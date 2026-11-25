import React from 'react';
import { Card } from '../types/board';
import { CalendarBlank, Paperclip, Check } from '@phosphor-icons/react';
import { cn } from '../lib/cn';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
  onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
  onQuickComplete?: (card: Card) => void;
  isDoneColumn?: boolean;
  isOriginPlaceholder?: boolean;
  placeholderHeight?: number;
  isFloatingClone?: boolean;
  isKeyboardDragging?: boolean;
  onKeyboardDragToggle?: () => void;
  onKeyboardMove?: (direction: 'left' | 'right') => void;
  onKeyboardCancel?: () => void;
}

const priorityConfig: Record<string, { label: string; dot: string }> = {
  urgent: { label: 'Urgent', dot: 'bg-rose-500' },
  high: { label: 'Tinggi', dot: 'bg-amber-500' },
  medium: { label: 'Sedang', dot: 'bg-sky-500' },
  low: { label: 'Rendah', dot: 'bg-neutral-400' }
};

function getCardPastelStyle(card: Card): { container: string; dot: string } {
  const firstTag = (card.tags?.[0]?.name || '').toLowerCase();

  if (firstTag.includes('design') || firstTag.includes('ui') || firstTag.includes('ux')) {
    return {
      container: 'bg-violet-50/90 border-violet-200/80 dark:bg-violet-950/35 dark:border-violet-800/50',
      dot: 'bg-violet-600 dark:bg-violet-400'
    };
  }
  if (firstTag.includes('frontend') || firstTag.includes('web') || firstTag.includes('react')) {
    return {
      container: 'bg-sky-50/90 border-sky-200/80 dark:bg-sky-950/35 dark:border-sky-800/50',
      dot: 'bg-sky-600 dark:bg-sky-400'
    };
  }
  if (firstTag.includes('backend') || firstTag.includes('infra') || firstTag.includes('api')) {
    return {
      container: 'bg-emerald-50/90 border-emerald-200/80 dark:bg-emerald-950/35 dark:border-emerald-800/50',
      dot: 'bg-emerald-600 dark:bg-emerald-400'
    };
  }
  if (card.priority === 'urgent' || firstTag.includes('bug')) {
    return {
      container: 'bg-amber-50/90 border-amber-200/80 dark:bg-amber-950/35 dark:border-amber-800/50',
      dot: 'bg-amber-600 dark:bg-amber-400'
    };
  }

  return {
    container: 'bg-surface border-border',
    dot: 'bg-project-solid'
  };
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  onClick,
  onPointerDown,
  onQuickComplete,
  isDoneColumn,
  isOriginPlaceholder,
  placeholderHeight,
  isFloatingClone,
  isKeyboardDragging,
  onKeyboardDragToggle,
  onKeyboardMove,
  onKeyboardCancel
}) => {
  if (isOriginPlaceholder) {
    return (
      <div
        aria-hidden="true"
        style={{ height: placeholderHeight ? `${placeholderHeight}px` : '108px' }}
        className="w-full rounded-2xl border-2 border-dashed border-project-solid/50 bg-project-soft/25 transition-[height,opacity] duration-150"
      />
    );
  }

  const completedChecklist = card.checklist.filter((item) => item.completed).length;
  const totalChecklist = card.checklist.length;
  const progressPct = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;
  const filledDots = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 10) : 0;
  const isAllDone = isDoneColumn || (totalChecklist > 0 && completedChecklist === totalChecklist);

  const formattedCode = `YUU-${card.id.replace(/\D/g, '').slice(-3) || '101'}`;
  const priority = priorityConfig[card.priority] || priorityConfig.low;
  const pastel = getCardPastelStyle(card);

  return (
    <article
      role="button"
      tabIndex={isFloatingClone ? -1 : 0}
      aria-label={`Kartu ${formattedCode}: ${card.title}. Prioritas: ${card.priority}. Tekan Spasi untuk mengangkat kartu.`}
      aria-grabbed={isKeyboardDragging || isFloatingClone || undefined}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === ' ') {
          e.preventDefault();
          onKeyboardDragToggle?.();
          return;
        }
        if (isKeyboardDragging) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onKeyboardMove?.('left');
            return;
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            onKeyboardMove?.('right');
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            onKeyboardCancel?.();
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            onKeyboardDragToggle?.();
            return;
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group relative cursor-grab select-none rounded-2xl border p-3.5 text-left shadow-card-sm',
        pastel.container,
        !isFloatingClone && 'transition-[transform,box-shadow,border-color,opacity] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        !isFloatingClone && 'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-project-ring',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent',
        isFloatingClone && 'cursor-grabbing shadow-card-drag border-project-accent ring-2 ring-project-ring',
        isKeyboardDragging && 'scale-[1.02] ring-2 ring-project-accent border-project-accent shadow-card-drag z-20',
        isDoneColumn && !isFloatingClone && 'opacity-85 hover:opacity-100',
        'motion-reduce:transform-none motion-reduce:transition-none'
      )}
    >
      {/* Quick Hover Action (Zero Layout Shift) */}
      {!isDoneColumn && !isFloatingClone && onQuickComplete && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onQuickComplete(card);
          }}
          title="Tandai Selesai"
          className="absolute right-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-surface/95 text-muted opacity-0 shadow-2xs transition-[opacity,color,transform] duration-150 group-hover:opacity-100 hover:text-status-done hover:border-status-done/40 active:scale-90 cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" weight="bold" />
        </button>
      )}

      {/* Optional Card Cover Image (proporsional 72px) */}
      {card.coverImage && (
        <div className="h-[72px] w-full overflow-hidden rounded-xl border border-border/70 -mt-0.5 mb-2.5 bg-bar">
          <img
            src={card.coverImage}
            alt={card.title}
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Top Meta: Monospaced ID & Priority / Done Micro-Delight */}
      <div className="mb-1.5 flex items-center justify-between gap-2 pr-6">
        <span
          className={cn(
            'font-mono text-[10px] font-semibold text-muted tracking-tight transition-colors group-hover:text-project-solid',
            isDoneColumn && 'line-through text-muted/60'
          )}
        >
          {formattedCode}
        </span>

        {isDoneColumn ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-status-done-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-done">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-yuu-check"
              />
            </svg>
            <span>Selesai</span>
          </span>
        ) : (
          <div className="flex items-center gap-1.5" title={`Prioritas: ${priority.label}`}>
            <span className={cn('h-1.5 w-1.5 rounded-full', priority.dot)} />
            <span className="text-[10px] font-medium text-muted">{priority.label}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-xs font-semibold leading-snug text-text mb-2 line-clamp-2',
          isDoneColumn && 'line-through text-muted'
        )}
      >
        {card.title}
      </h3>

      {/* Progressive Tag Pills (ala Weihu #tag) */}
      {card.tags.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-md bg-surface/80 dark:bg-bg/60 px-1.5 py-0.5 text-[10px] font-medium text-muted border border-border/70"
            >
              #{tag.name.toLowerCase()}
            </span>
          ))}
        </div>
      )}

      {/* Segmented Dot Progress Bar (ala Weihu Gambar 1) */}
      {totalChecklist > 0 && (
        <div className="mb-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted">
            <span>Progres</span>
            <span className={cn(isAllDone && 'text-status-done font-semibold')}>{progressPct}%</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-200',
                  i < filledDots
                    ? isAllDone
                      ? 'bg-status-done'
                      : pastel.dot
                    : 'bg-black/10 dark:bg-white/10'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row: Attachments / Date & Assignee Avatar */}
      <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2 text-[10px] text-muted font-mono">
        <div className="flex items-center gap-2.5">
          {card.attachments && card.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{card.attachments.length}</span>
            </span>
          )}

          {card.dueDate && (
            <span className="inline-flex items-center gap-1">
              <CalendarBlank className="h-3 w-3" />
              <span>{card.dueDate.slice(5)}</span>
            </span>
          )}
        </div>

        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-project-solid text-white text-[9px] font-bold shrink-0 shadow-2xs">
          H
        </div>
      </div>
    </article>
  );
};
