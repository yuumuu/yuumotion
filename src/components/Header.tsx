import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Board, SyncConnectionStatus, UserPresence, UserRole, NotionPage, NotificationItem } from '../types/board';
import { NotificationInbox } from './NotificationInbox';
import {
  MagnifyingGlass,
  Radio,
  CheckCircle,
  Warning,
  Spinner,
  List as MenuIcon,
  SignOut,
  Gear,
  House,
  User
} from '@phosphor-icons/react';
import { Kbd } from './ui';
import { SettingsTab } from './SettingsHubModal';

interface HeaderProps {
  board?: Board;
  activePage?: NotionPage;
  currentMode: 'workspace' | 'board' | 'page';
  workspaceName: string;
  currentUserRole: UserRole;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onlineUsers: UserPresence[];
  currentUser: UserPresence;
  syncStatus: SyncConnectionStatus;
  onLogout: () => void;
  onNavigateToLanding: () => void;
  onSelectWorkspaceOverview?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenSettings?: (tab: SettingsTab) => void;
  onSelectOnlineUser?: (user: UserPresence) => void;
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  board,
  activePage,
  currentMode,
  workspaceName,
  currentUserRole,
  onToggleSidebar,
  onlineUsers,
  currentUser,
  syncStatus,
  onLogout,
  onNavigateToLanding,
  onSelectWorkspaceOverview,
  onOpenCommandPalette,
  onOpenSettings,
  onSelectOnlineUser,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectNotification
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 56, right: 16 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setShowUserMenu(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showUserMenu]);

  const toggleMenu = () => {
    if (!showUserMenu && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: Math.min(rect.bottom + 8, window.innerHeight - 220),
        right: Math.max(12, window.innerWidth - rect.right)
      });
    }
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="flex sticky top-0 z-30 gap-4 justify-between items-center px-4 h-[var(--space-header-h)] border-b backdrop-blur-md select-none border-border bg-bar/85 sm:px-6 shrink-0 transition-[height] duration-150">
      <div className="flex gap-3 items-center min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex justify-center items-center w-8 h-8 rounded-lg transition-colors cursor-pointer md:hidden text-muted hover:bg-hover hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent shrink-0"
          title="Toggle Sidebar ([)"
        >
          <MenuIcon className="w-4 h-4" />
        </button>

        <div className="flex gap-2 items-center min-w-0 text-xs">
          {currentMode === 'workspace' ? (
            <span className="text-sm font-semibold truncate font-display text-text">
              {workspaceName}
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={onSelectWorkspaceOverview}
                className="hidden font-medium truncate text-muted hover:text-project-solid hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent lg:inline cursor-pointer"
                title="Buka Detail Workspace"
              >
                {workspaceName}
              </button>
              <span className="hidden text-muted/60 lg:inline">/</span>
              <span className="text-sm font-semibold truncate font-display text-text">
                {currentMode === 'board' ? board?.title || 'Board' : activePage?.title || 'Dokumen'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center: Clean Search Pill */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center rounded-xl border border-border bg-surface/90 px-3.5 py-1.5 text-xs text-muted hover:border-project-ring hover:bg-hover/60 transition-[background-color,border-color] duration-150 cursor-pointer w-full max-w-sm justify-between shadow-2xs"
        title="Buka Command Palette (⌘K)"
      >
        <span className="flex gap-2 items-center truncate">
          <MagnifyingGlass className="h-3.5 w-3.5 text-muted shrink-0" />
          <span className="truncate">Cari tugas, dokumen, atau perintah...</span>
        </span>
        <Kbd>⌘K</Kbd>
      </button>

      {/* Right: Online Team, Sync Status & Clean Profile Menu */}
      <div className="flex gap-2.5 items-center shrink-0">
        {onlineUsers.length > 0 && (
          <div className="hidden sm:flex items-center -space-x-1.5 mr-0.5">
            {onlineUsers.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onSelectOnlineUser?.(u)}
                title={`${u.name} (Lihat Profil)`}
                style={{ backgroundColor: u.color || '#2563EB' }}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-bar text-[10px] font-bold text-white shadow-2xs transition-transform hover:scale-110 hover:z-10 cursor-pointer"
              >
                {u.avatarEmoji || u.avatar || u.name?.[0]?.toUpperCase() || 'U'}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => onOpenSettings?.('sync')}
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-2.5 py-1 text-[11px] font-medium text-muted hover:bg-hover transition-colors cursor-pointer"
          title="Status Sinkronisasi"
        >
          {syncStatus === 'connected' && (
            <span className="flex gap-1 items-center font-medium text-status-done">
              <CheckCircle className="w-3 h-3" />
              <span>Realtime</span>
            </span>
          )}
          {syncStatus === 'connecting' && (
            <span className="flex gap-1 items-center text-status-high">
              <Spinner className="w-3 h-3 animate-spin" />
              <span>Menghubungkan</span>
            </span>
          )}
          {syncStatus === 'local' && (
            <span className="flex gap-1 items-center text-muted">
              <Radio className="w-3 h-3" />
              <span>Lokal</span>
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="flex gap-1 items-center font-medium text-danger">
              <Warning className="w-3 h-3" />
              <span>Error</span>
            </span>
          )}
        </button>

        {onMarkNotificationRead && onMarkAllNotificationsRead && onSelectNotification && (
          <NotificationInbox
            notifications={notifications}
            onMarkRead={onMarkNotificationRead}
            onMarkAllRead={onMarkAllNotificationsRead}
            onSelectNotification={onSelectNotification}
          />
        )}

        {/* User Menu Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleMenu}
          style={{ backgroundColor: currentUser.color || '#6366F1' }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shadow-2xs hover:opacity-90 active:scale-95 transition-[opacity,transform] cursor-pointer"
          title="Menu Profil"
        >
          {currentUser.avatar || currentUser.name?.[0]?.toUpperCase() || 'U'}
        </button>

        {showUserMenu && createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: `${menuPos.top}px`, right: `${menuPos.right}px`, zIndex: 9999 }}
            className="w-56 rounded-2xl border border-border bg-surface p-1.5 shadow-popover animate-yuu-crossfade"
          >
            <div className="px-3 py-2 mb-1 border-b border-border">
              <div className="text-xs font-bold truncate text-text">{currentUser.name}</div>
              <div className="font-mono text-[10px] uppercase text-muted">{currentUserRole}</div>
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenSettings?.('profile');
                setShowUserMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-muted" />
              <span>Profil Akun</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenSettings?.('appearance');
                setShowUserMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
            >
              <Gear className="h-3.5 w-3.5 text-muted" />
              <span>Pengaturan &amp; Preferensi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigateToLanding();
                setShowUserMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-text hover:bg-hover transition-colors cursor-pointer"
            >
              <House className="h-3.5 w-3.5 text-muted" />
              <span>Halaman Utama</span>
            </button>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                onLogout();
                setShowUserMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-danger hover:bg-danger/10 transition-colors cursor-pointer font-medium"
            >
              <SignOut className="h-3.5 w-3.5" />
              <span>Keluar Akun</span>
            </button>
          </div>,
          document.body
        )}
      </div>
    </header>
  );
};
