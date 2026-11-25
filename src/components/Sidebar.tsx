import React, { useState, useEffect } from 'react';
import { Workspace, NotionPage, Board, AuthUser, UserRole } from '../types/board';
import { canEditContent } from '../lib/auth';
import {
  Plus,
  Kanban,
  Users,
  CaretDown,
  Trash,
  FolderPlus,
  MagnifyingGlass,
  Gear,
  FileText,
  SidebarSimple,
  Moon,
  Sun
} from '@phosphor-icons/react';
import { Button, Kbd, ConfirmDialog } from './ui';
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
  onDeleteBoard?: (boardId: string) => void;
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
  onDeleteBoard,
  currentUser,
  currentUserRole: _currentUserRole,
  onOpenAuthModal: _onOpenAuthModal,
  onOpenMembersModal,
  onOpenCommandPalette,
  onOpenPreferences
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsIcon, setNewWsIcon] = useState('🚀');
  const { preferences, updatePreferences } = usePreferences();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const canEdit = canEditContent(_currentUserRole);

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

  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [pageToDelete, setPageToDelete] = useState<NotionPage | null>(null);

  const handleCreateNewBoard = () => {
    setIsAddBoardOpen(true);
  };

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-bar transition-all duration-200 select-none md:static',
          isOpen
            ? 'w-64 max-w-[264px] translate-x-0'
            : '-translate-x-full md:w-14 md:translate-x-0 overflow-hidden'
        )}
      >
        {/* Top: Workspace Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-3 shrink-0">
          {isOpen ? (
            <div className="relative flex-1 min-w-0 pr-1">
              <button
                type="button"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="flex w-full items-center justify-between rounded-xl p-1.5 text-left text-xs font-semibold text-text hover:bg-hover transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-project-soft text-project-solid font-bold text-xs border border-project-ring shrink-0">
                    {activeWorkspace?.icon || 'YM'}
                  </div>
                  <div className="truncate">
                    <div className="font-display font-bold text-xs text-text truncate leading-tight">
                      {activeWorkspace?.name || 'Workspace'}
                    </div>
                    <div className="text-[10px] text-muted font-medium">
                      {activeWorkspace?.members?.length || 1} Anggota
                    </div>
                  </div>
                </div>
                <CaretDown className="h-3.5 w-3.5 text-muted group-hover:text-text transition-colors shrink-0 ml-1" />
              </button>

              {/* Workspace Dropdown Menu */}
              {showWorkspaceMenu && (
                <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border border-border bg-surface p-1.5 shadow-popover animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
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
                        'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs text-text hover:bg-hover transition-colors cursor-pointer',
                        ws.id === activeWorkspaceId && 'bg-project-soft text-project-solid font-bold'
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs">{ws.icon || '🚀'}</span>
                        <span className="truncate">{ws.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted">{ws.members?.length || 0}</span>
                    </button>
                  ))}

                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={() => setIsCreatingWs(true)}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-project-solid hover:bg-project-soft transition-colors cursor-pointer font-medium"
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
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-text hover:bg-hover cursor-pointer"
              title="Buka Sidebar ([)"
            >
              <SidebarSimple className="h-4 w-4" />
            </button>
          )}

          {isOpen && (
            <button
              type="button"
              onClick={onToggle}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
              title="Tutup Sidebar ([)"
            >
              <SidebarSimple className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Modal Inline Buat Workspace */}
        {isCreatingWs && (
          <div className="p-3 border-b border-border bg-surface animate-in fade-in duration-150">
            <form onSubmit={handleCreateWsSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={newWsIcon}
                  onChange={(e) => setNewWsIcon(e.target.value)}
                  className="w-9 rounded-lg border border-border bg-bar p-1 text-center text-xs focus:border-project-accent focus:outline-none"
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
                <Button size="xs" variant="ghost" type="button" onClick={() => setIsCreatingWs(false)}>
                  Batal
                </Button>
                <Button size="xs" variant="primary" type="submit">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Middle Navigation */}
        {isOpen ? (
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
            
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-muted hover:text-text bg-hover/40 hover:bg-hover border border-border/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <MagnifyingGlass className="h-3.5 w-3.5 text-muted group-hover:text-text transition-colors" />
                <span className="font-medium">Cari atau navigasi...</span>
              </div>
              <Kbd>⌘K</Kbd>
            </button>

            {/* Quick Links */}
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                Pintasan
              </div>
              <button
                type="button"
                onClick={onOpenMembersModal}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-3.5 w-3.5 text-project-solid" />
                  <span className="font-medium">Anggota Tim</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-hover text-muted font-bold">
                  {activeWorkspace?.members?.length || 0}
                </span>
              </button>
            </div>

            {/* Project Boards */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                  <span
                    className="h-2 w-2 rounded-full shrink-0 bg-project-solid"
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
                {(boards || []).map((b) => {
                  const isActive = activeTarget.type === 'board' && activeTarget.id === b.id;
                  const cardCount = Object.keys(b.cards || {}).length;

                  return (
                    <div
                      key={b.id}
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer',
                        isActive
                          ? 'bg-project-soft text-project-solid font-semibold border border-project-ring shadow-2xs'
                          : 'text-text hover:bg-hover'
                      )}
                      onClick={() => onSelectTarget({ type: 'board', id: b.id })}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <Kanban className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-project-solid' : 'text-muted')} />
                        <span className="truncate">{b.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[10px] text-muted">{cardCount}</span>
                        {canEdit && onDeleteBoard && (boards || []).length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setBoardToDelete(b); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted hover:text-danger rounded hover:bg-surface transition-opacity cursor-pointer"
                            title="Hapus Papan"
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Standalone Page Docs */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
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
                {(!pages || pages.length === 0) ? (
                  <div className="px-2 py-1.5 text-[11px] text-muted italic">
                    Belum ada dokumen.
                  </div>
                ) : (
                  (pages || []).map((p) => {
                    const isActive = activeTarget.type === 'page' && activeTarget.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          'group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer',
                          isActive
                            ? 'bg-project-soft text-project-solid font-semibold border border-project-ring shadow-2xs'
                            : 'text-text hover:bg-hover'
                        )}
                        onClick={() => onSelectTarget({ type: 'page', id: p.id })}
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <FileText className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-project-solid' : 'text-muted')} />
                          <span className="truncate">{p.title || 'Untitled Document'}</span>
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPageToDelete(p);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-muted hover:text-danger rounded hover:bg-surface transition-opacity"
                            title="Hapus Dokumen"
                          >
                            <Trash className="h-3 w-3" />
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
          /* Mini Collapsed Nav */
          <div className="flex-1 py-3 flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="p-2 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer"
              title="Pencarian Cepat (⌘K)"
            >
              <MagnifyingGlass className="h-4 w-4" />
            </button>
            <div className="w-6 border-t border-border" />
            {boards.slice(0, 3).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectTarget({ type: 'board', id: b.id })}
                className={cn(
                  'p-2 rounded-lg cursor-pointer transition-colors',
                  activeTarget.id === b.id ? 'bg-project-soft text-project-solid' : 'text-muted hover:bg-hover'
                )}
                title={b.title}
              >
                <Kanban className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}

        {/* Bottom Profile & Preferences Footer */}
        <div className="border-t border-border p-2.5 bg-bar flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-project-solid text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {isOpen && (
              <div className="truncate">
                <div className="text-xs font-bold text-text truncate leading-tight">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            )}
          </div>

          {isOpen && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })
                }
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
                title="Ganti Tema"
              >
                {preferences.theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={onOpenPreferences}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
                title="Pengaturan Preferensi"
              >
                <Gear className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

      </aside>

      <ConfirmDialog
        isOpen={isAddBoardOpen}
        onClose={() => setIsAddBoardOpen(false)}
        title="Buat Papan Kanban Baru"
        mode="prompt"
        placeholder="Misal: Sprint Q1..."
        confirmLabel="Buat Papan"
        onConfirm={(title) => {
          if (title) onAddBoard(title);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(boardToDelete)}
        onClose={() => setBoardToDelete(null)}
        title="Hapus Papan Kanban"
        description={`Yakin ingin menghapus papan "${boardToDelete?.title || ''}" beserta seluruh kartunya?`}
        variant="danger"
        confirmLabel="Hapus Papan"
        onConfirm={() => {
          if (boardToDelete && onDeleteBoard) onDeleteBoard(boardToDelete.id);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(pageToDelete)}
        onClose={() => setPageToDelete(null)}
        title="Hapus Dokumen"
        description={`Yakin ingin menghapus dokumen "${pageToDelete?.title || ''}"?`}
        variant="danger"
        confirmLabel="Hapus"
        onConfirm={() => {
          if (pageToDelete) onDeletePage(pageToDelete.id);
        }}
      />
    </>
  );
};
