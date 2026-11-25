import { Hono } from 'hono';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { notifications } from '../db/schema';
import { requireAuth, checkWorkspaceRole, AuthPayload, AppEnv } from '../middleware/auth';
import { broadcastWorkspaceEvent } from './events';

export const notificationRoutes = new Hono<AppEnv>();

notificationRoutes.get('/', requireAuth, async (c) => {
  const auth = c.get('user') as AuthPayload;
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientUserId, auth.sub))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return c.json({ notifications: rows });
});

notificationRoutes.post('/', requireAuth, async (c) => {
  const auth = c.get('user') as AuthPayload;
  const body = await c.req.json();
  const workspaceId = String(body.workspaceId || '').trim();
  const recipientUserId = String(body.recipientUserId || '').trim();

  if (!workspaceId || !recipientUserId) {
    return c.json({ error: 'workspaceId dan recipientUserId wajib diisi' }, 400);
  }

  const allowed = await checkWorkspaceRole(auth.sub, workspaceId, 'member');
  if (!allowed) return c.json({ error: 'Forbidden' }, 403);

  const item = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    workspaceId,
    recipientUserId,
    actorId: auth.sub,
    actorName: String(body.actorName || auth.name || 'Anggota'),
    type: String(body.type || 'mention_card'),
    entityType: String(body.entityType || 'card'),
    entityId: String(body.entityId || ''),
    boardId: body.boardId ? String(body.boardId) : null,
    title: String(body.title || 'Notifikasi Baru').slice(0, 200),
    snippet: String(body.snippet || ''),
    isRead: false,
    createdAt: Date.now()
  };

  await db.insert(notifications).values(item);
  broadcastWorkspaceEvent(workspaceId, { type: 'NOTIFICATION_CREATED', notification: item });
  return c.json({ notification: item }, 201);
});

notificationRoutes.patch('/:id/read', requireAuth, async (c) => {
  const auth = c.get('user') as AuthPayload;
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'ID tidak valid' }, 400);
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.recipientUserId, auth.sub)));

  return c.json({ ok: true });
});

notificationRoutes.post('/read-all', requireAuth, async (c) => {
  const auth = c.get('user') as AuthPayload;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.recipientUserId, auth.sub));

  return c.json({ ok: true });
});
