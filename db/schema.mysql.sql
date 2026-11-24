-- Yuumotion MySQL Relational Database Schema
-- Compatible with MySQL 8.0+ and MariaDB

CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS columns (
    id VARCHAR(64) PRIMARY KEY,
    board_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    color VARCHAR(32) DEFAULT '#6B7280',
    `order` INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_board (board_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(64) PRIMARY KEY,
    board_id VARCHAR(64) NOT NULL,
    column_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    content_json LONGTEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'low',
    start_date DATE NULL,
    due_date DATE NULL,
    cover_image TEXT NULL,
    `order` INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_board_column (board_id, column_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(64) PRIMARY KEY,
    board_id VARCHAR(64) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(32) NOT NULL DEFAULT 'neutral',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_board_tag (board_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS card_tags (
    card_id VARCHAR(64) NOT NULL,
    tag_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (card_id, tag_id),
    INDEX idx_tag (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checklists (
    id VARCHAR(64) PRIMARY KEY,
    card_id VARCHAR(64) NOT NULL,
    text VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    `order` INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_card (card_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(64) PRIMARY KEY,
    card_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(128) NOT NULL,
    url LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_card_attachment (card_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
