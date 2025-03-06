import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from './categories.db.js';

const app = new Hono();

app.get('/categories', async (c) => {
  try {
    const limitParam = c.req.query('limit');
    const offsetParam = c.req.query('offset');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    const cats = await getCategories(limit, offset);
    return c.json(cats, 200);
  } catch (err) {
    console.error(err);
    return c.text('Internal Error', 500);
  }
});

app.get('/categories/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const category = await getCategory(slug);
    if (!category) {
      return c.text('Not Found', 404);
    }
    return c.json(category, 200);
  } catch (err) {
    console.error(err);
    return c.text('Internal Error', 500);
  }
});

app.post('/category', async (c) => {
  try {
    const data = await c.req.json();
    if (!data.title || !data.slug) {
      return c.text('Bad Request', 400);
    }
    const newCategory = await createCategory(data);
    return c.json(newCategory, 201);
  } catch (err) {
    console.error(err);
    return c.text('Internal Error', 500);
  }
});

app.patch('/category/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const data = await c.req.json();
    const category = await updateCategory(slug, data);
    if (!category) {
      return c.text('Not Found', 404);
    }
    return c.json(category, 200);
  } catch (err) {
    console.error(err);
    return c.text('Internal Error', 500);
  }
});

app.delete('/category/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const success = await deleteCategory(slug);
    if (!success) {
      return c.text('Not Found', 404);
    }
    c.status(204);
    return c.text('');
  } catch (err) {
    console.error(err);
    return c.text('Internal Error', 500);
  }
});

serve({ fetch: app.fetch, port: 3000 });
console.log('Server running on port 3000');
