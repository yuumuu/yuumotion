import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { TAG_COLORS } from '../lib/constants';

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-appflowy-bg p-4 sm:p-5 dark:bg-appflowy-darkBg">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-appflowy-text dark:text-appflowy-darkText">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-1 rounded-lg border border-appflowy-border bg-appflowy-surface p-0.5 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
            <button
              onClick={handlePrevMonth}
              className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 text-xs font-medium text-appflowy-muted hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:text-appflowy-darkText"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>Click any day to schedule a task card</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-t-xl border border-appflowy-border bg-neutral-200 text-center text-xs font-semibold uppercase tracking-wider text-appflowy-muted dark:border-appflowy-darkBorder dark:bg-neutral-800 dark:text-appflowy-darkMuted">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-appflowy-surface py-2 dark:bg-appflowy-darkSurface">
            {day}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-px overflow-y-auto rounded-b-xl border border-t-0 border-appflowy-border bg-neutral-200 dark:border-appflowy-darkBorder dark:bg-neutral-800">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div
            key={`pad-${i}`}
            className="min-h-24 bg-neutral-50/50 p-2 opacity-50 dark:bg-neutral-900/30"
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayCards = getCardsForDate(day);
          const isToday =
            new Date().toDateString() === new Date(year, month, day).toDateString();

          return (
            <div
              key={`day-${day}`}
              className="group relative flex min-h-24 flex-col bg-appflowy-surface p-2 transition-colors hover:bg-neutral-50 dark:bg-appflowy-darkSurface dark:hover:bg-neutral-900/60"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-appflowy-text dark:text-appflowy-darkText'
                  }`}
                >
                  {day}
                </span>

                <button
                  onClick={() => {
                    const defaultCol = board.columns[0]?.id || 'col-todo';
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const title = prompt('Card title for ' + dateStr);
                    if (title?.trim()) {
                      onAddCardOnDate(defaultCol, title.trim(), dateStr);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-purple-600"
                  title="Add card on this date"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-1 flex flex-1 flex-col gap-1 overflow-y-auto">
                {dayCards.map((card) => {
                  const tag = card.tags[0];
                  const tagStyle = tag ? TAG_COLORS[tag.color] || TAG_COLORS.neutral : TAG_COLORS.neutral;

                  return (
                    <div
                      key={card.id}
                      onClick={() => onCardClick(card)}
                      className="cursor-pointer truncate rounded border border-appflowy-border bg-appflowy-bg px-1.5 py-1 text-[11px] font-medium shadow-2xs hover:border-purple-400 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg"
                    >
                      <div className="flex items-center gap-1">
                        {card.priority !== 'low' && (
                          <AlertCircle className="h-2.5 w-2.5 flex-shrink-0 text-amber-500" />
                        )}
                        <span className="truncate text-appflowy-text dark:text-appflowy-darkText">
                          {card.title}
                        </span>
                      </div>
                      {tag && (
                        <div className="mt-0.5 flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${tagStyle.dot}`} />
                          <span className="truncate text-[9px] text-appflowy-muted dark:text-appflowy-darkMuted">
                            {tag.name}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
