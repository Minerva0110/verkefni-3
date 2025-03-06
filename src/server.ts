import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

app.use('/scripts/*', serveStatic({ root: './public/scripts' }));
app.use('/styles/*', serveStatic({ root: './public' }));
app.use('/', serveStatic({ path: './public/index.html' }));

app.get('/questions/:category', async (c) => {
  const category = c.req.param('category');
  return c.text(`Questions category = ${category}`);
});

export default app;
