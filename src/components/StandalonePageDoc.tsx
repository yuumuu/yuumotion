import React, { useState, useRef } from 'react';
import { NotionPage, UserRole } from '../types/board';
import { canEditContent } from '../lib/auth';
import { TipTapEditor } from './TipTapEditor';
import { ImageIcon, Trash2, Lock, Clock } from 'lucide-react';

interface StandalonePageDocProps {
  page: NotionPage;
  currentUserRole: UserRole;
  onUpdatePage: (updated: NotionPage) => void;
}

const PRESET_ICONS = ['📝', '⚡', '🚀', '🎯', '💡', '📌', '📊', '📚', '🛠️', '✨', '🔥', '🌐'];

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
