import React, { useState } from 'react';
import { Card } from '../types/board';
import { TAG_COLORS } from '../lib/constants';
import { Calendar, CheckSquare, AlertCircle, Paperclip } from 'lucide-react';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const PRIORITY_BADGES: Record<string, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' },
  high: { label: 'High', className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
  medium: { label: 'Med', className: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
  low: { label: 'Low', className: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' }
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, onClick, onDragStart }) => {
  const [isDragging, setIsDragging] = useState(false);
  const completedChecklist = card.checklist.filter((item) => item.completed).length;

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={onClick}
      className={`group relative cursor-pointer select-none overflow-hidden rounded-xl border border-appflowy-border bg-appflowy-surface transition-all duration-150 ${
        isDragging
          ? 'rotate-1.5 scale-[1.02] shadow-xl border-purple-400 opacity-80 dark:border-purple-600'
          : 'shadow-2xs hover:border-neutral-300 hover:shadow-md dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:hover:border-neutral-600'
      }`}
    >
      {card.coverImage && (
        <div className="h-28 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          <img
            src={card.coverImage}
            alt={card.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-3">
        {card.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {card.tags.map((tag) => {
              const style = TAG_COLORS[tag.color] || TAG_COLORS.neutral;
              return (
                <span
                  key={tag.id}
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {tag.name}
                </span>
              );
            })}
          </div>
        )}

        <h4 className="text-xs font-semibold leading-snug text-appflowy-text dark:text-appflowy-darkText">
          {card.title}
        </h4>

        {(card.dueDate || card.checklist.length > 0 || card.priority !== 'low' || (card.attachments && card.attachments.length > 0)) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
            {card.priority !== 'low' && (
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_BADGES[card.priority].className}`}
              >
                <AlertCircle className="h-2.5 w-2.5" />
                {PRIORITY_BADGES[card.priority].label}
              </span>
            )}

            {card.checklist.length > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] ${
                  completedChecklist === card.checklist.length ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''
                }`}
              >
                <CheckSquare className="h-3 w-3" />
                {completedChecklist}/{card.checklist.length}
              </span>
            )}

            {(card.attachments || []).length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px]" title={`${card.attachments.length} attachments`}>
                <Paperclip className="h-3 w-3" />
                {card.attachments.length}
              </span>
            )}

            {card.dueDate && (
              <span className="inline-flex items-center gap-1 text-[11px]">
                <Calendar className="h-3 w-3" />
                {card.dueDate}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
