import React, { useState, useEffect } from 'react';
import { Workspace, NotionPage, Board, AuthUser, UserRole } from '../types/board';
import { canEditContent } from '../lib/auth';
import {
  Plus,
  Kanban,
  Users,
  ChevronDown,
  Trash2,
  FolderPlus,
  Search,
  Settings,
  FileText,
  PanelLeftClose,
  PanelLeft,
  Moon,
  Sun,
  Wifi
} from 'lucide-react';
import { Separator, Button, Kbd } from './ui';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string, icon: string) => void;
  activeTarget: { type: 'board' | 'page'; id: string };
  onSelectTarget: (target: { type: 'board' | 'page'; id: string }) => void;
  pages: NotionPage[];
  boards: Board[];
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onAddBoard: (title: string) => void;
  currentUser: AuthUser;
  currentUserRole: UserRole;
  onOpenAuthModal: () => void;
  onOpenMembersModal: () => void;
  onOpenCommandPalette?: () => void;
  onOpenPreferences?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  activeTarget,
  onSelectTarget,
  pages,
  boards,
  onAddPage,
  onDeletePage,
  onAddBoard,
  currentUser,
  currentUserRole,
  onOpenAuthModal,
  onOpenMembersModal,
  onOpenCommandPalette,
  onOpenPreferences
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsIcon, setNewWsIcon] = useState('🚀');
  const { preferences, updatePreferences, activeProjectTheme } = usePreferences();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const canEdit = canEditContent(currentUserRole);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '[' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const handleCreateWsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    onCreateWorkspace(newWsName.trim(), newWsIcon);
    setNewWsName('');
    setIsCreatingWs(false);
    setShowWorkspaceMenu(false);
  };

  const handleCreateNewBoard = () => {
    const title = prompt('Judul Kanban Board Baru:');
    if (title?.trim()) {
      onAddBoard(title.trim());
    }
  };

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-bar transition-all duration-200 select-none md:static',
          isOpen
            ? 'w-[var(--space-col-w)] max-w-[280px] translate-x-0'
            : '-translate-x-full md:w-14 md:translate-x-0 overflow-hidden'
        )}
      >
        {/* Zone 1: Workspace Switcher Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-3 shrink-0">
          {isOpen ? (
            <div className="relative flex-1 min-w-0 pr-1">
              <button
                type="button"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm shrink-0">{activeWorkspace?.icon || '🚀'}</span>
                  <span className="font-display font-bold text-sm truncate">{activeWorkspace?.name || 'Workspace'}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted shrink-0 ml-1" />
              </button>

              {showWorkspaceMenu && (
                <div className="absolute left-0 top-11 z-50 w-60 rounded-xl border border-border bg-surface p-1 shadow-card-hover animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Pilih Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        onSelectWorkspace(ws.id);
                        setShowWorkspaceMenu(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer',
                        ws.id === activeWorkspaceId && 'bg-project-soft text-project-accent font-semibold'
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{ws.icon}</span>
                        <span className="truncate">{ws.name}</span>
                      </div>
                      <span className="text-[10px] text-muted">{ws.members.length} anggota</span>
                    </button>
                  ))}

                  <Separator className="my-1" />
                  <button
                    type="button"
                    onClick={() => setIsCreatingWs(true)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-project-accent hover:bg-project-soft transition-colors cursor-pointer"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    <span>Buat Workspace Baru</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-text hover:bg-hover cursor-pointer"
              title="Buka Sidebar ([)"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          {isOpen && (
            <button
              type="button"
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
              title="Tutup Sidebar ([)"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Create Workspace Modal Popup */}
        {isCreatingWs && (
          <div className="p-3 border-b border-border bg-surface animate-in fade-in duration-150">
            <form onSubmit={handleCreateWsSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={newWsIcon}
                  onChange={(e) => setNewWsIcon(e.target.value)}
                  className="w-10 rounded-lg border border-border bg-bar p-1 text-center text-sm focus:border-project-accent"
                />
                <input
                  type="text"
                  placeholder="Nama workspace..."
                  autoFocus
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-bar px-2.5 py-1 text-xs text-text placeholder:text-muted focus:border-project-accent focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-1.5">
                <Button size="sm" variant="ghost" type="button" onClick={() => setIsCreatingWs(false)}>
                  Batal
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Zone 2: Navigation Body */}
        {isOpen ? (
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
            {/* Quick Actions Bar */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  <span>Pencarian Cepat</span>
                </div>
                <Kbd>⌘K</Kbd>
              </button>

              <button
                type="button"
                onClick={onOpenMembersModal}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  <span>Anggota Workspace</span>
                </div>
                <span className="font-mono text-[10px] text-muted">{activeWorkspace.members.length}</span>
              </button>
            </div>

            <Separator />

            {/* Project Hub Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: 'var(--project-solid)' }}
                    title={`Aksen Project: ${activeProjectTheme}`}
                  />
                  <span>Project Boards</span>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleCreateNewBoard}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-text hover:bg-hover cursor-pointer"
                    title="Tambah Papan Baru"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-0.5">
                {boards.map((b) => {
                  const isActive = activeTarget.type === 'board' && activeTarget.id === b.id;
                  const cardCount = Object.keys(b.cards || {}).length;

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onSelectTarget({ type: 'board', id: b.id })}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer text-left',
                        isActive
                          ? 'bg-project-soft text-project-accent font-semibold shadow-card-rest'
                          : 'text-text hover:bg-hover'
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Kanban className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-project-accent' : 'text-muted')} />
                        <span className="truncate">{b.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted">{cardCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Standalone Page Docs Section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Dokumen Halaman
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={onAddPage}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-text hover:bg-hover cursor-pointer"
                    title="Buat Dokumen Baru"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-0.5">
                {pages.length === 0 ? (
                  <div className="px-2 py-2 text-[11px] text-muted italic">
                    Belum ada dokumen. Klik + untuk membuat.
                  </div>
                ) : (
                  pages.map((p) => {
                    const isActive = activeTarget.type === 'page' && activeTarget.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          'group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer',
                          isActive
                            ? 'bg-project-soft text-project-accent font-semibold shadow-card-rest'
                            : 'text-text hover:bg-hover'
                        )}
                        onClick={() => onSelectTarget({ type: 'page', id: p.id })}
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <span className="text-xs shrink-0">{p.icon || '📄'}</span>
                          <span className="truncate">{p.title || 'Untitled Document'}</span>
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Hapus dokumen "${p.title}"?`)) {
                                onDeletePage(p.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger rounded hover:bg-surface transition-opacity"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Nav */
          <div className="flex-1 py-4 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="p-2 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer"
              title="Pencarian Cepat (⌘K)"
            >
              <Search className="h-4 w-4" />
            </button>
            <Separator className="w-8" />
            {boards.slice(0, 3).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectTarget({ type: 'board', id: b.id })}
                className={cn(
                  'p-2 rounded-lg cursor-pointer transition-colors',
                  activeTarget.id === b.id ? 'bg-project-soft text-project-accent' : 'text-muted hover:bg-hover'
                )}
                title={b.title}
              >
                <Kanban className="h-4 w-4" />
              </button>
            ))}
            <Separator className="w-8" />
            {pages.slice(0, 3).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectTarget({ type: 'page', id: p.id })}
                className={cn(
                  'p-2 rounded-lg cursor-pointer transition-colors',
                  activeTarget.id === p.id ? 'bg-project-soft text-project-accent' : 'text-muted hover:bg-hover'
                )}
                title={p.title}
              >
                <FileText className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}

        {/* Zone 3: Footer Bar */}
        <div className="border-t border-border px-3 py-2.5 bg-bar shrink-0 space-y-2">
          {isOpen && (
            <div className="flex items-center justify-between text-[11px] text-muted px-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Wifi className="h-3 w-3 text-status-done" />
                <span>Supabase & PWA Ready</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })
                }
                className="p-1 rounded-md text-muted hover:text-text hover:bg-hover cursor-pointer"
                title="Ganti Tema (Terang/Gelap)"
              >
                {preferences.theme === 'dark' ? (
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-text hover:bg-hover transition-colors cursor-pointer min-w-0',
                isOpen ? 'flex-1' : 'mx-auto'
              )}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-white font-bold text-[10px] shrink-0"
                style={{ backgroundColor: currentUser.color || 'var(--project-solid)' }}
              >
                {currentUser.avatar || 'U'}
              </div>
              {isOpen && (
                <div className="truncate">
                  <div className="font-semibold text-xs truncate leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-muted capitalize mt-0.5">{currentUserRole}</div>
                </div>
              )}
            </button>

            {isOpen && (
              <button
                type="button"
                onClick={onOpenPreferences}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
                title="Buka Pengaturan Preferensi"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};
