import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureSchema } from './db';
import { authRoutes } from './routes/auth';
import { workspaceRoutes } from './routes/workspaces';
import { boardRoutes } from './routes/boards';
import { pageRoutes } from './routes/pages';
import { uploadRoutes } from './routes/uploads';
import { eventRoutes } from './routes/events';
import { notificationRoutes } from './routes/notifications';

export const app = new Hono();

app.use(
  '/api/*',
  cors({
    origin: process.env.APP_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.get('/api/health', (c) => {
  return c.json({ ok: true, runtime: 'hono-wasmer-mysql', timestamp: Date.now() });
});

app.route('/api/auth', authRoutes);
app.route('/api/workspaces', workspaceRoutes);
app.route('/api/boards', boardRoutes);
app.route('/api/pages', pageRoutes);
app.route('/api/uploads', uploadRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/notifications', notificationRoutes);

app.use('/*', serveStatic({ root: './dist' }));

app.get('*', async (c) => {
  try {
    const html = await fs.readFile(path.resolve('./dist/index.html'), 'utf-8');
    return c.html(html);
  } catch {
    return c.text('Yuumotion API running. Build frontend dist/ untuk SPA.', 404);
  }
});

const port = Number(process.env.PORT || process.env.API_PORT || 8080);

if (process.env.NODE_ENV !== 'test') {
  ensureSchema()
    .then(() => {
      console.log('Database schema verified');
    })
    .catch((err) => {
      console.error('Schema init warning:', err instanceof Error ? err.message : err);
    });
  console.log(`Yuumotion running on http://0.0.0.0:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
