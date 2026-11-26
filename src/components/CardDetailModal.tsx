import React, { useState, useRef } from 'react';
import { Card, Column, PriorityLevel, CardTag, CardAttachment, CardActivity, WorkspaceMember, ChecklistItem } from '../types/board';
import { INITIAL_TAGS } from '../lib/constants';
import { TipTapEditor } from './TipTapEditor';
import { CardChecklistSection } from './card/CardChecklistSection';
import { CardAutomationSection } from './card/CardAutomationSection';
import { CardActivitySection } from './card/CardActivitySection';
import {
  CustomSelect,
  CustomDatePicker,
  Button,
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
  FileText,
  Paperclip,
  Image,
  ArrowsOut,
  Square,
  SidebarSimple,
  ArrowLeftIcon,
  Users
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
  onConvertChecklistToCard?: (sourceCardId: string, item: ChecklistItem) => void;
  onMentionUser?: (member: WorkspaceMember, card: Card, commentText: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columns,
  allCards = [],
  members,
  onClose,
  onUpdate,
  onDelete,
  onConvertChecklistToCard,
  onMentionUser
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
  const [attachments, setAttachments] = useState<CardAttachment[]>(card.attachments || []);
  const [autoMoveDone, setAutoMoveDone] = useState<boolean>(card.autoMoveDone ?? true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
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

  const addActivity = (action: string, extraPartial?: Partial<Card>) => {
    const newAct: CardActivity = {
      id: `act-${Date.now()}`,
      userName: 'Anda',
      action,
      timestamp: Date.now()
    };
    const nextActivities = [newAct, ...activities];
    setActivities(nextActivities);
    syncChanges({ ...extraPartial, activities: nextActivities });
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
        addActivity(`Mengunggah lampiran "${file.name}"`, { attachments: nextAttachments });
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
      addActivity('Memperbarui cover gambar kartu', { coverImage: url });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Render Inner Content
  const renderDetailContent = () => (
    <div className="space-y-6">
      {/* Cover Image Banner */}
      {coverImage && (
        <div className="group/cover overflow-hidden relative w-full h-44 rounded-xl border border-border bg-bar">
          <img src={coverImage} alt="Card Cover" className="object-cover w-full h-full" />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="flex h-7 items-center gap-1 rounded-lg bg-black/65 px-2.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-black/85 cursor-pointer"
            >
              <Image className="h-3.5 w-3.5" />
              <span>Ganti</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCoverImage('');
                addActivity('Menghapus cover gambar kartu', { coverImage: undefined });
              }}
              className="flex h-7 items-center gap-1 rounded-lg bg-black/65 px-2.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-danger cursor-pointer"
            >
              <Trash className="h-3.5 w-3.5" />
              <span>Hapus</span>
            </button>
          </div>
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

      {/* Assignees Section (@mention / combobox) */}
      {members && members.length > 0 && (
        <div className="relative">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5" />
            Ditugaskan Ke
          </label>

          {(card.assignees || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(card.assignees || []).map((memberId) => {
                const m = members.find((x) => x.id === memberId);
                if (!m) return null;
                return (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-project-ring bg-project-soft px-2.5 py-1 text-xs font-semibold text-project-solid"
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
                      style={{ backgroundColor: m.color || '#6366F1' }}
                    >
                      {m.avatar || m.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span>{m.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = (card.assignees || []).filter((id) => id !== m.id);
                        syncChanges({ assignees: next });
                        addActivity(`Melepas tugas dari ${m.name}`);
                      }}
                      className="ml-0.5 rounded-full hover:text-danger cursor-pointer"
                      title={`Hapus ${m.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <input
            type="text"
            value={assigneeQuery}
            onFocus={() => setShowAssigneeMenu(true)}
            onBlur={() => setTimeout(() => setShowAssigneeMenu(false), 150)}
            onChange={(e) => {
              setAssigneeQuery(e.target.value);
              setShowAssigneeMenu(true);
            }}
            placeholder="Ketik @ atau cari nama anggota..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-project-accent focus:outline-none"
          />

          {showAssigneeMenu && (
            <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-popover">
              {members
                .filter((m) => {
                  const q = assigneeQuery.replace(/^@/, '').trim().toLowerCase();
                  const already = (card.assignees || []).includes(m.id);
                  return !already && (!q || m.name.toLowerCase().includes(q));
                })
                .map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const next = [...(card.assignees || []), m.id];
                      syncChanges({ assignees: next });
                      addActivity(`Menugaskan ke ${m.name}`);
                      setAssigneeQuery('');
                      setShowAssigneeMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer text-left"
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: m.color || '#6366F1' }}
                    >
                      {m.avatar || m.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-medium truncate">{m.name}</span>
                    <span className="ml-auto text-[10px] text-muted uppercase">{m.role}</span>
                  </button>
                ))}
              {members.filter((m) => {
                const q = assigneeQuery.replace(/^@/, '').trim().toLowerCase();
                return !(card.assignees || []).includes(m.id) && (!q || m.name.toLowerCase().includes(q));
              }).length === 0 && (
                <div className="px-2.5 py-2 text-[11px] text-muted text-center">
                  Tidak ada anggota yang cocok.
                </div>
              )}
            </div>
          )}
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

      <CardChecklistSection
        card={card}
        columns={columns}
        columnId={columnId}
        setColumnId={setColumnId}
        autoMoveDone={autoMoveDone}
        members={members}
        syncChanges={syncChanges}
        addActivity={addActivity}
        onConvertChecklistToCard={onConvertChecklistToCard}
      />

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

      <div className="pt-2 space-y-4">
        <CardAutomationSection
          card={card}
          allCards={allCards}
          autoMoveDone={autoMoveDone}
          setAutoMoveDone={setAutoMoveDone}
          syncChanges={syncChanges}
          addActivity={addActivity}
        />

        <CardActivitySection
          card={card}
          activities={activities}
          members={members}
          addActivity={addActivity}
          onMentionUser={onMentionUser}
        />
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

  // Unified Header Actions (Cover, Delete, Mode Switcher)
  const renderCardHeaderActions = (includeModeSwitcher: boolean) => (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => coverInputRef.current?.click()}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
        title={coverImage ? 'Ganti Cover Kartu' : 'Tambah Cover Kartu'}
      >
        <Image className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{coverImage ? 'Cover' : '+ Cover'}</span>
      </button>
      <button
        type="button"
        onClick={() => setConfirmDeleteOpen(true)}
        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-status-urgent-bg transition-colors cursor-pointer"
        title="Hapus Kartu Ini"
      >
        <Trash className="w-3.5 h-3.5" />
      </button>
      {includeModeSwitcher && (
        <>
          <Separator orientation="vertical" className="mx-0.5 h-4" />
          <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setOpenMode('drawer')}
              className={cn(
                'p-1 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
                openMode === 'drawer' && 'bg-hover text-project-accent font-semibold'
              )}
              title="Mode Side Peek Drawer"
            >
              <SidebarSimple className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOpenMode('modal')}
              className={cn(
                'p-1 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
                openMode === 'modal' && 'bg-hover text-project-accent font-semibold'
              )}
              title="Mode Center Modal"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOpenMode('fullpage')}
              className={cn(
                'p-1 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
                openMode === 'fullpage' && 'bg-hover text-project-accent font-semibold'
              )}
              title="Mode Halaman Penuh"
            >
              <ArrowsOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
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
        headerExtra={renderCardHeaderActions(false)}
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
            {renderCardHeaderActions(true)}
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
          {renderCardHeaderActions(true)}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>

      <div className="px-8 py-8 mx-auto max-w-4xl">{renderDetailContent()}</div>
    </div>
  );
};
