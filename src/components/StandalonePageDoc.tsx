import React, { useState, useRef, useMemo } from 'react';
import { NotionPage, UserRole } from '../types/board';
import { canEditContent } from '../lib/auth';
import { TipTapEditor } from './TipTapEditor';
import {
  FileText,
  BookOpen,
  Sparkle,
  Stack,
  Compass,
  Code,
  Shield,
  TreeStructure,
  Image,
  Trash,
  Lock,
  Clock,
  ArrowsOut,
  ArrowsIn,
  ListBullets
} from '@phosphor-icons/react';
import { cn } from '../lib/cn';
import { Button } from './ui';

interface StandalonePageDocProps {
  page: NotionPage;
  currentUserRole: UserRole;
  onUpdatePage: (updated: NotionPage) => void;
}

const PRESET_ICONS = [
  { id: 'doc', label: 'Dokumen', icon: <FileText className="h-5 w-5" /> },
  { id: 'book', label: 'Catatan', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'sparkles', label: 'Ide Baru', icon: <Sparkle className="h-5 w-5" /> },
  { id: 'layers', label: 'Spesifikasi', icon: <Stack className="h-5 w-5" /> },
  { id: 'compass', label: 'Roadmap', icon: <Compass className="h-5 w-5" /> },
  { id: 'code', label: 'Teknis', icon: <Code className="h-5 w-5" /> },
  { id: 'shield', label: 'Keamanan', icon: <Shield className="h-5 w-5" /> },
  { id: 'workflow', label: 'Alur Sistem', icon: <TreeStructure className="h-5 w-5" /> }
];

const PRESET_COVERS = [
  { name: 'Lavender Mist', style: 'linear-gradient(135deg, #E0E7FF 0%, #EDE9FE 50%, #F5F3FF 100%)' },
  { name: 'Warm Sunrise', style: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FED7AA 100%)' },
  { name: 'Ocean Breeze', style: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #E0E7FF 100%)' },
  { name: 'Sage Garden', style: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #E0F2FE 100%)' },
  { name: 'Rose Petal', style: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 50%, #FDF2F8 100%)' },
  { name: 'Slate Calm', style: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%)' }
];

const DOC_TEMPLATES = [
  {
    name: 'Meeting Notes',
    title: 'Notulensi Rapat Tim',
    html: '<h2>Agenda Rapat</h2><p>Pembahasan progres sprint, sinkronisasi edge wasmer, dan blocker.</p><h3>Poin Keputusan</h3><ul><li>Arsitektur offline-first diprioritaskan.</li><li>Sinkronisasi multi-user via realtime broadcast.</li></ul>'
  },
  {
    name: 'Product Specs (PRD)',
    title: 'Product Requirement Document',
    html: '<h2>1. Latar Belakang & Problem Statement</h2><p>Pengguna membutuhkan aplikasi manajemen kartu dan dokumen yang cepat tanpa vendor lock-in berbayar.</p><h2>2. Sasaran Pengguna</h2><p>Tim pengembang, kreator, dan manajer proyek independen.</p>'
  },
  {
    name: 'Sprint Roadmap',
    title: 'Sprint Planning Roadmap',
    html: '<h2>Sprint Goal</h2><p>Menyelesaikan fitur aksesibilitas keyboard dan automasi kartu kanban.</p>'
  }
];

export const StandalonePageDoc: React.FC<StandalonePageDocProps> = ({
  page,
  currentUserRole,
  onUpdatePage
}) => {
  const [title, setTitle] = useState(page.title);
  const [coverImage, setCoverImage] = useState(page.coverImage || '');
  const [selectedIconId, setSelectedIconId] = useState(page.icon || 'doc');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  const canEdit = canEditContent(currentUserRole);

  const tocHeadings = useMemo(() => {
    if (!page.contentHtml || typeof DOMParser === 'undefined') return [];
    const doc = new DOMParser().parseFromString(page.contentHtml, 'text/html');
    const nodes = Array.from(doc.querySelectorAll('h1, h2, h3'));
    return nodes
      .map((el, idx) => ({
        idx,
        level: Number(el.tagName.replace('H', '')) as 1 | 2 | 3,
        text: (el.textContent || '').trim()
      }))
      .filter((item) => item.text.length > 0);
  }, [page.contentHtml]);

  const scrollToHeading = (headingIndex: number) => {
    const container = editorWrapperRef.current;
    if (!container) return;
    const targets = container.querySelectorAll('h1, h2, h3');
    const target = targets[headingIndex];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentIconObj = PRESET_ICONS.find((i) => i.id === selectedIconId) || PRESET_ICONS[0];

  const syncChanges = (partial: Partial<NotionPage>) => {
    onUpdatePage({
      ...page,
      title,
      icon: selectedIconId,
      coverImage: coverImage || undefined,
      ...partial,
      updatedAt: Date.now()
    });
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== page.title) {
      syncChanges({ title: title.trim() });
    }
  };

  const handleSelectIcon = (iconId: string) => {
    setSelectedIconId(iconId);
    setShowIconPicker(false);
    syncChanges({ icon: iconId });
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
    <div className="flex h-full flex-1 flex-col overflow-y-auto bg-bg select-text">
      {/* Cover Banner */}
      {coverImage && (
        <div className="relative h-44 w-full flex-shrink-0 bg-bar overflow-hidden border-b border-border">
          {coverImage.startsWith('linear-gradient') || coverImage.startsWith('#') ? (
            <div style={{ background: coverImage }} className="h-full w-full" />
          ) : (
            <img src={coverImage} alt="Cover Banner" className="h-full w-full object-cover" />
          )}
          {canEdit && (
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="flex h-7 items-center gap-1.5 rounded-lg bg-black/60 px-2.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-black/80 cursor-pointer"
              >
                <Image className="h-3.5 w-3.5" />
                <span>Ganti Cover</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCoverImage('');
                  syncChanges({ coverImage: undefined });
                }}
                className="flex h-7 items-center gap-1 rounded-lg bg-black/60 px-2.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-black/80 cursor-pointer"
              >
                <Trash className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas + Sticky Outline TOC Layout */}
      <div className="flex flex-1 items-start justify-center gap-6 px-4 sm:px-8 py-8">
        <div
          className={cn(
            'w-full transition-[max-width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isFullWidth ? 'max-w-none' : 'max-w-[740px]'
          )}
        >
        {/* Role Viewer Lockout Banner */}
        {!canEdit && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-border bg-bar p-3.5 text-xs text-muted">
            <Lock className="h-4 w-4 text-project-accent shrink-0" />
            <span>
              Mode baca saja. Hubungi pemilik project untuk meminta akses edit.
            </span>
          </div>
        )}

        {/* Icon & Cover Action Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => canEdit && setShowIconPicker(!showIconPicker)}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-project-soft text-project-accent shadow-card-rest transition-all',
                canEdit ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
              )}
              title="Ganti Ikon Dokumen"
            >
              {currentIconObj.icon}
            </button>

            {showIconPicker && canEdit && (
              <div className="absolute left-0 top-14 z-50 flex w-64 flex-wrap gap-1.5 rounded-2xl border border-border bg-surface p-2.5 shadow-card-hover animate-in fade-in zoom-in-95 duration-100">
                {PRESET_ICONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectIcon(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:text-project-accent hover:bg-project-soft transition-colors cursor-pointer"
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex items-center gap-1.5">
            {!coverImage && canEdit && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                leftIcon={<Image className="h-3.5 w-3.5" />}
              >
                Pilih Cover
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsFullWidth(!isFullWidth)}
              leftIcon={isFullWidth ? <ArrowsIn className="h-3.5 w-3.5" /> : <ArrowsOut className="h-3.5 w-3.5" />}
              title={isFullWidth ? 'Lebar Standar (740px)' : 'Lebar Penuh'}
            >
              <span className="hidden sm:inline">{isFullWidth ? 'Standar' : 'Lebar Penuh'}</span>
            </Button>

            <Button
              type="button"
              variant={showOutline ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() => setShowOutline(!showOutline)}
              leftIcon={<ListBullets className="h-3.5 w-3.5" />}
              title="Tampilkan / Sembunyikan Daftar Isi"
              className="hidden xl:inline-flex"
            >
              Daftar Isi
            </Button>

            {showCoverPicker && canEdit && (
              <div className="absolute right-0 top-9 z-50 w-72 rounded-2xl border border-border bg-surface p-3 shadow-card-hover animate-in fade-in zoom-in-95 duration-100">
                <div className="mb-2 text-xs font-semibold text-text">
                  Galeri Cover Pastel
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setCoverImage(preset.style);
                        syncChanges({ coverImage: preset.style });
                        setShowCoverPicker(false);
                      }}
                      className="group relative h-12 w-full overflow-hidden rounded-lg border border-border text-left transition-all hover:scale-102 hover:border-project-accent cursor-pointer"
                      style={{ background: preset.style }}
                    >
                      <span className="absolute bottom-1 left-1.5 rounded bg-black/40 px-1 py-0.2 text-[9px] font-medium text-white backdrop-blur-xs">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    coverInputRef.current?.click();
                    setShowCoverPicker(false);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-1.5 text-xs text-muted hover:bg-hover cursor-pointer"
                >
                  <Image className="h-3.5 w-3.5" />
                  <span>Unggah Gambar Kustom</span>
                </button>
              </div>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Document Title Header */}
        <div className="mb-6">
          <input
            type="text"
            disabled={!canEdit}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Untitled Document"
            className="w-full bg-transparent font-display text-[34px] font-bold tracking-tight text-text placeholder:text-muted focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted font-mono">
            <Clock className="h-3 w-3" />
            <span>Diperbarui {new Date(page.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Template Quick Actions */}
        {canEdit && (
          <div className="mb-5 flex flex-wrap items-center gap-1.5 border-b border-border/80 pb-3">
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted mr-1">
              <Sparkle className="h-3 w-3 text-project-accent" />
              Template:
            </span>
            {DOC_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => {
                  setTitle(tmpl.title);
                  syncChanges({ title: tmpl.title, contentHtml: tmpl.html });
                }}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-text hover:border-project-accent hover:text-project-accent transition-colors cursor-pointer"
              >
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* TipTap Rich Editor */}
        <div ref={editorWrapperRef} className="min-h-[400px]">
          <TipTapEditor
            content={page.contentHtml}
            editable={canEdit}
            onChange={(html, json) => {
              syncChanges({ contentHtml: html, contentJson: json });
            }}
          />
        </div>
      </div>

      {/* Sticky Outline Table of Contents Panel */}
      {showOutline && (
        <aside
          aria-label="Daftar Isi Dokumen"
          className="hidden xl:block sticky top-6 w-56 shrink-0 rounded-2xl border border-border bg-surface/70 p-4 shadow-2xs select-none"
        >
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted pb-2.5 mb-2.5 border-b border-border">
            <ListBullets className="h-3.5 w-3.5 text-project-solid" />
            <span>Daftar Isi</span>
          </div>

          {tocHeadings.length === 0 ? (
            <p className="text-[11px] text-muted italic leading-relaxed">
              Tambahkan Heading (H1–H3) untuk membuat navigasi otomatis.
            </p>
          ) : (
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {tocHeadings.map((h) => (
                <button
                  key={`${h.idx}-${h.text}`}
                  type="button"
                  onClick={() => scrollToHeading(h.idx)}
                  className={cn(
                    'block w-full truncate rounded-lg py-1 pr-2 text-left text-xs transition-colors hover:bg-hover hover:text-text cursor-pointer',
                    h.level === 1 && 'pl-2 font-semibold text-text',
                    h.level === 2 && 'pl-4 font-medium text-muted',
                    h.level === 3 && 'pl-6 text-[11px] text-muted'
                  )}
                  title={h.text}
                >
                  {h.text}
                </button>
              ))}
            </nav>
          )}
        </aside>
      )}
      </div>
    </div>
  );
};
