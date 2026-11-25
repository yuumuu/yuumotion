import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { CaretLeft, CaretRight, CalendarBlank as CalendarIcon } from '@phosphor-icons/react';
import { TAG_COLORS } from '../lib/constants';
import { Button, ConfirmDialog, toast } from './ui';
import { cn } from '../lib/cn';

interface CalendarViewProps {
  board: Board;
  searchQuery: string;
  onCardClick: (card: Card) => void;
  onAddCardOnDate: (columnId: string, title: string, dueDate: string) => void;
  onUpdateCard?: (updated: Card) => void;
}

function addDaysYMD(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

function diffDaysYMD(fromYMD: string, toYMD: string): number {
  const [y1, m1, d1] = fromYMD.split('-').map(Number);
  const [y2, m2, d2] = toYMD.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / 86_400_000);
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  board,
  searchQuery,
  onCardClick,
  onAddCardOnDate,
  onUpdateCard
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [promptDate, setPromptDate] = useState<string | null>(null);
  const [dragInfo, setDragInfo] = useState<{ cardId: string; originDate: string } | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

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

  const getCardsForDate = (dateStr: string) => {
    return filteredCards
      .filter((card) => {
        const start = card.startDate || card.dueDate;
        const end = card.dueDate || card.startDate;
        if (!start || !end) return false;
        const min = start <= end ? start : end;
        const max = start <= end ? end : start;
        return dateStr >= min && dateStr <= max;
      })
      .map((card) => {
        const start = card.startDate || card.dueDate || dateStr;
        const end = card.dueDate || card.startDate || dateStr;
        const min = start <= end ? start : end;
        const max = start <= end ? end : start;
        return {
          card,
          isMultiDay: min !== max,
          isStart: dateStr === min,
          isEnd: dateStr === max
        };
      });
  };

  const handleDropOnDate = (targetDateStr: string) => {
    if (!dragInfo || !onUpdateCard) return;
    const card = board.cards[dragInfo.cardId];
    if (!card) return;
    const delta = diffDaysYMD(dragInfo.originDate, targetDateStr);
    if (delta === 0) {
      setDragInfo(null);
      setHoverDate(null);
      return;
    }

    const nextStart = card.startDate ? addDaysYMD(card.startDate, delta) : undefined;
    const nextDue = card.dueDate ? addDaysYMD(card.dueDate, delta) : targetDateStr;

    onUpdateCard({
      ...card,
      startDate: nextStart,
      dueDate: nextDue,
      updatedAt: Date.now()
    });
    toast.success(`Jadwal "${card.title}" dipindah ke ${nextDue}.`);
    setDragInfo(null);
    setHoverDate(null);
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
            <Button variant="ghost" size="xs" onClick={handlePrevMonth} title="Bulan Sebelumnya">
              <CaretLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="xs" onClick={handleToday}>
              Hari Ini
            </Button>
            <Button variant="ghost" size="xs" onClick={handleNextMonth} title="Bulan Berikutnya">
              <CaretRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <CalendarIcon className="h-3.5 w-3.5 text-project-solid" />
          <span>Klik tanggal untuk buat kartu, atau seret event ke hari lain</span>
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
          <div key={`pad-${i}`} className="min-h-24 bg-surface/30 p-2 opacity-40" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayCards = getCardsForDate(dateStr);
          const now = new Date();
          const isToday =
            now.getDate() === day &&
            now.getMonth() === month &&
            now.getFullYear() === year;
          const isDragOver = hoverDate === dateStr && dragInfo !== null;

          return (
            <div
              key={day}
              onClick={() => setPromptDate(dateStr)}
              onDragOver={(e) => {
                if (!dragInfo) return;
                e.preventDefault();
                if (hoverDate !== dateStr) setHoverDate(dateStr);
              }}
              onDragLeave={() => {
                if (hoverDate === dateStr) setHoverDate(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnDate(dateStr);
              }}
              className={cn(
                'min-h-24 p-2 transition-colors cursor-pointer',
                isToday
                  ? 'bg-blue-50/90 dark:bg-blue-950/45 ring-2 ring-inset ring-project-solid/70'
                  : 'bg-surface hover:bg-hover',
                isDragOver && 'bg-project-soft/60 ring-2 ring-inset ring-project-solid'
              )}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold font-mono',
                    isToday ? 'bg-project-solid text-white shadow-xs' : 'text-muted'
                  )}
                >
                  {day}
                </span>
                {dayCards.length > 0 && (
                  <span className="text-[10px] text-muted font-mono">{dayCards.length}</span>
                )}
              </div>

              <div className="space-y-1">
                {dayCards.map(({ card, isMultiDay, isStart, isEnd }) => {
                  const tag = card.tags[0];
                  const style = tag ? TAG_COLORS[tag.color] || TAG_COLORS.neutral : TAG_COLORS.neutral;

                  return (
                    <div
                      key={`${card.id}-${dateStr}`}
                      draggable={Boolean(onUpdateCard)}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDragInfo({ cardId: card.id, originDate: dateStr });
                      }}
                      onDragEnd={() => {
                        setDragInfo(null);
                        setHoverDate(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardClick(card);
                      }}
                      className={cn(
                        'truncate py-0.5 text-[10px] font-medium leading-normal cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.01] border border-border/40',
                        style.bg,
                        style.text,
                        !isMultiDay && 'rounded-md px-1.5',
                        isMultiDay && isStart && !isEnd && 'rounded-l-md rounded-r-none -mr-2 pr-2 pl-1.5 border-r-0',
                        isMultiDay && !isStart && !isEnd && 'rounded-none -mx-2 px-2 border-x-0 opacity-90',
                        isMultiDay && isEnd && !isStart && 'rounded-r-md rounded-l-none -ml-2 pl-2 pr-1.5 border-l-0'
                      )}
                      title={`${card.title}${isMultiDay ? ' (Multi-hari • Seret untuk pindah jadwal)' : ''}`}
                    >
                      {!isMultiDay || isStart ? card.title : `↳ ${card.title}`}
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
