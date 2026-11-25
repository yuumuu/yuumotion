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

const priorityConfig: Record<string, { label: string; dot: string }> = {
  urgent: { label: 'Urgent', dot: 'bg-rose-500' },
  high: { label: 'Tinggi', dot: 'bg-amber-500' },
  medium: { label: 'Sedang', dot: 'bg-sky-500' },
  low: { label: 'Rendah', dot: 'bg-neutral-400' }
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  onClick,
  onDragStart,
  isDoneColumn
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const completedChecklist = card.checklist.filter((item) => item.completed).length;
  const isAllDone = isDoneColumn || (card.checklist.length > 0 && completedChecklist === card.checklist.length);
  const formattedCode = `YUU-${card.id.replace(/\D/g, '').slice(-3) || '101'}`;
  const priority = priorityConfig[card.priority] || priorityConfig.low;

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
        'group relative cursor-grab select-none rounded-2xl border border-border bg-surface p-3.5 text-left shadow-card-sm',
        'transition-all duration-200 ease-drag-glide',
        'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-project-ring',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent',
        isDragging && 'cursor-grabbing scale-[1.02] rotate-[1.5deg] shadow-card-drag border-project-accent z-50 opacity-90',
        isDoneColumn && 'opacity-85 hover:opacity-100',
        'motion-reduce:transform-none motion-reduce:transition-none'
      )}
    >
      {/* Optional Card Cover Image */}
      {card.coverImage && (
        <div className="h-24 w-full overflow-hidden rounded-xl border border-border/80 -mt-0.5 mb-2.5 bg-bar">
          <img
            src={card.coverImage}
            alt={card.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Top Meta: Monospaced ID & Priority Micro Dot */}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={cn(
            'font-mono text-[10px] font-semibold text-muted tracking-tight transition-colors group-hover:text-project-solid',
            isDoneColumn && 'line-through text-muted/50'
          )}
        >
          {formattedCode}
        </span>
        <div className="flex items-center gap-1.5" title={`Prioritas: ${priority.label}`}>
          <span className={cn('h-1.5 w-1.5 rounded-full', priority.dot)} />
          <span className="text-[10px] font-medium text-muted">{priority.label}</span>
        </div>
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

      {/* Progressive Tag Pills (Tampil hanya jika ada, maks 2) */}
      {card.tags.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {card.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-project-soft px-2 py-0.2 text-[9px] font-bold text-project-solid border border-project-ring/40"
            >
              {tag.name}
            </span>
          ))}
          {card.tags.length > 2 && (
            <span className="rounded-full bg-hover px-1.5 py-0.2 text-[9px] font-mono font-bold text-muted">
              +{card.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Bottom Row: Checklist / Attachments / Date & Assignee Avatar */}
      <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2 text-[10px] text-muted font-mono">
        <div className="flex items-center gap-2">
          {card.checklist.length > 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                isAllDone ? 'text-status-done font-bold' : 'text-muted'
              )}
            >
              {isAllDone ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <CheckSquare className="h-3 w-3" />
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

          {card.dueDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{card.dueDate.slice(5)}</span>
            </span>
          )}
        </div>

        {/* Minimal Assignee Avatar Dot */}
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-project-solid text-white text-[8px] font-bold shrink-0">
          H
        </div>
      </div>
    </article>
  );
};
