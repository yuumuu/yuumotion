import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { Plus, Table as TableIcon } from 'lucide-react';
import { CustomSelect, Button, Input, Badge } from './ui';

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
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-appflowy-bg p-4 sm:p-5 dark:bg-appflowy-darkBg">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-semibold text-appflowy-text dark:text-appflowy-darkText">
            Database Spreadsheet
          </h2>
          <Badge variant="neutral">{filteredCards.length} data kartu</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-appflowy-border bg-appflowy-surface shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-appflowy-border bg-neutral-50/90 font-medium text-appflowy-muted backdrop-blur-xs dark:border-appflowy-darkBorder dark:bg-neutral-900/90 dark:text-appflowy-darkMuted">
              <th className="px-4 py-3 min-w-64">Nama Tugas / Kartu</th>
              <th className="px-4 py-3 w-40">Status Kolom</th>
              <th className="px-4 py-3 w-32">Prioritas</th>
              <th className="px-4 py-3 w-48">Tags & Label</th>
              <th className="px-4 py-3 w-32">Mulai</th>
              <th className="px-4 py-3 w-32">Deadline</th>
              <th className="px-4 py-3 w-28">Checklist</th>
              <th className="px-4 py-3 w-24">Lampiran</th>
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
                      className="font-medium text-appflowy-text hover:text-purple-600 hover:underline dark:text-appflowy-darkText dark:hover:text-purple-400 text-left truncate max-w-sm block cursor-pointer"
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
                    <span className="capitalize text-appflowy-muted dark:text-appflowy-darkMuted">
                      {card.priority}
                    </span>
                  </td>

                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {card.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-2.5 font-mono text-[11px] text-appflowy-muted">
                    {card.startDate || '-'}
                  </td>

                  <td className="px-4 py-2.5 font-mono text-[11px] text-appflowy-muted">
                    {card.dueDate || '-'}
                  </td>

                  <td className="px-4 py-2.5 text-appflowy-muted font-mono text-[11px]">
                    {completedChecklist}/{card.checklist.length}
                  </td>

                  <td className="px-4 py-2.5 text-appflowy-muted text-[11px]">
                    {card.attachments?.length || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCreate} className="mt-3 flex items-center gap-2">
        <div className="w-40 flex-shrink-0">
          <CustomSelect
            value={selectedColumn}
            onChange={(val) => setSelectedColumn(val)}
            options={board.columns.map((col) => ({ value: col.id, label: col.title }))}
          />
        </div>
        <Input
          placeholder="Tambah baris baru cepat..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Tambah Baris
        </Button>
      </form>
    </div>
  );
};