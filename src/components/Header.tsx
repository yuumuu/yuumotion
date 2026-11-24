import React from 'react';
import { Board, SyncConnectionStatus, UserPresence, WorkspaceView, UserRole, NotionPage } from '../types/board';
import {
  Kanban,
  Calendar,
  Clock,
  Table as TableIcon,
  Moon,
  Sun,
  Download,
  Upload,
  Users,
  Search,
  Radio,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Database,
  Menu,
  ShieldCheck,
  Crown
} from 'lucide-react';

interface HeaderProps {
  board?: Board;
  activePage?: NotionPage;
  currentMode: 'board' | 'page';
  workspaceName: string;
  currentUserRole: UserRole;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentRoom: string;
  onRoomChange: (newRoom: string) => void;
  onlineUsers: UserPresence[];
  currentUser: UserPresence;
  syncStatus: SyncConnectionStatus;
  activeView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  onOpenSyncSettings: () => void;
  onOpenDbBridge: () => void;
  onOpenMembersModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  board,
  activePage,
  currentMode,
  workspaceName,
  currentUserRole,
  isSidebarOpen,
  onToggleSidebar,
  currentRoom,
  onRoomChange,
  onlineUsers,
  currentUser,
  syncStatus,
  activeView,
  onViewChange,
  onOpenSyncSettings,
  onOpenDbBridge,
  onOpenMembersModal,
  isDark,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  onExport,
  onImport
}) => {
  const views: { id: WorkspaceView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'table', label: 'Table', icon: TableIcon }
  ];

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between border-b border-appflowy-border bg-appflowy-surface/90 px-4 py-2.5 backdrop-blur-md dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface/90">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-appflowy-muted hover:bg-neutral-100 hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {currentMode === 'board' ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-2xs">
              <Kanban className="h-3.5 w-3.5" />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-sm dark:bg-neutral-800">
              {activePage?.icon || '📄'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted hidden sm:inline">
                {workspaceName} /
              </span>
              <h1 className="text-xs font-semibold tracking-tight text-appflowy-text dark:text-appflowy-darkText">
                {currentMode === 'board' ? board?.title || 'Board' : activePage?.title || 'Page'}
              </h1>

              <button
                onClick={onOpenMembersModal}
                className="flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300"
                title="Your Role in this Workspace (Click to view members)"
              >
                {currentUserRole === 'owner' && <Crown className="h-2.5 w-2.5" />}
                {currentUserRole !== 'owner' && <ShieldCheck className="h-2.5 w-2.5" />}
                <span>{currentUserRole}</span>
              </button>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-appflowy-muted dark:text-appflowy-darkMuted hidden sm:flex">
              <span>Room:</span>
              <input
                type="text"
                value={currentRoom}
                onChange={(e) => onRoomChange(e.target.value)}
                className="h-4 rounded bg-transparent px-1 font-mono text-[10px] font-medium text-purple-600 underline hover:bg-neutral-100 dark:text-purple-400 dark:hover:bg-neutral-800"
                title="Change sync room name"
              />
            </div>
          </div>
        </div>

        {currentMode === 'board' && (
          <div className="flex items-center rounded-lg border border-appflowy-border bg-appflowy-bg p-0.5 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg">
            {views.map((v) => {
              const Icon = v.icon;
              const isActive = activeView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onViewChange(v.id)}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-appflowy-surface text-purple-600 shadow-2xs dark:bg-appflowy-darkSurface dark:text-purple-400'
                      : 'text-appflowy-muted hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:text-appflowy-darkText'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSyncSettings}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor:
              syncStatus === 'connected'
                ? 'rgba(16, 185, 129, 0.12)'
                : syncStatus === 'connecting'
                ? 'rgba(245, 158, 11, 0.12)'
                : syncStatus === 'error'
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(147, 51, 234, 0.12)',
            color:
              syncStatus === 'connected'
                ? '#059669'
                : syncStatus === 'connecting'
                ? '#d97706'
                : syncStatus === 'error'
                ? '#dc2626'
                : '#7c3aed'
          }}
          title="Click to configure Cloud Realtime sync settings"
        >
          {syncStatus === 'connected' && <CheckCircle2 className="h-3 w-3" />}
          {syncStatus === 'connecting' && <Loader2 className="h-3 w-3 animate-spin" />}
          {syncStatus === 'local' && <Radio className="h-3 w-3 animate-pulse" />}
          {syncStatus === 'error' && <AlertTriangle className="h-3 w-3" />}
          <span className="hidden sm:inline">
            {syncStatus === 'connected'
              ? 'Cloud Sync'
              : syncStatus === 'connecting'
              ? 'Connecting'
              : syncStatus === 'error'
              ? 'Sync Error'
              : 'Local Sync'}
          </span>
        </button>

        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-appflowy-muted dark:text-appflowy-darkMuted" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 w-32 rounded-md border border-appflowy-border bg-appflowy-bg pl-8 pr-2.5 text-xs transition-all focus:w-44 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:focus:ring-purple-400"
          />
        </div>

        <div className="flex items-center -space-x-1.5 pl-1" title="Collaborators currently active in this room">
          {onlineUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              style={{ backgroundColor: user.color }}
              className="relative flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white dark:ring-neutral-900"
              title={`${user.name} ${user.id === currentUser.id ? '(You)' : ''}`}
            >
              {user.avatar}
              <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
          ))}
          <div className="flex items-center gap-1 pl-2 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
            <Users className="h-3 w-3" />
            <span className="text-[11px]">{onlineUsers.length}</span>
          </div>
        </div>

        <div className="h-4 w-px bg-appflowy-border dark:bg-appflowy-darkBorder" />

        <div className="flex items-center gap-0.5">
          <button
            onClick={onOpenDbBridge}
            title="Database Bridge (MySQL & SQLite SQL Dump)"
            className="flex h-7 w-7 items-center justify-center rounded-md text-appflowy-muted transition-colors hover:bg-appflowy-hover hover:text-indigo-600 dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkHover dark:hover:text-indigo-400"
          >
            <Database className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onOpenSyncSettings}
            title="Configure Cloud Sync (Supabase Realtime)"
            className="flex h-7 w-7 items-center justify-center rounded-md text-appflowy-muted transition-colors hover:bg-appflowy-hover hover:text-purple-600 dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkHover dark:hover:text-purple-400"
          >
            <Cloud className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onExport}
            title="Export board data (JSON)"
            className="flex h-7 w-7 items-center justify-center rounded-md text-appflowy-muted transition-colors hover:bg-appflowy-hover hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkHover dark:hover:text-appflowy-darkText"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <label
            title="Import board data (JSON)"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-appflowy-muted transition-colors hover:bg-appflowy-hover hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkHover dark:hover:text-appflowy-darkText"
          >
            <Upload className="h-3.5 w-3.5" />
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button
            onClick={onToggleTheme}
            title="Toggle light/dark mode"
            className="flex h-7 w-7 items-center justify-center rounded-md text-appflowy-muted transition-colors hover:bg-appflowy-hover hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkHover dark:hover:text-appflowy-darkText"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
