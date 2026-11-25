import React, { useState } from 'react';
import { Card } from '../types/board';
import { CalendarBlank, Paperclip, Check, CheckSquare } from '@phosphor-icons/react';
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
  onRenameCard?: (cardId: string, newTitle: string) => void;
  assigneeAvatars?: string[];
}

const priorityConfig: Record<string, { label: string; badge: string }> = {
  urgent: { label: 'Urgent', badge: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  high: { label: 'Tinggi', badge: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  medium: { label: 'Sedang', badge: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  low: { label: 'Rendah', badge: 'text-muted bg-hover' }
};

function getCardPastelGradient(card: Card): { container: string; bar: string } {
  const firstTag = (card.tags?.[0]?.name || '').toLowerCase();

  if (firstTag.includes('design') || firstTag.includes('ui') || firstTag.includes('ux')) {
    return {
      container: 'bg-gradient-to-b from-violet-50/90 to-surface border-violet-200/75 dark:from-violet-950/35 dark:to-surface dark:border-violet-800/45',
      bar: 'bg-violet-500'
    };
  }
  if (firstTag.includes('frontend') || firstTag.includes('web') || firstTag.includes('react')) {
    return {
      container: 'bg-gradient-to-b from-sky-50/90 to-surface border-sky-200/75 dark:from-sky-950/35 dark:to-surface dark:border-sky-800/45',
      bar: 'bg-sky-500'
    };
  }
  if (firstTag.includes('backend') || firstTag.includes('infra') || firstTag.includes('api')) {
    return {
      container: 'bg-gradient-to-b from-emerald-50/90 to-surface border-emerald-200/75 dark:from-emerald-950/35 dark:to-surface dark:border-emerald-800/45',
      bar: 'bg-emerald-500'
    };
  }
  if (card.priority === 'urgent' || firstTag.includes('bug')) {
    return {
      container: 'bg-gradient-to-b from-amber-50/90 to-surface border-amber-200/75 dark:from-amber-950/35 dark:to-surface dark:border-amber-800/45',
      bar: 'bg-amber-500'
    };
  }

  return {
    container: 'bg-surface border-border',
    bar: 'bg-project-solid'
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
  onKeyboardCancel,
  onRenameCard,
  assigneeAvatars
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(card.title);

  if (isOriginPlaceholder) {
    return (
      <div
        aria-hidden="true"
        style={{ height: placeholderHeight ? `${placeholderHeight}px` : '104px' }}
        className="w-full rounded-2xl border-2 border-dashed border-project-solid/50 bg-project-soft/20 transition-[height,opacity] duration-150"
      />
    );
  }

  const completedChecklist = card.checklist.filter((item) => item.completed).length;
  const totalChecklist = card.checklist.length;
  const progressPct = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;
  const isAllDone = isDoneColumn || (totalChecklist > 0 && completedChecklist === totalChecklist);

  const formattedCode = `YUU-${card.id.replace(/\D/g, '').slice(-3) || '101'}`;
  const priority = priorityConfig[card.priority] || priorityConfig.low;
  const pastel = getCardPastelGradient(card);

  const hasFooter = totalChecklist > 0 || (card.attachments && card.attachments.length > 0) || Boolean(card.dueDate);

  return (
    <article
      role="button"
      tabIndex={isFloatingClone ? -1 : 0}
      aria-label={`Kartu ${formattedCode}: ${card.title}. Prioritas: ${card.priority}.`}
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
          className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-border/50 bg-surface/90 text-muted opacity-40 shadow-sm transition-all duration-150 group-hover:opacity-100 group-hover:border-status-done group-hover:bg-status-done/15 group-hover:text-status-done hover:scale-110 active:scale-90 cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" weight="bold" />
        </button>
      )}

      {/* Optional Card Cover Image */}
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

      {/* Top Meta: Monospaced ID & Priority Badge */}
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
          <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold', priority.badge)}>
            {priority.label}
          </span>
        )}
      </div>

      {/* Title (Double-click untuk inline edit) */}
      {isEditingTitle ? (
        <input
          type="text"
          autoFocus
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onBlur={() => {
            setIsEditingTitle(false);
            if (draftTitle.trim() && draftTitle.trim() !== card.title) {
              onRenameCard?.(card.id, draftTitle.trim());
            } else {
              setDraftTitle(card.title);
            }
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            } else if (e.key === 'Escape') {
              setDraftTitle(card.title);
              setIsEditingTitle(false);
            }
          }}
          className="w-full bg-transparent text-xs font-semibold leading-snug text-text mb-2 focus:outline-none"
        />
      ) : (
        <h3
          onDoubleClick={(e) => {
            if (!onRenameCard || isFloatingClone) return;
            e.stopPropagation();
            setDraftTitle(card.title);
            setIsEditingTitle(true);
          }}
          title={onRenameCard ? 'Klik dua kali untuk ubah judul' : undefined}
          className={cn(
            'text-xs font-semibold leading-snug text-text mb-2 line-clamp-2',
            isDoneColumn && 'line-through text-muted'
          )}
        >
          {card.title}
        </h3>
      )}

      {/* Minimal Tag Pills (maks 2) */}
      {card.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="rounded-md bg-surface/80 dark:bg-bg/60 px-1.5 py-0.5 text-[10px] font-medium text-muted border border-border/70"
            >
              #{tag.name.toLowerCase()}
            </span>
          ))}
        </div>
      )}

      {/* Assignee Avatars */}
      {assigneeAvatars && assigneeAvatars.length > 0 && (
        <div className="flex -space-x-1.5 mb-2">
          {assigneeAvatars.slice(0, 3).map((avatar, i) => (
            <div
              key={i}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-project-soft border-2 border-surface text-[9px] font-bold text-project-solid"
            >
              {avatar}
            </div>
          ))}
        </div>
      )}

      {/* Clean Linear Progress Bar (Tanpa 10 Circle Dots) */}
      {totalChecklist > 0 && (
        <div className="mb-2 h-1 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-[width] duration-200', isAllDone ? 'bg-status-done' : pastel.bar)}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Minimal Footer */}
      {hasFooter && (
        <div className="flex items-center gap-3 border-t border-border/40 pt-2 text-[10px] text-muted font-mono">
          {totalChecklist > 0 && (
            <span className={cn('inline-flex items-center gap-1', isAllDone && 'text-status-done font-semibold')}>
              <CheckSquare className="h-3 w-3" />
              <span>{completedChecklist}/{totalChecklist}</span>
            </span>
          )}

          {card.attachments && card.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{card.attachments.length}</span>
            </span>
          )}

          {card.dueDate && (
            <span className="inline-flex items-center gap-1 ml-auto">
              <CalendarBlank className="h-3 w-3" />
              <span>{card.dueDate.slice(5)}</span>
            </span>
          )}
        </div>
      )}
    </article>
  );
};
