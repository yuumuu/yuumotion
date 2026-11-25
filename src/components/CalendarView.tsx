import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { CaretLeft, CaretRight, CalendarBlank as CalendarIcon } from '@phosphor-icons/react';
import { TAG_COLORS } from '../lib/constants';
import { Button, ConfirmDialog } from './ui';

interface CalendarViewProps {
  board: Board;
  searchQuery: string;
  onCardClick: (card: Card) => void;
  onAddCardOnDate: (columnId: string, title: string, dueDate: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  board,
  searchQuery,
  onCardClick,
  onAddCardOnDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [promptDate, setPromptDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const allCards = Object.values(board.cards);
  const filteredCards = allCards.filter((card) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return card.title.toLowerCase().includes(q) || card.tags.some((t) => t.name.toLowerCase().includes(q));
  });

  const getCardsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredCards.filter((card) => card.dueDate === dateStr);
  };

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-bg p-4 sm:p-5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg font-bold tracking-tight text-text">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-0.5">
            <Button
              variant="ghost"
              size="xs"
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
            >
              <CaretLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleToday}
            >
              Hari Ini
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
            >
              <CaretRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <CalendarIcon className="h-3.5 w-3.5 text-project-solid" />
          <span>Klik pada tanggal mana saja untuk menjadwalkan kartu</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-t-2xl border border-border bg-border text-center text-xs font-semibold uppercase tracking-wider text-muted">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-bar py-2.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-px overflow-y-auto rounded-b-2xl border border-t-0 border-border bg-border">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div
            key={`pad-${i}`}
            className="min-h-24 bg-surface/30 p-2 opacity-40"
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayCards = getCardsForDate(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={day}
              onClick={() => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                setPromptDate(dateStr);
              }}
              className={`min-h-24 p-2 transition-colors cursor-pointer ${
                isToday
                  ? 'bg-project-soft/50'
                  : 'bg-surface hover:bg-hover'
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold font-mono ${
                    isToday
                      ? 'bg-project-solid text-white'
                      : 'text-muted'
                  }`}
                >
                  {day}
                </span>
                {dayCards.length > 0 && (
                  <span className="text-[10px] text-muted font-mono">{dayCards.length}</span>
                )}
              </div>

              <div className="space-y-1">
                {dayCards.map((card) => {
                  const tag = card.tags[0];
                  const style = tag ? TAG_COLORS[tag.color] || TAG_COLORS.neutral : TAG_COLORS.neutral;

                  return (
                    <div
                      key={card.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardClick(card);
                      }}
                      className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-normal cursor-pointer transition-transform hover:scale-[1.02] border border-border/40 ${style.bg} ${style.text}`}
                      title={card.title}
                    >
                      {card.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={Boolean(promptDate)}
        onClose={() => setPromptDate(null)}
        title={`Jadwalkan Tugas (${promptDate || ''})`}
        mode="prompt"
        placeholder="Judul tugas baru..."
        confirmLabel="Jadwalkan"
        onConfirm={(title) => {
          if (title && promptDate) {
            onAddCardOnDate(board.columns[0]?.id || 'col-todo', title, promptDate);
          }
        }}
      />
    </div>
  );
};
