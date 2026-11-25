import React, { useState, useRef } from 'react';
import {
  User,
  Palette,
  Cloud,
  Keyboard as KeyboardIcon,
  Sun,
  Moon,
  Desktop,
  SidebarSimple,
  Square,
  ArrowsOut,
  Check,
  DownloadSimple,
  UploadSimple,
  Database,
  WifiHigh,
  Sparkle
} from '@phosphor-icons/react';
import { Dialog, Button, Input, Switch, Kbd, toast } from './ui';
import { cn } from '../lib/cn';
import { usePreferences } from '../context/PreferencesContext';
import { AppTheme, AppDensity, CardOpenMode, ProjectAccentTheme } from '../types/preferences';
import { AuthUser, CloudSyncConfig, SyncConnectionStatus } from '../types/board';
import { saveStoredAuthUser } from '../lib/auth';

export type SettingsTab = 'profile' | 'appearance' | 'sync' | 'shortcuts';

interface SettingsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  currentUser: AuthUser;
  onUserChange: (user: AuthUser) => void;
  cloudConfig: CloudSyncConfig;
  syncStatus: SyncConnectionStatus;
  onSaveCloudConfig: (cfg: CloudSyncConfig) => void;
  onOpenDbBridge: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AVATAR_COLORS = ['#6366F1', '#2563EB', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

const ACCENT_PRESETS: { id: ProjectAccentTheme; label: string; solid: string }[] = [
  { id: 'violet', label: 'Violet', solid: '#6D28D9' },
  { id: 'cobalt', label: 'Cobalt', solid: '#2563EB' },
  { id: 'coral', label: 'Coral', solid: '#C84228' },
  { id: 'emerald', label: 'Emerald', solid: '#047857' },
  { id: 'berry', label: 'Berry', solid: '#BE185D' },
  { id: 'amber', label: 'Amber', solid: '#B45309' }
];

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

export const SettingsHubModal: React.FC<SettingsHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  currentUser,
  onUserChange,
  cloudConfig,
  syncStatus,
  onSaveCloudConfig,
  onOpenDbBridge,
  onExportBackup,
  onImportBackup
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const { preferences, updatePreferences, activeProjectTheme, setActiveProjectTheme } = usePreferences();

  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileColor, setProfileColor] = useState(currentUser.color);

  const [supabaseUrl, setSupabaseUrl] = useState(cloudConfig.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(cloudConfig.supabaseAnonKey);
  const [cloudEnabled, setCloudEnabled] = useState(cloudConfig.enabled);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setProfileName(currentUser.name);
      setProfileColor(currentUser.color);
    }
  }, [isOpen, initialTab, currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    const updated: AuthUser = {
      ...currentUser,
      name: profileName.trim(),
      avatar: profileName.trim().charAt(0).toUpperCase(),
      color: profileColor
    };
    saveStoredAuthUser(updated);
    onUserChange(updated);
    toast.success('Profil berhasil diperbarui');
  };

  const handleSaveSync = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCloudConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
      enabled: cloudEnabled
    });
    toast.success('Pengaturan sinkronisasi disimpan');
  };

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profil Akun', icon: <User className="h-4 w-4" /> },
    { id: 'appearance', label: 'Tampilan', icon: <Palette className="h-4 w-4" /> },
    { id: 'sync', label: 'Sinkron & Data', icon: <Cloud className="h-4 w-4" /> },
    { id: 'shortcuts', label: 'Pintasan', icon: <KeyboardIcon className="h-4 w-4" /> }
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan & Profil"
      description="Kelola identitas akun, tampilan antarmuka, sinkronisasi cloud, dan pintasan kerja."
      maxWidth="3xl"
    >
      <div className="flex flex-col sm:flex-row gap-5 min-h-[380px] -mx-1">
        {/* Vertical Tab Menu */}
        <nav
          aria-label="Menu Pengaturan"
          className="flex sm:flex-col gap-1 sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4 overflow-x-auto"
        >
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer text-left',
                  active
                    ? 'bg-project-soft text-project-solid font-semibold'
                    : 'text-muted hover:text-text hover:bg-hover'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content Panel */}
        <div className="flex-1 min-w-0 overflow-y-auto max-h-[60vh] pr-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-bg p-4">
                <div
                  style={{ backgroundColor: profileColor }}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white shadow-sm shrink-0"
                >
                  {profileName.trim().charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-sm font-bold text-text truncate">
                    {profileName || 'Pengguna Lokal'}
                  </div>
                  <div className="font-mono text-[11px] text-muted truncate">
                    {currentUser.isCloudAuth ? currentUser.email || 'Cloud Terhubung' : 'Sesi Penyimpanan Lokal'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text">Nama Tampilan</label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Nama lengkap atau panggilan..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text">Warna Identitas Avatar</label>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProfileColor(color)}
                      style={{ backgroundColor: color }}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform cursor-pointer',
                        profileColor === color ? 'ring-2 ring-project-accent ring-offset-2 scale-105' : 'opacity-80 hover:opacity-100'
                      )}
                    >
                      {profileColor === color && <Check className="h-3.5 w-3.5" weight="bold" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  Simpan Profil
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-text">Tema Tampilan</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'light', label: 'Terang', icon: <Sun className="h-4 w-4" /> },
                      { id: 'dark', label: 'Gelap', icon: <Moon className="h-4 w-4" /> },
                      { id: 'system', label: 'Sistem', icon: <Desktop className="h-4 w-4" /> }
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

              {/* Project Accent */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-text">Aksen Warna Project</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                          className="h-5 w-5 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: preset.solid }}
                        >
                          {active && <Check className="h-3 w-3" weight="bold" />}
                        </span>
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density & Card Open Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Sparkle className="h-4 w-4 text-project-solid" />
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
          )}

          {activeTab === 'sync' && (
            <div className="space-y-5">
              <form onSubmit={handleSaveSync} className="space-y-3 rounded-2xl border border-border bg-bg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WifiHigh className="h-4 w-4 text-status-done" />
                    <span className="text-xs font-semibold text-text">
                      Supabase Realtime ({syncStatus === 'connected' ? 'Terhubung' : 'Mode Lokal'})
                    </span>
                  </div>
                  <Switch
                    checked={cloudEnabled}
                    onChange={(e) => setCloudEnabled(e.target.checked)}
                  />
                </div>
                <Input
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xxx.supabase.co"
                />
                <Input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="Supabase Anon Key"
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="xs">
                    Simpan Koneksi Cloud
                  </Button>
                </div>
              </form>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-text">Cadangan Data &amp; SQL Bridge</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onExportBackup}
                    leftIcon={<DownloadSimple className="h-3.5 w-3.5" />}
                  >
                    Unduh JSON
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<UploadSimple className="h-3.5 w-3.5" />}
                  >
                    Pulihkan JSON
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onOpenDbBridge();
                    }}
                    leftIcon={<Database className="h-3.5 w-3.5" />}
                  >
                    SQL Bridge
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={onImportBackup}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
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
                  <div className="flex items-center gap-1 shrink-0">
                    {s.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
