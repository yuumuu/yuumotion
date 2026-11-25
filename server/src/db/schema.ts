import {
  mysqlTable,
  varchar,
  text,
  int,
  bigint,
  boolean,
  json
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 190 }).notNull().unique(),
  passwordHash: text('password_hash'),
  oauthProvider: varchar('oauth_provider', { length: 32 }),
  oauthId: varchar('oauth_id', { length: 128 }),
  avatar: varchar('avatar', { length: 16 }).notNull().default('U'),
  color: varchar('color', { length: 16 }).notNull().default('#6366F1'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull()
});

export const workspaces = mysqlTable('workspaces', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  icon: varchar('icon', { length: 16 }).notNull().default('🚀'),
  ownerId: varchar('owner_id', { length: 64 }).notNull(),
  joinPolicy: varchar('join_policy', { length: 16 }).notNull().default('invite'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull()
});

export const workspaceMembers = mysqlTable('workspace_members', {
  id: varchar('id', { length: 64 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 64 }).notNull(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  role: varchar('role', { length: 16 }).notNull().default('member'),
  joinedAt: bigint('joined_at', { mode: 'number' }).notNull()
});

export const boards = mysqlTable('boards', {
  id: varchar('id', { length: 64 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 64 }).notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  shareToken: varchar('share_token', { length: 64 }),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull()
});

export const columns = mysqlTable('columns', {
  id: varchar('id', { length: 64 }).primaryKey(),
  boardId: varchar('board_id', { length: 64 }).notNull(),
  title: varchar('title', { length: 120 }).notNull(),
  color: varchar('color', { length: 16 }).notNull().default('#6366F1'),
  order: int('sort_order').notNull().default(0),
  wipLimit: int('wip_limit'),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull()
});

export const cards = mysqlTable('cards', {
  id: varchar('id', { length: 64 }).primaryKey(),
  boardId: varchar('board_id', { length: 64 }).notNull(),
  columnId: varchar('column_id', { length: 64 }).notNull(),
  title: varchar('title', { length: 240 }).notNull(),
  description: text('description').notNull(),
  priority: varchar('priority', { length: 16 }).notNull().default('medium'),
  startDate: varchar('start_date', { length: 32 }),
  dueDate: varchar('due_date', { length: 32 }),
  coverImage: text('cover_image'),
  tags: json('tags').$type<Array<{ id: string; name: string; color: string }>>().notNull(),
  checklist: json('checklist').$type<Array<{ id: string; text: string; completed: boolean }>>().notNull(),
  attachments: json('attachments').$type<Array<{ id: string; name: string; size: number; mimeType: string; url: string; createdAt: number }>>().notNull(),
  assignees: json('assignees').$type<string[]>(),
  blockedBy: json('blocked_by').$type<string[]>(),
  recurrence: json('recurrence').$type<{ frequency: 'daily' | 'weekly' | 'monthly'; interval: number; daysOfWeek?: number[] }>(),
  autoMoveDone: boolean('auto_move_done').notNull().default(true),
  order: int('sort_order').notNull().default(0),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull()
});

export const pages = mysqlTable('pages', {
  id: varchar('id', { length: 64 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 64 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  icon: varchar('icon', { length: 16 }),
  coverImage: text('cover_image'),
  contentHtml: text('content_html').notNull(),
  shareToken: varchar('share_token', { length: 64 }),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull()
});

export const activities = mysqlTable('activities', {
  id: varchar('id', { length: 64 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 64 }).notNull(),
  boardId: varchar('board_id', { length: 64 }),
  cardId: varchar('card_id', { length: 64 }),
  userId: varchar('user_id', { length: 64 }).notNull(),
  userName: varchar('user_name', { length: 120 }).notNull(),
  action: varchar('action', { length: 48 }).notNull(),
  summary: text('summary').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull()
});

export const uploads = mysqlTable('uploads', {
  id: varchar('id', { length: 64 }).primaryKey(),
  workspaceId: varchar('workspace_id', { length: 64 }),
  userId: varchar('user_id', { length: 64 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 120 }).notNull(),
  size: int('size').notNull(),
  storageUrl: text('storage_url').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull()
});
