import type { Board, Card, Column, NotionPage, UserPresence } from '../../shared/contracts';

export * from '../../shared/contracts';

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
  | { type: 'PAGE_UPSERT'; page: NotionPage; senderId: string }
  | { type: 'PAGE_DELETE'; pageId: string; senderId: string; updatedAt: number }
  | { type: 'PRESENCE_PING'; user: UserPresence; senderId: string };
