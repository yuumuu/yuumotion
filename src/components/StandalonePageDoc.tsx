import React, { useState, useRef } from 'react';
import { NotionPage, UserRole } from '../types/board';
import { canEditContent } from '../lib/auth';
import { TipTapEditor } from './TipTapEditor';
import { ImageIcon, Trash2, Lock, Clock, Sparkles } from 'lucide-react';

interface StandalonePageDocProps {
  page: NotionPage;
  currentUserRole: UserRole;
  onUpdatePage: (updated: NotionPage) => void;
}

const PRESET_ICONS = ['📝', '⚡', '🚀', '🎯', '💡', '📌', '📊', '📚', '🛠️', '✨', '🔥', '🌐'];

const DOC_TEMPLATES = [
  {
    name: 'Meeting Notes',
    icon: '🎙️',
    title: 'Notulensi Rapat Tim',
    html: '<h2>Agenda Rapat</h2><p>Pembahasan progres sprint, sinkronisasi edge wasmer, dan blocker.</p><h3>Peserta</h3><p>Yuu, Engineering Lead, Product Manager</p><h3>Poin Keputusan</h3><ul><li>Arsitektur offline-first diprioritaskan.</li><li>Sinkronisasi multi-user via realtime broadcast.</li></ul><h3>Action Items</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Update schema database MySQL & SQLite</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Testing deploy Wasmer static server</p></div></li></ul>'
  },
  {
    name: 'Product Specs (PRD)',
    icon: '📋',
    title: 'Product Requirement Document',
    html: '<h2>1. Latar Belakang & Problem Statement</h2><p>Pengguna membutuhkan aplikasi manajemen kartu dan dokumen yang cepat tanpa vendor lock-in berbayar.</p><h2>2. Sasaran Pengguna</h2><p>Tim pengembang, kreator, dan manajer proyek independen.</p><h2>3. Spesifikasi Fitur Utama</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"></label><div><p>Multi-view kanban, calendar, gantt, dan database table</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Notion-style slash commands (/)</p></div></li></ul><blockquote><p>Target rilis: Wasmer Edge Production CDN.</p></blockquote>'
  },
  {
    name: 'Sprint Planning',
    icon: '🚀',
    title: 'Sprint Planning Roadmap',
    html: '<h2>Sprint Goal</h2><p>Menyelesaikan fitur aksesibilitas keyboard dan automasi kartu kanban.</p><h3>Daftar Tugas Sprint</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Implementasi auto-move done saat checklist 100%</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Audit WCAG contrast dan keyboard focus indicators</p></div></li></ul>'
  },
  {
    name: 'Habit & Weekly Tracker',
    icon: '🎯',
    title: 'Weekly Focus & Tracker',
    html: '<h2>Fokus Mingguan</h2><p>Fokus pada penyempurnaan UI/UX dan kebersihan kode antislop.</p><h3>Target Harian</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Review performa drag and drop board</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Dokumentasikan panduan shortcut keyboard</p></div></li></ul>'
  }
];

export const StandalonePageDoc: React.FC<StandalonePageDocProps> = ({
  page,
  currentUserRole,
  onUpdatePage
}) => {
  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon || '📄');
  const [coverImage, setCoverImage] = useState(page.coverImage || '');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const canEdit = canEditContent(currentUserRole);

  const syncChanges = (partial: Partial<NotionPage>) => {
    onUpdatePage({
      ...page,
      title,
      icon,
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

  const handleSelectIcon = (newIcon: string) => {
    setIcon(newIcon);
    setShowIconPicker(false);
    syncChanges({ icon: newIcon });
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
    <div className="flex h-full flex-1 flex-col overflow-y-auto bg-appflowy-bg dark:bg-appflowy-darkBg">
      {coverImage && (
        <div className="relative h-48 w-full flex-shrink-0 bg-neutral-100 dark:bg-neutral-900">
          <img src={coverImage} alt="Cover Banner" className="h-full w-full object-cover" />
          {canEdit && (
            <button
              onClick={() => {
                setCoverImage('');
                syncChanges({ coverImage: undefined });
              }}
              className="absolute right-4 top-4 flex h-7 items-center gap-1 rounded-lg bg-black/60 px-2.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-black/80"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove Cover</span>
            </button>
          )}
        </div>
      )}

      <div className="mx-auto w-full max-w-4xl px-8 py-8">
        {!canEdit && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <span>
              You have <strong>Viewer</strong> access to this document. Content is in read-only mode.
            </span>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => canEdit && setShowIconPicker(!showIconPicker)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-2xl shadow-xs hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              title="Change document icon"
            >
              {icon}
            </button>

            {showIconPicker && canEdit && (
              <div className="absolute left-0 top-14 z-50 flex w-56 flex-wrap gap-1.5 rounded-xl border border-appflowy-border bg-appflowy-surface p-2 shadow-xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
                {PRESET_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectIcon(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!coverImage && canEdit && (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-appflowy-muted hover:bg-neutral-100 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
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
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            disabled={!canEdit}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Untitled Document"
            className="w-full bg-transparent text-3xl font-extrabold tracking-tight text-appflowy-text placeholder-neutral-300 focus:outline-none dark:text-appflowy-darkText dark:placeholder-neutral-600"
          />
          <div className="mt-2 flex items-center gap-2 text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
            <Clock className="h-3 w-3" />
            <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {canEdit && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] font-medium text-appflowy-muted dark:text-appflowy-darkMuted mr-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              Template:
            </span>
            {DOC_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => {
                  setTitle(tmpl.title);
                  setIcon(tmpl.icon);
                  syncChanges({ title: tmpl.title, icon: tmpl.icon, contentHtml: tmpl.html });
                }}
                className="flex items-center gap-1 rounded-lg border border-appflowy-border bg-appflowy-surface px-2.5 py-1 text-xs text-appflowy-text hover:border-purple-400 hover:text-purple-600 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText dark:hover:border-purple-500 cursor-pointer"
                title={`Terapkan template ${tmpl.name}`}
              >
                <span>{tmpl.icon}</span>
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="min-h-[400px]">
          <TipTapEditor
            content={page.contentHtml}
            editable={canEdit}
            onChange={(html, json) => {
              syncChanges({ contentHtml: html, contentJson: json });
            }}
          />
        </div>
      </div>
    </div>
  );
};
