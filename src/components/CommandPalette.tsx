import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { MagnifyingGlass, Moon, Sun, Desktop, Stack, SidebarSimple, FileText, CheckCircle } from '@phosphor-icons/react';
import { Kbd } from './ui/Kbd';
import { cn } from '../lib/cn';
import { usePreferences } from '../context/PreferencesContext';
import { AppTheme, AppDensity } from '../types/preferences';
import { Board, NotionPage } from '../types/board';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: string) => void;
  onQuickCreateTask?: () => void;
  onOpenPreferences?: () => void;
  boards?: Board[];
  pages?: NotionPage[];
  onNavigateToCard?: (boardId: string, cardId: string) => void;
  onNavigateToBoard?: (boardId: string) => void;
  onNavigateToPage?: (pageId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  onQuickCreateTask,
  onOpenPreferences,
  boards,
  pages,
  onNavigateToCard,
  onNavigateToBoard,
  onNavigateToPage
}) => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { preferences, updatePreferences } = usePreferences();

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const actions = useMemo(
    () => [
      {
        id: 'create-task',
        label: 'Buat Tugas Baru',
        shortcut: 'C',
        icon: <CheckCircle className="h-4 w-4 text-project-accent" />,
        run: () => {
          onQuickCreateTask?.();
          onClose();
        }
      },
      {
        id: 'view-board',
        label: 'Buka Papan Kanban',
        shortcut: '1',
        icon: <Stack className="h-4 w-4 text-muted" />,
        run: () => {
          onNavigateView?.('board');
          onClose();
        }
      },
      {
        id: 'view-table',
        label: 'Buka Database Spreadsheet',
        shortcut: '2',
        icon: <SidebarSimple className="h-4 w-4 text-muted" />,
        run: () => {
          onNavigateView?.('table');
          onClose();
        }
      },
      {
        id: 'view-calendar',
        label: 'Buka Kalender',
        shortcut: '3',
        icon: <FileText className="h-4 w-4 text-muted" />,
        run: () => {
          onNavigateView?.('calendar');
          onClose();
        }
      },
      {
        id: 'theme-light',
        label: 'Ganti Tema: Terang',
        icon: <Sun className="h-4 w-4 text-amber-500" />,
        run: () => {
          updatePreferences({ theme: 'light' as AppTheme });
          onClose();
        }
      },
      {
        id: 'theme-dark',
        label: 'Ganti Tema: Gelap',
        icon: <Moon className="h-4 w-4 text-project-accent" />,
        run: () => {
          updatePreferences({ theme: 'dark' as AppTheme });
          onClose();
        }
      },
      {
        id: 'theme-system',
        label: 'Ganti Tema: Ikuti Sistem',
        icon: <Desktop className="h-4 w-4 text-muted" />,
        run: () => {
          updatePreferences({ theme: 'system' as AppTheme });
          onClose();
        }
      },
      {
        id: 'density-compact',
        label: preferences.density === 'compact' ? 'Kepadatan: Kembali ke Comfortable' : 'Kepadatan: Ubah ke Compact',
        icon: <SidebarSimple className="h-4 w-4 text-muted" />,
        run: () => {
          updatePreferences({
            density: (preferences.density === 'compact' ? 'comfortable' : 'compact') as AppDensity
          });
          onClose();
        }
      },
      {
        id: 'open-prefs',
        label: 'Buka Pengaturan Preferensi',
        icon: <Desktop className="h-4 w-4 text-muted" />,
        run: () => {
          onOpenPreferences?.();
          onClose();
        }
      }
    ],
    [onQuickCreateTask, onNavigateView, onOpenPreferences, onClose, updatePreferences, preferences.density]
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase();
    return q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
  }, [actions, deferredQuery]);

  const searchResults = useMemo(() => {
    const results: Array<{
      id: string;
      label: string;
      subtitle: string;
      type: 'card' | 'board' | 'page';
      boardId?: string;
      itemId: string;
    }> = [];

    const trimmed = deferredQuery.trim().toLowerCase();
    if (!trimmed || (!boards && !pages)) return results;

    for (const b of boards || []) {
      if (results.length >= 8) break;
      if (b.title.toLowerCase().includes(trimmed)) {
        results.push({
          id: `board-${b.id}`,
          label: b.title,
          subtitle: 'Papan Kanban',
          type: 'board',
          itemId: b.id
        });
      }
      for (const card of Object.values(b.cards || {})) {
        if (results.length >= 8) break;
        if (card.title.toLowerCase().includes(trimmed)) {
          results.push({
            id: `card-${card.id}`,
            label: card.title,
            subtitle: `Kartu di ${b.title}`,
            type: 'card',
            boardId: b.id,
            itemId: card.id
          });
        }
      }
    }
    for (const p of pages || []) {
      if (results.length >= 8) break;
      if ((p.title || 'Untitled').toLowerCase().includes(trimmed)) {
        results.push({
          id: `page-${p.id}`,
          label: p.title || 'Untitled Document',
          subtitle: 'Dokumen',
          type: 'page',
          itemId: p.id
        });
      }
    }
    return results;
  }, [deferredQuery, boards, pages]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/35 dark:bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-card-drag animate-in fade-in duration-75 motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-bar">
          <MagnifyingGlass className="h-4 w-4 text-muted shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Ketik perintah atau cari tindakan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-text placeholder:text-muted focus:outline-none font-sans"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 && searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              Tidak ada perintah atau item yang cocok.
            </div>
          ) : (
            <>
              {filtered.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.run}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-text transition-colors cursor-pointer',
                    'hover:bg-hover hover:text-text text-left'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {action.icon}
                    <span className="font-medium">{action.label}</span>
                  </div>
                  {action.shortcut && <Kbd>{action.shortcut}</Kbd>}
                </button>
              ))}

              {searchResults.length > 0 && (
                <div className="border-t border-border/50 pt-1.5 mt-1.5 space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Hasil Pencarian ({searchResults.length})
                  </div>
                  {searchResults.slice(0, 8).map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => {
                        if (result.type === 'card' && result.boardId) {
                          onNavigateToCard?.(result.boardId, result.itemId);
                        } else if (result.type === 'board') {
                          onNavigateToBoard?.(result.itemId);
                        } else if (result.type === 'page') {
                          onNavigateToPage?.(result.itemId);
                        }
                        onClose();
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-text hover:bg-hover transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {result.type === 'card' ? (
                          <CheckCircle className="h-3.5 w-3.5 text-project-solid shrink-0" />
                        ) : result.type === 'board' ? (
                          <Stack className="h-3.5 w-3.5 text-muted shrink-0" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 text-muted shrink-0" />
                        )}
                        <span className="font-medium truncate">{result.label}</span>
                      </div>
                      <span className="text-[10px] text-muted shrink-0 ml-2">{result.subtitle}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border px-4 py-2 bg-bar flex items-center justify-between text-[11px] text-muted font-mono">
          <span>Gunakan panah untuk navigasi</span>
          <span>Yuumotion Command Palette</span>
        </div>
      </div>
    </div>
  );
};
