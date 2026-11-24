import React, { useState } from 'react';
import { Board, Card, PriorityLevel } from '../types/board';
import { Plus, Table as TableIcon, Paperclip, CheckSquare } from 'lucide-react';
import { TAG_COLORS } from '../lib/constants';
import { CustomSelect } from './ui/CustomSelect';

interface TableDatabaseViewProps {
  board: Board;
  searchQuery: string;
  onCardClick: (card: Card) => void;
  onUpdateCard: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => void;
}

export const TableDatabaseView: React.FC<TableDatabaseViewProps> = ({
  board,
  searchQuery,
  onCardClick,
  onUpdateCard,
  onAddCard
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(board.columns[0]?.id || 'col-todo');

  const allCards = Object.values(board.cards);
  const filteredCards = allCards.filter((card) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return card.title.toLowerCase().includes(q) || card.tags.some((t) => t.name.toLowerCase().includes(q));
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAddCard(selectedColumn, newTitle.trim());
      setNewTitle('');
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-appflowy-bg p-6 dark:bg-appflowy-darkBg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-semibold text-appflowy-text dark:text-appflowy-darkText">
            Database Spreadsheet
          </h2>
          <span className="rounded-full bg-neutral-200/80 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {filteredCards.length} records
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-appflowy-border bg-appflowy-surface shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-appflowy-border bg-neutral-50/90 font-medium text-appflowy-muted backdrop-blur-xs dark:border-appflowy-darkBorder dark:bg-neutral-900/90 dark:text-appflowy-darkMuted">
              <th className="px-4 py-3 min-w-64">Card Name</th>
              <th className="px-4 py-3 w-40">Status</th>
              <th className="px-4 py-3 w-32">Priority</th>
              <th className="px-4 py-3 w-48">Tags</th>
              <th className="px-4 py-3 w-32">Start Date</th>
              <th className="px-4 py-3 w-32">Due Date</th>
              <th className="px-4 py-3 w-28">Tasks</th>
              <th className="px-4 py-3 w-24">Files</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-appflowy-border/60 dark:divide-appflowy-darkBorder/60">
            {filteredCards.map((card) => {
              const completedChecklist = card.checklist.filter((i) => i.completed).length;

              return (
                <tr
                  key={card.id}
                  className="group transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => onCardClick(card)}
                      className="font-medium text-appflowy-text hover:text-purple-600 hover:underline dark:text-appflowy-darkText dark:hover:text-purple-400 text-left truncate max-w-sm block"
                    >
                      {card.title}
                    </button>
                  </td>

                  <td className="px-4 py-2.5">
                    <CustomSelect
                      value={card.columnId}
                      options={board.columns.map((col) => ({
                        value: col.id,
                        label: col.title,
                        colorDot: col.color
                      }))}
                      onChange={(val) => {
                        onUpdateCard({
                          ...card,
                          columnId: val,
                          updatedAt: Date.now()
                        });
                      }}
                      size="sm"
                    />
                  </td>

                  <td className="px-4 py-2.5">
                    <CustomSelect
                      value={card.priority}
                      options={[
                        { value: 'low', label: 'Low', colorDot: '#9CA3AF' },
                        { value: 'medium', label: 'Medium', colorDot: '#3B82F6' },
                        { value: 'high', label: 'High', colorDot: '#F59E0B' },
                        { value: 'urgent', label: 'Urgent', colorDot: '#EF4444' }
                      ]}
                      onChange={(p) => {
                        onUpdateCard({
                          ...card,
                          priority: p as PriorityLevel,
                          updatedAt: Date.now()
                        });
                      }}
                      size="sm"
                    />
                  </td>

                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {card.tags.map((tag) => {
                        const style = TAG_COLORS[tag.color] || TAG_COLORS.neutral;
                        return (
                          <span
                            key={tag.id}
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            {tag.name}
                          </span>
                        );
                      })}
                      {card.tags.length === 0 && (
                        <span className="text-neutral-400 text-[11px]">-</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-2.5 font-mono text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                    {card.startDate || '-'}
                  </td>

                  <td className="px-4 py-2.5 font-mono text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                    {card.dueDate || '-'}
                  </td>

                  <td className="px-4 py-2.5">
                    {card.checklist.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                        <CheckSquare className="h-3 w-3" />
                        {completedChecklist}/{card.checklist.length}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">-</span>
                    )}
                  </td>

                  <td className="px-4 py-2.5">
                    {(card.attachments || []).length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                        <Paperclip className="h-3 w-3" />
                        {card.attachments.length}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <form
          onSubmit={handleCreate}
          className="flex items-center gap-2 border-t border-appflowy-border bg-neutral-50/50 p-3 dark:border-appflowy-darkBorder dark:bg-neutral-900/30"
        >
          <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <input
            type="text"
            placeholder="Add new card row..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded border border-appflowy-border bg-appflowy-bg px-2.5 py-1 text-xs text-appflowy-text focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
          />
          <CustomSelect
            value={selectedColumn}
            options={board.columns.map((col) => ({
              value: col.id,
              label: col.title,
              colorDot: col.color
            }))}
            onChange={(val) => setSelectedColumn(val)}
            size="sm"
          />
          <button
            type="submit"
            className="rounded bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700"
          >
            Add Record
          </button>
        </form>
      </div>
    </div>
  );
};
