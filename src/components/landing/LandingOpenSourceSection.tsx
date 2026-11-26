import React, { Suspense } from 'react';
import { GithubLogo, ArrowUpRight } from '@phosphor-icons/react';
import { GITHUB_REPO_URL } from '../PublicFooter';

const Landing3DCanvas = React.lazy(() => import('../Landing3DCanvas'));

interface LandingOpenSourceSectionProps {
  show3D: boolean;
}

export const LandingOpenSourceSection: React.FC<LandingOpenSourceSectionProps> = ({ show3D }) => {
  return (
    <section id="open-source" className="relative overflow-hidden bg-[#0B0D12] text-white py-28 sm:py-36 border-b border-white/10">
      <div className="absolute inset-0 pointer-events-none">
        {show3D && (
          <Suspense fallback={null}>
            <Landing3DCanvas isDark={true} />
          </Suspense>
        )}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B0D12] via-[#0B0D12]/75 via-40% to-transparent"
      />

      <div data-reveal className="yuu-reveal relative z-10 px-4 mx-auto max-w-6xl sm:px-6">
        <div className="space-y-5 max-w-lg">
          <h2 className="text-3xl font-bold tracking-tight leading-tight font-display sm:text-5xl">
            Arsitektur Terbuka,{' '}
            <span className="font-serif italic font-normal text-blue-400">Siap Diperluas</span>
          </h2>
          <p className="text-xs leading-relaxed sm:text-sm text-slate-300">
            Dibangun dalam satu repositori dengan frontend React + Vite dan backend Hono + Drizzle ORM untuk MySQL/TiDB di Wasmer Edge. Berlisensi Apache 2.0.
          </p>
          <div className="pt-2">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.97]"
            >
              <GithubLogo className="w-4 h-4" />
              <span>Beri Bintang &amp; Lihat Repo</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
