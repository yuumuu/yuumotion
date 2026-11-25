import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
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

const port = Number(process.env.API_PORT || 8787);

if (process.env.NODE_ENV !== 'test') {
  console.log(`Yuumotion API running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
