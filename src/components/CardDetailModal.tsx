import React, { useState, useRef } from 'react';
import { Card, Column, PriorityLevel, CardTag, CardAttachment } from '../types/board';
import { INITIAL_TAGS, TAG_COLORS } from '../lib/constants';
import { TipTapEditor } from './TipTapEditor';
import { CustomSelect } from './ui/CustomSelect';
import { CustomDatePicker } from './ui/CustomDatePicker';
import {
  X,
  Trash2,
  AlertCircle,
  Tag,
  CheckSquare,
  FileText,
  Plus,
  Paperclip,
  ImageIcon,
  Download,
  Clock
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
  const [startDate, setStartDate] = useState(card.startDate || '');
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [coverImage, setCoverImage] = useState(card.coverImage || '');
  const [tags, setTags] = useState<CardTag[]>(card.tags);
  const [allAvailableTags, setAllAvailableTags] = useState<CardTag[]>(INITIAL_TAGS);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('purple');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [attachments, setAttachments] = useState<CardAttachment[]>(card.attachments || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const syncChanges = (partial: Partial<Card>) => {
    onUpdate({
      ...card,
      title,
      description,
      columnId,
      priority,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      coverImage: coverImage || undefined,
      tags,
      attachments,
      ...partial,
      updatedAt: Date.now()
    });
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== card.title) {
      syncChanges({ title: title.trim() });
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

  const handleCreateCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const newTag: CardTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor
    };

    setAllAvailableTags((prev) => [...prev, newTag]);
    const nextTags = [...tags, newTag];
    setTags(nextTags);
    syncChanges({ tags: nextTags });
    setNewTagName('');
    setIsAddingTag(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: CardAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          url: reader.result as string,
          createdAt: Date.now()
        };

        setAttachments((prev) => {
          const next = [...prev, newAttachment];
          syncChanges({ attachments: next });
          return next;
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => {
      const next = prev.filter((a) => a.id !== attId);
      syncChanges({ attachments: next });
      return next;
    });
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setCoverImage(url);
      syncChanges({ coverImage: url });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative flex h-[90vh] max-h-[840px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-appflowy-border bg-appflowy-surface shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        {coverImage && (
          <div className="relative h-36 w-full flex-shrink-0 bg-neutral-100 dark:bg-neutral-900">
            <img src={coverImage} alt="Card Cover" className="h-full w-full object-cover" />
            <button
              onClick={() => {
                setCoverImage('');
                syncChanges({ coverImage: undefined });
              }}
              className="absolute right-3 top-3 flex h-7 items-center gap-1 rounded-lg bg-black/50 px-2 text-[11px] font-medium text-white backdrop-blur-xs hover:bg-black/70"
            >
              <Trash2 className="h-3 w-3" />
              Remove Cover
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-appflowy-border px-6 py-3 dark:border-appflowy-darkBorder">
          <div className="flex items-center gap-2 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
            <span>In list</span>
            <CustomSelect
              value={columnId}
              options={columns.map((c) => ({
                value: c.id,
                label: c.title,
                colorDot: c.color
              }))}
              onChange={(val) => {
                setColumnId(val);
                syncChanges({ columnId: val });
              }}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {!coverImage && (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-appflowy-muted hover:bg-neutral-100 hover:text-purple-600 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Add Cover</span>
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />

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

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Card Title"
              className="w-full bg-transparent text-lg font-bold tracking-tight text-appflowy-text placeholder-neutral-400 focus:outline-none dark:text-appflowy-darkText"
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-xl bg-neutral-50/70 p-3 dark:bg-neutral-900/30">
            <div className="flex items-center gap-2">
              <span className="flex w-14 items-center gap-1 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                <AlertCircle className="h-3.5 w-3.5" />
                Priority
              </span>
              <CustomSelect
                value={priority}
                options={[
                  { value: 'low', label: 'Low', colorDot: '#9CA3AF' },
                  { value: 'medium', label: 'Medium', colorDot: '#3B82F6' },
                  { value: 'high', label: 'High', colorDot: '#F59E0B' },
                  { value: 'urgent', label: 'Urgent', colorDot: '#EF4444' }
                ]}
                onChange={(p) => {
                  setPriority(p as PriorityLevel);
                  syncChanges({ priority: p as PriorityLevel });
                }}
                className="flex-1"
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="flex w-12 items-center gap-1 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                <Clock className="h-3.5 w-3.5" />
                Start
              </span>
              <CustomDatePicker
                value={startDate}
                onChange={(d) => {
                  setStartDate(d);
                  syncChanges({ startDate: d });
                }}
                className="flex-1"
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="flex w-12 items-center gap-1 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                <Clock className="h-3.5 w-3.5" />
                Due
              </span>
              <CustomDatePicker
                value={dueDate}
                onChange={(d) => {
                  setDueDate(d);
                  syncChanges({ dueDate: d });
                }}
                className="flex-1"
                size="sm"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                <Tag className="h-3.5 w-3.5" />
                <span>Tags</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingTag(!isAddingTag)}
                className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:underline dark:text-purple-400"
              >
                <Plus className="h-3 w-3" />
                <span>Create Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {allAvailableTags.map((tag) => {
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

            {isAddingTag && (
              <form onSubmit={handleCreateCustomTag} className="mt-2.5 flex items-center gap-2 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-900/50">
                <input
                  type="text"
                  placeholder="New tag label..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 rounded border border-appflowy-border bg-appflowy-bg px-2 py-1 text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                />
                <CustomSelect
                  value={newTagColor}
                  options={[
                    { value: 'purple', label: 'Purple', colorDot: '#8B5CF6' },
                    { value: 'blue', label: 'Blue', colorDot: '#3B82F6' },
                    { value: 'green', label: 'Green', colorDot: '#10B981' },
                    { value: 'amber', label: 'Amber', colorDot: '#F59E0B' },
                    { value: 'rose', label: 'Rose', colorDot: '#EC4899' },
                    { value: 'neutral', label: 'Neutral', colorDot: '#9CA3AF' }
                  ]}
                  onChange={(c) => setNewTagColor(c)}
                  size="sm"
                />
                <button
                  type="submit"
                  className="rounded bg-purple-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-purple-700"
                >
                  Save
                </button>
              </form>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                <CheckSquare className="h-3.5 w-3.5" />
                Checklist Sub-Tasks
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
                  placeholder="Add a checklist sub-task..."
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
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                <Paperclip className="h-3.5 w-3.5" />
                Attachments & Uploaded Documents
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:underline dark:text-purple-400"
              >
                <Plus className="h-3 w-3" />
                <span>Upload File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="group flex items-center justify-between rounded-lg border border-appflowy-border bg-appflowy-bg p-2 text-xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="h-3.5 w-3.5 text-appflowy-muted" />
                    <span className="truncate font-medium text-appflowy-text dark:text-appflowy-darkText">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-appflowy-muted">
                      ({formatFileSize(att.size)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={att.url}
                      download={att.name}
                      className="text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-neutral-400 hover:text-rose-500"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {attachments.length === 0 && (
                <div className="rounded-lg border border-dashed border-appflowy-border p-3 text-center text-xs text-appflowy-muted dark:border-appflowy-darkBorder dark:text-appflowy-darkMuted">
                  No documents attached yet. Click upload to attach images, PDFs, or files.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
              <FileText className="h-3.5 w-3.5" />
              <span>Notion-Style WYSIWYG Document Canvas</span>
            </div>
            <TipTapEditor
              content={description}
              onChange={(html, json) => {
                setDescription(html);
                syncChanges({ description: html, contentJson: json });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
