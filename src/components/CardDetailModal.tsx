import React, { useState, useRef } from 'react';
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
  Separator,
  Drawer,
  Dialog
} from './ui';
import {
  X,
  Trash2,
  Tag,
  CheckSquare,
  FileText,
  Plus,
  Paperclip,
  ImageIcon,
  History,
  Maximize2,
  Square,
  Layout
} from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { CardOpenMode } from '../types/preferences';
import { cn } from '../lib/cn';

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
  const { preferences } = usePreferences();
  const [openMode, setOpenMode] = useState<CardOpenMode>(preferences.cardOpenMode || 'drawer');

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

  const formattedCode = `YUU-${card.id.replace(/\D/g, '').slice(-3) || '101'}`;

  const syncChanges = (partial: Partial<Card>) => {
    const updated: Card = {
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
      autoMoveDone,
      activities,
      ...partial,
      updatedAt: Date.now()
    };
    onUpdate(updated);
  };

  const addActivity = (action: string) => {
    const newAct: CardActivity = {
      id: `act-${Date.now()}`,
      userName: 'Anda',
      action,
      timestamp: Date.now()
    };
    const nextActivities = [newAct, ...activities];
    setActivities(nextActivities);
    syncChanges({ activities: nextActivities });
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== card.title) {
      syncChanges({ title: title.trim() });
      addActivity(`Mengubah judul menjadi "${title.trim()}"`);
    }
  };

  const handleColumnChange = (newColId: string) => {
    setColumnId(newColId);
    syncChanges({ columnId: newColId });
    const colName = columns.find((c) => c.id === newColId)?.title || 'kolom baru';
    addActivity(`Memindahkan kartu ke kolom "${colName}"`);
  };

  const handlePriorityChange = (newPriority: string) => {
    const p = newPriority as PriorityLevel;
    setPriority(p);
    syncChanges({ priority: p });
    addActivity(`Mengubah prioritas menjadi "${p}"`);
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };

    const nextChecklist = [...card.checklist, newItem];
    syncChanges({ checklist: nextChecklist });
    setNewChecklistText('');
    addActivity(`Menambahkan checklist "${newItem.text}"`);
  };

  const handleToggleChecklist = (id: string) => {
    const nextChecklist = card.checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    const isAllCompleted =
      nextChecklist.length > 0 && nextChecklist.every((item) => item.completed);

    let nextColumnId = columnId;
    if (isAllCompleted && autoMoveDone) {
      const doneCol = columns.find(
        (c) =>
          c.title.toLowerCase().includes('done') ||
          c.title.toLowerCase().includes('selesai')
      );
      if (doneCol && doneCol.id !== columnId) {
        nextColumnId = doneCol.id;
        setColumnId(doneCol.id);
        addActivity('Semua checklist selesai: kartu otomatis dipindahkan ke Done');
      }
    }

    syncChanges({ checklist: nextChecklist, columnId: nextColumnId });
  };

  const handleDeleteChecklistItem = (id: string) => {
    const nextChecklist = card.checklist.filter((item) => item.id !== id);
    syncChanges({ checklist: nextChecklist });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: CardAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          url: reader.result as string,
          createdAt: Date.now()
        };
        const nextAttachments = [...attachments, newAttachment];
        setAttachments(nextAttachments);
        syncChanges({ attachments: nextAttachments });
        addActivity(`Mengunggah lampiran "${file.name}"`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setCoverImage(url);
      syncChanges({ coverImage: url });
      addActivity('Memperbarui cover gambar kartu');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Render Inner Content
  const renderDetailContent = () => (
    <div className="space-y-6">
      {/* Cover Image Banner */}
      {coverImage && (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-border bg-bar">
          <img src={coverImage} alt="Card Cover" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setCoverImage('');
              syncChanges({ coverImage: undefined });
              addActivity('Menghapus cover gambar kartu');
            }}
            className="absolute right-3 top-3 flex h-7 items-center gap-1 rounded-lg bg-black/60 px-2.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-black/80 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Cover</span>
          </button>
        </div>
      )}

      {/* Title & Metadata Topbar */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs font-semibold text-project-accent bg-project-soft px-2 py-0.5 rounded-md">
            {formattedCode}
          </span>
          <span className="text-xs text-muted">di kolom</span>
          <span className="text-xs font-medium text-text">
            {columns.find((c) => c.id === columnId)?.title || 'Papan'}
          </span>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="w-full bg-transparent font-display text-xl sm:text-2xl font-bold tracking-tight text-text placeholder:text-muted focus:outline-none"
          placeholder="Judul Tugas..."
        />
      </div>

      {/* Grid Settings: Kolom, Prioritas, Tanggal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 p-3.5 rounded-xl border border-border bg-bar">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
            Status Kolom
          </label>
          <CustomSelect
            value={columnId}
            onChange={handleColumnChange}
            options={columns.map((c) => ({ value: c.id, label: c.title }))}
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
            Prioritas
          </label>
          <CustomSelect
            value={priority}
            onChange={handlePriorityChange}
            options={[
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'Tinggi' },
              { value: 'medium', label: 'Sedang' },
              { value: 'low', label: 'Rendah' }
            ]}
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
            Tanggal Mulai
          </label>
          <CustomDatePicker
            value={startDate}
            onChange={(d) => {
              setStartDate(d);
              syncChanges({ startDate: d });
              addActivity(`Mengatur tanggal mulai ke "${d}"`);
            }}
            placeholder="Pilih mulai"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
            Tenggat Waktu
          </label>
          <CustomDatePicker
            value={dueDate}
            onChange={(d) => {
              setDueDate(d);
              syncChanges({ dueDate: d });
              addActivity(`Mengatur tenggat waktu ke "${d}"`);
            }}
            placeholder="Pilih deadline"
          />
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-2">
          <Tag className="h-3.5 w-3.5" />
          Tags & Label
        </label>
        <TagPicker
          selectedTags={tags}
          allTags={allAvailableTags}
          onToggleTag={(tag: CardTag) => {
            const isSelected = tags.some((t) => t.id === tag.id);
            const next = isSelected ? tags.filter((t) => t.id !== tag.id) : [...tags, tag];
            setTags(next);
            syncChanges({ tags: next });
            addActivity(`${isSelected ? 'Menghapus' : 'Menambahkan'} tag "${tag.name}"`);
          }}
          onCreateTag={(name: string, color: string) => {
            const newTag: CardTag = {
              id: `tag-${Date.now()}`,
              name,
              color
            };
            setAllAvailableTags((prev) => [...prev, newTag]);
            const next = [...tags, newTag];
            setTags(next);
            syncChanges({ tags: next });
            addActivity(`Membuat tag baru "${name}"`);
          }}
        />
      </div>

      {/* TipTap Rich Editor Description */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-2">
          <FileText className="h-3.5 w-3.5" />
          Deskripsi & Catatan Lengkap
        </label>
        <div className="rounded-xl border border-border bg-surface p-3 min-h-[160px] shadow-2xs">
          <TipTapEditor
            content={description}
            onChange={(html) => {
              setDescription(html);
              syncChanges({ description: html });
            }}
          />
        </div>
      </div>

      {/* Checklist Task Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" />
            Checklist Tugas
          </label>
          <span className="text-xs font-mono text-muted">
            {card.checklist.filter((i) => i.completed).length}/{card.checklist.length} Selesai
          </span>
        </div>

        <div className="space-y-1.5 mb-3">
          {card.checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface p-2 text-xs"
            >
              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleChecklist(item.id)}
                  className="rounded border-border text-project-solid focus:ring-project-accent"
                />
                <span className={cn('truncate', item.completed && 'line-through text-muted')}>
                  {item.text}
                </span>
              </label>
              <button
                type="button"
                onClick={() => handleDeleteChecklistItem(item.id)}
                className="text-muted hover:text-danger p-1 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddChecklistItem} className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah item checklist..."
            value={newChecklistText}
            onChange={(e) => setNewChecklistText(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-project-accent focus:outline-none"
          />
          <Button size="sm" variant="secondary" type="submit" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Tambah
          </Button>
        </form>
      </div>

      {/* Lampiran Dokumen */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5" />
            Lampiran Dokumen & Gambar
          </label>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<ImageIcon className="h-3 w-3" />}
              onClick={() => coverInputRef.current?.click()}
            >
              Ganti Cover
            </Button>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Paperclip className="h-3 w-3" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Unggah File
            </Button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {attachments.map((att) => (
              <AttachmentCard
                key={att.id}
                attachment={att}
                onRemove={() => {
                  const next = attachments.filter((a) => a.id !== att.id);
                  setAttachments(next);
                  syncChanges({ attachments: next });
                  addActivity(`Menghapus lampiran "${att.name}"`);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Automasi & Audit Trail */}
      <div className="pt-2">
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-bar mb-4">
          <div>
            <span className="text-xs font-semibold text-text block">Automasi Selesai (Auto-Move)</span>
            <span className="text-[11px] text-muted block">
              Pindahkan otomatis ke kolom Done saat seluruh checklist tercentang
            </span>
          </div>
          <Switch
            checked={autoMoveDone}
            onChange={(e) => {
              setAutoMoveDone(e.target.checked);
              syncChanges({ autoMoveDone: e.target.checked });
            }}
          />
        </div>

        {/* Activity Log */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <History className="h-3.5 w-3.5" />
              Riwayat Aktivitas Kartu
            </span>
            <span className="text-[11px] text-muted font-mono">{activities.length} catatan</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border/70 bg-bar/60 p-2 text-[11px]"
              >
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold text-project-accent">{act.userName}:</span>
                  <span className="text-text">{act.action}</span>
                </div>
                <span className="text-[10px] text-muted whitespace-nowrap font-mono">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Switcher Toolbar Buttons
  const renderModeSwitcher = () => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setOpenMode('drawer')}
        className={cn(
          'p-1.5 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
          openMode === 'drawer' && 'bg-hover text-project-accent font-semibold'
        )}
        title="Mode Side Peek Drawer"
      >
        <Layout className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setOpenMode('modal')}
        className={cn(
          'p-1.5 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
          openMode === 'modal' && 'bg-hover text-project-accent font-semibold'
        )}
        title="Mode Center Modal"
      >
        <Square className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setOpenMode('fullpage')}
        className={cn(
          'p-1.5 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
          openMode === 'fullpage' && 'bg-hover text-project-accent font-semibold'
        )}
        title="Mode Halaman Penuh"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
      <Separator orientation="vertical" className="h-4 mx-1" />
      <button
        type="button"
        onClick={() => {
          if (confirm(`Hapus kartu "${card.title}"?`)) {
            onDelete(card.id);
            onClose();
          }
        }}
        className="p-1.5 rounded-md text-danger hover:bg-status-urgent-bg transition-colors cursor-pointer"
        title="Hapus Kartu Ini"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  // Mode 1: Side Peek Drawer
  if (openMode === 'drawer') {
    return (
      <Drawer
        isOpen={true}
        onClose={onClose}
        title={formattedCode}
        subtitle={title}
        currentMode="drawer"
        onChangeMode={(m) => setOpenMode(m)}
        footer={
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Perubahan tersimpan otomatis</span>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Selesai
            </Button>
          </div>
        }
      >
        {renderDetailContent()}
      </Drawer>
    );
  }

  // Mode 2: Center Modal
  if (openMode === 'modal') {
    return (
      <Dialog
        isOpen={true}
        onClose={onClose}
        maxWidth="2xl"
        title={
          <div className="flex items-center justify-between w-full pr-6">
            <span className="font-mono text-xs font-semibold text-project-accent bg-project-soft px-2 py-0.5 rounded-md">
              {formattedCode}
            </span>
            {renderModeSwitcher()}
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted">Tersinkronisasi secara realtime</span>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Tutup
            </Button>
          </div>
        }
      >
        {renderDetailContent()}
      </Dialog>
    );
  }

  // Mode 3: Full Page View
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-bg animate-in fade-in duration-200"
    >
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bar/95 backdrop-blur-md px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            ← Kembali ke Papan
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="font-mono text-xs font-semibold text-project-accent bg-project-soft px-2 py-0.5 rounded-md">
            {formattedCode}
          </span>
          <span className="text-sm font-semibold text-text truncate max-w-md">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {renderModeSwitcher()}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-8">{renderDetailContent()}</div>
    </div>
  );
};
