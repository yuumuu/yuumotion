import React, { useState } from 'react';
import {
  Kanban,
  Users,
  Sun,
  Moon,
  PaperPlaneTilt,
  CheckCircle,
  GithubLogo
} from '@phosphor-icons/react';

export const GITHUB_REPO_URL = 'https://github.com/yuumuu/yuumotion';

interface PublicFooterProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
  onEnterApp?: () => void;
  onOpenAuth?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  isDark = false,
  onToggleTheme,
  onEnterApp,
  onOpenAuth
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setEmailInput('');
  };

  return (
    <footer className="px-4 pt-10 pb-8 mx-auto max-w-6xl text-white sm:px-6">
      <div className="flex flex-col gap-10 justify-between pb-12 md:flex-row md:items-start">
        <div className="space-y-4 max-w-xs">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="Yuumotion" className="h-7 w-7 rounded-lg shadow-xs ring-1 ring-white/25" />
            <span className="text-lg font-bold tracking-tight font-display">Yuumotion</span>
          </div>
          <p className="text-xs leading-relaxed text-white/85">
            Ruang kerja hibrida open-source untuk ketenangan dokumen dan ketajaman alur tugas tim. Berlisensi Apache 2.0.
          </p>
          <div className="flex items-center gap-2.5 pt-1">
            {onEnterApp && (
              <button
                type="button"
                onClick={onEnterApp}
                className="flex justify-center items-center w-8 h-8 text-white rounded-full border transition-colors cursor-pointer border-white/25 bg-white/10 hover:bg-white/20"
                title="Buka Workspace"
              >
                <Kanban className="h-3.5 w-3.5" />
              </button>
            )}
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex justify-center items-center w-8 h-8 text-white rounded-full border transition-colors cursor-pointer border-white/25 bg-white/10 hover:bg-white/20"
                title="Kelola Akun"
              >
                <Users className="h-3.5 w-3.5" />
              </button>
            )}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex justify-center items-center w-8 h-8 text-white rounded-full border transition-colors cursor-pointer border-white/25 bg-white/10 hover:bg-white/20"
                title="Ganti Tema"
              >
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            )}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center w-8 h-8 text-white rounded-full border transition-colors border-white/25 bg-white/10 hover:bg-white/20"
              title="Repositori GitHub Yuumotion"
            >
              <GithubLogo className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-2.5">
          <div className="text-xs font-semibold text-white">
            Berlangganan pembaruan rilis
          </div>
          {subscribed ? (
            <div className="flex gap-2 items-center px-4 py-3 text-xs font-medium text-white rounded-xl border backdrop-blur-sm border-white/30 bg-white/15">
              <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Terima kasih! Email kamu telah tercatat.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Alamat Email"
                className="w-full rounded-xl border border-white/25 bg-white/15 px-3.5 py-2.5 text-xs text-white placeholder:text-white/70 focus:border-white focus:outline-none backdrop-blur-sm"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-semibold text-[#0B45D6] shadow-md transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.98] cursor-pointer"
              >
                <PaperPlaneTilt className="h-3.5 w-3.5" />
                <span>Langganan</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex overflow-hidden gap-4 justify-center items-center pt-4 mt-4 select-none sm:gap-7">
        <img
          src="/icon.svg"
          alt="Yuumotion"
          className="h-14 w-14 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl shadow-2xl ring-2 ring-white/30 shrink-0"
        />
        <span className="font-display text-[clamp(3.25rem,11vw,8.5rem)] font-extrabold leading-none tracking-tight text-white">
          Yuumotion
        </span>
      </div>
    </footer>
  );
};
