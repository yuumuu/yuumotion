import React from 'react';
import { Board, UserPresence } from '../types/board';
import {
  Kanban,
  Moon,
  Sun,
  Download,
  Upload,
  Users,
  Search,
  Radio
} from 'lucide-react';

interface HeaderProps {
  board: Board;
  currentRoom: string;
  onRoomChange: (newRoom: string) => void;
  onlineUsers: UserPresence[];
  currentUser: UserPresence;
  isDark: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  board,
  currentRoom,
  onRoomChange,
  onlineUsers,
  currentUser,
  isDark,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  onExport,
  onImport
}) => {
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between border-b border-appflowy-border bg-appflowy-surface/90 px-6 py-3 backdrop-blur-md dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface/90">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xs">
            <Kanban className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-appflowy-text dark:text-appflowy-darkText">
                {board.title}
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Radio className="h-3 w-3 animate-pulse" />
                Live Sync
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
              <span>Room:</span>
              <input
                type="text"
                value={currentRoom}
                onChange={(e) => onRoomChange(e.target.value)}
                className="h-5 rounded bg-transparent px-1 font-mono text-xs font-medium text-purple-600 underline hover:bg-neutral-100 dark:text-purple-400 dark:hover:bg-neutral-800"
                title="Change room name to collaborate in private boards"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-appflowy-muted dark:text-appflowy-darkMuted" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-44 rounded-md border border-appflowy-border bg-appflowy-bg pl-8 pr-3 text-xs transition-all focus:w-60 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:focus:ring-purple-400"
          />
        </div>

        <div className="flex items-center -space-x-1.5 pl-2" title="Collaborators currently active in this room">
          {onlineUsers.slice(0, 4).map((user) => (
            <div
              key={user.id}
              style={{ backgroundColor: user.color }}
              className="relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white dark:ring-neutral-900"
              title={`${user.name} ${user.id === currentUser.id ? '(You)' : ''}`}
            >
              {user.avatar}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
          ))}
          {onlineUsers.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-medium text-neutral-700 ring-2 ring-white dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-900">
              +{onlineUsers.length - 4}
            </div>
          )}
          <div className="pl-2.5 text-xs text-appflowy-muted dark:text-appflowy-darkMuted flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{onlineUsers.length}</span>
          </div>
        </div>

        <div className="h-4 w-px bg-appflowy-border dark:bg-appflowy-darkBorder" />

        <div className="flex items-center gap-1">
          <button
            onClick={onExport}
            title="Export board data (JSON)"
            className="flex h-8 w-8 items-center justify-center rounded-md text-appflowy-muted transition-colors hover:bg-appflowy-hover hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkHover dark:hover:text-appflowy-darkText"
          >
            <Download className="h-4 w-4" />
          </button>
          <label
            title="Import board data (JSON)"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-appflowy-muted transition-colors hover:bg-appflowy-hover hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkHover dark:hover:text-appflowy-darkText"
          >
            <Upload className="h-4 w-4" />
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button
            onClick={onToggleTheme}
            title="Toggle light/dark mode"
            className="flex h-8 w-8 items-center justify-center rounded-md text-appflowy-muted transition-colors hover:bg-appflowy-hover hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkHover dark:hover:text-appflowy-darkText"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
