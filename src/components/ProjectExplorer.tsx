import React, { useState } from 'react';
import { NotionPage, Board, UserRole } from '../types/board';
import { canEditContent } from '../lib/auth';
import {
  Kanban,
  FileText,
  Plus,
  Trash,
  FolderOpen,
  Stack,
  Gear,
  Sparkle,
  Globe
} from '@phosphor-icons/react';
import { cn } from '../lib/cn';
import { ConfirmDialog } from './ui';
import { ContextMenu, ContextMenuItem } from './ui/ContextMenu';

interface ProjectExplorerProps {
  isOpen: boolean;
  onToggle: () => void;
  projectName: string;
  activeTarget: { type: 'board' | 'page'; id: string };
  onSelectTarget: (target: { type: 'board' | 'page'; id: string }) => void;
  boards: Board[];
  pages: NotionPage[];
  onAddBoard: (title: string) => void;
  onDeleteBoard?: (boardId: string) => void;
  onOpenTemplates?: () => void;
  onOpenWorkspaceSettings?: () => void;
  onDeleteWorkspace?: () => void;
  onOpenBoardSettings?: (boardId: string) => void;
  onShareBoard?: (boardId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  currentUserRole: UserRole;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  isOpen,
  onToggle: _onToggle,
  projectName,
  activeTarget,
  onSelectTarget,
  boards,
  pages,
  onAddBoard,
  onDeleteBoard,
  onOpenTemplates,
  onOpenWorkspaceSettings,
  onDeleteWorkspace,
  onOpenBoardSettings,
  onShareBoard,
  onAddPage,
  onDeletePage,
  currentUserRole
}) => {
  const canEdit = canEditContent(currentUserRole);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [pageToDelete, setPageToDelete] = useState<NotionPage | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ open: boolean; x: number; y: number; items: ContextMenuItem[] }>({
    open: false,
    x: 0,
    y: 0,
    items: []
  });

  const openContextMenu = (e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ open: true, x: e.clientX, y: e.clientY, items });
  };

  return (
    <aside
      aria-label="Project Explorer"
      aria-hidden={!isOpen}
      className={cn(
        'hidden md:flex h-full flex-col border-border bg-bar/40 select-none shrink-0 z-20 transition-[width,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isOpen ? 'w-56 opacity-100 border-r' : 'w-0 opacity-0 border-r-0 overflow-hidden pointer-events-none'
      )}
    >
      {/* Top Header: Workspace Name + Hover Settings */}
      <div
        onContextMenu={(e) =>
          openContextMenu(e, [
            ...(onOpenWorkspaceSettings
              ? [
                  {
                    id: 'ws-settings',
                    label: 'Pengaturan Workspace',
                    icon: <Gear className="h-3.5 w-3.5" />,
                    onClick: onOpenWorkspaceSettings
                  }
                ]
              : []),
            ...(onDeleteWorkspace
              ? [
                  {
                    id: 'ws-delete',
                    label: 'Hapus Workspace',
                    variant: 'danger' as const,
                    icon: <Trash className="h-3.5 w-3.5" />,
                    onClick: onDeleteWorkspace
                  }
                ]
              : [])
          ])
        }
        className="group flex h-14 items-center justify-between border-b border-border px-3.5 shrink-0"
      >
        <div className="flex gap-2 items-center min-w-0 truncate">
          <Stack className="h-3.5 w-3.5 text-project-solid shrink-0" />
          <h2 className="text-xs font-bold truncate font-display text-text">
            {projectName}
          </h2>
        </div>
        {onOpenWorkspaceSettings && (
          <button
            type="button"
            onClick={onOpenWorkspaceSettings}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted hover:text-text hover:bg-hover transition-opacity cursor-pointer shrink-0"
            title="Pengaturan Workspace"
          >
            <Gear className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Navigation Tree */}
      <div className="overflow-y-auto flex-1 px-2 py-3 space-y-4">
        
        {/* Section 1: Papan Kanban */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            <div className="flex items-center gap-1.5">
              <Kanban className="w-3 h-3" />
              <span>Papan Sprint</span>
            </div>
            {canEdit && (
              <div className="flex items-center gap-0.5">
                {onOpenTemplates && (
                  <button
                    type="button"
                    onClick={onOpenTemplates}
                    className="flex justify-center items-center w-4 h-4 rounded cursor-pointer text-muted hover:text-project-solid hover:bg-hover"
                    title="Buat dari Template"
                  >
                    <Sparkle className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddBoardOpen(true)}
                  className="flex justify-center items-center w-4 h-4 rounded cursor-pointer text-muted hover:text-text hover:bg-hover"
                  title="Tambah Papan"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            {(!boards || boards.length === 0) ? (
              <div className="px-2 py-1.5 text-[11px] text-muted italic">
                Belum ada papan.
              </div>
            ) : (
              (boards || []).map((b) => {
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
                    onContextMenu={(e) =>
                      openContextMenu(e, [
                        ...(onShareBoard
                          ? [
                              {
                                id: 'board-share',
                                label: 'Bagikan Papan',
                                icon: <Globe className="h-3.5 w-3.5" />,
                                onClick: () => onShareBoard(b.id)
                              }
                            ]
                          : []),
                        ...(onOpenBoardSettings
                          ? [
                              {
                                id: 'board-settings',
                                label: 'Pengaturan Papan',
                                icon: <Gear className="h-3.5 w-3.5" />,
                                onClick: () => onOpenBoardSettings(b.id)
                              }
                            ]
                          : []),
                        ...(canEdit && onDeleteBoard
                          ? [
                              {
                                id: 'board-delete',
                                label: 'Hapus Papan',
                                variant: 'danger' as const,
                                icon: <Trash className="h-3.5 w-3.5" />,
                                onClick: () => setBoardToDelete(b)
                              }
                            ]
                          : [])
                      ])
                    }
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <Kanban className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-project-solid' : 'text-muted')} />
                      <span className="truncate">{b.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[10px] text-muted">{cardCount}</span>
                      {canEdit && onDeleteBoard && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setBoardToDelete(b); }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-muted hover:text-danger rounded hover:bg-surface transition-opacity cursor-pointer"
                          title="Hapus Papan"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 2: Dokumen & Spesifikasi */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            <div className="flex items-center gap-1.5">
              <FolderOpen className="w-3 h-3" />
              <span>Dokumen & PRD</span>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={onAddPage}
                className="flex justify-center items-center w-4 h-4 rounded cursor-pointer text-muted hover:text-text hover:bg-hover"
                title="Tambah Dokumen"
              >
                <Plus className="w-3 h-3" />
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
                    onContextMenu={(e) =>
                      openContextMenu(e, [
                        ...(canEdit
                          ? [
                              {
                                id: 'page-delete',
                                label: 'Hapus Dokumen',
                                variant: 'danger' as const,
                                icon: <Trash className="h-3.5 w-3.5" />,
                                onClick: () => setPageToDelete(p)
                              }
                            ]
                          : [])
                      ])
                    }
                  >
                    <div className="flex gap-2 items-center min-w-0 truncate">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted group-hover:text-text" />
                      <span className="truncate">{p.title || 'Untitled Document'}</span>
                    </div>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPageToDelete(p);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-muted hover:text-danger rounded hover:bg-surface transition-opacity cursor-pointer"
                        title="Hapus Dokumen"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      <ConfirmDialog
        isOpen={isAddBoardOpen}
        onClose={() => setIsAddBoardOpen(false)}
        title="Buat Papan Kanban Baru"
        mode="prompt"
        placeholder="Misal: Roadmap Q1..."
        confirmLabel="Buat Papan"
        onConfirm={(val) => {
          if (val) onAddBoard(val);
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
        description={`Yakin ingin menghapus dokumen "${pageToDelete?.title || ''}"? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
        confirmLabel="Hapus"
        onConfirm={() => {
          if (pageToDelete) onDeletePage(pageToDelete.id);
        }}
      />

      <ContextMenu
        isOpen={ctxMenu.open}
        x={ctxMenu.x}
        y={ctxMenu.y}
        items={ctxMenu.items}
        onClose={() => setCtxMenu((prev) => ({ ...prev, open: false }))}
      />
    </aside>
  );
};
