import React, { useState } from 'react';
import { CardTag } from '../../types/board';
import { TAG_COLORS } from '../../lib/constants';
import { Plus, X } from '@phosphor-icons/react';

export interface TagPickerProps {
  selectedTags: CardTag[];
  allTags: CardTag[];
  onToggleTag: (tag: CardTag) => void;
  onCreateTag: (name: string, color: string) => void;
  onDeleteTag?: (tagId: string) => void;
  readOnly?: boolean;
}

const PRESET_COLORS = ['purple', 'blue', 'green', 'amber', 'rose', 'neutral'];

export const TagPicker: React.FC<TagPickerProps> = ({
  selectedTags,
  allTags,
  onToggleTag,
  onCreateTag,
  onDeleteTag,
  readOnly = false
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('purple');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    onCreateTag(newTagName.trim(), newTagColor);
    setNewTagName('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {allTags.map((tag) => {
          const isSelected = selectedTags.some((t) => t.id === tag.id);
          const style = TAG_COLORS[tag.color] || TAG_COLORS.neutral;
          return (
            <div
              key={tag.id}
              className={`group/tag inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                style.bg
              } ${style.text} ${
                isSelected
                  ? 'ring-2 ring-purple-500 shadow-2xs font-semibold'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <button
                type="button"
                disabled={readOnly}
                onClick={() => onToggleTag(tag)}
                className="inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                <span>{tag.name}</span>
              </button>
              {!readOnly && onDeleteTag && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTag(tag.id);
                  }}
                  title={`Hapus tag "${tag.name}"`}
                  className="ml-0.5 rounded p-0.5 opacity-0 group-hover/tag:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-appflowy-border px-2 py-0.5 text-xs text-appflowy-muted hover:border-purple-400 hover:text-purple-600 dark:border-appflowy-darkBorder dark:hover:border-purple-500 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Tag Baru</span>
          </button>
        )}
      </div>

      {isCreating && !readOnly && (
        <form
          onSubmit={handleCreate}
          className="flex items-center gap-2 rounded-xl border border-appflowy-border bg-neutral-50/70 p-2 dark:border-appflowy-darkBorder dark:bg-neutral-900/40"
        >
          <input
            type="text"
            autoFocus
            placeholder="Nama tag..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 rounded-lg border border-appflowy-border bg-appflowy-bg px-2.5 py-1 text-xs text-appflowy-text focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
          />
          <div className="flex items-center gap-1">
            {PRESET_COLORS.map((c) => {
              const style = TAG_COLORS[c] || TAG_COLORS.neutral;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTagColor(c)}
                  className={`h-4 w-4 rounded-full ${style.dot} transition-transform ${
                    newTagColor === c ? 'scale-125 ring-2 ring-purple-400 ring-offset-1' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              );
            })}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 cursor-pointer"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="text-appflowy-muted hover:text-appflowy-text cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};