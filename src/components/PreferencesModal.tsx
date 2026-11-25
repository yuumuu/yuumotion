import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Desktop,
  SidebarSimple,
  ArrowsOut,
  Square,
  Sparkle,
  DownloadSimple,
  WifiHigh,
  Check
} from '@phosphor-icons/react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';
import { cn } from '../lib/cn';
import { usePreferences } from '../context/PreferencesContext';
import { AppTheme, AppDensity, CardOpenMode, ProjectAccentTheme } from '../types/preferences';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_PRESETS: { id: ProjectAccentTheme; label: string; solid: string; text: string }[] = [
  { id: 'violet', label: 'Violet', solid: '#6D28D9', text: 'Ungu Elegan' },
  { id: 'cobalt', label: 'Cobalt', solid: '#2563EB', text: 'Biru Tajam' },
  { id: 'coral', label: 'Coral', solid: '#C84228', text: 'Merah Hangat' },
  { id: 'emerald', label: 'Emerald', solid: '#047857', text: 'Hijau Sejuk' },
  { id: 'berry', label: 'Berry', solid: '#BE185D', text: 'Magenta Ceria' },
  { id: 'amber', label: 'Amber', solid: '#B45309', text: 'Oranye Emas' }
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, activeProjectTheme, setActiveProjectTheme } = usePreferences();
  const [offlineStatus] = useState<string>('Online (Cache Lokal Aktif)');

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Preferensi"
      description="Sesuaikan tema, kerapatan layout, mode kartu, dan perilaku offline aplikasi"
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted">
            Tersimpan otomatis di profil dan cache lokal PWA
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* 1. Tema Tampilan */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2.5">
            1. Tema Tampilan
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Terang', desc: 'Default kertas hangat', icon: <Sun className="h-4 w-4" /> },
              { id: 'dark', label: 'Gelap', desc: 'Arang lembut nyaman', icon: <Moon className="h-4 w-4" /> },
              { id: 'system', label: 'Sistem', desc: 'Otomatis sesuai OS', icon: <Desktop className="h-4 w-4" /> }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updatePreferences({ theme: item.id as AppTheme })}
                className={cn(
                  'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
                  preferences.theme === item.id
                    ? 'border-project-accent bg-project-soft text-project-accent shadow-card-hover font-medium'
                    : 'border-border bg-surface text-text hover:bg-hover'
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="p-1 rounded-md bg-bar text-muted">{item.icon}</span>
                  {preferences.theme === item.id && <Check className="h-3.5 w-3.5 text-project-accent" />}
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
                <span className="text-[11px] text-muted mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Warna Aksen Project */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2.5">
            2. Preset Aksen Project Aktif
          </label>
          <div className="grid grid-cols-6 gap-2">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActiveProjectTheme(preset.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer text-center',
                  activeProjectTheme === preset.id
                    ? 'border-project-accent bg-project-soft ring-2 ring-project-ring shadow-sm'
                    : 'border-border bg-surface hover:bg-hover'
                )}
              >
                <span
                  className="h-5 w-5 rounded-full shadow-xs flex items-center justify-center text-white"
                  style={{ backgroundColor: preset.solid }}
                >
                  {activeProjectTheme === preset.id && <Check className="h-3 w-3" />}
                </span>
                <span className="text-[11px] font-medium text-text">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Kepadatan Antarmuka (Density) */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2.5">
            3. Kepadatan Antarmuka (Density)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'comfortable',
                title: 'Comfortable (Default)',
                desc: 'Spasi lega (padding 14px), nyaman untuk mengetik dokumen dan fokus membaca'
              },
              {
                id: 'compact',
                title: 'Compact',
                desc: 'Kerapatan tinggi (padding 10px), muat lebih banyak kolom, baris, dan kartu'
              }
            ].map((density) => (
              <button
                key={density.id}
                type="button"
                onClick={() => updatePreferences({ density: density.id as AppDensity })}
                className={cn(
                  'flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer',
                  preferences.density === density.id
                    ? 'border-project-accent bg-project-soft text-project-accent shadow-card-hover'
                    : 'border-border bg-surface text-text hover:bg-hover'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{density.title}</span>
                  {preferences.density === density.id && <Check className="h-3.5 w-3.5 text-project-accent" />}
                </div>
                <span className="text-[11px] text-muted">{density.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Cara Membuka Kartu */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2.5">
            4. Cara Membuka Detail Kartu
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: 'drawer',
                title: 'Side Peek Drawer',
                desc: 'Panel kanan, papan di belakang tetap bisa diakses',
                icon: <SidebarSimple className="h-4 w-4" />
              },
              {
                id: 'modal',
                title: 'Center Modal',
                desc: 'Dialog di tengah layar dengan backdrop blur',
                icon: <Square className="h-4 w-4" />
              },
              {
                id: 'fullpage',
                title: 'Halaman Penuh',
                desc: 'Buka kartu sebagai halaman dokumen penuh',
                icon: <ArrowsOut className="h-4 w-4" />
              }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => updatePreferences({ cardOpenMode: mode.id as CardOpenMode })}
                className={cn(
                  'flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer',
                  preferences.cardOpenMode === mode.id
                    ? 'border-project-accent bg-project-soft text-project-accent shadow-card-hover'
                    : 'border-border bg-surface text-text hover:bg-hover'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="p-1 rounded-md bg-bar text-muted">{mode.icon}</span>
                  {preferences.cardOpenMode === mode.id && <Check className="h-3.5 w-3.5 text-project-accent" />}
                </div>
                <span className="text-xs font-semibold">{mode.title}</span>
                <span className="text-[11px] text-muted mt-0.5">{mode.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Gerak & Micro-delight */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-bar">
          <div className="flex items-center gap-3">
            <Sparkle className="h-4 w-4 text-project-accent" />
            <div>
              <span className="text-xs font-semibold text-text block">
                Kurangi Animasi (Reduced Motion)
              </span>
              <span className="text-[11px] text-muted block">
                Matikan rotasi drag, kurva pegas, dan pulse glow untuk transisi instan
              </span>
            </div>
          </div>
          <Switch
            checked={preferences.reduceMotion}
            onChange={(e) => updatePreferences({ reduceMotion: e.target.checked })}
          />
        </div>

        {/* 6. PWA & Status Offline */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-bar">
          <div className="flex items-center gap-3">
            <WifiHigh className="h-4 w-4 text-status-done" />
            <div>
              <span className="text-xs font-semibold text-text block">
                Status PWA & Sinkronisasi
              </span>
              <span className="text-[11px] text-muted block">
                {offlineStatus} • Tersinkron dengan Supabase
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<DownloadSimple className="h-3.5 w-3.5" />}
            onClick={() => alert('PWA sudah terpasang dan siap digunakan saat offline.')}
          >
            Cek PWA
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
