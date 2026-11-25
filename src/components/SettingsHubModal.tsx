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
  Sparkle,
  Camera,
  Trash,
  SignOut,
  Lock,
  Bell,
  Plus
} from '@phosphor-icons/react';
import { Dialog, Button, Input, Switch, Kbd, CustomSelect, ColorPicker, EmojiPickerPopover, toast } from './ui';
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
  onLogout?: () => void;
}

const AVATAR_COLORS = ['#2563EB', '#1D4ED8', '#0B0D12', '#3B82F6', '#0EA5E9', '#64748B'];
const AVATAR_EMOJIS = ['🚀', '🎨', '⚡', '🦊', '✨', '💻'];
const TIMEZONE_OPTIONS = [
  'Asia/Jakarta (WIB)',
  'Asia/Makassar (WITA)',
  'Asia/Jayapura (WIT)',
  'Asia/Singapore (SGT)',
  'UTC'
];

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
  onImportBackup,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const { preferences, updatePreferences, activeProjectTheme, setActiveProjectTheme } = usePreferences();

  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profileTitle, setProfileTitle] = useState(currentUser.title || '');
  const [profileBio, setProfileBio] = useState(currentUser.bio || '');
  const [profileTimezone, setProfileTimezone] = useState(currentUser.timezone || 'Asia/Jakarta (WIB)');
  const [profileColor, setProfileColor] = useState(currentUser.color);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [profileAvatarEmoji, setProfileAvatarEmoji] = useState(currentUser.avatarEmoji || '');
  const [presenceStatus, setPresenceStatus] = useState<'online' | 'busy' | 'away'>(
    currentUser.presenceStatus || 'online'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    currentUser.notificationsEnabled ?? true
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const [supabaseUrl, setSupabaseUrl] = useState(cloudConfig.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(cloudConfig.supabaseAnonKey);
  const [cloudEnabled, setCloudEnabled] = useState(cloudConfig.enabled);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email || '');
      setProfileTitle(currentUser.title || '');
      setProfileBio(currentUser.bio || '');
      setProfileTimezone(currentUser.timezone || 'Asia/Jakarta (WIB)');
      setProfileColor(currentUser.color);
      setProfileAvatarUrl(currentUser.avatarUrl || '');
      setProfileAvatarEmoji(currentUser.avatarEmoji || '');
      setPresenceStatus(currentUser.presenceStatus || 'online');
      setNotificationsEnabled(currentUser.notificationsEnabled ?? true);
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialTab, currentUser]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast.error('Ukuran foto maksimal 512 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileAvatarUrl(reader.result);
        setProfileAvatarEmoji('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    const updated: AuthUser = {
      ...currentUser,
      name: profileName.trim(),
      email: profileEmail.trim() || undefined,
      title: profileTitle.trim() || undefined,
      bio: profileBio.trim() || undefined,
      timezone: profileTimezone,
      avatar: profileAvatarEmoji || profileName.trim().charAt(0).toUpperCase(),
      avatarUrl: profileAvatarUrl || undefined,
      avatarEmoji: profileAvatarEmoji || undefined,
      color: profileColor,
      presenceStatus,
      notificationsEnabled
    };
    saveStoredAuthUser(updated);
    onUserChange(updated);
    toast.success('Profil berhasil diperbarui');
  };

  const handlePasswordUpdate = () => {
    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok.');
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password akun berhasil diperbarui.');
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
    { id: 'profile', label: 'Profil Akun', icon: <User className="w-4 h-4" /> },
    { id: 'appearance', label: 'Tampilan', icon: <Palette className="w-4 h-4" /> },
    { id: 'sync', label: 'Sinkron & Data', icon: <Cloud className="w-4 h-4" /> },
    { id: 'shortcuts', label: 'Pintasan', icon: <KeyboardIcon className="w-4 h-4" /> }
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
          className="flex overflow-x-auto gap-1 pb-3 border-b sm:flex-col sm:w-44 shrink-0 sm:border-b-0 sm:border-r border-border sm:pb-0 sm:pr-4"
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
              {/* Avatar & Identity Card */}
              <div className="flex flex-wrap gap-4 justify-between items-center p-4 rounded-2xl border border-border bg-bg">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    {profileAvatarUrl ? (
                      <img
                        src={profileAvatarUrl}
                        alt={profileName}
                        className="object-cover w-14 h-14 rounded-full ring-2 ring-border"
                      />
                    ) : (
                      <div
                        style={{ backgroundColor: profileColor }}
                        className="flex justify-center items-center w-14 h-14 text-lg font-bold text-white rounded-full shadow-sm"
                      >
                        {profileAvatarEmoji || profileName.trim().charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span
                      className={cn(
                        'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-bg',
                        presenceStatus === 'online'
                          ? 'bg-emerald-500'
                          : presenceStatus === 'busy'
                            ? 'bg-rose-500'
                            : 'bg-amber-400'
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate font-display text-text">
                      {profileName || 'Pengguna Lokal'}
                    </div>
                    <div className="text-[11px] text-muted truncate">
                      {profileTitle || 'Anggota Workspace'} · {profileTimezone}
                    </div>
                    <div className="font-mono text-[10px] text-muted truncate mt-0.5">
                      {currentUser.isCloudAuth ? profileEmail || 'Cloud Terhubung' : 'Sesi Penyimpanan Lokal'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    Unggah Foto
                  </Button>
                  {(profileAvatarUrl || profileAvatarEmoji) && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileAvatarUrl('');
                        setProfileAvatarEmoji('');
                      }}
                      title="Reset ke inisial"
                      className="flex justify-center items-center w-8 h-8 rounded-lg border transition-colors cursor-pointer border-border text-muted hover:text-rose-500 hover:bg-hover"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Avatar Emoji & Color */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative space-y-2">
                  <label className="text-xs font-semibold text-text">Preset Emoji Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          setProfileAvatarEmoji(em);
                          setProfileAvatarUrl('');
                          setIsEmojiPickerOpen(false);
                        }}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-transform cursor-pointer',
                          profileAvatarEmoji === em && !profileAvatarUrl
                            ? 'border-project-accent bg-project-soft scale-105'
                            : 'border-border bg-bg hover:bg-hover'
                        )}
                      >
                        {em}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen((v) => !v)}
                      title="Pilih dari semua emoji & ikon"
                      className={cn(
                        'flex justify-center items-center w-8 h-8 text-xs font-semibold rounded-lg border transition-colors cursor-pointer',
                        isEmojiPickerOpen
                          ? 'border-project-accent bg-project-soft text-project-solid'
                          : 'border-dashed border-border bg-bg text-muted hover:text-text hover:bg-hover'
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <EmojiPickerPopover
                    isOpen={isEmojiPickerOpen}
                    selectedEmoji={profileAvatarEmoji}
                    onSelect={(em) => {
                      setProfileAvatarEmoji(em);
                      setProfileAvatarUrl('');
                    }}
                    onClose={() => setIsEmojiPickerOpen(false)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text">Warna Identitas Avatar</label>
                    <span className="font-mono text-[10px] uppercase text-muted">{profileColor}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
                    <ColorPicker
                      value={profileColor}
                      onChange={setProfileColor}
                      presets={AVATAR_COLORS}
                      align="right"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text">Nama Tampilan</label>
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Nama lengkap atau panggilan..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text">Email</label>
                  <Input
                    type="email"
                    value={profileEmail}
                    disabled={currentUser.isCloudAuth}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text">Jabatan / Peran</label>
                  <Input
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    placeholder="Product Engineer, Designer..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text">Zona Waktu</label>
                  <CustomSelect
                    value={profileTimezone}
                    options={TIMEZONE_OPTIONS.map((tz) => ({ value: tz, label: tz }))}
                    onChange={(val) => setProfileTimezone(val)}
                    size="md"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text">Bio Singkat</label>
                <textarea
                  rows={2}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Ceritakan fokus kerja atau catatan singkat untuk anggota tim..."
                  className="px-3 py-2 w-full text-xs rounded-xl border resize-none border-border bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-project-accent/40"
                />
              </div>

              {/* Presence & Notifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-bg p-3.5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text">Status Kehadiran</label>
                  <div className="flex gap-1.5">
                    {(
                      [
                        { id: 'online', label: 'Online', dot: 'bg-emerald-500' },
                        { id: 'busy', label: 'Sibuk', dot: 'bg-rose-500' },
                        { id: 'away', label: 'Menjauh', dot: 'bg-amber-400' }
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setPresenceStatus(st.id)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer',
                          presenceStatus === st.id
                            ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
                            : 'border-border bg-surface text-muted hover:text-text'
                        )}
                      >
                        <span className={cn('h-2 w-2 rounded-full', st.dot)} />
                        <span>{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-between items-center">
                  <div className="flex gap-2 items-start">
                    <Bell className="h-4 w-4 text-project-solid shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-text">Notifikasi Tenggat</div>
                      <div className="text-[11px] text-muted">Pengingat kartu &amp; komentar baru</div>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                </div>
              </div>

              {/* Account Security & Logout */}
              <div className="rounded-xl border border-border bg-bg p-3.5 space-y-3">
                <div className="flex gap-2 items-center text-xs font-semibold text-text">
                  <Lock className="w-4 h-4 text-project-solid" />
                  <span>Keamanan Akun &amp; Sesi</span>
                </div>
                <div className="space-y-2.5 max-w-sm">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password baru (min. 6 karakter)"
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password baru"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handlePasswordUpdate}>
                    Perbarui Password
                  </Button>
                </div>

                {onLogout && (
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-[11px] text-muted">
                      Keluar dari sesi aktif dan kembali ke halaman depan.
                    </span>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      <SignOut className="h-3.5 w-3.5" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
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

              {/* Project Accent */}
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

              {/* Density & Card Open Mode */}
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
          )}

          {activeTab === 'sync' && (
            <div className="space-y-5">
              <form onSubmit={handleSaveSync} className="p-4 space-y-3 rounded-2xl border border-border bg-bg">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <WifiHigh className="w-4 h-4 text-status-done" />
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
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                  <div className="flex gap-1 items-center shrink-0">
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
