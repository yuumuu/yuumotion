import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { requireAuth, AuthPayload, AppEnv, checkWorkspaceRole } from '../middleware/auth';

export const eventRoutes = new Hono<AppEnv>();

type Listener = (data: string) => void;
const listenersByWorkspace = new Map<string, Set<Listener>>();

export function broadcastWorkspaceEvent(workspaceId: string, payload: Record<string, unknown>) {
  const listeners = listenersByWorkspace.get(workspaceId);
  if (!listeners || listeners.size === 0) return;
  const serialized = JSON.stringify(payload);
  listeners.forEach((fn) => fn(serialized));
}

eventRoutes.get('/stream', requireAuth, async (c) => {
  const auth = c.get('user') as AuthPayload;
  const workspaceId = c.req.query('workspaceId') || 'default';
  const allowed = await checkWorkspaceRole(auth.sub, workspaceId, 'viewer');
  if (!allowed) return c.json({ error: 'Forbidden' }, 403);

  return streamSSE(c, async (stream) => {
    const send: Listener = (data) => {
      void stream.writeSSE({ event: 'sync', data });
    };

    if (!listenersByWorkspace.has(workspaceId)) {
      listenersByWorkspace.set(workspaceId, new Set());
    }
    listenersByWorkspace.get(workspaceId)!.add(send);

    await stream.writeSSE({ event: 'connected', data: JSON.stringify({ workspaceId }) });

    const keepAlive = setInterval(() => {
      void stream.writeSSE({ event: 'ping', data: String(Date.now()) });
    }, 25000);

    stream.onAbort(() => {
      clearInterval(keepAlive);
      listenersByWorkspace.get(workspaceId)?.delete(send);
    });

    await new Promise(() => {});
  });
});
