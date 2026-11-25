export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type WorkspaceView = 'board' | 'calendar' | 'timeline' | 'table';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type WorkspaceTemplateType = 'plain' | 'board' | 'docs' | 'full';

export interface CardTag {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  order: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string;
  groupId?: string;
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
  checklistGroups?: ChecklistGroup[];
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
  title?: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  presenceStatus?: 'online' | 'busy' | 'away';
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
  currentRole: UserRole;
  joinPolicy?: 'invite' | 'link' | 'open';
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
  title?: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  presenceStatus?: 'online' | 'busy' | 'away';
  notificationsEnabled?: boolean;
}

export interface UserPresence {
  id: string;
  name: string;
  avatar: string;
  color: string;
  lastActive: number;
  title?: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  presenceStatus?: 'online' | 'busy' | 'away';
}

export type NotificationType = 'mention_card' | 'mention_page' | 'assigned';

export interface NotificationItem {
  id: string;
  workspaceId: string;
  recipientUserId: string;
  actorId: string;
  actorName: string;
  type: NotificationType;
  entityType: 'card' | 'page';
  entityId: string;
  boardId?: string;
  title: string;
  snippet: string;
  isRead: boolean;
  createdAt: number;
}
