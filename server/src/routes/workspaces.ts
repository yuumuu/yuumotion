import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { workspaces, workspaceMembers, boards, columns, cards, pages } from '../db/schema';
import { requireAuth, AuthPayload, AppEnv, checkWorkspaceRole } from '../middleware/auth';
import { broadcastWorkspaceEvent } from './events';

export const workspaceRoutes = new Hono<AppEnv>();

workspaceRoutes.use('*', requireAuth);

workspaceRoutes.get('/', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const memberships = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, auth.sub));

  const results = [];
  for (const m of memberships) {
    const wsRows = await db.select().from(workspaces).where(eq(workspaces.id, m.workspaceId)).limit(1);
    if (!wsRows[0]) continue;
    const wsBoards = await db.select().from(boards).where(eq(boards.workspaceId, m.workspaceId));
    const hydratedBoards = [];
    for (const b of wsBoards) {
      const bCols = await db.select().from(columns).where(eq(columns.boardId, b.id));
      const bCards = await db.select().from(cards).where(eq(cards.boardId, b.id));
      const cardsMap = Object.fromEntries(bCards.map((card) => [card.id, card]));
      hydratedBoards.push({ ...b, columns: bCols, cards: cardsMap });
    }
    const wsPages = await db.select().from(pages).where(eq(pages.workspaceId, m.workspaceId));
    const wsMembers = await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, m.workspaceId));
    results.push({
      ...wsRows[0],
      currentRole: m.role,
      members: wsMembers,
      boards: hydratedBoards,
      pages: wsPages
    });
  }

  return c.json({ workspaces: results });
});

workspaceRoutes.post('/', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const body = await c.req.json<{ name?: string; icon?: string; joinPolicy?: string }>();
  const name = (body.name || 'Workspace Baru').trim();
  const icon = body.icon || '🚀';
  const now = Date.now();
  const wsId = `ws-${crypto.randomUUID()}`;

  await db.insert(workspaces).values({
    id: wsId,
    name,
    icon,
    ownerId: auth.sub,
    joinPolicy: body.joinPolicy || 'invite',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(workspaceMembers).values({
    id: `wm-${crypto.randomUUID()}`,
    workspaceId: wsId,
    userId: auth.sub,
    role: 'owner',
    joinedAt: now
  });

  return c.json({ id: wsId, name, icon, ownerId: auth.sub, currentRole: 'owner' }, 201);
});

workspaceRoutes.patch('/:id', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const wsId = c.req.param('id');
  const allowed = await checkWorkspaceRole(auth.sub, wsId, 'admin');
  if (!allowed) {
    return c.json({ error: 'Forbidden: hanya admin atau owner yang dapat mengubah workspace.' }, 403);
  }
  const body = await c.req.json<{ name?: string; icon?: string; joinPolicy?: string }>();
  const now = Date.now();

  await db
    .update(workspaces)
    .set({
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.icon ? { icon: body.icon } : {}),
      ...(body.joinPolicy ? { joinPolicy: body.joinPolicy } : {}),
      updatedAt: now
    })
    .where(eq(workspaces.id, wsId));

  broadcastWorkspaceEvent(wsId, { type: 'WORKSPACE_UPDATED', workspaceId: wsId, updatedAt: now });
  return c.json({ ok: true });
});

workspaceRoutes.delete('/:id', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const wsId = c.req.param('id');

  const existing = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, wsId), eq(workspaces.ownerId, auth.sub)))
    .limit(1);

  if (!existing[0]) {
    return c.json({ error: 'Hanya owner yang dapat menghapus workspace.' }, 403);
  }

  await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, wsId));
  await db.delete(boards).where(eq(boards.workspaceId, wsId));
  await db.delete(pages).where(eq(pages.workspaceId, wsId));
  await db.delete(workspaces).where(eq(workspaces.id, wsId));

  return c.json({ ok: true });
});
