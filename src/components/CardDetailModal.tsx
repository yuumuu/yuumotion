import React, { useState, useRef } from 'react';
import { Card, Column, PriorityLevel, CardTag, CardAttachment, CardActivity, WorkspaceMember } from '../types/board';
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
  Dialog,
  ConfirmDialog
} from './ui';
import {
  X,
  Trash,
  Tag,
  CheckSquare,
  FileText,
  Plus,
  Paperclip,
  Image,
  ClockCounterClockwise,
  ArrowsOut,
  Square,
  SidebarSimple,
  ArrowLeftIcon,
  Users,
  Lock,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { usePreferences } from '../context/PreferencesContext';
import { CardOpenMode } from '../types/preferences';
import { cn } from '../lib/cn';

interface CardDetailModalProps {
  card: Card;
  columns: Column[];
  allCards?: Card[];
  members?: WorkspaceMember[];
  onClose: () => void;
  onUpdate: (updated: Card) => void;
  onDelete: (cardId: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columns,
  allCards = [],
  members,
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
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
        setAttachments((prev) => {
          const nextAttachments = [...prev, newAttachment];
          syncChanges({ attachments: nextAttachments });
          return nextAttachments;
        });
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
      {/* Quick Cover & Action Toolbar di Bagian Atas */}
      <div className="flex flex-wrap items-center justify-between gap-2 -mt-1">
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="ghost"
            leftIcon={<Image className="w-3.5 h-3.5" />}
            onClick={() => coverInputRef.current?.click()}
          >
            {coverImage ? 'Ganti Cover' : 'Tambah Cover'}
          </Button>
          {coverImage && (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<Trash className="w-3.5 h-3.5 text-danger" />}
              onClick={() => {
                setCoverImage('');
                syncChanges({ coverImage: undefined });
                addActivity('Menghapus cover gambar kartu');
              }}
            >
              Hapus Cover
            </Button>
          )}
        </div>
        <Button
          size="xs"
          variant="ghost"
          className="text-danger hover:bg-status-urgent-bg"
          leftIcon={<Trash className="w-3.5 h-3.5" />}
          onClick={() => setConfirmDeleteOpen(true)}
        >
          Hapus Kartu
        </Button>
      </div>

      {/* Cover Image Banner */}
      {coverImage && (
        <div className="overflow-hidden relative w-full h-44 rounded-xl border border-border bg-bar">
          <img src={coverImage} alt="Card Cover" className="object-cover w-full h-full" />
        </div>
      )}

      {/* Title & Metadata Topbar */}
      <div>
        <div className="flex gap-2 items-center mb-2">
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
          className="w-full bg-transparent font-display text-xl sm:text-2xl font-bold tracking-tight text-text placeholder:text-muted rounded-xl px-1.5 py-1 transition-colors focus:outline-none"
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
          onDeleteTag={(tagId: string) => {
            const deleted = allAvailableTags.find((t) => t.id === tagId);
            setAllAvailableTags((prev) => prev.filter((t) => t.id !== tagId));
            const next = tags.filter((t) => t.id !== tagId);
            setTags(next);
            syncChanges({ tags: next });
            if (deleted) addActivity(`Menghapus tag "${deleted.name}" dari daftar`);
          }}
        />
      </div>

      {/* Assignees Section */}
      {members && members.length > 0 && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5" />
            Ditugaskan Ke
          </label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const isAssigned = (card.assignees || []).includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const current = card.assignees || [];
                    const next = isAssigned ? current.filter((id) => id !== m.id) : [...current, m.id];
                    syncChanges({ assignees: next });
                    addActivity(isAssigned ? `Melepas tugas dari ${m.name}` : `Menugaskan ke ${m.name}`);
                  }}
                  title={m.name}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-all cursor-pointer',
                    isAssigned
                      ? 'border-project-accent bg-project-soft text-project-solid font-semibold shadow-2xs'
                      : 'border-border bg-surface text-muted hover:text-text hover:bg-hover'
                  )}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: m.color || '#6366F1' }}
                  >
                    {m.avatar || m.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" />
            Checklist Tugas
          </label>
          <span className="font-mono text-xs text-muted">
            {card.checklist.filter((i) => i.completed).length}/{card.checklist.length} Selesai
          </span>
        </div>

        <div className="space-y-1.5 mb-3">
          {card.checklist.map((item) => (
            <div
              key={item.id}
              className="flex gap-2 justify-between items-center p-2 text-xs rounded-lg border border-border bg-surface"
            >
              <label className="flex flex-1 gap-2 items-center min-w-0 cursor-pointer">
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
                className="p-1 rounded text-muted hover:text-danger"
              >
                <X className="w-3 h-3" />
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
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5" />
            Lampiran Dokumen & Gambar
          </label>
          <div className="flex gap-2 items-center">
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<Paperclip className="w-3 h-3" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Unggah File / Gambar
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
          <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
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

      {/* Automasi, Dependensi & Pengulangan */}
      <div className="pt-2 space-y-4">
        {/* Card Dependencies (Blocking) */}
        <div className="p-3.5 rounded-xl border border-border bg-bar space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-text">
              <Lock className="h-3.5 w-3.5 text-rose-500" />
              Dependensi (Diblokir Oleh)
            </span>
            <span className="text-[11px] font-mono text-muted">
              {(card.blockedBy || []).length} pemblokir
            </span>
          </div>

          {(card.blockedBy || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(card.blockedBy || []).map((blockerId) => {
                const blocker = allCards.find((c) => c.id === blockerId);
                if (!blocker) return null;
                return (
                  <span
                    key={blockerId}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400"
                  >
                    <span className="truncate max-w-[180px]">{blocker.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = (card.blockedBy || []).filter((id) => id !== blockerId);
                        syncChanges({ blockedBy: next });
                        addActivity(`Menghapus pemblokir "${blocker.title}"`);
                      }}
                      className="hover:text-text cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {allCards.filter((c) => c.id !== card.id && !(card.blockedBy || []).includes(c.id)).length > 0 && (
            <CustomSelect
              value=""
              placeholder="Tambah kartu pemblokir..."
              onChange={(blockerId) => {
                if (!blockerId) return;
                const next = [...(card.blockedBy || []), blockerId];
                syncChanges({ blockedBy: next });
                const blocker = allCards.find((c) => c.id === blockerId);
                if (blocker) addActivity(`Menandai diblokir oleh "${blocker.title}"`);
              }}
              options={allCards
                .filter((c) => c.id !== card.id && !(card.blockedBy || []).includes(c.id))
                .map((c) => ({ value: c.id, label: c.title }))}
            />
          )}
        </div>

        {/* Recurring Tasks */}
        <div className="p-3.5 rounded-xl border border-border bg-bar space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-text">
                <ArrowsClockwise className="h-3.5 w-3.5 text-sky-500" />
                Tugas Berulang (Recurring)
              </span>
              <span className="text-[11px] text-muted block">
                Otomatis buat kartu baru di kolom pertama saat dipindah ke Done
              </span>
            </div>
            <Switch
              checked={Boolean(card.recurrence)}
              onChange={(e) => {
                if (e.target.checked) {
                  syncChanges({ recurrence: { frequency: 'weekly', interval: 1 } });
                  addActivity('Mengaktifkan pengulangan mingguan');
                } else {
                  syncChanges({ recurrence: undefined });
                  addActivity('Menonaktifkan pengulangan kartu');
                }
              }}
            />
          </div>

          {card.recurrence && (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <CustomSelect
                value={card.recurrence.frequency}
                onChange={(freq) => {
                  syncChanges({
                    recurrence: {
                      ...card.recurrence!,
                      frequency: freq as 'daily' | 'weekly' | 'monthly'
                    }
                  });
                }}
                options={[
                  { value: 'daily', label: 'Harian' },
                  { value: 'weekly', label: 'Mingguan' },
                  { value: 'monthly', label: 'Bulanan' }
                ]}
              />
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1">
                <span className="text-[11px] text-muted shrink-0">Tiap</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={card.recurrence.interval}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value) || 1);
                    syncChanges({
                      recurrence: { ...card.recurrence!, interval: val }
                    });
                  }}
                  className="w-full bg-transparent text-xs font-mono text-text focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-3 rounded-xl border border-border bg-bar">
          <div>
            <span className="block text-xs font-semibold text-text">Automasi Selesai (Auto-Move)</span>
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
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <ClockCounterClockwise className="h-3.5 w-3.5" />
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

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Hapus Kartu"
        description={`Yakin ingin menghapus kartu "${card.title}"?`}
        variant="danger"
        confirmLabel="Hapus"
        onConfirm={() => {
          onDelete(card.id);
          onClose();
        }}
      />
    </div>
  );

  // Switcher Toolbar Buttons
  const renderModeSwitcher = () => (
    <div className="flex gap-1 items-center">
      <button
        type="button"
        onClick={() => setOpenMode('drawer')}
        className={cn(
          'p-1.5 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
          openMode === 'drawer' && 'bg-hover text-project-accent font-semibold'
        )}
        title="Mode Side Peek Drawer"
      >
        <SidebarSimple className="w-4 h-4" />
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
        <Square className="w-4 h-4" />
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
        <ArrowsOut className="w-4 h-4" />
      </button>
      <Separator orientation="vertical" className="mx-1 h-4" />
      <button
        type="button"
        onClick={() => setConfirmDeleteOpen(true)}
        className="p-1.5 rounded-md text-danger hover:bg-status-urgent-bg transition-colors cursor-pointer"
        title="Hapus Kartu Ini"
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
  );

  // Mode 1: Push & Split-View / Side Peek Drawer
  if (openMode === 'drawer') {
    return (
      <Drawer
        isOpen={true}
        onClose={onClose}
        isSplitView={true}
        title={formattedCode}
        subtitle={title}
        currentMode="drawer"
        onChangeMode={(m) => setOpenMode(m)}
        footer={
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted font-medium">Tersimpan otomatis</span>
            <Button variant="secondary" size="xs" onClick={onClose}>
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
          <div className="flex justify-between items-center pr-6 w-full">
            <span className="font-mono text-xs font-semibold text-project-accent bg-project-soft px-2 py-0.5 rounded-md">
              {formattedCode}
            </span>
            {renderModeSwitcher()}
          </div>
        }
        footer={
          <div className="flex justify-between items-center w-full">
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
      className="overflow-y-auto fixed inset-0 z-50 duration-200 bg-bg animate-in fade-in"
    >
      <div className="flex sticky top-0 z-20 justify-between items-center px-6 h-14 border-b backdrop-blur-md border-border bg-bar/95">
        <div className="flex gap-3 items-center">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeftIcon className="w-4 h-4" />
            Kembali ke Papan
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="font-mono text-xs font-semibold text-project-accent bg-project-soft px-2 py-0.5 rounded-md">
            {formattedCode}
          </span>
          <span className="max-w-md text-sm font-semibold truncate text-text">{title}</span>
        </div>

        <div className="flex gap-2 items-center">
          {renderModeSwitcher()}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>

      <div className="px-8 py-8 mx-auto max-w-4xl">{renderDetailContent()}</div>
    </div>
  );
};
