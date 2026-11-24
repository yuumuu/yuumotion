import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { Clock } from 'lucide-react';
import { TAG_COLORS } from '../lib/constants';

interface TimelineGanttViewProps {
  board: Board;
  searchQuery: string;
  onCardClick: (card: Card) => void;
}

export const TimelineGanttView: React.FC<TimelineGanttViewProps> = ({
  board,
  searchQuery,
  onCardClick
}) => {
  const [timelineSpan] = useState(21);

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 3);

  const timelineDays: Date[] = [];
  for (let i = 0; i < timelineSpan; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    timelineDays.push(d);
  }

  const allCards = Object.values(board.cards);
  const filteredCards = allCards.filter((card) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return card.title.toLowerCase().includes(q) || card.tags.some((t) => t.name.toLowerCase().includes(q));
  });

  const getDayDiff = (d1: Date, d2: Date) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.floor((utc2 - utc1) / msPerDay);
  };

  const calculateCardPosition = (card: Card) => {
    const startDate = card.startDate ? new Date(card.startDate) : new Date(card.updatedAt);
    const dueDate = card.dueDate ? new Date(card.dueDate) : new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 3);

    const startOffset = getDayDiff(timelineDays[0], startDate);
    const duration = Math.max(1, getDayDiff(startDate, dueDate) + 1);

    const leftPercent = Math.max(0, Math.min(100, (startOffset / timelineSpan) * 100));
    const widthPercent = Math.max(3, Math.min(100 - leftPercent, (duration / timelineSpan) * 100));

    return { leftPercent, widthPercent, isVisible: startOffset + duration > 0 && startOffset < timelineSpan };
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-appflowy-bg p-4 sm:p-5 dark:bg-appflowy-darkBg">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-semibold text-appflowy-text dark:text-appflowy-darkText">
            Timeline & Gantt Roadmap
          </h2>
        </div>
        <div className="text-xs text-appflowy-muted dark:text-appflowy-darkMuted font-mono">
          Periode 3 Pekan
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-appflowy-border bg-appflowy-surface dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface shadow-2xs">
        <div className="flex border-b border-appflowy-border bg-neutral-50/80 text-xs font-semibold text-appflowy-muted dark:border-appflowy-darkBorder dark:bg-neutral-900/60 dark:text-appflowy-darkMuted">
          <div className="w-72 flex-shrink-0 border-r border-appflowy-border px-4 py-2.5 dark:border-appflowy-darkBorder">
            Tugas & Deliverables
          </div>
          <div className="flex flex-1 overflow-x-hidden">
            {timelineDays.map((d) => {
              const isToday = d.toDateString() === new Date().toDateString();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div
                  key={d.toISOString()}
                  className={`flex-1 border-r border-appflowy-border/50 py-1.5 text-center text-[10px] ${
                    isToday
                      ? 'bg-purple-100 font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : isWeekend
                      ? 'bg-neutral-100/50 dark:bg-neutral-800/40'
                      : ''
                  }`}
                >
                  <div>{d.toLocaleDateString('id-ID', { weekday: 'narrow' })}</div>
                  <div className="font-mono">{d.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {board.columns.map((column) => {
            const columnCards = filteredCards.filter((c) => c.columnId === column.id);

            return (
              <div key={column.id} className="border-b border-appflowy-border/50 last:border-b-0">
                <div className="sticky top-0 z-10 flex items-center gap-2 bg-neutral-100/70 px-4 py-1.5 text-[11px] font-semibold text-appflowy-muted backdrop-blur-xs dark:bg-neutral-900/70 dark:text-appflowy-darkMuted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                  <span>{column.title}</span>
                  <span className="font-mono text-[10px]">({columnCards.length})</span>
                </div>

                <div className="divide-y divide-appflowy-border/30">
                  {columnCards.map((card) => {
                    const { leftPercent, widthPercent, isVisible } = calculateCardPosition(card);
                    const tag = card.tags[0];
                    const style = tag ? TAG_COLORS[tag.color] || TAG_COLORS.purple : TAG_COLORS.purple;

                    return (
                      <div
                        key={card.id}
                        className="flex h-10 items-center transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30"
                      >
                        <div className="w-72 flex-shrink-0 truncate border-r border-appflowy-border/50 px-4 text-xs font-medium text-appflowy-text dark:text-appflowy-darkText">
                          <button
                            onClick={() => onCardClick(card)}
                            className="truncate hover:text-purple-600 hover:underline cursor-pointer"
                          >
                            {card.title}
                          </button>
                        </div>

                        <div className="relative flex-1 h-full flex items-center px-1">
                          {isVisible ? (
                            <div
                              onClick={() => onCardClick(card)}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`
                              }}
                              className={`absolute h-6 rounded-lg px-2 flex items-center justify-between text-[10px] font-semibold text-white shadow-2xs transition-all hover:brightness-105 cursor-pointer ${style.dot.replace('bg-', 'bg-')}`}
                            >
                              <span className="truncate">{card.title}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-400 italic px-2">Diluar rentang waktu</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {columnCards.length === 0 && (
                    <div className="py-2 px-4 text-xs text-appflowy-muted italic">
                      Tidak ada kartu di kolom ini
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};