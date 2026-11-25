import React, { useState } from 'react';
import { AuthUser } from '../types/board';
import { saveStoredAuthUser, loginWithSupabaseAuth } from '../lib/auth';
import { apiClient, ApiError } from '../services/apiClient';
import { PublicFooter } from './PublicFooter';
import {
  ArrowLeft,
  User,
  EnvelopeSimple,
  Lock,
  Sparkle,
  Spinner,
  CheckCircle,
  GithubLogo,
  GoogleLogo,
  Eye,
  EyeSlash
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    try {
      const data = await apiClient.auth.login(email.trim(), password);
      const apiUser = data.user as AuthUser;
      saveStoredAuthUser(apiUser);
      onUserChange(apiUser);
      setLoading(false);
      onEnterApp();
      return;
    } catch (err) {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        setLoading(false);
        setErrorMsg(err.message);
        return;
      }
    }

    // Fallback bila backend API lokal belum dinyalakan
    const result = await loginWithSupabaseAuth(email.trim(), password);
    setLoading(false);

    if (result.success && result.user) {
      onUserChange(result.user);
      onEnterApp();
    } else {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Nama tampilan wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Alamat email valid wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.auth.register(name.trim(), email.trim(), password);
      const apiUser = data.user as AuthUser;
      saveStoredAuthUser(apiUser);
      onUserChange(apiUser);
      setLoading(false);
      setSuccessMsg('Akun berhasil didaftarkan.');
      setTimeout(() => onEnterApp(), 500);
      return;
    } catch (err) {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        setLoading(false);
        setErrorMsg(err.message);
        return;
      }
    }

    // Fallback offline-first jika server API belum berjalan
    setLoading(false);
    const newUser: AuthUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim(),
      avatar: name.trim().charAt(0).toUpperCase(),
      color: selectedColor,
      isCloudAuth: false
    };

    saveStoredAuthUser(newUser);
    onUserChange(newUser);
    setSuccessMsg('Akun lokal berhasil dibuat (mode offline).');
    setTimeout(() => {
      onEnterApp();
    }, 600);
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('API offline');
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch {
      setErrorMsg(
        `Backend OAuth (${provider === 'github' ? 'GitHub' : 'Google'}) belum aktif atau belum dikonfigurasi di server/. Jalankan server API terlebih dahulu atau gunakan Masuk sebagai Tamu.`
      );
    }
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
    <div className="flex flex-col justify-between min-h-screen bg-bg text-text">
      <div className="flex flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onNavigateHome}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted hover:text-project-solid cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center justify-center gap-2.5">
          <img
            src="/icon.svg"
            alt="Yuumotion Logo"
            className="w-10 h-10 rounded-xl shadow-md"
          />
          <h2 className="text-xl font-bold tracking-tight text-appflowy-text dark:text-appflowy-darkText">
            Yuumotion Auth
          </h2>
        </div>
        <p className="mt-2 text-xs text-center text-appflowy-muted dark:text-appflowy-darkMuted">
          Akses workspace kolaboratif dengan akun lokal atau cloud
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="p-6 rounded-2xl border shadow-xl border-appflowy-border bg-appflowy-surface dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
          {/* Tab Switcher */}
          <div className="flex p-1 mb-6 rounded-xl border border-appflowy-border bg-appflowy-bg dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-[background-color,color] duration-150 cursor-pointer ${
                tab === 'login'
                  ? 'bg-surface text-project-solid shadow-2xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-[background-color,color] duration-150 cursor-pointer ${
                tab === 'register'
                  ? 'bg-surface text-project-solid shadow-2xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 text-xs text-rose-600 rounded-xl border border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
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
                    className="py-2 pr-3 pl-9 w-full text-xs rounded-xl border border-appflowy-border bg-appflowy-bg text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-project-ring dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
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
                    className="py-2 pr-3 pl-9 w-full text-xs rounded-xl border border-appflowy-border bg-appflowy-bg text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-project-ring dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-project-solid py-2.5 text-xs font-semibold text-white shadow-sm transition-[opacity,transform] duration-150 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Spinner className="w-4 h-4 animate-spin" /> : <span>Masuk ke Workspace</span>}
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
                    className="py-2 pr-3 pl-9 w-full text-xs rounded-xl border border-appflowy-border bg-appflowy-bg text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-project-ring dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                  />
                </div>
              </div>

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
                    className="py-2 pr-3 pl-9 w-full text-xs rounded-xl border border-appflowy-border bg-appflowy-bg text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-project-ring dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-2 pr-9 pl-9 w-full text-xs rounded-xl border border-appflowy-border bg-appflowy-bg text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-project-ring dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-appflowy-muted hover:text-text cursor-pointer"
                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeSlash className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText mb-1.5">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-appflowy-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Ulangi kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="py-2 pr-3 pl-9 w-full text-xs rounded-xl border border-appflowy-border bg-appflowy-bg text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-project-ring dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText mb-1.5">
                  Warna Avatar
                </label>
                <div className="flex gap-2 items-center">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`h-6 w-6 rounded-full transition-[transform,opacity] duration-150 cursor-pointer ${
                        selectedColor === color ? 'scale-125 ring-2 ring-project-ring ring-offset-2' : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-project-solid py-2.5 text-xs font-semibold text-white shadow-sm transition-[opacity,transform] duration-150 hover:opacity-95 active:scale-[0.98] cursor-pointer"
              >
                <span>Simpan & Buka Workspace</span>
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="flex absolute inset-0 items-center">
                <div className="w-full border-t border-appflowy-border dark:border-appflowy-darkBorder" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="px-2 bg-appflowy-surface text-appflowy-muted dark:bg-appflowy-darkSurface dark:text-appflowy-darkMuted">
                  Akses Cepat
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border border-border bg-bg text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <GithubLogo className="h-4 w-4" />
                <span>GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border border-border bg-bg text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <GoogleLogo className="h-4 w-4 text-blue-500" />
                <span>Google</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              className="flex gap-2 justify-center items-center py-2 mt-2.5 w-full text-xs font-medium rounded-xl border cursor-pointer border-border bg-bg text-text hover:bg-hover"
            >
              <Sparkle className="h-3.5 w-3.5 text-blue-400" />
              <span>Masuk sebagai Tamu</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      <div className="bg-gradient-to-b from-bg via-[#3B82F6] via-25% to-[#0B45D6] pt-20">
        <PublicFooter onEnterApp={onEnterApp} />
      </div>
    </div>
  );
};