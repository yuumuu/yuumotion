import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { pages } from '../db/schema';
import { requireAuth, AuthPayload, AppEnv } from '../middleware/auth';
import { authorizeWorkspaceResource } from '../middleware/workspaceGuard';
import { broadcastWorkspaceEvent } from './events';

export const pageRoutes = new Hono<AppEnv>();

pageRoutes.use('*', requireAuth);

pageRoutes.post('/', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const body = await c.req.json<{
    workspaceId: string;
    title?: string;
    contentHtml?: string;
    parentId?: string | null;
    icon?: string;
  }>();

  const guard = await authorizeWorkspaceResource(auth.sub, { workspaceId: body.workspaceId }, 'member');
  if (!guard.allowed) return c.json({ error: 'Forbidden' }, 403);

  const now = Date.now();
  const pageId = `page-${crypto.randomUUID()}`;

  await db.insert(pages).values({
    id: pageId,
    workspaceId: body.workspaceId,
    parentId: body.parentId || null,
    title: (body.title || 'Untitled Document').trim(),
    icon: body.icon || '📄',
    contentHtml: body.contentHtml || '<p></p>',
    createdAt: now,
    updatedAt: now
  });

  broadcastWorkspaceEvent(body.workspaceId, { type: 'PAGE_CREATED', pageId, updatedAt: now });
  return c.json({ id: pageId, parentId: body.parentId || null, updatedAt: now }, 201);
});

pageRoutes.patch('/:id', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const pageId = c.req.param('id');
  const guard = await authorizeWorkspaceResource(auth.sub, { pageId }, 'member');
  if (guard.notFound) return c.json({ error: 'Halaman tidak ditemukan' }, 404);
  if (!guard.allowed) return c.json({ error: 'Forbidden' }, 403);

  const body = await c.req.json<{
    title?: string;
    contentHtml?: string;
    shareToken?: string | null;
    parentId?: string | null;
    icon?: string;
    coverImage?: string | null;
  }>();
  const now = Date.now();

  await db
    .update(pages)
    .set({
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.contentHtml !== undefined ? { contentHtml: body.contentHtml } : {}),
      ...(body.shareToken !== undefined ? { shareToken: body.shareToken } : {}),
      ...(body.parentId !== undefined ? { parentId: body.parentId === pageId ? null : body.parentId } : {}),
      ...(body.icon !== undefined ? { icon: body.icon } : {}),
      ...(body.coverImage !== undefined ? { coverImage: body.coverImage } : {}),
      updatedAt: now
    })
    .where(eq(pages.id, pageId));

  if (guard.workspaceId) {
    broadcastWorkspaceEvent(guard.workspaceId, { type: 'PAGE_UPDATED', pageId, updatedAt: now });
  }
  return c.json({ ok: true, updatedAt: now });
});

pageRoutes.delete('/:id', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const pageId = c.req.param('id');
  const guard = await authorizeWorkspaceResource(auth.sub, { pageId }, 'member');
  if (guard.notFound) return c.json({ error: 'Halaman tidak ditemukan' }, 404);
  if (!guard.allowed) return c.json({ error: 'Forbidden' }, 403);

  // Promosikan child pages ke root agar tidak yatim
  await db.update(pages).set({ parentId: null }).where(eq(pages.parentId, pageId));
  await db.delete(pages).where(eq(pages.id, pageId));

  if (guard.workspaceId) {
    broadcastWorkspaceEvent(guard.workspaceId, { type: 'PAGE_DELETED', pageId, updatedAt: Date.now() });
  }
  return c.json({ ok: true });
});
