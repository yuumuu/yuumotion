export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type WorkspaceView = 'board' | 'calendar' | 'timeline' | 'table';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

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

export interface CardActivity {
  id: string;
  userName: string;
  action: string;
  timestamp: number;
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
  activities?: CardActivity[];
  autoMoveDone?: boolean;
  order: number;
  updatedAt: number;
  assignees?: string[];
  blockedBy?: string[];
  blocks?: string[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
  };
}

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
  updatedAt: number;
  wipLimit?: number;
}

export interface Board {
  id: string;
  workspaceId?: string;
  title: string;
  columns: Column[];
  cards: Record<string, Card>;
  updatedAt: number;
  shareToken?: string;
}

export interface NotionPage {
  id: string;
  workspaceId: string;
  title: string;
  icon?: string;
  coverImage?: string;
  contentHtml: string;
  contentJson?: Record<string, unknown>;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
  shareToken?: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  color: string;
  role: UserRole;
  joinedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
  currentRole: UserRole;
  members: WorkspaceMember[];
  boards: Board[];
  pages: NotionPage[];
  createdAt: number;
  updatedAt: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  color: string;
  isCloudAuth: boolean;
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
  | { type: 'PAGE_UPSERT'; page: NotionPage; senderId: string }
  | { type: 'PAGE_DELETE'; pageId: string; senderId: string; updatedAt: number }
  | { type: 'PRESENCE_PING'; user: UserPresence; senderId: string };
