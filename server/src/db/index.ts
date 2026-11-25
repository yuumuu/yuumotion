import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

function buildConnectionConfig(): mysql.PoolOptions {
  const databaseUrl = process.env.DATABASE_URL;
  const useSsl = process.env.DB_SSL === 'true' || Boolean(process.env.DB_HOST);
  const sslOption = useSsl ? { rejectUnauthorized: false } : undefined;

  if (databaseUrl) {
    return {
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      ssl: sslOption
    };
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yuumotion',
    waitForConnections: true,
    connectionLimit: 10,
    ssl: sslOption
  };
}

const pool = mysql.createPool(buildConnectionConfig());

export const db = drizzle(pool, { schema, mode: 'default' });
export { pool };

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash TEXT,
    oauth_provider VARCHAR(32),
    oauth_id VARCHAR(128),
    avatar VARCHAR(16) NOT NULL DEFAULT 'U',
    color VARCHAR(16) NOT NULL DEFAULT '#6366F1',
    created_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    icon VARCHAR(16) NOT NULL DEFAULT '🚀',
    owner_id VARCHAR(64) NOT NULL,
    join_policy VARCHAR(16) NOT NULL DEFAULT 'invite',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS workspace_members (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    role VARCHAR(16) NOT NULL DEFAULT 'member',
    joined_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    title VARCHAR(160) NOT NULL,
    share_token VARCHAR(64),
    updated_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS columns (
    id VARCHAR(64) PRIMARY KEY,
    board_id VARCHAR(64) NOT NULL,
    title VARCHAR(120) NOT NULL,
    color VARCHAR(16) NOT NULL DEFAULT '#6366F1',
    sort_order INT NOT NULL DEFAULT 0,
    wip_limit INT,
    updated_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(64) PRIMARY KEY,
    board_id VARCHAR(64) NOT NULL,
    column_id VARCHAR(64) NOT NULL,
    title VARCHAR(240) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(16) NOT NULL DEFAULT 'medium',
    start_date VARCHAR(32),
    due_date VARCHAR(32),
    cover_image TEXT,
    tags JSON NOT NULL,
    checklist JSON NOT NULL,
    attachments JSON NOT NULL,
    assignees JSON,
    blocked_by JSON,
    recurrence JSON,
    auto_move_done BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    updated_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS pages (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    parent_id VARCHAR(64),
    title VARCHAR(200) NOT NULL,
    icon VARCHAR(16),
    cover_image TEXT,
    content_html TEXT NOT NULL,
    share_token VARCHAR(64),
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    recipient_user_id VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(120) NOT NULL,
    type VARCHAR(32) NOT NULL,
    entity_type VARCHAR(16) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    board_id VARCHAR(64),
    title VARCHAR(200) NOT NULL,
    snippet TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    board_id VARCHAR(64),
    card_id VARCHAR(64),
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(120) NOT NULL,
    action VARCHAR(48) NOT NULL,
    summary TEXT NOT NULL,
    created_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS uploads (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64),
    user_id VARCHAR(64) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    size INT NOT NULL,
    storage_url TEXT NOT NULL,
    created_at BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

export async function ensureSchema(): Promise<void> {
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) return;
  for (const sql of SCHEMA_STATEMENTS) {
    await pool.query(sql);
  }
}
