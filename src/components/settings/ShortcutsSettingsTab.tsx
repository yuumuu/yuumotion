import React from 'react';
import { Kbd } from '../ui';

const SHORTCUT_LIST = [
  { keys: ['⌘K', '/'], desc: 'Buka Command Palette & Pencarian Cepat', cat: 'Navigasi' },
  { keys: ['['], desc: 'Buka / Tutup Panel Project Explorer', cat: 'Navigasi' },
  { keys: ['?'], desc: 'Tampilkan Daftar Pintasan Keyboard', cat: 'Navigasi' },
  { keys: ['b'], desc: 'Tampilan Kanban Board', cat: 'Tampilan' },
  { keys: ['t'], desc: 'Tampilan Timeline / Gantt', cat: 'Tampilan' },
  { keys: ['c'], desc: 'Tampilan Kalender Bulanan', cat: 'Tampilan' },
  { keys: ['s'], desc: 'Tampilan Tabel Spreadsheet', cat: 'Tampilan' },
  { keys: ['Spasi', '←/→'], desc: 'Angkat & Pindah Kartu Kanban via Keyboard', cat: 'Kartu' }
];

export const ShortcutsSettingsTab: React.FC = () => {
  return (
    <div className="space-y-2.5">
      {SHORTCUT_LIST.map((s) => (
        <div
          key={s.desc}
          className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs"
        >
          <div>
            <span className="font-medium text-text">{s.desc}</span>
            <span className="ml-2 font-mono text-[10px] text-muted">({s.cat})</span>
          </div>
          <div className="flex gap-1 items-center shrink-0">
            {s.keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
