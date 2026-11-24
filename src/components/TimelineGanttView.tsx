import React, { useState } from 'react';
import { Board, Card } from '../types/board';
import { Clock, CheckSquare } from 'lucide-react';
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
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-appflowy-bg p-6 dark:bg-appflowy-darkBg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-semibold text-appflowy-text dark:text-appflowy-darkText">
            Timeline & Gantt Roadmap
          </h2>
        </div>
        <div className="text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
          Showing 3-week planning horizon
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-appflowy-border bg-appflowy-surface dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <div className="flex border-b border-appflowy-border bg-neutral-50/80 text-xs font-semibold text-appflowy-muted dark:border-appflowy-darkBorder dark:bg-neutral-900/60 dark:text-appflowy-darkMuted">
          <div className="w-72 flex-shrink-0 border-r border-appflowy-border px-4 py-2.5 dark:border-appflowy-darkBorder">
            Task & Deliverables
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
                  <div>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
                  <div className="font-mono">{d.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {board.columns.map((column) => {
            const columnCards = filteredCards.filter((c) => c.columnId === column.id);
            if (columnCards.length === 0) return null;

            return (
              <div key={column.id} className="border-b border-appflowy-border/60 dark:border-appflowy-darkBorder/60">
                <div className="flex items-center gap-2 bg-neutral-50/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-appflowy-muted dark:bg-neutral-900/40 dark:text-appflowy-darkMuted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                  <span>{column.title}</span>
                  <span className="text-[10px] text-neutral-400">({columnCards.length})</span>
                </div>

                <div className="divide-y divide-appflowy-border/40 dark:divide-appflowy-darkBorder/40">
                  {columnCards.map((card) => {
                    const pos = calculateCardPosition(card);
                    const completedCount = card.checklist.filter((i) => i.completed).length;
                    const progressPercent =
                      card.checklist.length > 0 ? (completedCount / card.checklist.length) * 100 : 0;
                    const tag = card.tags[0];
                    const tagStyle = tag ? TAG_COLORS[tag.color] || TAG_COLORS.neutral : TAG_COLORS.neutral;

                    return (
                      <div
                        key={card.id}
                        className="group flex items-center hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30"
                      >
                        <div
                          onClick={() => onCardClick(card)}
                          className="w-72 flex-shrink-0 cursor-pointer border-r border-appflowy-border px-4 py-2 dark:border-appflowy-darkBorder"
                        >
                          <div className="truncate text-xs font-medium text-appflowy-text group-hover:text-purple-600 dark:text-appflowy-darkText dark:group-hover:text-purple-400">
                            {card.title}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-appflowy-muted dark:text-appflowy-darkMuted">
                            {tag && (
                              <span className={`inline-flex items-center gap-1 rounded px-1 text-[9px] ${tagStyle.bg} ${tagStyle.text}`}>
                                {tag.name}
                              </span>
                            )}
                            {card.dueDate && <span>Due {card.dueDate}</span>}
                          </div>
                        </div>

                        <div className="relative flex h-12 flex-1 items-center px-1">
                          {pos.isVisible && (
                            <div
                              onClick={() => onCardClick(card)}
                              style={{
                                left: `${pos.leftPercent}%`,
                                width: `${pos.widthPercent}%`
                              }}
                              className="absolute cursor-pointer rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-1.5 text-white shadow-xs transition-transform hover:scale-[1.01]"
                            >
                              <div className="truncate text-[10px] font-medium leading-none">
                                {card.title}
                              </div>
                              {card.checklist.length > 0 && (
                                <div className="mt-1 flex items-center gap-1 text-[9px] opacity-90">
                                  <CheckSquare className="h-2.5 w-2.5" />
                                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/20">
                                    <div
                                      style={{ width: `${progressPercent}%` }}
                                      className="h-full bg-white"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
