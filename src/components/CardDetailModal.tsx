import React, { useState, useRef, useEffect } from 'react';
import { Card, Column, PriorityLevel, CardTag, CardAttachment, CardActivity } from '../types/board';
import { INITIAL_TAGS } from '../lib/constants';
import { TipTapEditor } from './TipTapEditor';
import {
  CustomSelect,
  CustomDatePicker,
  Button,
  Switch,
  TagPicker,
  AttachmentCard,
  Separator
} from './ui';
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
  Clock,
  History
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
  const [newChecklistText, setNewChecklistText] = useState('');
  const [attachments, setAttachments] = useState<CardAttachment[]>(card.attachments || []);
  const [autoMoveDone, setAutoMoveDone] = useState<boolean>(card.autoMoveDone ?? true);
  const [activities, setActivities] = useState<CardActivity[]>(() => {
    if (card.activities && card.activities.length > 0) return card.activities;
    return [
      {
        id: `act-${Date.now()}`,
        userName: 'Sistem',
        action: 'Kartu dibuat',
        timestamp: card.updatedAt || Date.now()
      }
    ];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
      activities,
      autoMoveDone,
      ...partial,
      updatedAt: Date.now()
    });
  };

  const logActivity = (action: string) => {
    const act: CardActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userName: 'Anda',
      action,
      timestamp: Date.now()
    };
    const nextActs = [act, ...activities];
    setActivities(nextActs);
    return nextActs;
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== card.title) {
      const nextActs = logActivity(`Mengubah judul kartu menjadi "${title.trim()}"`);
      syncChanges({ title: title.trim(), activities: nextActs });
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    const targetItem = card.checklist.find((i) => i.id === itemId);
    const nextChecklist = card.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const isAllComplete = nextChecklist.length > 0 && nextChecklist.every((i) => i.completed);
    let nextColId = columnId;
    let nextActivities = [
      {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        userName: 'Anda',
        action: `${targetItem?.completed ? 'Membatalkan' : 'Menyelesaikan'} checklist "${targetItem?.text}"`,
        timestamp: Date.now()
      },
      ...activities
    ];

    if (isAllComplete && autoMoveDone) {
      const doneCol = columns.find((c) => c.title.toLowerCase().includes('done')) || columns[columns.length - 1];
      if (doneCol && doneCol.id !== columnId) {
        nextColId = doneCol.id;
        setColumnId(doneCol.id);
        nextActivities = [
          {
            id: `act-${Date.now()}-auto`,
            userName: 'Aturan Otomasi',
            action: `Checklist 100% lengkap. Kartu otomatis dipindahkan ke kolom "${doneCol.title}"`,
            timestamp: Date.now()
          },
          ...nextActivities
        ];
      }
    }

    setActivities(nextActivities);
    syncChanges({ checklist: nextChecklist, columnId: nextColId, activities: nextActivities });
  };

  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    const nextActs = logActivity(`Menambahkan checklist "${newItem.text}"`);
    syncChanges({ checklist: [...card.checklist, newItem], activities: nextActs });
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

  const handleCreateCustomTag = (name: string, color: string) => {
    const newTag: CardTag = {
      id: `tag-${Date.now()}`,
      name,
      color
    };
    setAllAvailableTags((prev) => [...prev, newTag]);
    const nextTags = [...tags, newTag];
    setTags(nextTags);
    syncChanges({ tags: nextTags });
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative flex h-[90vh] max-h-[860px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-appflowy-border bg-appflowy-surface shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        {coverImage && (
          <div className="relative h-36 w-full flex-shrink-0 bg-neutral-100 dark:bg-neutral-900">
            <img src={coverImage} alt="Card Cover" className="h-full w-full object-cover" />
            <button
              onClick={() => {
                setCoverImage('');
                syncChanges({ coverImage: undefined });
              }}
              className="absolute right-3 top-3 flex h-7 items-center gap-1 rounded-lg bg-black/60 px-2.5 text-[11px] font-medium text-white backdrop-blur-xs hover:bg-black/80 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>Hapus Cover</span>
            </button>
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-appflowy-border px-6 py-3 dark:border-appflowy-darkBorder">
          <div className="flex items-center gap-2 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
            <span>Di kolom</span>
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
              <Button
                variant="ghost"
                size="xs"
                onClick={() => coverInputRef.current?.click()}
                leftIcon={<ImageIcon className="h-3.5 w-3.5 text-appflowy-muted" />}
              >
                Tambah Cover
              </Button>
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
                if (confirm('Hapus kartu ini secara permanen?')) {
                  onDelete(card.id);
                  onClose();
                }
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
              title="Hapus Kartu"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Judul Kartu..."
              className="w-full bg-transparent text-xl font-bold tracking-tight text-appflowy-text placeholder-neutral-400 focus:outline-none dark:text-appflowy-darkText"
            />
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-2xl border border-appflowy-border/80 bg-neutral-50/70 p-3 dark:border-appflowy-darkBorder/80 dark:bg-neutral-900/30">
            <div className="flex items-center gap-2">
              <span className="flex w-16 items-center gap-1 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                <AlertCircle className="h-3.5 w-3.5" />
                Prioritas
              </span>
              <CustomSelect
                value={priority}
                options={[
                  { value: 'low', label: 'Rendah', colorDot: '#9CA3AF' },
                  { value: 'medium', label: 'Sedang', colorDot: '#3B82F6' },
                  { value: 'high', label: 'Tinggi', colorDot: '#F59E0B' },
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
              <span className="flex w-14 items-center gap-1 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                <Clock className="h-3.5 w-3.5" />
                Mulai
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
              <span className="flex w-14 items-center gap-1 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                <Clock className="h-3.5 w-3.5" />
                Deadline
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

          {/* Tags Section */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-appflowy-muted dark:text-appflowy-darkMuted">
              <Tag className="h-3.5 w-3.5" />
              <span>Label & Tags</span>
            </div>
            <TagPicker
              selectedTags={tags}
              allTags={allAvailableTags}
              onToggleTag={toggleTag}
              onCreateTag={handleCreateCustomTag}
            />
          </div>

          <Separator />

          {/* Checklist Tasks Section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-appflowy-muted dark:text-appflowy-darkMuted">
                <CheckSquare className="h-3.5 w-3.5" />
                Checklist Sub-Tasks
              </span>
              <span className="text-xs text-appflowy-muted dark:text-appflowy-darkMuted font-mono">
                {card.checklist.filter((i) => i.completed).length} dari {card.checklist.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {card.checklist.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <label className="flex items-center gap-2.5 text-xs text-appflowy-text dark:text-appflowy-darkText cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className={item.completed ? 'line-through text-appflowy-muted dark:text-appflowy-darkMuted' : ''}>
                      {item.text}
                    </span>
                  </label>
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 cursor-pointer p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <form onSubmit={addChecklistItem} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Tambah sub-task checklist..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 rounded-lg border border-appflowy-border bg-appflowy-bg px-2.5 py-1 text-xs text-appflowy-text focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                />
                <Button type="submit" size="xs" variant="primary" leftIcon={<Plus className="h-3 w-3" />}>
                  Tambah
                </Button>
              </form>
            </div>
          </div>

          <Separator />

          {/* Attachments Section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-appflowy-muted dark:text-appflowy-darkMuted">
                <Paperclip className="h-3.5 w-3.5" />
                Lampiran Dokumen & Gambar
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Plus className="h-3 w-3" />}
              >
                Unggah File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.map((att) => (
                <AttachmentCard
                  key={att.id}
                  attachment={att}
                  onRemove={() => handleRemoveAttachment(att.id)}
                />
              ))}
              {attachments.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-appflowy-border p-3 text-center text-xs text-appflowy-muted dark:border-appflowy-darkBorder dark:text-appflowy-darkMuted">
                  Belum ada dokumen yang dilampirkan.
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* TipTap Document Canvas */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-appflowy-muted dark:text-appflowy-darkMuted">
              <FileText className="h-3.5 w-3.5" />
              <span>Dokumen Catatan Lengkap</span>
            </div>
            <TipTapEditor
              content={description}
              onChange={(html, json) => {
                setDescription(html);
                syncChanges({ description: html, contentJson: json });
              }}
            />
          </div>

          {/* Auto-Rules & Automation Toggle */}
          <div className="rounded-2xl border border-appflowy-border/80 bg-neutral-50/60 p-3 text-xs dark:border-appflowy-darkBorder/80 dark:bg-neutral-900/30">
            <Switch
              label="Otomasi Selesai (Auto-Move to Done)"
              description="Otomatis geser kartu ke kolom Done saat seluruh checklist (100%) terpenuhi"
              checked={autoMoveDone}
              onChange={(e) => {
                setAutoMoveDone(e.target.checked);
                syncChanges({ autoMoveDone: e.target.checked });
              }}
            />
          </div>

          {/* Activity Log & Audit Trail */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-appflowy-muted dark:text-appflowy-darkMuted">
                <History className="h-3.5 w-3.5" />
                Riwayat Aktivitas Kartu
              </span>
              <span className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted font-mono">
                {activities.length} aktivitas
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-appflowy-border/60 bg-appflowy-bg/60 p-2 text-[11px] dark:border-appflowy-darkBorder/60 dark:bg-appflowy-darkBg/60"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {act.userName}:
                    </span>
                    <span className="text-appflowy-text dark:text-appflowy-darkText">
                      {act.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-appflowy-muted dark:text-appflowy-darkMuted whitespace-nowrap font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};