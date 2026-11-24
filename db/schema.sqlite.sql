-- Yuumotion SQLite / Wasmer Edge D1 Schema

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    title TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280',
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    column_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_json TEXT,
    priority TEXT DEFAULT 'low',
    start_date TEXT,
    due_date TEXT,
    cover_image TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'neutral'
);

CREATE TABLE IF NOT EXISTS card_tags (
    card_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (card_id, tag_id)
);

CREATE TABLE IF NOT EXISTS checklists (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    name TEXT NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
