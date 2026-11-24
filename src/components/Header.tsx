import React, { useState } from 'react';
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
  Crown,
  MoreHorizontal,
  LogOut,
  User as UserIcon,
  Home,
  Keyboard
} from 'lucide-react';
import { Tabs, Badge, Separator } from './ui';

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
  onImport,
  onLogout,
  onNavigateToLanding,
  onOpenAuthModal,
  onOpenShortcutsModal
}) => {
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);

  const viewItems = [
    { id: 'board', label: 'Board', icon: <Kanban className="h-3.5 w-3.5" /> },
    { id: 'calendar', label: 'Kalender', icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-3.5 w-3.5" /> },
    { id: 'table', label: 'Tabel', icon: <TableIcon className="h-3.5 w-3.5" /> }
  ];

  return (
    <header className="flex sticky top-0 z-30 justify-between items-center px-4 h-14 border-b backdrop-blur-md border-appflowy-border bg-white/90 sm:px-5 dark:border-appflowy-darkBorder dark:bg-[#121215]/90">
      <div className="flex gap-3 items-center min-w-0">
        <button
          onClick={onToggleSidebar}
          className="flex justify-center items-center w-8 h-8 rounded-lg cursor-pointer text-appflowy-muted hover:bg-neutral-100 hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 transition-colors"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex gap-2 items-center min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="hidden text-xs truncate text-appflowy-muted dark:text-appflowy-darkMuted lg:inline">
              {workspaceName}
            </span>
            <span className="hidden text-appflowy-muted dark:text-appflowy-darkMuted lg:inline">/</span>
            <h1 className="text-xs font-semibold tracking-tight truncate text-appflowy-text dark:text-appflowy-darkText">
              {currentMode === 'board' ? board?.title || 'Board' : activePage?.title || 'Dokumen'}
            </h1>
          </div>

          <Badge
            variant={currentUserRole === 'owner' ? 'purple' : 'neutral'}
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

        {currentMode === 'board' && (
          <div className="ml-2 hidden sm:block">
            <Tabs
              items={viewItems}
              activeId={activeView}
              onChange={(id) => onViewChange(id as WorkspaceView)}
              size="xs"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 ms-2.5">
        <div className="hidden relative xl:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-appflowy-muted dark:text-appflowy-darkMuted" />
          <input
            id="search-input-field"
            type="text"
            placeholder="Cari item... (/)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-40 rounded-lg border border-appflowy-border bg-appflowy-bg pl-8 pr-2.5 text-xs transition-all focus:w-52 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:focus:ring-purple-400"
            title="Cari kartu atau dokumen (Tekan / untuk fokus)"
          />
        </div>

        <button
          onClick={onOpenSyncSettings}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors hover:opacity-85 cursor-pointer"
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
          title="Status Sinkronisasi (Klik untuk konfigurasi)"
        >
          {syncStatus === 'connected' && <CheckCircle2 className="h-3 w-3" />}
          {syncStatus === 'connecting' && <Loader2 className="h-3 w-3 animate-spin" />}
          {syncStatus === 'local' && <Radio className="h-3 w-3 animate-pulse" />}
          {syncStatus === 'error' && <AlertTriangle className="h-3 w-3" />}
          <span className="hidden sm:inline">
            {syncStatus === 'connected'
              ? 'Cloud'
              : syncStatus === 'connecting'
              ? 'Connecting'
              : syncStatus === 'error'
              ? 'Error'
              : 'Local'}
          </span>
        </button>

        <div className="flex items-center -space-x-1.5" title="Pengguna aktif di room ini">
          {onlineUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              style={{ backgroundColor: user.color }}
              className="relative flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white dark:ring-neutral-900"
              title={`${user.name} ${user.id === currentUser.id ? '(Anda)' : ''}`}
            >
              {user.avatar}
              <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
          ))}
          <div className="flex items-center gap-0.5 pl-2 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
            <Users className="h-3 w-3" />
            <span className="text-[11px]">{onlineUsers.length}</span>
          </div>
        </div>

        <Separator orientation="vertical" />

        {/* Tools Menu (Database, Sync, Export/Import) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowToolsMenu(!showToolsMenu);
              setShowUserMenu(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-appflowy-muted transition-colors hover:bg-neutral-100 hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 dark:hover:text-appflowy-darkText cursor-pointer"
            title="Alat & Opsi Ekspor Data"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showToolsMenu && (
            <div className="absolute right-0 top-10 z-40 w-52 rounded-xl border border-appflowy-border bg-appflowy-surface p-1.5 shadow-xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <div className="px-2 py-1.5 border-b border-appflowy-border dark:border-appflowy-darkBorder mb-1">
                <span className="text-[10px] uppercase font-semibold text-appflowy-muted dark:text-appflowy-darkMuted">
                  Sync Room
                </span>
                <div className="mt-1 flex items-center gap-1">
                  {isEditingRoom ? (
                    <input
                      type="text"
                      autoFocus
                      value={currentRoom}
                      onChange={(e) => onRoomChange(e.target.value)}
                      onBlur={() => setIsEditingRoom(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingRoom(false);
                      }}
                      className="w-full rounded border border-appflowy-border bg-appflowy-bg px-1.5 py-0.5 text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                    />
                  ) : (
                    <span
                      onClick={() => setIsEditingRoom(true)}
                      className="cursor-pointer font-mono text-xs text-purple-600 hover:underline dark:text-purple-400"
                      title="Klik untuk ubah room"
                    >
                      #{currentRoom}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowToolsMenu(false);
                  onOpenDbBridge();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800 cursor-pointer"
              >
                <Database className="h-3.5 w-3.5 text-indigo-500" />
                <span>Database Bridge (SQL)</span>
              </button>

              <button
                onClick={() => {
                  setShowToolsMenu(false);
                  onOpenSyncSettings();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800 cursor-pointer"
              >
                <Cloud className="h-3.5 w-3.5 text-purple-500" />
                <span>Realtime Cloud Sync</span>
              </button>

              <div className="my-1 h-px bg-appflowy-border dark:bg-appflowy-darkBorder" />

              <button
                onClick={() => {
                  setShowToolsMenu(false);
                  onExport();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-neutral-500" />
                <span>Ekspor Board (JSON)</span>
              </button>

              <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800">
                <Upload className="h-3.5 w-3.5 text-neutral-500" />
                <span>Impor Board (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    setShowToolsMenu(false);
                    onImport(e);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        <button
          onClick={onOpenShortcutsModal}
          title="Pintasan Keyboard (Tekan ?)"
          className="flex justify-center items-center w-8 h-8 rounded-lg transition-colors cursor-pointer text-appflowy-muted hover:bg-neutral-100 hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 dark:hover:text-appflowy-darkText"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle light/dark mode"
          className="flex justify-center items-center w-8 h-8 rounded-lg transition-colors cursor-pointer text-appflowy-muted hover:bg-neutral-100 hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 dark:hover:text-appflowy-darkText"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Avatar & Logout Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowToolsMenu(false);
            }}
            style={{ backgroundColor: currentUser.color }}
            className="flex justify-center items-center w-8 h-8 text-xs font-bold text-white rounded-full ring-2 transition-transform cursor-pointer shadow-xs ring-purple-400/40 hover:scale-105"
            title={`${currentUser.name} (Akun & Opsi Keluar)`}
          >
            {currentUser.avatar}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 z-40 p-2 w-56 rounded-xl border shadow-xl border-appflowy-border bg-appflowy-surface dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <div className="px-2.5 py-2 border-b border-appflowy-border dark:border-appflowy-darkBorder mb-1">
                <p className="text-xs font-semibold truncate text-appflowy-text dark:text-appflowy-darkText">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="purple" className="text-[9px] uppercase font-semibold">
                    {currentUserRole}
                  </Badge>
                  <span className="text-[10px] text-appflowy-muted dark:text-appflowy-darkMuted">
                    Online
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenAuthModal();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800 cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-neutral-500" />
                <span>Ganti Akun / Profil</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigateToLanding();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800 cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 text-neutral-500" />
                <span>Halaman Beranda</span>
              </button>

              <Separator className="my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};