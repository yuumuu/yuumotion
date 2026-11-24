import React, { useState } from 'react';
import { AuthUser } from '../types/board';
import { loginWithSupabaseAuth, saveStoredAuthUser } from '../lib/auth';
import { X, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthModalProps {
  currentUser: AuthUser;
  onUserChange: (user: AuthUser) => void;
  onClose: () => void;
}

const PRESET_AVATAR_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onUserChange,
  onClose
}) => {
  const [authTab, setAuthTab] = useState<'local' | 'cloud'>('local');
  const [localName, setLocalName] = useState(currentUser.name);
  const [localColor, setLocalColor] = useState(currentUser.color);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveLocalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName.trim()) return;

    const updatedUser: AuthUser = {
      ...currentUser,
      name: localName.trim(),
      avatar: localName.trim().charAt(0).toUpperCase(),
      color: localColor,
      isCloudAuth: false
    };

    saveStoredAuthUser(updatedUser);
    onUserChange(updatedUser);
    onClose();
  };

  const handleCloudLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const result = await loginWithSupabaseAuth(email.trim(), password);
    setLoading(false);

    if (result.success && result.user) {
      onUserChange(result.user);
      onClose();
    } else {
      setErrorMsg(result.message || 'Login failed.');
    }
  };

  const handleSwitchToGuest = () => {
    const guestUser: AuthUser = {
      id: `usr-guest-${Math.random().toString(36).substring(2, 7)}`,
      name: 'Guest Collab',
      avatar: 'G',
      color: '#10B981',
      isCloudAuth: false
    };
    saveStoredAuthUser(guestUser);
    onUserChange(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <div className="flex items-center justify-between border-b border-appflowy-border pb-3 dark:border-appflowy-darkBorder">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-appflowy-text dark:text-appflowy-darkText">
                User Authentication & Profile
              </h2>
              <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                Unlimited local guest or Supabase cloud session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex rounded-lg border border-appflowy-border bg-appflowy-bg p-0.5 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg">
          <button
            type="button"
            onClick={() => setAuthTab('local')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              authTab === 'local'
                ? 'bg-appflowy-surface text-purple-600 shadow-2xs dark:bg-appflowy-darkSurface dark:text-purple-400'
                : 'text-appflowy-muted hover:text-appflowy-text dark:text-appflowy-darkMuted'
            }`}
          >
            Local Fast Login (0 Cost)
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('cloud')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              authTab === 'cloud'
                ? 'bg-appflowy-surface text-purple-600 shadow-2xs dark:bg-appflowy-darkSurface dark:text-purple-400'
                : 'text-appflowy-muted hover:text-appflowy-text dark:text-appflowy-darkMuted'
            }`}
          >
            Supabase Cloud Auth
          </button>
        </div>

        {authTab === 'local' ? (
          <form onSubmit={handleSaveLocalProfile} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                Display Name / Identity
              </label>
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Your username..."
                className="mt-1 h-8 w-full rounded border border-appflowy-border bg-appflowy-bg px-2.5 text-xs text-appflowy-text focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
              />
            </div>

            <div>
              <label className="block font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                Avatar Theme Color
              </label>
              <div className="mt-2 flex items-center gap-2">
                {PRESET_AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setLocalColor(c)}
                    style={{ backgroundColor: c }}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-white transition-transform ${
                      localColor === c ? 'scale-125 ring-2 ring-purple-400 ring-offset-1' : 'opacity-80'
                    }`}
                  >
                    {localColor === c && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 p-2.5 text-[11px] text-appflowy-muted dark:bg-neutral-900/50 dark:text-appflowy-darkMuted">
              Local accounts require zero credentials and operate offline with 0ms latency.
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSwitchToGuest}
                className="text-xs text-purple-600 hover:underline dark:text-purple-400"
              >
                Reset to Guest
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded px-3 py-1.5 text-xs text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-purple-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-purple-700"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCloudLogin} className="mt-4 space-y-4 text-xs">
            {errorMsg && (
              <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="mt-1 h-8 w-full rounded border border-appflowy-border bg-appflowy-bg px-2.5 text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
              />
            </div>

            <div>
              <label className="block font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 h-8 w-full rounded border border-appflowy-border bg-appflowy-bg px-2.5 text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
              />
            </div>

            <div className="rounded-lg bg-neutral-50 p-2.5 text-[11px] text-appflowy-muted dark:bg-neutral-900/50 dark:text-appflowy-darkMuted">
              Supabase Auth Free Tier supports up to 50,000 monthly active users at zero infrastructure cost.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded px-3 py-1.5 text-xs text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded bg-purple-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-purple-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Sign In Cloud</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
