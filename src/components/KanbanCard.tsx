import React, { useState } from 'react';
import { Card } from '../types/board';
import { Calendar, CheckSquare, Paperclip, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/cn';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  isDoneColumn?: boolean;
}

const priorityStyles: Record<string, { label: string; text: string; bg: string; border: string }> = {
  urgent: { label: 'Urgent', text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  high: { label: 'Tinggi', text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  medium: { label: 'Sedang', text: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  low: { label: 'Rendah', text: 'text-muted', bg: 'bg-hover/80', border: 'border-border/60' }
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
      className={cn(
        'group relative cursor-grab select-none rounded-2xl border border-border bg-surface p-4 text-left shadow-card-sm',
        'transition-all duration-200 ease-drag-glide',
        'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-project-ring',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent',
        isDragging && 'cursor-grabbing scale-[1.03] rotate-[2deg] shadow-card-drag border-project-accent z-50 opacity-90',
        isDoneColumn && 'opacity-85 hover:opacity-100',
        'motion-reduce:transform-none motion-reduce:transition-none'
      )}
    >
      {/* Optional Card Cover Image */}
      {card.coverImage && (
        <div className="h-28 w-full overflow-hidden rounded-xl border border-border/80 -mt-1 mb-3 bg-bar">
          <img
            src={card.coverImage}
            alt={card.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Top Meta: Monospaced ID & Priority Pill */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={cn(
          'font-mono text-[11px] font-semibold text-muted tracking-tight transition-colors group-hover:text-project-solid',
          isDoneColumn && 'line-through text-muted/60'
        )}>
          {formattedCode}
        </span>
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border',
            priority.bg,
            priority.text,
            priority.border
          )}
        >
          {priority.label}
        </span>
      </div>

      {/* Title */}
      <h3 className={cn(
        'text-xs font-bold leading-snug text-text mb-2.5',
        isDoneColumn && 'line-through text-muted'
      )}>
        {card.title}
      </h3>

      {/* Playful Tag Pills */}
      {card.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-project-soft px-2 py-0.5 text-[10px] font-bold text-project-solid border border-project-ring/40"
            >
              {tag.name}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="rounded-full bg-hover px-1.5 py-0.5 text-[9px] font-mono font-bold text-muted">
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Checklist Progress Bar Mini */}
      {card.checklist.length > 0 && (
        <div className="mb-3 space-y-1">
          <div className="h-1 w-full rounded-full bg-hover overflow-hidden">
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
      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-xs text-muted">
        <div className="flex items-center gap-2.5 font-mono tabular-nums text-[11px]">
          {card.checklist.length > 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                isAllDone ? 'text-status-done' : 'text-muted'
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
            <span className="inline-flex items-center gap-1 text-[10px]">
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
