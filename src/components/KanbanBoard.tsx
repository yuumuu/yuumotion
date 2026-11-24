import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { KanbanColumn } from './KanbanColumn';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  board: Board;
  searchQuery: string;
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => void;
  onAddColumn: (title: string, color: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onDropCard: (cardId: string, targetColumnId: string) => void;
}

const PRESET_COLORS = ['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

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
    <div className="flex h-full flex-1 gap-3.5 overflow-x-auto p-4 sm:p-5">
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

      <div className="w-72 flex-shrink-0">
        {isAddingColumn ? (
          <form
            onSubmit={handleCreateColumn}
            className="rounded-xl border border-appflowy-border bg-appflowy-surface p-3 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface"
          >
            <input
              type="text"
              autoFocus
              placeholder="Column title..."
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              className="h-8 w-full rounded border border-appflowy-border bg-appflowy-bg px-2.5 text-xs text-appflowy-text focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
            />
            <div className="mt-2.5 flex items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-4 w-4 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-purple-400 ring-offset-1' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsAddingColumn(false)}
                className="rounded px-2.5 py-1 text-xs text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700"
              >
                Add Column
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 py-3 text-xs font-medium text-appflowy-muted transition-colors hover:border-purple-400 hover:text-purple-600 dark:border-neutral-700 dark:hover:border-purple-500 dark:hover:text-purple-400"
          >
            <Plus className="h-4 w-4" />
            <span>Add Column</span>
          </button>
        )}
      </div>
    </div>
  );
};
