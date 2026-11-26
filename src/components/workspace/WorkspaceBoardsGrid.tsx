import React, { useState } from 'react';
import {
  Kanban,
  ArrowRight,
  Plus,
  PencilSimple,
  Gear,
  ShareNetwork,
  Trash
} from '@phosphor-icons/react';
import { Board } from '../../types/board';
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu';

interface WorkspaceBoardsGridProps {
  boards: Board[];
  canEdit: boolean;
  onSelectBoard: (boardId: string) => void;
  onAddBoard: () => void;
  onRenameBoard?: (boardId: string, newTitle: string) => void;
  onDeleteBoard?: (boardId: string) => void;
  onOpenBoardSettings?: (boardId: string) => void;
  onShareBoard?: (boardId: string) => void;
}

export const WorkspaceBoardsGrid: React.FC<WorkspaceBoardsGridProps> = ({
  boards,
  canEdit,
  onSelectBoard,
  onAddBoard,
  onRenameBoard,
  onDeleteBoard,
  onOpenBoardSettings,
  onShareBoard
}) => {
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; board: Board } | null>(null);

  const commitRename = (boardId: string) => {
    const trimmed = editingTitle.trim();
    setEditingBoardId(null);
    if (trimmed && onRenameBoard) {
      onRenameBoard(boardId, trimmed);
    }
  };

  const buildMenuItems = (board: Board): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [
      {
        id: 'open',
        label: 'Buka Papan',
        icon: <Kanban className="h-3.5 w-3.5" />,
        onClick: () => onSelectBoard(board.id)
      }
    ];
    if (canEdit) {
      if (onRenameBoard) {
        items.push({
          id: 'rename',
          label: 'Ubah Nama',
          icon: <PencilSimple className="h-3.5 w-3.5" />,
          onClick: () => {
            setEditingBoardId(board.id);
            setEditingTitle(board.title);
          }
        });
      }
      if (onOpenBoardSettings) {
        items.push({
          id: 'settings',
          label: 'Pengaturan Papan',
          icon: <Gear className="h-3.5 w-3.5" />,
          onClick: () => onOpenBoardSettings(board.id)
        });
      }
      if (onShareBoard) {
        items.push({
          id: 'share',
          label: 'Bagikan Tautan',
          icon: <ShareNetwork className="h-3.5 w-3.5" />,
          onClick: () => onShareBoard(board.id)
        });
      }
      if (onDeleteBoard) {
        items.push({
          id: 'delete',
          label: 'Hapus Papan',
          icon: <Trash className="h-3.5 w-3.5" />,
          variant: 'danger',
          onClick: () => onDeleteBoard(board.id)
        });
      }
    }
    return items;
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
          Papan Kerja ({boards.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-card-gap)] sm:grid-cols-2 xl:grid-cols-3">
        {boards.map((board) => {
          const cards = Object.values(board.cards || {});
          const doneIds = new Set(
            board.columns
              .filter((c) => {
                const t = c.title.toLowerCase();
                return t.includes('done') || t.includes('selesai') || t.includes('completed');
              })
              .map((c) => c.id)
          );
          const doneCount = cards.filter((c) => doneIds.has(c.columnId)).length;
          const pct = cards.length > 0 ? Math.round((doneCount / cards.length) * 100) : 0;

          return (
            <div
              key={board.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (editingBoardId !== board.id) onSelectBoard(board.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, board });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && editingBoardId !== board.id) onSelectBoard(board.id);
              }}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-[var(--space-card-p)] text-left transition-[border-color,background-color,transform] duration-150 ease-out hover:border-project-ring hover:bg-hover/30 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer h-full"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-project-soft text-project-solid">
                      <Kanban className="h-4 w-4" />
                    </div>
                    {editingBoardId === board.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => commitRename(board.id)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') commitRename(board.id);
                          if (e.key === 'Escape') setEditingBoardId(null);
                        }}
                        className="w-full rounded-lg border border-project-accent bg-bg px-2 py-0.5 text-sm font-bold text-text focus:outline-none"
                      />
                    ) : (
                      <span className="truncate font-display text-sm font-bold text-text group-hover:text-project-solid">
                        {board.title}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                    <span>
                      {board.columns.length} kolom • {cards.length} kartu
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-project-solid transition-[width] duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {canEdit && (
          <button
            type="button"
            onClick={onAddBoard}
            className="flex min-h-[108px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-surface/40 p-[var(--space-card-p)] text-xs font-semibold text-muted transition-[border-color,color,background-color,transform] duration-150 ease-out hover:border-project-accent hover:bg-project-soft/20 hover:text-project-solid active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Tambah Papan Baru</span>
          </button>
        )}
      </div>

      <ContextMenu
        isOpen={Boolean(contextMenu)}
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        items={contextMenu ? buildMenuItems(contextMenu.board) : []}
        onClose={() => setContextMenu(null)}
      />
    </section>
  );
};
