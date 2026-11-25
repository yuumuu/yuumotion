import React, { useState, useEffect, useRef } from 'react';
import { Board, Card } from '../types/board';
import { Clock } from '@phosphor-icons/react';
import { TAG_COLORS } from '../lib/constants';
import { toast } from './ui';
import { cn } from '../lib/cn';

interface TimelineGanttViewProps {
  board: Board;
  searchQuery: string;
  onCardClick: (card: Card) => void;
  onUpdateCard?: (updated: Card) => void;
}

interface TimelineDragState {
  card: Card;
  startX: number;
  trackWidth: number;
  deltaDays: number;
  hasMoved: boolean;
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const TimelineGanttView: React.FC<TimelineGanttViewProps> = ({
  board,
  searchQuery,
  onCardClick,
  onUpdateCard
}) => {
  const [timelineSpan] = useState(21);
  const [dragState, setDragState] = useState<TimelineDragState | null>(null);
  const dragRef = useRef<TimelineDragState | null>(null);
  dragRef.current = dragState;

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

  const calculateCardPosition = (card: Card, extraDays = 0) => {
    const startDate = card.startDate ? new Date(card.startDate) : new Date(card.updatedAt);
    const dueDate = card.dueDate ? new Date(card.dueDate) : new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 3);

    const startOffset = getDayDiff(timelineDays[0], startDate) + extraDays;
    const duration = Math.max(1, getDayDiff(startDate, dueDate) + 1);

    const leftPercent = Math.max(0, Math.min(100, (startOffset / timelineSpan) * 100));
    const widthPercent = Math.max(4, Math.min(100 - leftPercent, (duration / timelineSpan) * 100));

    return { leftPercent, widthPercent, isVisible: startOffset + duration > 0 && startOffset < timelineSpan };
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const prev = dragRef.current;
      if (!prev) return;
      const dx = e.clientX - prev.startX;
      const hasMoved = prev.hasMoved || Math.abs(dx) > 5;
      const deltaDays = Math.round((dx / Math.max(prev.trackWidth, 200)) * timelineSpan);
      setDragState({ ...prev, deltaDays, hasMoved });
    };

    const handlePointerUp = () => {
      const current = dragRef.current;
      if (current) {
        if (!current.hasMoved) {
          onCardClick(current.card);
        } else if (current.deltaDays !== 0 && onUpdateCard) {
          const origStart = current.card.startDate
            ? new Date(current.card.startDate)
            : new Date(current.card.updatedAt);
          const origDue = current.card.dueDate
            ? new Date(current.card.dueDate)
            : new Date(origStart.getTime() + 1000 * 60 * 60 * 24 * 3);

          const nextStart = new Date(origStart);
          nextStart.setDate(origStart.getDate() + current.deltaDays);
          const nextDue = new Date(origDue);
          nextDue.setDate(origDue.getDate() + current.deltaDays);

          const startStr = formatYMD(nextStart);
          const dueStr = formatYMD(nextDue);

          onUpdateCard({
            ...current.card,
            startDate: startStr,
            dueDate: dueStr,
            updatedAt: Date.now()
          });
          toast.success(`Jadwal diperbarui: ${startStr} s/d ${dueStr}`);
        }
      }
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [Boolean(dragState), timelineSpan, onCardClick, onUpdateCard]);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-bg p-4 sm:p-5 select-none">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-project-solid" />
          <h2 className="font-display text-base font-bold tracking-tight text-text">
            Timeline &amp; Gantt Roadmap
          </h2>
        </div>
        <div className="text-xs text-muted font-mono">
          Geser bar tugas untuk ubah tanggal • Periode 3 Pekan
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
        <div className="flex border-b border-border bg-bar text-xs font-semibold text-muted">
          <div className="w-72 flex-shrink-0 border-r border-border px-4 py-2.5">
            Tugas &amp; Deliverables
          </div>
          <div className="flex flex-1 overflow-x-hidden">
            {timelineDays.map((d) => {
              const isToday = d.toDateString() === new Date().toDateString();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    'flex-1 border-r border-border/50 py-1.5 text-center text-[10px]',
                    isToday
                      ? 'bg-project-soft font-bold text-project-solid'
                      : isWeekend
                      ? 'bg-bar/50'
                      : ''
                  )}
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
              <div key={column.id} className="border-b border-border/50 last:border-b-0">
                <div className="sticky top-0 z-10 flex items-center gap-2 bg-bar/85 px-4 py-1.5 text-[11px] font-semibold text-muted backdrop-blur-xs">
                  <span className="h-3 w-1 rounded-full" style={{ backgroundColor: column.color }} />
                  <span>{column.title}</span>
                  <span className="font-mono text-[10px]">({columnCards.length})</span>
                </div>

                <div className="divide-y divide-border/30">
                  {columnCards.map((card) => {
                    const isDraggingThis = dragState?.card.id === card.id;
                    const extraDays = isDraggingThis ? dragState.deltaDays : 0;
                    const { leftPercent, widthPercent, isVisible } = calculateCardPosition(card, extraDays);
                    const tag = card.tags[0];
                    const style = tag ? TAG_COLORS[tag.color] || TAG_COLORS.purple : TAG_COLORS.purple;

                    return (
                      <div
                        key={card.id}
                        className="flex h-10 items-center transition-colors hover:bg-hover/60"
                      >
                        <div className="w-72 flex-shrink-0 truncate border-r border-border/50 px-4 text-xs font-medium text-text">
                          <button
                            type="button"
                            onClick={() => onCardClick(card)}
                            className="truncate hover:text-project-solid hover:underline cursor-pointer"
                          >
                            {card.title}
                          </button>
                        </div>

                        <div className="relative flex-1 h-full flex items-center px-1">
                          {isVisible ? (
                            <div
                              onPointerDown={(e) => {
                                if (e.button !== 0) return;
                                const track = e.currentTarget.parentElement;
                                if (!track) return;
                                setDragState({
                                  card,
                                  startX: e.clientX,
                                  trackWidth: track.getBoundingClientRect().width,
                                  deltaDays: 0,
                                  hasMoved: false
                                });
                              }}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`
                              }}
                              className={cn(
                                'absolute h-6 rounded-lg px-2.5 flex items-center justify-between text-[10px] font-semibold text-white shadow-2xs select-none',
                                isDraggingThis
                                  ? 'cursor-grabbing ring-2 ring-project-accent brightness-110 z-20 shadow-card-drag'
                                  : 'cursor-grab hover:brightness-105 transition-[left,brightness] duration-75',
                                style.dot
                              )}
                              title="Geser kiri/kanan untuk ubah tanggal, klik untuk detail"
                            >
                              <span className="truncate">{card.title}</span>
                              {isDraggingThis && dragState.deltaDays !== 0 && (
                                <span className="ml-1.5 rounded bg-black/30 px-1 font-mono text-[9px] shrink-0">
                                  {dragState.deltaDays > 0 ? `+${dragState.deltaDays}h` : `${dragState.deltaDays}h`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted italic px-2">Diluar rentang waktu</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {columnCards.length === 0 && (
                    <div className="py-2 px-4 text-xs text-muted italic">
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
