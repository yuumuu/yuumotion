import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { pages } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { broadcastWorkspaceEvent } from './events';

export const pageRoutes = new Hono();

pageRoutes.use('*', requireAuth);

pageRoutes.post('/', async (c) => {
  const body = await c.req.json<{ workspaceId: string; title?: string; contentHtml?: string }>();
  const now = Date.now();
  const pageId = `page-${crypto.randomUUID()}`;

  await db.insert(pages).values({
    id: pageId,
    workspaceId: body.workspaceId,
    title: (body.title || 'Untitled Document').trim(),
    icon: '📄',
    contentHtml: body.contentHtml || '<p></p>',
    createdAt: now,
    updatedAt: now
  });

  broadcastWorkspaceEvent(body.workspaceId, { type: 'PAGE_CREATED', pageId, updatedAt: now });
  return c.json({ id: pageId, updatedAt: now }, 201);
});

pageRoutes.patch('/:id', async (c) => {
  const pageId = c.req.param('id');
  const body = await c.req.json<{ title?: string; contentHtml?: string; shareToken?: string | null }>();
  const now = Date.now();

  await db
    .update(pages)
    .set({
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.contentHtml !== undefined ? { contentHtml: body.contentHtml } : {}),
      ...(body.shareToken !== undefined ? { shareToken: body.shareToken } : {}),
      updatedAt: now
    })
    .where(eq(pages.id, pageId));

  return c.json({ ok: true, updatedAt: now });
});

pageRoutes.delete('/:id', async (c) => {
  const pageId = c.req.param('id');
  await db.delete(pages).where(eq(pages.id, pageId));
  return c.json({ ok: true });
});
