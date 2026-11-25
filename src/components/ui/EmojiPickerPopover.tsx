import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MagnifyingGlass, Spinner, X } from '@phosphor-icons/react';
import { cn } from '../../lib/cn';
import { EmojiEntry, FALLBACK_EMOJIS, fetchEmojiList } from '../../lib/emojiApi';

interface EmojiPickerPopoverProps {
  isOpen: boolean;
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'smileys', label: 'Ekspresi' },
  { id: 'animals', label: 'Alam' },
  { id: 'activities', label: 'Aktivitas' },
  { id: 'objects', label: 'Objek' },
  { id: 'travel', label: 'Tempat' }
];

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
  isOpen,
  selectedEmoji,
  onSelect,
  onClose
}) => {
  const [emojis, setEmojis] = useState<EmojiEntry[]>(FALLBACK_EMOJIS);
  const [isLoading, setIsLoading] = useState(false);
  const [isFromApi, setIsFromApi] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setIsLoading(true);
    fetchEmojiList().then((res) => {
      if (!active) return;
      setEmojis(res.emojis);
      setIsFromApi(res.fromApi);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return emojis
      .filter((item) => {
        if (category !== 'all' && !item.category.includes(category)) return false;
        if (q && !item.name.includes(q) && !item.emoji.includes(q)) return false;
        return true;
      })
      .slice(0, 240);
  }, [emojis, search, category]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-full z-50 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-surface p-3 shadow-popover ring-1 ring-black/5 dark:ring-white/10"
    >
      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted">
        <span className="flex items-center gap-1.5">
          <span>Semua Emoji</span>
          {isLoading ? (
            <Spinner className="h-3 w-3 animate-spin text-project-solid" />
          ) : (
            <span className="rounded bg-bar px-1.5 py-0.5 font-mono text-[9px] text-muted">
              {isFromApi ? `${emojis.length}+` : `${emojis.length}`}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded text-muted hover:bg-hover hover:text-text cursor-pointer"
          aria-label="Tutup pemilih emoji"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative mb-2">
        <MagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari emoji (misal: rocket, cat, fire)..."
          className="h-8 w-full rounded-lg border border-border bg-bg pl-8 pr-2.5 text-xs text-text placeholder:text-muted focus:border-project-accent focus:outline-none"
        />
      </div>

      <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={cn(
              'rounded-lg px-2 py-1 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer',
              category === tab.id
                ? 'bg-project-soft text-project-solid font-semibold'
                : 'text-muted hover:bg-hover hover:text-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <div className="col-span-8 py-6 text-center text-xs text-muted">
            Emoji tidak ditemukan.
          </div>
        ) : (
          filtered.map((item) => (
            <button
              key={`${item.emoji}-${item.name}`}
              type="button"
              title={item.name}
              onClick={() => {
                onSelect(item.emoji);
                onClose();
              }}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-base transition-transform hover:scale-110 cursor-pointer',
                selectedEmoji === item.emoji ? 'bg-project-soft ring-1 ring-project-accent' : 'hover:bg-hover'
              )}
            >
              {item.emoji}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
