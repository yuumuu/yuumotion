import React, { useState } from 'react';
import { AuthUser } from '../types/board';
import { saveStoredAuthUser, loginWithSupabaseAuth } from '../lib/auth';
import {
  ArrowLeft,
  User,
  EnvelopeSimple,
  Lock,
  Stack,
  Sparkle,
  Spinner,
  CheckCircle
} from '@phosphor-icons/react';

interface AuthPageProps {
  currentUser: AuthUser;
  onUserChange: (user: AuthUser) => void;
  onNavigateHome: () => void;
  onEnterApp: () => void;
}

const AVATAR_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export const AuthPage: React.FC<AuthPageProps> = ({
  currentUser,
  onUserChange,
  onNavigateHome,
  onEnterApp
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState(currentUser.color);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan email dan kata sandi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Coba login via Supabase cloud auth bila kredensial tersedia
    const result = await loginWithSupabaseAuth(email.trim(), password);
    setLoading(false);

    if (result.success && result.user) {
      onUserChange(result.user);
      onEnterApp();
    } else {
      // Fallback ke fast-session local jika cloud auth belum disetting
      const localUser: AuthUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: email.split('@')[0] || 'User',
        email: email.trim(),
        avatar: (email.charAt(0) || 'U').toUpperCase(),
        color: selectedColor,
        isCloudAuth: false
      };
      saveStoredAuthUser(localUser);
      onUserChange(localUser);
      onEnterApp();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama akun wajib diisi.');
      return;
    }

    const newUser: AuthUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim() || undefined,
      avatar: name.trim().charAt(0).toUpperCase(),
      color: selectedColor,
      isCloudAuth: false
    };

    saveStoredAuthUser(newUser);
    onUserChange(newUser);
    setSuccessMsg('Akun profil berhasil dibuat.');
    setTimeout(() => {
      onEnterApp();
    }, 600);
  };

  const handleGuestAccess = () => {
    const guestUser: AuthUser = {
      id: `usr-guest-${Math.random().toString(36).substring(2, 7)}`,
      name: 'Guest Collab',
      avatar: 'G',
      color: '#10B981',
      isCloudAuth: false
    };
    saveStoredAuthUser(guestUser);
    onUserChange(guestUser);
    onEnterApp();
  };

  return (
    <div className="min-h-screen bg-appflowy-bg text-appflowy-text dark:bg-appflowy-darkBg dark:text-appflowy-darkText flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onNavigateHome}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-appflowy-muted hover:text-purple-600 dark:text-appflowy-darkMuted dark:hover:text-purple-400 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-purple-500/20">
            <Stack className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-appflowy-text dark:text-appflowy-darkText">
            Yuumotion Auth
          </h2>
        </div>
        <p className="mt-2 text-center text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
          Akses workspace kolaboratif dengan akun lokal atau cloud
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
          {/* Tab Switcher */}
          <div className="flex rounded-xl border border-appflowy-border bg-appflowy-bg p-1 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-appflowy-surface text-purple-600 shadow-2xs dark:bg-appflowy-darkSurface dark:text-purple-400'
                  : 'text-appflowy-muted hover:text-appflowy-text dark:text-appflowy-darkMuted'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-appflowy-surface text-purple-600 shadow-2xs dark:bg-appflowy-darkSurface dark:text-purple-400'
                  : 'text-appflowy-muted hover:text-appflowy-text dark:text-appflowy-darkMuted'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-appflowy-muted" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-appflowy-border bg-appflowy-bg pl-9 pr-3 py-2 text-xs text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-appflowy-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-appflowy-border bg-appflowy-bg pl-9 pr-3 py-2 text-xs text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Spinner className="h-4 w-4 animate-spin" /> : <span>Masuk ke Workspace</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText mb-1.5">
                  Nama Tampilan
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-appflowy-muted" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Yuu Designer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-appflowy-border bg-appflowy-bg pl-9 pr-3 py-2 text-xs text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText mb-1.5">
                  Email (Opsional)
                </label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-appflowy-muted" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-appflowy-border bg-appflowy-bg pl-9 pr-3 py-2 text-xs text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText mb-1.5">
                  Warna Avatar
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`h-6 w-6 rounded-full transition-all cursor-pointer ${
                        selectedColor === color ? 'scale-125 ring-2 ring-purple-400 ring-offset-2' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-700 cursor-pointer"
              >
                <span>Simpan & Buka Workspace</span>
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-appflowy-border dark:border-appflowy-darkBorder" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-appflowy-surface px-2 text-appflowy-muted dark:bg-appflowy-darkSurface dark:text-appflowy-darkMuted">
                  Akses Cepat
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-appflowy-border bg-appflowy-bg py-2 text-xs font-medium text-appflowy-text hover:bg-neutral-100 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText dark:hover:bg-neutral-800 cursor-pointer"
            >
              <Sparkle className="h-3.5 w-3.5 text-emerald-500" />
              <span>Masuk sebagai Guest (Tanpa Sandi)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};