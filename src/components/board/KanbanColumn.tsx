import React, { useState, useEffect } from 'react';
import { Card, Column, WorkspaceMember } from '../../types/board';
import { KanbanCard } from './KanbanCard';
import { Plus, DotsThree, Trash, Warning, Gauge } from '@phosphor-icons/react';
import { Button, ConfirmDialog } from '../ui';
import { cn } from '../../lib/cn';

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  members?: WorkspaceMember[];
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => void;
  onRenameCard?: (cardId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateWipLimit?: (columnId: string, wipLimit?: number) => void;
  onQuickComplete?: (card: Card) => void;
  draggingCardId?: string | null;
  draggingCardHeight?: number;
  isDropTarget?: boolean;
  isColumnDragging?: boolean;
  isColumnDropTarget?: boolean;
  onColumnPointerDown?: (column: Column, e: React.PointerEvent<HTMLElement>) => void;
  keyboardDragCardId?: string | null;
  onCardPointerDown: (card: Card, columnId: string, e: React.PointerEvent<HTMLElement>) => void;
  onKeyboardDragToggle: (card: Card, columnId: string) => void;
  onKeyboardMove: (card: Card, direction: 'left' | 'right') => void;
  onKeyboardCancel: () => void;
  autoFocusAdd?: boolean;
  onAutoFocusHandled?: () => void;
  wipLimit?: number;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  cards,
  members,
  onCardClick,
  onAddCard,
  onRenameCard,
  onDeleteColumn,
  onUpdateWipLimit,
  onQuickComplete,
  draggingCardId,
  draggingCardHeight,
  isDropTarget,
  isColumnDragging,
  isColumnDropTarget,
  onColumnPointerDown,
  keyboardDragCardId,
  onCardPointerDown,
  onKeyboardDragToggle,
  onKeyboardMove,
  onKeyboardCancel,
  autoFocusAdd,
  onAutoFocusHandled,
  wipLimit
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isWipPromptOpen, setIsWipPromptOpen] = useState(false);

  useEffect(() => {
    if (autoFocusAdd) {
      setIsAdding(true);
      onAutoFocusHandled?.();
    }
  }, [autoFocusAdd, onAutoFocusHandled]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddCard(column.id, newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const isDoneColumn =
    column.title.toLowerCase().includes('done') ||
    column.title.toLowerCase().includes('selesai') ||
    column.title.toLowerCase().includes('completed');

  const effectiveWip = wipLimit ?? column.wipLimit;
  const isOverWip = effectiveWip !== undefined && effectiveWip > 0 && cards.length > effectiveWip;

  return (
    <section
      data-column-id={column.id}
      className={cn(
        'flex h-full w-[var(--space-col-w)] flex-shrink-0 flex-col rounded-2xl transition-[width,background-color,box-shadow,opacity,transform] duration-200 select-none p-2 -m-2',
        isDropTarget && 'bg-project-soft/20 ring-1 ring-project-ring/60',
        isColumnDragging && 'opacity-45 scale-[0.98]',
        isColumnDropTarget && 'ring-2 ring-project-solid/70 bg-project-soft/15'
      )}
    >
      {/* Column Header: Minimalist & Crisp (Drag handle untuk reorder kolom) */}
      <div
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onColumnPointerDown?.(column, e);
        }}
        className={cn(
          'flex items-center justify-between pb-3 px-1',
          onColumnPointerDown && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              'h-3.5 w-1 rounded-full shrink-0',
              isDoneColumn ? 'bg-status-done' : 'bg-project-solid'
            )}
            style={column.color ? { backgroundColor: column.color } : undefined}
          />
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-text truncate">
            {column.title}
          </h2>
          <span className="font-mono text-xs px-1.5 py-0.2 rounded-md bg-hover text-muted font-bold">
            {cards.length}
          </span>
          {isOverWip && (
            <span
              title={`Melebihi batas WIP (${effectiveWip})`}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-md shrink-0"
            >
              <Warning className="h-3 w-3" weight="bold" />
              <span>{cards.length}/{effectiveWip}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
            title="Tambah Kartu (+)"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
              title="Menu Kolom"
            >
              <DotsThree className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-7 z-20 w-44 rounded-xl border border-border bg-surface p-1 shadow-popover animate-in fade-in zoom-in-95 duration-100">
                {onUpdateWipLimit && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setIsWipPromptOpen(true);
                    }}
                    className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer font-medium"
                  >
                    <Gauge className="h-3.5 w-3.5 text-muted" />
                    <span>Atur Batas WIP {effectiveWip ? `(${effectiveWip})` : ''}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteColumn(column.id);
                  }}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-danger hover:bg-danger/10 transition-colors cursor-pointer font-medium"
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span>Hapus Kolom</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards List Stack */}
      <div className="flex flex-1 flex-col gap-[var(--space-card-gap)] overflow-y-auto pr-1 pb-4">
        {cards.map((card) => {
          const assigneeAvatars = (card.assignees || [])
            .map((id) => members?.find((m) => m.id === id))
            .filter(Boolean)
            .map((m) => m!.avatar || m!.name.slice(0, 2).toUpperCase());

          return (
            <KanbanCard
              key={card.id}
              card={card}
              isDoneColumn={isDoneColumn}
              isOriginPlaceholder={draggingCardId === card.id}
              placeholderHeight={draggingCardHeight}
              isKeyboardDragging={keyboardDragCardId === card.id}
              assigneeAvatars={assigneeAvatars}
              onRenameCard={onRenameCard}
              onClick={() => {
                if (!draggingCardId) onCardClick(card);
              }}
              onPointerDown={(e) => onCardPointerDown(card, column.id, e)}
              onQuickComplete={onQuickComplete}
              onKeyboardDragToggle={() => onKeyboardDragToggle(card, column.id)}
              onKeyboardMove={(dir) => onKeyboardMove(card, dir)}
              onKeyboardCancel={onKeyboardCancel}
            />
          );
        })}

        {/* Drop Target Placeholder (Zero Layout Shift) */}
        {isDropTarget && (
          <div
            style={{ height: draggingCardHeight ? `${Math.min(draggingCardHeight, 120)}px` : '88px' }}
            className="rounded-2xl border-2 border-dashed border-project-solid/50 bg-project-soft/25 transition-[height,opacity] duration-150"
          />
        )}

        {/* Inline Add Card Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-project-accent bg-surface p-3.5 shadow-card-hover animate-in fade-in duration-150 space-y-2.5"
          >
            <textarea
              autoFocus
              placeholder="Tulis judul tugas..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate(e);
                }
                if (e.key === 'Escape') setIsAdding(false);
              }}
              rows={2}
              className="w-full resize-none bg-transparent text-xs font-medium text-text placeholder:text-muted focus:outline-none"
            />
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <Button size="xs" variant="ghost" type="button" onClick={() => setIsAdding(false)}>
                Batal
              </Button>
              <Button size="xs" variant="primary" type="submit">
                Tambah
              </Button>
            </div>
          </form>
        )}

        {/* Dashed Add Card Button */}
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs text-muted hover:border-project-ring hover:text-project-solid hover:bg-project-soft/30 transition-all duration-150 cursor-pointer"
            title="Tambah Kartu Baru"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Kartu</span>
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={isWipPromptOpen}
        onClose={() => setIsWipPromptOpen(false)}
        title={`Batas WIP: ${column.title}`}
        description="Masukkan angka batas maksimal kartu di kolom ini (kosongkan atau 0 untuk tanpa batas)."
        mode="prompt"
        initialValue={effectiveWip ? String(effectiveWip) : ''}
        placeholder="Misal: 5"
        confirmLabel="Simpan"
        onConfirm={(val) => {
          const parsed = Number(val);
          if (!val || Number.isNaN(parsed) || parsed <= 0) {
            onUpdateWipLimit?.(column.id, undefined);
          } else {
            onUpdateWipLimit?.(column.id, Math.floor(parsed));
          }
        }}
      />
    </section>
  );
};
