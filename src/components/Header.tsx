import React, { useState } from 'react';
import { Board, SyncConnectionStatus, UserPresence, WorkspaceView, UserRole, NotionPage } from '../types/board';
import {
  Kanban,
  Calendar,
  Clock,
  Table as TableIcon,
  Search,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Database,
  Menu,
  ShieldCheck,
  Crown,
  LogOut,
  Keyboard,
  Settings
} from 'lucide-react';
import { Tabs, Badge, Separator, Kbd } from './ui';

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
  onLogout: () => void;
  onNavigateToLanding: () => void;
  onOpenAuthModal: () => void;
  onOpenShortcutsModal: () => void;
  onOpenCommandPalette?: () => void;
  onOpenPreferences?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  board,
  activePage,
  currentMode,
  workspaceName,
  currentUserRole,
  isSidebarOpen,
  onToggleSidebar,
  currentRoom: _currentRoom,
  onRoomChange: _onRoomChange,
  onlineUsers,
  currentUser,
  syncStatus,
  activeView,
  onViewChange,
  onOpenSyncSettings,
  onOpenDbBridge,
  onOpenMembersModal,
  isDark: _isDark,
  onToggleTheme: _onToggleTheme,
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  onExport,
  onImport,
  onLogout,
  onNavigateToLanding: _onNavigateToLanding,
  onOpenAuthModal,
  onOpenShortcutsModal,
  onOpenCommandPalette,
  onOpenPreferences
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const viewItems = [
    { id: 'board', label: 'Kanban', icon: <Kanban className="h-3.5 w-3.5" /> },
    { id: 'calendar', label: 'Kalender', icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-3.5 w-3.5" /> },
    { id: 'table', label: 'Tabel', icon: <TableIcon className="h-3.5 w-3.5" /> }
  ];

  return (
    <header className="flex sticky top-0 z-30 justify-between items-center px-4 h-14 border-b border-border bg-bar/95 backdrop-blur-md sm:px-5 shrink-0 select-none">
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <div className="flex gap-3 items-center min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex justify-center items-center w-8 h-8 rounded-lg cursor-pointer text-muted hover:bg-hover hover:text-text transition-colors"
          title={isSidebarOpen ? 'Lipat Sidebar ([)' : 'Buka Sidebar ([)'}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex gap-2 items-center min-w-0">
          <div className="flex items-center gap-1.5 truncate text-xs">
            <span className="hidden text-muted lg:inline truncate">
              {workspaceName}
            </span>
            <span className="hidden text-muted lg:inline">/</span>
            <h1 className="font-display font-bold tracking-tight truncate text-text text-sm">
              {currentMode === 'board' ? board?.title || 'Board' : activePage?.title || 'Dokumen'}
            </h1>
          </div>

          <Badge
            variant={currentUserRole === 'owner' ? 'project' : 'neutral'}
            dot
            onClick={onOpenMembersModal}
            className="hidden sm:inline-flex uppercase text-[10px]"
          >
            {currentUserRole === 'owner' ? (
              <span className="inline-flex items-center gap-1">
                <Crown className="h-2.5 w-2.5" /> {currentUserRole}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" /> {currentUserRole}
              </span>
            )}
          </Badge>
        </div>
      </div>

      {/* Center: Multi-Views Segmented Switch (Khusus Board Mode) */}
      {currentMode === 'board' && (
        <div className="hidden md:flex items-center">
          <Tabs
            items={viewItems}
            activeId={activeView}
            onChange={(id) => onViewChange(id as WorkspaceView)}
          />
        </div>
      )}

      {/* Right: Quick Search, Collaborators & Profile Menu */}
      <div className="flex gap-2 items-center">
        {/* Global Search & Command Palette shortcut */}
        <div
          onClick={onOpenCommandPalette}
          className="relative hidden sm:flex items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-muted hover:border-border-strong hover:bg-hover transition-colors cursor-pointer w-48 justify-between"
          title="Buka Command Palette (⌘K)"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search className="h-3.5 w-3.5 text-muted shrink-0" />
            <span className="truncate">Cari tugas...</span>
          </div>
          <Kbd>/</Kbd>
        </div>

        {/* Realtime Collaborator Avatars */}
        {onlineUsers.length > 0 && (
          <div className="hidden lg:flex items-center -space-x-1.5">
            {onlineUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-white text-[9px] font-bold shadow-2xs"
                style={{ backgroundColor: user.color }}
                title={`${user.name} sedang online`}
              >
                {user.avatar}
              </div>
            ))}
          </div>
        )}

        {/* Sync Status Badge */}
        <button
          type="button"
          onClick={onOpenSyncSettings}
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted hover:bg-hover transition-colors cursor-pointer"
          title="Pengaturan Sinkronisasi Supabase Realtime"
        >
          {syncStatus === 'connected' && (
            <span className="flex items-center gap-1 text-status-done font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span>Realtime</span>
            </span>
          )}
          {syncStatus === 'connecting' && (
            <span className="flex items-center gap-1 text-status-high">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Menghubungkan</span>
            </span>
          )}
          {syncStatus === 'local' && (
            <span className="flex items-center gap-1 text-muted">
              <Radio className="h-3 w-3" />
              <span>Lokal (PWA)</span>
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="flex items-center gap-1 text-danger font-medium">
              <AlertTriangle className="h-3 w-3" />
              <span>Error</span>
            </span>
          )}
        </button>

        {/* User Profile & Quick Actions Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-hover transition-colors cursor-pointer"
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-xs shadow-xs"
              style={{ backgroundColor: currentUser.color || 'var(--project-solid)' }}
            >
              {currentUser.avatar || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-card-hover animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-2 border-b border-border">
                <div className="text-xs font-semibold text-text truncate">{currentUser.name}</div>
                <div className="text-[10px] text-muted capitalize truncate">{currentUserRole}</div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenPreferences?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-muted" />
                  <span>Preferensi Tampilan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenShortcutsModal();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                >
                  <Keyboard className="h-3.5 w-3.5 text-muted" />
                  <span>Pintasan Keyboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenDbBridge();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                >
                  <Database className="h-3.5 w-3.5 text-muted" />
                  <span>Database Export & Bridge</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onExport();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                >
                  <span>Ekspor Cadangan JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                >
                  <span>Impor Cadangan JSON</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={onImport}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAuthModal();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                >
                  <span>Ganti Akun / Sesi</span>
                </button>
              </div>

              <Separator className="my-1" />

              <div className="py-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-danger hover:bg-status-urgent-bg cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
