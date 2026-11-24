import React, { useState } from 'react';
import { Card } from '../types/board';
import { TAG_COLORS } from '../lib/constants';
import { Calendar, CheckSquare, AlertCircle, Paperclip } from 'lucide-react';
import { Badge } from './ui';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const PRIORITY_BADGES: Record<string, { label: string; variant: 'rose' | 'amber' | 'blue' | 'neutral' }> = {
  urgent: { label: 'Urgent', variant: 'rose' },
  high: { label: 'Tinggi', variant: 'amber' },
  medium: { label: 'Sedang', variant: 'blue' },
  low: { label: 'Rendah', variant: 'neutral' }
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, onClick, onDragStart }) => {
  const [isDragging, setIsDragging] = useState(false);
  const completedChecklist = card.checklist.filter((item) => item.completed).length;

  return (
    <div
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Kartu: ${card.title}. Prioritas: ${card.priority}.`}
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
      className={`group relative cursor-pointer select-none overflow-hidden rounded-xl border border-appflowy-border/90 bg-appflowy-surface transition-all duration-150 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
        isDragging
          ? 'rotate-1 scale-[1.01] shadow-xl border-purple-400 opacity-80 dark:border-purple-600'
          : 'shadow-2xs hover:border-neutral-300 hover:shadow-xs active:scale-[0.99] dark:border-appflowy-darkBorder/90 dark:bg-appflowy-darkSurface dark:hover:border-neutral-700'
      }`}
    >
      {card.coverImage && (
        <div className="h-24 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          <img
            src={card.coverImage}
            alt={card.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-3">
        {card.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {card.tags.map((tag) => {
              const style = TAG_COLORS[tag.color] || TAG_COLORS.neutral;
              return (
                <span
                  key={tag.id}
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${style.bg} ${style.text}`}
                >
                  <span className={`h-1 w-1 rounded-full ${style.dot}`} />
                  {tag.name}
                </span>
              );
            })}
          </div>
        )}

        <h4 className="text-xs font-medium leading-snug text-appflowy-text line-clamp-2 dark:text-appflowy-darkText">
          {card.title}
        </h4>

        {(card.dueDate || card.checklist.length > 0 || card.priority !== 'low' || (card.attachments && card.attachments.length > 0)) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
            {card.priority !== 'low' && (
              <Badge
                variant={PRIORITY_BADGES[card.priority]?.variant || 'neutral'}
                className="text-[10px] px-1.5 py-0.5"
              >
                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                {PRIORITY_BADGES[card.priority]?.label || card.priority}
              </Badge>
            )}

            {card.checklist.length > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                  completedChecklist === card.checklist.length ? 'text-emerald-600 dark:text-emerald-400' : ''
                }`}
                title="Progres checklist tugas"
              >
                <CheckSquare className="h-3 w-3" />
                {completedChecklist}/{card.checklist.length}
              </span>
            )}

            {(card.attachments || []).length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px]" title={`${card.attachments.length} lampiran dokumen`}>
                <Paperclip className="h-2.5 w-2.5" />
                {card.attachments.length}
              </span>
            )}

            {card.dueDate && (
              <span className="inline-flex items-center gap-1 text-[10px] ml-auto font-mono">
                <Calendar className="h-2.5 w-2.5" />
                {card.dueDate}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};