const { Hono } = require('hono');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { sign, verify } = require('hono/jwt');
const bcrypt = require('bcrypt');
 'bcrypt';

const auth = new Hono()
const prisma = new PrismaClient()
const SECRET = 'your_jwt_secret'

// Nýskráning
auth.post('/signup', async (c) => {
  const body = await c.req.json()
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const validated = schema.safeParse(body)
  if (!validated.success) return c.json({ error: validated.error.format() }, 400)

  const hashedPassword = await bcrypt.hash(validated.data.password, 10)

  const user = await prisma.user.create({
    data: { email: validated.data.email, password: hashedPassword },
  })

  return c.json(user)
})

// Innskráning
auth.post('/login', async (c) => {
  const body = await c.req.json()
  const { email, password } = body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await sign({ id: user.id }, SECRET)
  return c.json({ token })
})

// Vernda rútur með JWT
auth.use('/protected/*', async (c, next) => {
  const token = c.req.header('Authorization')?.split(' ')[1]
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const payload = await verify(token, SECRET)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})

export default auth
