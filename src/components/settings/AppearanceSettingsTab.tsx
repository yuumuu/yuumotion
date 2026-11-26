import React from 'react';
import {
  Sun,
  Moon,
  Desktop,
  SidebarSimple,
  Square,
  ArrowsOut,
  Check,
  Sparkle
} from '@phosphor-icons/react';
import { Switch } from '../ui';
import { cn } from '../../lib/cn';
import { usePreferences } from '../../context/PreferencesContext';
import { AppTheme, AppDensity, CardOpenMode, ProjectAccentTheme } from '../../types/preferences';

const ACCENT_PRESETS: { id: ProjectAccentTheme; label: string; solid: string }[] = [
  { id: 'violet', label: 'Violet', solid: '#6D28D9' },
  { id: 'cobalt', label: 'Cobalt', solid: '#2563EB' },
  { id: 'coral', label: 'Coral', solid: '#C84228' },
  { id: 'emerald', label: 'Emerald', solid: '#047857' },
  { id: 'berry', label: 'Berry', solid: '#BE185D' },
  { id: 'amber', label: 'Amber', solid: '#B45309' }
];

export const AppearanceSettingsTab: React.FC = () => {
  const { preferences, updatePreferences, activeProjectTheme, setActiveProjectTheme } = usePreferences();

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-text">Tema Tampilan</label>
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              { id: 'light', label: 'Terang', icon: <Sun className="w-4 h-4" /> },
              { id: 'dark', label: 'Gelap', icon: <Moon className="w-4 h-4" /> },
              { id: 'system', label: 'Sistem', icon: <Desktop className="w-4 h-4" /> }
            ] as { id: AppTheme; label: string; icon: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => updatePreferences({ theme: t.id })}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-colors cursor-pointer',
                preferences.theme === t.id
                  ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
                  : 'border-border bg-bg text-text hover:bg-hover'
              )}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-text">Aksen Warna Project</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ACCENT_PRESETS.map((preset) => {
            const active = activeProjectTheme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActiveProjectTheme(preset.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-2 text-[11px] font-medium transition-colors cursor-pointer',
                  active ? 'border-project-accent bg-project-soft' : 'border-border bg-bg hover:bg-hover'
                )}
              >
                <span
                  className="flex justify-center items-center w-5 h-5 text-white rounded-full"
                  style={{ backgroundColor: preset.solid }}
                >
                  {active && <Check className="w-3 h-3" weight="bold" />}
                </span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text">Kepadatan</label>
          <div className="grid grid-cols-2 gap-2">
            {(['comfortable', 'compact'] as AppDensity[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => updatePreferences({ density: d })}
                className={cn(
                  'rounded-xl border py-2 text-xs font-medium capitalize transition-colors cursor-pointer',
                  preferences.density === d
                    ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
                    : 'border-border bg-bg text-text hover:bg-hover'
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text">Mode Detail Kartu</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'drawer', label: 'Side', icon: <SidebarSimple className="h-3.5 w-3.5" /> },
                { id: 'modal', label: 'Modal', icon: <Square className="h-3.5 w-3.5" /> },
                { id: 'full', label: 'Penuh', icon: <ArrowsOut className="h-3.5 w-3.5" /> }
              ] as { id: CardOpenMode; label: string; icon: React.ReactNode }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => updatePreferences({ cardOpenMode: m.id })}
                className={cn(
                  'flex items-center justify-center gap-1 rounded-xl border py-2 text-[11px] font-medium transition-colors cursor-pointer',
                  preferences.cardOpenMode === m.id
                    ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
                    : 'border-border bg-bg text-text hover:bg-hover'
                )}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-bg p-3.5">
        <div className="flex items-center gap-2.5">
          <Sparkle className="w-4 h-4 text-project-solid" />
          <div>
            <div className="text-xs font-semibold text-text">Kurangi Animasi</div>
            <div className="text-[11px] text-muted">Nonaktifkan efek transisi gerak berlebih</div>
          </div>
        </div>
        <Switch
          checked={preferences.reduceMotion}
          onChange={(e) => updatePreferences({ reduceMotion: e.target.checked })}
        />
      </div>
    </div>
  );
};
