import React, { useState } from 'react';
import { Card, Column } from '../types/board';
import { KanbanCard } from './KanbanCard';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from './ui';
import { cn } from '../lib/cn';

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

  const isDoneColumn =
    column.title.toLowerCase().includes('done') ||
    column.title.toLowerCase().includes('selesai');

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex h-full w-80 flex-shrink-0 flex-col transition-all duration-200 select-none'
      )}
    >
      {/* Column Header: Minimalist & Crisp */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full shrink-0 shadow-xs',
              isDoneColumn ? 'bg-status-done' : 'bg-project-solid'
            )}
            style={column.color ? { backgroundColor: column.color } : undefined}
          />
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-text">
            {column.title}
          </h2>
          <span className="font-mono text-xs px-1.5 py-0.2 rounded-md bg-hover text-muted font-bold">
            {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
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
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-border bg-surface p-1 shadow-popover animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteColumn(column.id);
                  }}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-danger hover:bg-danger/10 transition-colors cursor-pointer font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Kolom</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards List Stack */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-4">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            isDoneColumn={isDoneColumn}
            onClick={() => onCardClick(card)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', card.id);
            }}
          />
        ))}

        {/* Drop Target Placeholder (Zero Layout Shift) */}
        {isDragOver && (
          <div className="h-24 rounded-2xl border-2 border-dashed border-project-accent bg-project-soft animate-pulse transition-all duration-200" />
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
      </div>
    </section>
  );
};
