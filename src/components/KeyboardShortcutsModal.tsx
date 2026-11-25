import React from 'react';
import { Keyboard, Command } from '@phosphor-icons/react';
import { Dialog, Kbd, Button } from './ui';

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
  const categories = ['Navigasi', 'Tampilan', 'Aksi Kartu', 'Editor'] as const;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>Pintasan Keyboard (Shortcuts)</span>
        </div>
      }
      description="Akses cepat tanpa mouse untuk navigasi board dan dokumen"
      maxWidth="lg"
      footer={
        <div className="flex w-full items-center justify-between text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
          <div className="flex items-center gap-1.5">
            <Command className="h-3.5 w-3.5" />
            <span>Tekan <Kbd>?</Kbd> kapan saja untuk membuka</span>
          </div>
          <Button variant="primary" size="xs" onClick={onClose}>
            Mengerti
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pr-1">
        {categories.map((cat) => {
          const items = SHORTCUTS.filter((s) => s.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {cat}
              </h4>
              <div className="rounded-xl border border-appflowy-border/80 bg-neutral-50/50 p-2 dark:border-appflowy-darkBorder/80 dark:bg-neutral-900/40 space-y-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <span className="text-appflowy-text dark:text-appflowy-darkText">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <Kbd key={kIdx}>{k}</Kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
};