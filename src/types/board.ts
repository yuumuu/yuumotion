export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type WorkspaceView = 'board' | 'calendar' | 'timeline' | 'table';

export interface CardTag {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CardAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: number;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string;
  contentJson?: Record<string, unknown>;
  tags: CardTag[];
  priority: PriorityLevel;
  startDate?: string;
  dueDate?: string;
  coverImage?: string;
  checklist: ChecklistItem[];
  attachments: CardAttachment[];
  order: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
  updatedAt: number;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  cards: Record<string, Card>;
  updatedAt: number;
}

export interface UserPresence {
  id: string;
  name: string;
  avatar: string;
  color: string;
  lastActive: number;
}

export type SyncConnectionStatus = 'local' | 'connecting' | 'connected' | 'error';

export interface CloudSyncConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  enabled: boolean;
}

export interface DatabaseBridgeConfig {
  endpoint: string;
  target: 'mysql' | 'sqlite' | 'wasmer-edge';
  enabled: boolean;
  autoSync: boolean;
  lastSyncedAt?: number;
}

export type BoardSyncEvent =
  | { type: 'CARD_UPSERT'; card: Card; senderId: string }
  | { type: 'CARD_DELETE'; cardId: string; senderId: string; updatedAt: number }
  | { type: 'CARD_MOVE'; cardId: string; targetColumnId: string; targetOrder: number; senderId: string; updatedAt: number }
  | { type: 'COLUMN_UPSERT'; column: Column; senderId: string }
  | { type: 'COLUMN_DELETE'; columnId: string; senderId: string; updatedAt: number }
  | { type: 'BOARD_RESET'; board: Board; senderId: string }
  | { type: 'PRESENCE_PING'; user: UserPresence; senderId: string };
