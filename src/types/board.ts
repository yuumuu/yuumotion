export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

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

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string;
  tags: CardTag[];
  priority: PriorityLevel;
  dueDate?: string;
  checklist: ChecklistItem[];
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

export type BoardSyncEvent =
  | { type: 'CARD_UPSERT'; card: Card; senderId: string }
  | { type: 'CARD_DELETE'; cardId: string; senderId: string; updatedAt: number }
  | { type: 'CARD_MOVE'; cardId: string; targetColumnId: string; targetOrder: number; senderId: string; updatedAt: number }
  | { type: 'COLUMN_UPSERT'; column: Column; senderId: string }
  | { type: 'COLUMN_DELETE'; columnId: string; senderId: string; updatedAt: number }
  | { type: 'BOARD_RESET'; board: Board; senderId: string }
  | { type: 'PRESENCE_PING'; user: UserPresence; senderId: string };
