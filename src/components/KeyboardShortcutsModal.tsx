import React, { useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigasi' | 'Tampilan' | 'Aksi Kartu' | 'Editor';
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['/'], description: 'Fokus ke kotak pencarian', category: 'Navigasi' },
  { keys: ['b'], description: 'Beralih ke tampilan Kanban Board', category: 'Tampilan' },
  { keys: ['c'], description: 'Beralih ke tampilan Kalender', category: 'Tampilan' },
  { keys: ['t'], description: 'Beralih ke tampilan Timeline / Gantt', category: 'Tampilan' },
  { keys: ['s'], description: 'Beralih ke tampilan Tabel Database', category: 'Tampilan' },
  { keys: ['Tab', 'Shift + Tab'], description: 'Navigasi antar kartu dan tombol', category: 'Navigasi' },
  { keys: ['Enter', 'Spasi'], description: 'Buka kartu yang sedang disorot', category: 'Aksi Kartu' },
  { keys: ['Esc'], description: 'Tutup modal atau batal input', category: 'Navigasi' },
  { keys: ['/'], description: 'Buka menu perintah slash di dokumen', category: 'Editor' },
  { keys: ['?'], description: 'Buka panduan pintasan keyboard ini', category: 'Navigasi' }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['Navigasi', 'Tampilan', 'Aksi Kartu', 'Editor'] as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <div className="flex items-center justify-between border-b border-appflowy-border pb-3 dark:border-appflowy-darkBorder">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="shortcuts-title"
                className="text-sm font-semibold text-appflowy-text dark:text-appflowy-darkText"
              >
                Pintasan Keyboard (Shortcuts)
              </h2>
              <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                Akses cepat tanpa mouse untuk navigasi board dan dokumen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
            aria-label="Tutup panduan pintasan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const items = SHORTCUTS.filter((s) => s.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="space-y-1.5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {cat}
                </h3>
                <div className="rounded-xl border border-appflowy-border/80 bg-neutral-50/50 p-2 dark:border-appflowy-darkBorder/80 dark:bg-neutral-900/40 space-y-1.5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
                    >
                      <span className="text-appflowy-text dark:text-appflowy-darkText">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="inline-flex min-w-5 items-center justify-center rounded border border-appflowy-border bg-appflowy-bg px-1.5 py-0.5 font-mono text-[10px] font-semibold text-appflowy-text shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-appflowy-border pt-3 text-[11px] text-appflowy-muted dark:border-appflowy-darkBorder dark:text-appflowy-darkMuted">
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>Tekan <kbd className="font-mono font-semibold">?</kbd> kapan saja untuk membuka</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};