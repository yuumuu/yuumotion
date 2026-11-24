import React, { useState } from 'react';
import { Card, Column } from '../types/board';
import { KanbanCard } from './KanbanCard';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from './ui';

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onDropCard: (cardId: string, targetColumnId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  cards,
  onCardClick,
  onAddCard,
  onDeleteColumn,
  onDropCard
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddCard(column.id, newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      onDropCard(cardId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex h-full w-72 flex-shrink-0 flex-col rounded-xl border transition-all duration-200 ${
        isDragOver
          ? 'border-purple-500/80 bg-purple-50/50 shadow-md ring-2 ring-purple-500/20 dark:border-purple-500 dark:bg-purple-950/20'
          : 'border-zinc-200/80 bg-zinc-100/60 dark:border-[#27272A] dark:bg-[#121215]'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-appflowy-muted dark:text-appflowy-darkMuted">
            {column.title}
          </h3>
          <span className="flex h-4 min-w-4 items-center justify-center rounded-md border border-zinc-200 bg-zinc-200/70 px-1.5 font-mono text-[10px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-[#18181B] dark:text-zinc-400">
            {cards.length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex h-6 w-6 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 cursor-pointer"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-appflowy-border bg-appflowy-surface p-1 shadow-lg dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteColumn(column.id);
                }}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Kolom</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-2.5 py-1">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onClick={() => onCardClick(card)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', card.id);
            }}
          />
        ))}

        {isDragOver && (
          <div className="h-9 rounded-xl border-2 border-dashed border-purple-400/80 bg-purple-100/40 dark:border-purple-600/80 dark:bg-purple-950/30 animate-pulse" />
        )}

        {isAdding ? (
          <form onSubmit={handleCreate} className="rounded-xl border border-purple-300 bg-white p-2.5 shadow-2xs dark:border-purple-800 dark:bg-neutral-800">
            <textarea
              autoFocus
              rows={2}
              placeholder="Tuliskan tugas yang perlu dikerjakan..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate(e);
                }
              }}
              className="w-full resize-none bg-transparent text-xs text-appflowy-text focus:outline-none dark:text-appflowy-darkText placeholder-neutral-400"
            />
            <div className="mt-2 flex items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsAdding(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="xs">
                Tambah Kartu
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium text-appflowy-muted transition-colors hover:bg-neutral-200/50 hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-neutral-800/60 dark:hover:text-appflowy-darkText cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Kartu Baru</span>
          </button>
        )}
      </div>
    </div>
  );
};