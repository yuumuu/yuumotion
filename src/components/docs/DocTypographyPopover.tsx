import React, { useState, useRef, useEffect } from 'react';
import { TextAa } from '@phosphor-icons/react';
import { Button } from '../ui';
import { cn } from '../../lib/cn';
import { usePreferences } from '../../context/PreferencesContext';
import { DocFontFamily, DocFontSize, DocPageWidth } from '../../types/preferences';

export const DocTypographyPopover: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  const docFont = preferences.docFont || 'sans';
  const docFontSize = preferences.docFontSize || 'md';
  const docPageWidth = preferences.docPageWidth || 'standard';

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant={open ? 'secondary' : 'ghost'}
        size="xs"
        onClick={() => setOpen((v) => !v)}
        leftIcon={<TextAa className="h-3.5 w-3.5" />}
        title="Pengaturan Tipografi Dokumen"
      >
        <span className="hidden sm:inline">Tipografi</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-64 rounded-2xl border border-border bg-surface p-3.5 shadow-card-hover space-y-3.5 animate-yuu-crossfade">
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Gaya Font
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'sans', label: 'Sans', sample: 'Ag', cls: 'font-sans' },
                  { id: 'serif', label: 'Serif', sample: 'Ag', cls: 'font-serif' },
                  { id: 'mono', label: 'Mono', sample: 'Ag', cls: 'font-mono' }
                ] as { id: DocFontFamily; label: string; sample: string; cls: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updatePreferences({ docFont: f.id })}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-xl border py-2 text-xs transition-colors cursor-pointer',
                    docFont === f.id
                      ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
                      : 'border-border bg-bg text-text hover:bg-hover'
                  )}
                >
                  <span className={cn('text-sm font-bold', f.cls)}>{f.sample}</span>
                  <span className="text-[10px]">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Ukuran Teks
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'sm', label: 'Kecil' },
                  { id: 'md', label: 'Sedang' },
                  { id: 'lg', label: 'Besar' }
                ] as { id: DocFontSize; label: string }[]
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updatePreferences({ docFontSize: s.id })}
                  className={cn(
                    'rounded-lg border py-1.5 text-[11px] font-medium transition-colors cursor-pointer',
                    docFontSize === s.id
                      ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
                      : 'border-border bg-bg text-text hover:bg-hover'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Lebar Halaman
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'standard', label: 'Standar' },
                  { id: 'wide', label: 'Lebar Penuh' }
                ] as { id: DocPageWidth; label: string }[]
              ).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => updatePreferences({ docPageWidth: w.id })}
                  className={cn(
                    'rounded-lg border py-1.5 text-[11px] font-medium transition-colors cursor-pointer',
                    docPageWidth === w.id
                      ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
                      : 'border-border bg-bg text-text hover:bg-hover'
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
