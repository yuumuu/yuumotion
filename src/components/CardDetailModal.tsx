import React, { useState } from 'react';
import { Card, Column, PriorityLevel, CardTag } from '../types/board';
import { INITIAL_TAGS, TAG_COLORS } from '../lib/constants';
import {
  X,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  CheckSquare,
  FileText,
  Plus
} from 'lucide-react';

interface CardDetailModalProps {
  card: Card;
  columns: Column[];
  onClose: () => void;
  onUpdate: (updated: Card) => void;
  onDelete: (cardId: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columns,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [columnId, setColumnId] = useState(card.columnId);
  const [priority, setPriority] = useState<PriorityLevel>(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [tags, setTags] = useState<CardTag[]>(card.tags);
  const [newChecklistText, setNewChecklistText] = useState('');

  const syncChanges = (partial: Partial<Card>) => {
    onUpdate({
      ...card,
      title,
      description,
      columnId,
      priority,
      dueDate: dueDate || undefined,
      tags,
      ...partial,
      updatedAt: Date.now()
    });
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== card.title) {
      syncChanges({ title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== card.description) {
      syncChanges({ description });
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    const nextChecklist = card.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    syncChanges({ checklist: nextChecklist });
  };

  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    syncChanges({ checklist: [...card.checklist, newItem] });
    setNewChecklistText('');
  };

  const removeChecklistItem = (itemId: string) => {
    syncChanges({ checklist: card.checklist.filter((item) => item.id !== itemId) });
  };

  const toggleTag = (tag: CardTag) => {
    const exists = tags.some((t) => t.id === tag.id);
    const nextTags = exists ? tags.filter((t) => t.id !== tag.id) : [...tags, tag];
    setTags(nextTags);
    syncChanges({ tags: nextTags });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative flex h-[85vh] max-h-[720px] w-full max-w-2xl flex-col rounded-2xl border border-appflowy-border bg-appflowy-surface shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <div className="flex items-center justify-between border-b border-appflowy-border px-6 py-3.5 dark:border-appflowy-darkBorder">
          <div className="flex items-center gap-2 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
            <span>In list</span>
            <select
              value={columnId}
              onChange={(e) => {
                setColumnId(e.target.value);
                syncChanges({ columnId: e.target.value });
              }}
              className="rounded border border-appflowy-border bg-appflowy-bg px-2 py-0.5 font-medium text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDelete(card.id);
                onClose();
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Card"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Card Title"
              className="w-full bg-transparent text-xl font-semibold tracking-tight text-appflowy-text placeholder-neutral-400 focus:outline-none dark:text-appflowy-darkText"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl bg-neutral-50/80 p-3.5 dark:bg-neutral-900/40">
            <div className="flex items-center gap-2">
              <span className="flex w-24 items-center gap-1.5 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                <AlertCircle className="h-3.5 w-3.5" />
                Priority
              </span>
              <select
                value={priority}
                onChange={(e) => {
                  const p = e.target.value as PriorityLevel;
                  setPriority(p);
                  syncChanges({ priority: p });
                }}
                className="rounded border border-appflowy-border bg-appflowy-surface px-2 py-1 text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex w-24 items-center gap-1.5 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                <Calendar className="h-3.5 w-3.5" />
                Due Date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  syncChanges({ dueDate: e.target.value });
                }}
                className="rounded border border-appflowy-border bg-appflowy-surface px-2 py-0.5 text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
              <Tag className="h-3.5 w-3.5" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_TAGS.map((tag) => {
                const isSelected = tags.some((t) => t.id === tag.id);
                const style = TAG_COLORS[tag.color] || TAG_COLORS.neutral;
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-opacity ${
                      style.bg
                    } ${style.text} ${isSelected ? 'ring-2 ring-purple-500' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                <CheckSquare className="h-3.5 w-3.5" />
                Checklist
              </span>
              <span className="text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                {card.checklist.filter((i) => i.completed).length} of {card.checklist.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {card.checklist.map((item) => (
                <div key={item.id} className="group flex items-center justify-between rounded-lg px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <label className="flex items-center gap-2 text-xs text-appflowy-text dark:text-appflowy-darkText cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={item.completed ? 'line-through text-appflowy-muted dark:text-appflowy-darkMuted' : ''}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <form onSubmit={addChecklistItem} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add a checklist item..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 rounded border border-appflowy-border bg-appflowy-bg px-2.5 py-1 text-xs text-appflowy-text focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded bg-purple-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-purple-700"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
              <FileText className="h-3.5 w-3.5" />
              <span>Notes & Document</span>
            </div>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Write detailed notes, markdown content, or specifications..."
              className="w-full rounded-xl border border-appflowy-border bg-appflowy-bg p-3 text-xs leading-relaxed text-appflowy-text focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
