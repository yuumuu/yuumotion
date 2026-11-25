import React from 'react';
import { NotionPage, Board, UserRole } from '../types/board';
import { canEditContent } from '../lib/auth';
import {
  Kanban,
  FileText,
  Plus,
  Trash,
  SidebarSimple,
  FolderOpen
} from '@phosphor-icons/react';
import { cn } from '../lib/cn';

interface ProjectExplorerProps {
  isOpen: boolean;
  onToggle: () => void;
  projectName: string;
  activeTarget: { type: 'board' | 'page'; id: string };
  onSelectTarget: (target: { type: 'board' | 'page'; id: string }) => void;
  boards: Board[];
  pages: NotionPage[];
  onAddBoard: (title: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  currentUserRole: UserRole;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  isOpen,
  onToggle,
  projectName,
  activeTarget,
  onSelectTarget,
  boards,
  pages,
  onAddBoard,
  onAddPage,
  onDeletePage,
  currentUserRole
}) => {
  const canEdit = canEditContent(currentUserRole);

  const handleCreateBoard = () => {
    const title = prompt('Judul Papan Baru:');
    if (title?.trim()) onAddBoard(title.trim());
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Project Explorer"
      className="hidden md:flex h-full w-56 flex-col border-r border-border bg-bar/40 select-none shrink-0 z-20"
    >
      {/* Top Header: Project Name & Collapse button */}
      <div className="flex h-14 items-center justify-between border-b border-border px-3.5 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="h-2 w-2 rounded-full bg-project-solid shrink-0" />
          <h2 className="font-display font-bold text-xs text-text truncate">
            {projectName}
          </h2>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
          title="Tutup Panel ([)"
        >
          <SidebarSimple className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        
        {/* Section 1: Papan Kanban */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            <div className="flex items-center gap-1.5">
              <Kanban className="h-3 w-3" />
              <span>Papan Sprint</span>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={handleCreateBoard}
                className="flex h-4 w-4 items-center justify-center rounded text-muted hover:text-text hover:bg-hover cursor-pointer"
                title="Tambah Papan"
              >
                <Plus className="h-3 w-3" />
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
                    'flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer text-left',
                    isActive
                      ? 'bg-project-soft text-project-solid font-semibold border border-project-ring shadow-2xs'
                      : 'text-text hover:bg-hover'
                  )}
                >
                  <span className="truncate">{b.title}</span>
                  <span className="font-mono text-[10px] text-muted">{cardCount}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Dokumen & Spesifikasi */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            <div className="flex items-center gap-1.5">
              <FolderOpen className="h-3 w-3" />
              <span>Dokumen & PRD</span>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={onAddPage}
                className="flex h-4 w-4 items-center justify-center rounded text-muted hover:text-text hover:bg-hover cursor-pointer"
                title="Tambah Dokumen"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="space-y-0.5">
            {pages.length === 0 ? (
              <div className="px-2 py-1.5 text-[11px] text-muted italic">
                Belum ada dokumen.
              </div>
            ) : (
              pages.map((p) => {
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
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted group-hover:text-text" />
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
    </aside>
  );
};
