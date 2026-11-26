import React from 'react';
import { ListBullets } from '@phosphor-icons/react';
import { cn } from '../../lib/cn';

export interface TocHeadingItem {
  idx: number;
  level: 1 | 2 | 3;
  text: string;
}

interface DocOutlineSidebarProps {
  headings: TocHeadingItem[];
  activeIdx: number | null;
  onSelectHeading: (idx: number) => void;
}

export const DocOutlineSidebar: React.FC<DocOutlineSidebarProps> = ({
  headings,
  activeIdx,
  onSelectHeading
}) => {
  return (
    <aside
      aria-label="Daftar Isi Dokumen"
      className="hidden xl:block sticky top-6 w-60 shrink-0 rounded-2xl border border-border bg-surface/75 p-4 shadow-2xs select-none"
    >
      <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-wider text-muted pb-2.5 mb-2.5 border-b border-border">
        <span className="flex items-center gap-1.5">
          <ListBullets className="h-3.5 w-3.5 text-project-solid" />
          <span>Daftar Isi</span>
        </span>
        {headings.length > 0 && (
          <span className="rounded bg-bar px-1.5 py-0.5 text-[9px]">{headings.length}</span>
        )}
      </div>

      {headings.length === 0 ? (
        <p className="text-[11px] text-muted italic leading-relaxed">
          Tambahkan Heading (H1–H3) untuk membuat navigasi otomatis.
        </p>
      ) : (
        <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
          {headings.map((h) => {
            const isActive = activeIdx === h.idx;
            return (
              <button
                key={`${h.idx}-${h.text}`}
                type="button"
                onClick={() => onSelectHeading(h.idx)}
                className={cn(
                  'flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left text-xs transition-colors cursor-pointer',
                  h.level === 1 && 'pl-2 font-semibold',
                  h.level === 2 && 'pl-4 font-medium',
                  h.level === 3 && 'pl-6 text-[11px]',
                  isActive
                    ? 'bg-project-soft text-project-solid font-semibold'
                    : h.level === 1
                      ? 'text-text hover:bg-hover'
                      : 'text-muted hover:bg-hover hover:text-text'
                )}
                title={h.text}
              >
                <span
                  className={cn(
                    'rounded px-1 py-0.2 font-mono text-[9px] shrink-0',
                    isActive ? 'bg-project-solid text-white' : 'bg-bar text-muted'
                  )}
                >
                  H{h.level}
                </span>
                <span className="truncate">{h.text}</span>
              </button>
            );
          })}
        </nav>
      )}
    </aside>
  );
};
