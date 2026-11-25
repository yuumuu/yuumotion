import React, { useState } from 'react';
import { Card } from '../types/board';
import { Calendar, CheckSquare, Flag, Paperclip, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/cn';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  isDoneColumn?: boolean;
}

const priorityStyles: Record<string, { label: string; text: string; bg: string; border: string }> = {
  urgent: { label: 'Urgent', text: 'text-status-urgent', bg: 'bg-status-urgent-bg', border: 'border-status-urgent/30' },
  high: { label: 'Tinggi', text: 'text-status-high', bg: 'bg-status-high-bg', border: 'border-status-high/30' },
  medium: { label: 'Sedang', text: 'text-status-medium', bg: 'bg-status-medium-bg', border: 'border-status-medium/30' },
  low: { label: 'Rendah', text: 'text-muted', bg: 'bg-bar', border: 'border-border' }
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, onClick, onDragStart, isDoneColumn }) => {
  const [isDragging, setIsDragging] = useState(false);
  const completedChecklist = card.checklist.filter((item) => item.completed).length;
  const isAllDone = isDoneColumn || (card.checklist.length > 0 && completedChecklist === card.checklist.length);
  const formattedCode = `YUU-${card.id.replace(/\D/g, '').slice(-3) || '101'}`;
  const priority = priorityStyles[card.priority] || priorityStyles.low;

  return (
    <article
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Kartu ${formattedCode}: ${card.title}. Prioritas: ${card.priority}.`}
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ padding: 'var(--space-card-p)' }}
      className={cn(
        'group relative cursor-grab select-none rounded-xl border border-border bg-surface text-left',
        'shadow-card-rest transition-[transform,box-shadow,border-color] duration-200 ease-drag-glide',
        'hover:border-border-strong hover:shadow-card-hover',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent',
        isDragging && 'cursor-grabbing scale-[1.03] rotate-[2deg] shadow-card-drag border-project-accent z-50 opacity-90',
        'motion-reduce:transform-none motion-reduce:transition-none'
      )}
    >
      {/* Optional Card Cover Banner */}
      {card.coverImage && (
        <div className="h-[var(--space-cover-h)] w-full overflow-hidden rounded-t-[11px] border-b border-border -mx-[var(--space-card-p)] -mt-[var(--space-card-p)] mb-2.5 bg-bar">
          <img
            src={card.coverImage}
            alt={card.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Top Meta: Monospaced ID & Priority Flag */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-medium text-muted tracking-tight">
          {formattedCode}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium border',
            priority.bg,
            priority.text,
            priority.border
          )}
        >
          <Flag className="h-3 w-3" aria-hidden="true" />
          <span>{priority.label}</span>
        </span>
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 text-[var(--text-ui)] font-semibold leading-snug text-text">
        {card.title}
      </h3>

      {/* Tag Pills (Max 3) */}
      {card.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-project-soft px-2 py-0.5 text-[11px] font-medium text-project-accent"
            >
              {tag.name}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="rounded-full bg-bar px-1.5 py-0.5 text-[10px] text-muted font-mono">
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Checklist Progress Bar Mini */}
      {card.checklist.length > 0 && (
        <div className="mt-3 space-y-1">
          <div className="h-1 w-full rounded-full bg-bar overflow-hidden border border-border/50">
            <div
              className={cn(
                'h-full transition-all duration-300',
                isAllDone ? 'bg-status-done' : 'bg-project-solid'
              )}
              style={{ width: `${(completedChecklist / card.checklist.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Metadata & Micro-delight */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-xs text-muted">
        <div className="flex items-center gap-2.5 font-mono tabular-nums text-[11px]">
          {card.checklist.length > 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                isAllDone && 'text-status-done font-medium'
              )}
            >
              {isAllDone ? (
                <CheckCircle2 className="h-3.5 w-3.5 animate-in zoom-in-75 duration-200" />
              ) : (
                <CheckSquare className="h-3.5 w-3.5" />
              )}
              <span>{completedChecklist}/{card.checklist.length}</span>
            </span>
          )}

          {card.attachments && card.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{card.attachments.length}</span>
            </span>
          )}
        </div>

        {card.dueDate && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted">
            <Calendar className="h-3 w-3" />
            <span>{card.dueDate}</span>
          </span>
        )}
      </div>
    </article>
  );
};
