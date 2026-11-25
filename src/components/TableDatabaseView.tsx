import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { Plus, Table as TableIcon } from '@phosphor-icons/react';
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
  onUpdateCard: _onUpdateCard,
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
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-bg p-4 sm:p-5 select-none">
      <div className="mb-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-project-accent" />
          <h2 className="font-display text-base font-bold text-text">
            Database Spreadsheet
          </h2>
          <Badge variant="neutral">{filteredCards.length} data kartu</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-border bg-surface shadow-card-rest">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-border bg-bar/95 font-medium text-muted backdrop-blur-xs">
              <th className="px-4 py-3 min-w-64 font-display">Nama Tugas / Kartu</th>
              <th className="px-4 py-3 w-40 font-display">Status Kolom</th>
              <th className="px-4 py-3 w-32 font-display">Prioritas</th>
              <th className="px-4 py-3 w-48 font-display">Tags & Label</th>
              <th className="px-4 py-3 w-32 font-display">Mulai</th>
              <th className="px-4 py-3 w-32 font-display">Deadline</th>
              <th className="px-4 py-3 w-28 font-display">Checklist</th>
              <th className="px-4 py-3 w-24 font-display">Lampiran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCards.map((card) => {
              const completedChecklist = card.checklist.filter((i) => i.completed).length;

              return (
                <tr
                  key={card.id}
                  onClick={() => onCardClick(card)}
                  className="hover:bg-hover transition-colors cursor-pointer group h-[var(--space-row-h)]"
                >
                  <td className="px-4 py-2 font-medium text-text">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted">
                        YUU-{card.id.replace(/\D/g, '').slice(-3) || '101'}
                      </span>
                      <span className="truncate">{card.title}</span>
                    </div>
                  </td>

                  <td className="px-4 py-2 text-muted">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-bar text-[11px] font-medium border border-border">
                      {board.columns.find((c) => c.id === card.columnId)?.title || '-'}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    <span className="capitalize text-muted text-[11px]">
                      {card.priority}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {card.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-project-soft px-1.5 py-0.2 text-[10px] font-medium text-project-accent"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-2 font-mono text-[11px] text-muted">
                    {card.startDate || '-'}
                  </td>

                  <td className="px-4 py-2 font-mono text-[11px] text-muted">
                    {card.dueDate || '-'}
                  </td>

                  <td className="px-4 py-2 text-muted font-mono text-[11px]">
                    {completedChecklist}/{card.checklist.length}
                  </td>

                  <td className="px-4 py-2 text-muted text-[11px] font-mono">
                    {card.attachments?.length || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleCreate}
        className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-2.5 pr-4 sm:mr-16 shrink-0"
      >
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
          className="flex-1 min-w-[200px]"
        />
        <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Tambah Data
        </Button>
      </form>
    </div>
  );
};
