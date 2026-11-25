import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { boards, columns, cards } from '../db/schema';
import { requireAuth, AuthPayload, AppEnv, checkWorkspaceRole } from '../middleware/auth';
import { broadcastWorkspaceEvent } from './events';

export const boardRoutes = new Hono<AppEnv>();

// Public guest link endpoint (tanpa auth)
boardRoutes.get('/share/:token', async (c) => {
  const token = c.req.param('token');
  const found = await db.select().from(boards).where(eq(boards.shareToken, token)).limit(1);
  if (!found[0]) return c.json({ error: 'Tautan tidak ditemukan' }, 404);

  const boardCols = await db.select().from(columns).where(eq(columns.boardId, found[0].id));
  const boardCards = await db.select().from(cards).where(eq(cards.boardId, found[0].id));
  return c.json({ board: { ...found[0], columns: boardCols, cards: boardCards } });
});

boardRoutes.use('*', requireAuth);

boardRoutes.post('/', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const body = await c.req.json<{ workspaceId: string; title: string }>();
  const allowed = await checkWorkspaceRole(auth.sub, body.workspaceId, 'member');
  if (!allowed) return c.json({ error: 'Forbidden' }, 403);
  const now = Date.now();
  const boardId = `board-${crypto.randomUUID()}`;

  await db.insert(boards).values({
    id: boardId,
    workspaceId: body.workspaceId,
    title: body.title.trim() || 'Papan Baru',
    updatedAt: now
  });

  broadcastWorkspaceEvent(body.workspaceId, { type: 'BOARD_CREATED', boardId, updatedAt: now });
  return c.json({ id: boardId, workspaceId: body.workspaceId, title: body.title, updatedAt: now }, 201);
});

boardRoutes.delete('/:id', async (c) => {
  const boardId = c.req.param('id');
  await db.delete(cards).where(eq(cards.boardId, boardId));
  await db.delete(columns).where(eq(columns.boardId, boardId));
  await db.delete(boards).where(eq(boards.id, boardId));
  return c.json({ ok: true });
});

boardRoutes.post('/:boardId/cards', async (c) => {
  const boardId = c.req.param('boardId');
  const body = await c.req.json<{ columnId: string; title: string; priority?: string }>();
  const now = Date.now();
  const cardId = `card-${crypto.randomUUID()}`;

  await db.insert(cards).values({
    id: cardId,
    boardId,
    columnId: body.columnId,
    title: body.title.trim() || 'Tugas Baru',
    description: '',
    priority: body.priority || 'medium',
    tags: [],
    checklist: [],
    attachments: [],
    order: 0,
    updatedAt: now
  });

  return c.json({ id: cardId, boardId, columnId: body.columnId, title: body.title, updatedAt: now }, 201);
});

boardRoutes.patch('/cards/:cardId', async (c) => {
  const cardId = c.req.param('cardId');
  const body = await c.req.json<Record<string, unknown>>();
  const now = Date.now();

  await db
    .update(cards)
    .set({
      ...(typeof body.title === 'string' ? { title: body.title } : {}),
      ...(typeof body.description === 'string' ? { description: body.description } : {}),
      ...(typeof body.columnId === 'string' ? { columnId: body.columnId } : {}),
      ...(typeof body.priority === 'string' ? { priority: body.priority } : {}),
      ...(Array.isArray(body.assignees) ? { assignees: body.assignees as string[] } : {}),
      updatedAt: now
    })
    .where(eq(cards.id, cardId));

  return c.json({ ok: true, updatedAt: now });
});
