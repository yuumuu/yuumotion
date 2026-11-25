import React, { useState } from 'react';
import { Board, SyncConnectionStatus, UserPresence, WorkspaceView, UserRole, NotionPage } from '../types/board';
import {
  Kanban,
  CalendarBlank,
  Clock,
  Table as TableIcon,
  MagnifyingGlass,
  Radio,
  CheckCircle,
  Warning,
  Spinner,
  Database,
  List as MenuIcon,
  ShieldCheck,
  Crown,
  SignOut,
  Keyboard,
  Gear,
  House
} from '@phosphor-icons/react';
import { Badge, Kbd } from './ui';
import { cn } from '../lib/cn';

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
  isSidebarOpen: _isSidebarOpen,
  onToggleSidebar,
  currentRoom: _currentRoom,
  onRoomChange: _onRoomChange,
  onlineUsers,
  currentUser: _currentUser,
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
  onNavigateToLanding,
  onOpenAuthModal: _onOpenAuthModal,
  onOpenShortcutsModal,
  onOpenCommandPalette,
  onOpenPreferences
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const viewItems: { id: WorkspaceView; label: string; icon: React.ReactNode }[] = [
    { id: 'board', label: 'Kanban', icon: <Kanban className="h-3.5 w-3.5" /> },
    { id: 'table', label: 'Table', icon: <TableIcon className="h-3.5 w-3.5" /> },
    { id: 'calendar', label: 'Kalender', icon: <CalendarBlank className="h-3.5 w-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-3.5 w-3.5" /> }
  ];

  return (
    <header className="flex sticky top-0 z-30 justify-between items-center px-4 h-14 border-b border-border bg-bar/80 backdrop-blur-md sm:px-6 shrink-0 select-none">
      {/* Left: Sidebar Toggle & Linear Breadcrumb */}
      <div className="flex gap-3 items-center min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex justify-center items-center w-8 h-8 rounded-lg cursor-pointer text-muted hover:bg-hover hover:text-text transition-colors"
          title="Toggle Sidebar ([)"
        >
          <MenuIcon className="w-4 h-4" />
        </button>

        <div className="flex gap-2 items-center min-w-0 text-xs">
          <span className="hidden text-muted font-medium lg:inline truncate">
            {workspaceName}
          </span>
          <span className="hidden text-muted/60 lg:inline">/</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="h-2 w-2 rounded-full bg-project-solid shrink-0" />
            <h1 className="font-display font-bold tracking-tight truncate text-text text-sm">
              {currentMode === 'board' ? board?.title || 'Board' : activePage?.title || 'Dokumen'}
            </h1>
          </div>

          <Badge
            variant={currentUserRole === 'owner' ? 'project' : 'neutral'}
            dot
            onClick={onOpenMembersModal}
            className="hidden sm:inline-flex uppercase text-[10px] cursor-pointer"
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

      {/* Center: Linear-Style Segmented View Switcher */}
      {currentMode === 'board' && (
        <div className="hidden md:flex items-center bg-hover/60 border border-border/80 p-0.5 rounded-xl text-xs">
          {viewItems.map((v) => {
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onViewChange(v.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] cursor-pointer',
                  isActive
                    ? 'bg-surface text-text font-bold shadow-card-sm'
                    : 'text-muted hover:text-text hover:bg-surface/50'
                )}
              >
                <span className={isActive ? 'text-project-solid' : 'text-muted'}>{v.icon}</span>
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Right: Quick Search, Collaborators & Profile Menu */}
      <div className="flex gap-2.5 items-center">
        {/* Command Palette Trigger */}
        <div
          onClick={onOpenCommandPalette}
          className="relative hidden sm:flex items-center rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-xs text-muted hover:border-project-ring hover:bg-hover transition-all cursor-pointer w-44 justify-between shadow-2xs"
          title="Buka Command Palette (⌘K)"
        >
          <div className="flex items-center gap-1.5 truncate">
            <MagnifyingGlass className="h-3.5 w-3.5 text-muted shrink-0" />
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
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-bar text-white text-[9px] font-bold shadow-2xs"
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
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1 text-[11px] font-medium text-muted hover:bg-hover transition-colors cursor-pointer"
          title="Status Sinkronisasi"
        >
          {syncStatus === 'connected' && (
            <span className="flex items-center gap-1 text-status-done font-medium">
              <CheckCircle className="h-3 w-3" />
              <span>Realtime</span>
            </span>
          )}
          {syncStatus === 'connecting' && (
            <span className="flex items-center gap-1 text-status-high">
              <Spinner className="h-3 w-3 animate-spin" />
              <span>Menghubungkan</span>
            </span>
          )}
          {syncStatus === 'local' && (
            <span className="flex items-center gap-1 text-muted">
              <Radio className="h-3 w-3" />
              <span>Offline (PWA)</span>
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="flex items-center gap-1 text-danger font-medium">
              <Warning className="h-3 w-3" />
              <span>Error</span>
            </span>
          )}
        </button>

        {/* User Profile & Quick Actions Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-hover transition-colors cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-project-solid text-white text-xs font-bold shadow-2xs">
              {currentUserRole === 'owner' ? '★' : '●'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-border bg-surface p-1.5 shadow-popover animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-xs font-bold text-text border-b border-border mb-1">
                Akun & Cadangan
              </div>

              <button
                type="button"
                onClick={() => {
                  onOpenPreferences?.();
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <Gear className="h-3.5 w-3.5 text-muted" />
                <span>Pengaturan Preferensi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenDbBridge();
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <Database className="h-3.5 w-3.5 text-muted" />
                <span>Koneksi Supabase</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenShortcutsModal();
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <Keyboard className="h-3.5 w-3.5 text-muted" />
                <span>Daftar Pintasan (Keyboard)</span>
              </button>

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={() => {
                  onExport();
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <span>Unduh Cadangan (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <span>Pulihkan Cadangan (JSON)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  onImport(e);
                  setShowUserMenu(false);
                }}
                className="hidden"
              />

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={() => {
                  onNavigateToLanding();
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <House className="h-3.5 w-3.5 text-muted" />
                <span>Halaman Utama (Landing)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-danger hover:bg-danger/10 transition-colors cursor-pointer font-medium"
              >
                <SignOut className="h-3.5 w-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
