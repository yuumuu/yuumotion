import { eq } from 'drizzle-orm';
import { db } from '../db';
import { boards, cards, pages } from '../db/schema';
import { checkWorkspaceRole } from './auth';

type MinRole = 'viewer' | 'member' | 'admin' | 'owner';

export async function resolveWorkspaceIdFromBoard(boardId: string): Promise<string | null> {
  const rows = await db
    .select({ workspaceId: boards.workspaceId })
    .from(boards)
    .where(eq(boards.id, boardId))
    .limit(1);
  return rows[0]?.workspaceId ?? null;
}

export async function resolveWorkspaceIdFromCard(cardId: string): Promise<string | null> {
  const cardRows = await db
    .select({ boardId: cards.boardId })
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);
  if (!cardRows[0]) return null;
  return resolveWorkspaceIdFromBoard(cardRows[0].boardId);
}

export async function resolveWorkspaceIdFromPage(pageId: string): Promise<string | null> {
  const rows = await db
    .select({ workspaceId: pages.workspaceId })
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);
  return rows[0]?.workspaceId ?? null;
}

export async function authorizeWorkspaceResource(
  userId: string,
  target: { workspaceId?: string; boardId?: string; cardId?: string; pageId?: string },
  minRole: MinRole = 'member'
): Promise<{ allowed: boolean; workspaceId: string | null; notFound?: boolean }> {
  let workspaceId = target.workspaceId ?? null;
  if (!workspaceId && target.boardId) workspaceId = await resolveWorkspaceIdFromBoard(target.boardId);
  if (!workspaceId && target.cardId) workspaceId = await resolveWorkspaceIdFromCard(target.cardId);
  if (!workspaceId && target.pageId) workspaceId = await resolveWorkspaceIdFromPage(target.pageId);

  if (!workspaceId) {
    return { allowed: false, workspaceId: null, notFound: true };
  }

  const allowed = await checkWorkspaceRole(userId, workspaceId, minRole);
  return { allowed, workspaceId };
}
