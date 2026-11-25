import React, { useState, useEffect } from 'react';
import { MagnifyingGlass, Moon, Sun, Desktop, Stack, SidebarSimple, FileText, CheckCircle } from '@phosphor-icons/react';
import { Kbd } from './ui/Kbd';
import { cn } from '../lib/cn';
import { usePreferences } from '../context/PreferencesContext';
import { AppTheme, AppDensity } from '../types/preferences';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: string) => void;
  onQuickCreateTask?: () => void;
  onOpenPreferences?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  onQuickCreateTask,
  onOpenPreferences
}) => {
  const [query, setQuery] = useState('');
  const { preferences, updatePreferences } = usePreferences();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
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
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/25 dark:bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-card-drag animate-in zoom-in-95 duration-150"
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
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              Tidak ada perintah yang cocok.
            </div>
          ) : (
            filtered.map((action) => (
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
            ))
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
