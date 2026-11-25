import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { KanbanColumn } from './KanbanColumn';
import { Plus } from 'lucide-react';
import { Button, Input } from './ui';

interface KanbanBoardProps {
  board: Board;
  searchQuery: string;
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => void;
  onAddColumn: (title: string, color: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onDropCard: (cardId: string, targetColumnId: string) => void;
}

const PRESET_COLORS = ['#6366F1', '#EC4899', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  searchQuery,
  onCardClick,
  onAddCard,
  onAddColumn,
  onDeleteColumn,
  onDropCard
}) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnTitle.trim()) {
      onAddColumn(columnTitle.trim(), selectedColor);
      setColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  const getFilteredCards = (columnId: string): Card[] => {
    const list = Object.values(board.cards).filter((card) => card.columnId === columnId);
    if (!searchQuery.trim()) {
      return list.sort((a, b) => a.order - b.order);
    }
    const q = searchQuery.toLowerCase();
    return list
      .filter((card) => card.title.toLowerCase().includes(q) || card.tags.some((t) => t.name.toLowerCase().includes(q)))
      .sort((a, b) => a.order - b.order);
  };

  return (
    <div className="flex h-full flex-1 gap-6 overflow-x-auto p-6 bg-bg items-start">
      {sortedColumns.map((col) => (
        <KanbanColumn
          key={col.id}
          column={col}
          cards={getFilteredCards(col.id)}
          onCardClick={onCardClick}
          onAddCard={onAddCard}
          onDeleteColumn={onDeleteColumn}
          onDropCard={onDropCard}
        />
      ))}

      <div className="w-80 flex-shrink-0">
        {isAddingColumn ? (
          <form
            onSubmit={handleCreateColumn}
            className="rounded-2xl border border-border bg-surface p-4 shadow-popover space-y-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="text-xs font-bold text-text">Tambah Kolom Baru</div>
            <Input
              autoFocus
              placeholder="Misal: Review Klien..."
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
            />
            <div className="flex items-center gap-2 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-4 w-4 rounded-full transition-transform cursor-pointer ${
                    selectedColor === c ? 'scale-125 ring-2 ring-project-accent ring-offset-2' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-end gap-1.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsAddingColumn(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="xs"
              >
                Buat Kolom
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingColumn(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-surface/30 p-3.5 text-xs font-semibold text-muted hover:border-project-accent hover:bg-surface hover:text-project-accent transition-all cursor-pointer shadow-2xs hover:shadow-card-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kolom</span>
          </button>
        )}
      </div>
    </div>
  );
};
