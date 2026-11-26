import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { SlashCategory, SlashCommandItem } from './docSlashCommands';

interface DocSlashMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  slashQuery: string;
  activeCategory: SlashCategory;
  onSelectCategory: (cat: SlashCategory) => void;
  commands: SlashCommandItem[];
  selectedIndex: number;
  onSelectCommand: (cmd: SlashCommandItem) => void;
}

const CATEGORIES: SlashCategory[] = ['Semua', 'Dasar', 'Struktur', 'Developer', 'Embed'];

export const DocSlashMenu: React.FC<DocSlashMenuProps> = ({
  isOpen,
  position,
  slashQuery,
  activeCategory,
  onSelectCategory,
  commands,
  selectedIndex,
  onSelectCommand
}) => {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const el = itemRefs.current[selectedIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999
      }}
      className="w-80 rounded-2xl border border-border bg-surface shadow-card-drag animate-yuu-crossfade overflow-hidden"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bar/70">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Sisipkan Blok
        </span>
        <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-project-solid border border-border/70">
          /{slashQuery}
        </span>
      </div>

      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/70 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer',
              activeCategory === cat
                ? 'bg-project-soft text-project-solid'
                : 'text-muted hover:text-text hover:bg-hover'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
        {commands.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted">
            Tidak ada blok yang cocok untuk &ldquo;/{slashQuery}&rdquo;
          </div>
        ) : (
          commands.map((cmd, idx) => {
            const active = idx === selectedIndex;
            return (
              <button
                key={cmd.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => onSelectCommand(cmd)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors cursor-pointer',
                  active
                    ? 'bg-project-soft text-project-solid'
                    : 'text-text hover:bg-hover'
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg border shrink-0',
                    active
                      ? 'border-project-accent/40 bg-surface text-project-solid'
                      : 'border-border bg-bar text-muted'
                  )}
                >
                  {cmd.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold leading-tight truncate">{cmd.title}</div>
                  <div className="text-[10px] text-muted truncate mt-0.5">{cmd.description}</div>
                </div>
                {cmd.shortcut && (
                  <span className="rounded bg-bar px-1.5 py-0.5 font-mono text-[9px] text-muted border border-border/70 shrink-0">
                    {cmd.shortcut}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );
};
