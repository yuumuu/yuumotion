import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import {
  MagnifyingGlass,
  Moon,
  Sun,
  Desktop,
  Stack,
  SidebarSimple,
  FileText,
  CheckCircle,
  Table as TableIcon,
  CalendarBlank,
  Clock,
  Sparkle,
  ShareNetwork,
  Users,
  DownloadSimple,
  House,
  UserCircle,
  SlidersHorizontal,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { Kbd } from './ui/Kbd';
import { toast } from './ui/Toast';
import { cn } from '../lib/cn';
import { usePreferences } from '../context/PreferencesContext';
import { AppTheme, AppDensity } from '../types/preferences';
import { Board, NotionPage } from '../types/board';
import type { SettingsTab } from './SettingsHubModal';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: string) => void;
  onQuickCreateTask?: () => void;
  onQuickCreatePage?: () => void;
  onOpenTemplates?: () => void;
  onToggleSidebar?: () => void;
  onOpenShare?: () => void;
  onOpenMembers?: () => void;
  onExportBackup?: () => void;
  onOpenPreferences?: () => void;
  onOpenSettings?: (tab: SettingsTab) => void;
  onNavigateHome?: () => void;
  boards?: Board[];
  pages?: NotionPage[];
  onNavigateToCard?: (boardId: string, cardId: string) => void;
  onNavigateToBoard?: (boardId: string) => void;
  onNavigateToPage?: (pageId: string) => void;
}

interface PaletteAction {
  id: string;
  category: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  onQuickCreateTask,
  onQuickCreatePage,
  onOpenTemplates,
  onToggleSidebar,
  onOpenShare,
  onOpenMembers,
  onExportBackup,
  onOpenPreferences,
  onOpenSettings,
  onNavigateHome,
  boards,
  pages,
  onNavigateToCard,
  onNavigateToBoard,
  onNavigateToPage
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const { preferences, updatePreferences } = usePreferences();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const actions = useMemo<PaletteAction[]>(
    () => [
      {
        id: 'create-task',
        category: 'Aksi Cepat',
        label: 'Buat Tugas Baru',
        shortcut: 'C',
        icon: <CheckCircle className="h-4 w-4 text-project-solid" />,
        run: () => {
          onQuickCreateTask?.();
          onClose();
        }
      },
      {
        id: 'create-page',
        category: 'Aksi Cepat',
        label: 'Buat Dokumen Baru',
        shortcut: 'N',
        icon: <FileText className="h-4 w-4 text-project-solid" />,
        run: () => {
          onQuickCreatePage?.();
          onClose();
        }
      },
      {
        id: 'open-templates',
        category: 'Aksi Cepat',
        label: 'Buat Papan dari Template',
        icon: <Sparkle className="h-4 w-4 text-amber-500" />,
        run: () => {
          onOpenTemplates?.();
          onClose();
        }
      },
      {
        id: 'toggle-sidebar',
        category: 'Aksi Cepat',
        label: 'Buka / Tutup Sidebar Explorer',
        shortcut: '[',
        icon: <SidebarSimple className="h-4 w-4 text-muted" />,
        run: () => {
          onToggleSidebar?.();
          onClose();
        }
      },
      {
        id: 'view-board',
        category: 'Navigasi',
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
        category: 'Navigasi',
        label: 'Buka Database Spreadsheet',
        shortcut: '2',
        icon: <TableIcon className="h-4 w-4 text-muted" />,
        run: () => {
          onNavigateView?.('table');
          onClose();
        }
      },
      {
        id: 'view-calendar',
        category: 'Navigasi',
        label: 'Buka Kalender Bulanan',
        shortcut: '3',
        icon: <CalendarBlank className="h-4 w-4 text-muted" />,
        run: () => {
          onNavigateView?.('calendar');
          onClose();
        }
      },
      {
        id: 'view-timeline',
        category: 'Navigasi',
        label: 'Buka Timeline Gantt',
        shortcut: '4',
        icon: <Clock className="h-4 w-4 text-muted" />,
        run: () => {
          onNavigateView?.('timeline');
          onClose();
        }
      },
      {
        id: 'open-share',
        category: 'Kolaborasi & Data',
        label: 'Bagikan Papan / Link Tamu',
        icon: <ShareNetwork className="h-4 w-4 text-project-solid" />,
        run: () => {
          onOpenShare?.();
          onClose();
        }
      },
      {
        id: 'open-members',
        category: 'Kolaborasi & Data',
        label: 'Kelola Anggota Tim',
        icon: <Users className="h-4 w-4 text-emerald-500" />,
        run: () => {
          onOpenMembers?.();
          onClose();
        }
      },
      {
        id: 'export-backup',
        category: 'Kolaborasi & Data',
        label: 'Ekspor Backup Workspace (JSON)',
        icon: <DownloadSimple className="h-4 w-4 text-muted" />,
        run: () => {
          onExportBackup?.();
          onClose();
        }
      },
      {
        id: 'open-profile',
        category: 'Pengaturan',
        label: 'Pengaturan Profil & Avatar',
        icon: <UserCircle className="h-4 w-4 text-muted" />,
        run: () => {
          onOpenSettings?.('profile');
          onClose();
        }
      },
      {
        id: 'open-sync',
        category: 'Pengaturan',
        label: 'Pengaturan Sinkronisasi & Cloud',
        icon: <ArrowsClockwise className="h-4 w-4 text-muted" />,
        run: () => {
          onOpenSettings?.('sync');
          onClose();
        }
      },
      {
        id: 'open-prefs',
        category: 'Pengaturan',
        label: 'Buka Pengaturan Tampilan & Preferensi',
        icon: <SlidersHorizontal className="h-4 w-4 text-muted" />,
        run: () => {
          onOpenPreferences?.();
          onClose();
        }
      },
      {
        id: 'theme-light',
        category: 'Tampilan',
        label: 'Ganti Tema: Terang',
        icon: <Sun className="h-4 w-4 text-amber-500" />,
        run: () => {
          updatePreferences({ theme: 'light' as AppTheme });
          onClose();
        }
      },
      {
        id: 'theme-dark',
        category: 'Tampilan',
        label: 'Ganti Tema: Gelap',
        icon: <Moon className="h-4 w-4 text-project-solid" />,
        run: () => {
          updatePreferences({ theme: 'dark' as AppTheme });
          onClose();
        }
      },
      {
        id: 'theme-system',
        category: 'Tampilan',
        label: 'Ganti Tema: Ikuti Sistem',
        icon: <Desktop className="h-4 w-4 text-muted" />,
        run: () => {
          updatePreferences({ theme: 'system' as AppTheme });
          onClose();
        }
      },
      {
        id: 'density-compact',
        category: 'Tampilan',
        label: preferences.density === 'compact' ? 'Kepadatan: Ubah ke Comfortable' : 'Kepadatan: Ubah ke Compact',
        icon: <SidebarSimple className="h-4 w-4 text-muted" />,
        run: () => {
          const nextDensity = (preferences.density === 'compact' ? 'comfortable' : 'compact') as AppDensity;
          updatePreferences({ density: nextDensity });
          toast.info(`Kepadatan tampilan diubah ke ${nextDensity === 'compact' ? 'Compact' : 'Comfortable'}.`);
          onClose();
        }
      },
      {
        id: 'toggle-motion',
        category: 'Tampilan',
        label: preferences.reduceMotion ? 'Aktifkan Animasi Antarmuka' : 'Kurangi Animasi (Reduce Motion)',
        icon: <Sparkle className="h-4 w-4 text-muted" />,
        run: () => {
          const nextMotion = !preferences.reduceMotion;
          updatePreferences({ reduceMotion: nextMotion });
          toast.info(`Mode kurangi animasi: ${nextMotion ? 'Aktif' : 'Nonaktif'}.`);
          onClose();
        }
      },
      {
        id: 'go-home',
        category: 'Navigasi',
        label: 'Kembali ke Halaman Beranda',
        icon: <House className="h-4 w-4 text-muted" />,
        run: () => {
          onNavigateHome?.();
          onClose();
        }
      }
    ],
    [
      onQuickCreateTask,
      onQuickCreatePage,
      onOpenTemplates,
      onToggleSidebar,
      onNavigateView,
      onOpenShare,
      onOpenMembers,
      onExportBackup,
      onOpenSettings,
      onOpenPreferences,
      onNavigateHome,
      onClose,
      updatePreferences,
      preferences.density,
      preferences.reduceMotion
    ]
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return q
      ? actions.filter(
          (a) => a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
        )
      : actions;
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
    if (!boards && !pages) return results;

    if (!trimmed) {
      for (const b of (boards || []).slice(0, 2)) {
        results.push({
          id: `board-${b.id}`,
          label: b.title,
          subtitle: 'Papan Kanban',
          type: 'board',
          itemId: b.id
        });
      }
      for (const p of (pages || []).slice(0, 2)) {
        results.push({
          id: `page-${p.id}`,
          label: p.title || 'Untitled Document',
          subtitle: 'Dokumen',
          type: 'page',
          itemId: p.id
        });
      }
      return results;
    }

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

  const totalSelectable = filtered.length + searchResults.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [deferredQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' && totalSelectable > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % totalSelectable);
      } else if (e.key === 'ArrowUp' && totalSelectable > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + totalSelectable) % totalSelectable);
      } else if (e.key === 'Enter' && totalSelectable > 0) {
        e.preventDefault();
        if (activeIndex < filtered.length) {
          filtered[activeIndex]?.run();
        } else {
          const result = searchResults[activeIndex - filtered.length];
          if (result) {
            if (result.type === 'card' && result.boardId) {
              onNavigateToCard?.(result.boardId, result.itemId);
            } else if (result.type === 'board') {
              onNavigateToBoard?.(result.itemId);
            } else if (result.type === 'page') {
              onNavigateToPage?.(result.itemId);
            }
            onClose();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, totalSelectable, activeIndex, filtered, searchResults, onNavigateToCard, onNavigateToBoard, onNavigateToPage]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 bg-black/35 dark:bg-black/60 p-4"
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
            placeholder="Ketik perintah, cari kartu, papan, atau dokumen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-text placeholder:text-muted focus:outline-none font-sans"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 && searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              Tidak ada perintah atau item yang cocok.
            </div>
          ) : (
            <>
              {filtered.map((action, idx) => (
                <button
                  key={action.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={action.run}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-text transition-colors cursor-pointer text-left',
                    activeIndex === idx ? 'bg-project-soft/60 text-project-solid' : 'hover:bg-hover'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {action.icon}
                    <span className="font-medium truncate">{action.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted">{action.category}</span>
                    {action.shortcut && <Kbd>{action.shortcut}</Kbd>}
                  </div>
                </button>
              ))}

              {searchResults.length > 0 && (
                <div className="border-t border-border/50 pt-1.5 mt-1.5 space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {deferredQuery.trim() ? `Hasil Pencarian (${searchResults.length})` : 'Papan & Dokumen Cepat'}
                  </div>
                  {searchResults.map((result, rIdx) => {
                    const globalIdx = filtered.length + rIdx;
                    return (
                      <button
                        key={result.id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(globalIdx)}
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
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-text transition-colors cursor-pointer text-left',
                          activeIndex === globalIdx ? 'bg-project-soft/60 text-project-solid' : 'hover:bg-hover'
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {result.type === 'board' && <Stack className="h-3.5 w-3.5 text-project-solid shrink-0" />}
                          {result.type === 'card' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                          {result.type === 'page' && <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                          <span className="font-medium truncate">{result.label}</span>
                        </div>
                        <span className="text-[10px] text-muted ml-2 shrink-0">{result.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
