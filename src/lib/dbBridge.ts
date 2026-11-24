import { Board, DatabaseBridgeConfig } from '../types/board';

const DB_CONFIG_KEY = 'yuumotion_db_bridge_config';

export function getStoredDbConfig(): DatabaseBridgeConfig {
  const raw = localStorage.getItem(DB_CONFIG_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback to default if malformed
    }
  }

  return {
    endpoint: 'http://localhost:3001/api/sync',
    target: 'mysql',
    enabled: false,
    autoSync: false
  };
}

export function saveStoredDbConfig(config: DatabaseBridgeConfig) {
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
}

export function generateBoardSqlDump(board: Board, dialect: 'mysql' | 'sqlite' = 'mysql'): string {
  const lines: string[] = [];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  lines.push(`-- Yuumotion Board Export for ${dialect.toUpperCase()}`);
  lines.push(`-- Generated: ${now}`);
  lines.push('');

  const escapeStr = (val?: string) => {
    if (!val) return 'NULL';
    return `'${val.replace(/'/g, "''")}'`;
  };

  lines.push(`REPLACE INTO boards (id, workspace_id, title) VALUES (${escapeStr(board.id)}, 'workspace-default', ${escapeStr(board.title)});`);
  lines.push('');

  board.columns.forEach((col) => {
    lines.push(
      `REPLACE INTO columns (id, board_id, title, color, \`order\`) VALUES (${escapeStr(col.id)}, ${escapeStr(board.id)}, ${escapeStr(col.title)}, ${escapeStr(col.color)}, ${col.order});`
    );
  });
  lines.push('');

  Object.values(board.cards).forEach((card) => {
    const desc = escapeStr(card.description);
    const content = card.contentJson ? escapeStr(JSON.stringify(card.contentJson)) : 'NULL';
    const startDate = escapeStr(card.startDate);
    const dueDate = escapeStr(card.dueDate);
    const cover = escapeStr(card.coverImage);

    lines.push(
      `REPLACE INTO cards (id, board_id, column_id, title, description, content_json, priority, start_date, due_date, cover_image, \`order\`) VALUES (${escapeStr(card.id)}, ${escapeStr(board.id)}, ${escapeStr(card.columnId)}, ${escapeStr(card.title)}, ${desc}, ${content}, '${card.priority}', ${startDate}, ${dueDate}, ${cover}, ${card.order});`
    );

    card.tags.forEach((tag) => {
      lines.push(`REPLACE INTO tags (id, board_id, name, color) VALUES (${escapeStr(tag.id)}, ${escapeStr(board.id)}, ${escapeStr(tag.name)}, ${escapeStr(tag.color)});`);
      lines.push(`REPLACE INTO card_tags (card_id, tag_id) VALUES (${escapeStr(card.id)}, ${escapeStr(tag.id)});`);
    });

    card.checklist.forEach((chk, idx) => {
      lines.push(`REPLACE INTO checklists (id, card_id, text, completed, \`order\`) VALUES (${escapeStr(chk.id)}, ${escapeStr(card.id)}, ${escapeStr(chk.text)}, ${chk.completed ? 1 : 0}, ${idx});`);
    });

    (card.attachments || []).forEach((att) => {
      lines.push(`REPLACE INTO attachments (id, card_id, name, size, mime_type, url) VALUES (${escapeStr(att.id)}, ${escapeStr(card.id)}, ${escapeStr(att.name)}, ${att.size}, ${escapeStr(att.mimeType)}, ${escapeStr(att.url)});`);
    });
  });

  return lines.join('\n');
}

export async function syncBoardToDatabase(board: Board, config: DatabaseBridgeConfig): Promise<{ success: boolean; message: string }> {
  if (!config.enabled || !config.endpoint) {
    return { success: false, message: 'Database bridge is not enabled or endpoint is missing.' };
  }

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boardId: board.id,
        board,
        target: config.target,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    return { success: true, message: 'Successfully synced to database bridge.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown network error';
    return { success: false, message: `Sync failed: ${errorMsg}` };
  }
}
