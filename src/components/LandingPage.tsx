import React, { useState, useEffect, useRef } from 'react';
import {
  Kanban,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Sun,
  Moon,
  CheckSquare,
  Radio
} from '@phosphor-icons/react';
import { AuthUser } from '../types/board';
import { cn } from '../lib/cn';
import { PublicFooter } from './PublicFooter';
import { LandingPersonasSection } from './landing/LandingPersonasSection';
import { LandingDocsSection } from './landing/LandingDocsSection';
import { LandingViewsSection, PreviewViewMode, VIEW_STEPS } from './landing/LandingViewsSection';
import { LandingOpenSourceSection } from './landing/LandingOpenSourceSection';

interface LandingPageProps {
  currentUser: AuthUser | null;
  onEnterApp: () => void;
  onOpenAuth: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onEnterApp,
  onOpenAuth,
  isDark,
  onToggleTheme
}) => {
  const [personaTab, setPersonaTab] = useState<'personal' | 'product' | 'engineering'>('product');
  const [previewView, setPreviewView] = useState<PreviewViewMode>('board');
  const [viewScrollProgress, setViewScrollProgress] = useState(0);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const viewsSectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setShow3D(true), { timeout: 600 });
      return () => win.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(() => setShow3D(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroPaused(!entry.isIntersecting),
      { threshold: 0.01 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const section = viewsSectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScrollable = Math.max(1, rect.height - window.innerHeight);

      const inStickyZone = rect.top <= 40 && rect.bottom >= window.innerHeight * 0.65;
      setIsNavbarHidden(inStickyZone);

      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        const progress = Math.min(0.999, Math.max(0, -rect.top / totalScrollable));
        setViewScrollProgress(progress);
        const idx = Math.floor(progress * VIEW_STEPS.length);
        const nextView = VIEW_STEPS[idx]?.id;
        if (nextView) setPreviewView(nextView);
      } else if (rect.top > 0) {
        setViewScrollProgress(0);
      } else if (rect.bottom < window.innerHeight) {
        setViewScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('yuu-reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToViewStep = (idx: number, id: PreviewViewMode) => {
    setPreviewView(id);
    const section = viewsSectionRef.current;
    if (!section) return;
    const totalScrollable = Math.max(1, section.offsetHeight - window.innerHeight);
    const targetTop = section.offsetTop + (idx / VIEW_STEPS.length) * totalScrollable + 24;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B0D12] text-text flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-600">
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 px-4 pt-4 sm:px-6 pointer-events-none transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          isNavbarHidden ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
        )}
      >
        <div className="pointer-events-auto mx-auto max-w-6xl flex justify-between items-center px-4 h-14 rounded-2xl border shadow-lg backdrop-blur-md border-black/10 bg-white/85 text-[#0B0D12] dark:border-white/15 dark:bg-[#0B0D12]/80 dark:text-white transition-colors duration-200">
          <a href="#top" onClick={(e) => scrollToSection(e, 'top')} className="flex items-center gap-2.5 cursor-pointer">
            <img src="/icon.svg" alt="Yuumotion" className="w-8 h-8 rounded-xl ring-1 shadow-xs ring-black/10 dark:ring-white/25" />
            <span className="text-base font-bold tracking-tight font-display">
              Yuumotion
            </span>
          </a>

          <nav className="hidden gap-7 items-center text-xs font-semibold md:flex text-slate-700 dark:text-slate-200">
            <a
              href="#personas"
              onClick={(e) => scrollToSection(e, 'personas')}
              className="transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Solusi Tim
            </a>
            <a
              href="#docs"
              onClick={(e) => scrollToSection(e, 'docs')}
              className="transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Dokumen &amp; Sync
            </a>
            <a
              href="#views"
              onClick={(e) => scrollToSection(e, 'views')}
              className="transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Multi-View
            </a>
            <a
              href="#open-source"
              onClick={(e) => scrollToSection(e, 'open-source')}
              className="transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Open-Source
            </a>
          </nav>

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-slate-100/80 text-slate-800 hover:bg-slate-200 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-[background-color,transform] duration-150 active:scale-[0.95] cursor-pointer"
              title="Ganti Tema Aplikasi"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B0D12] dark:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97] cursor-pointer"
            >
              <span>{currentUser ? 'Buka Workspace' : 'Masuk'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={heroRef}
        className={cn(
          'relative overflow-hidden bg-gradient-to-b from-[#6BB5FF] via-[#2563EB] to-[#1D4ED8] text-white',
          isHeroPaused && 'yuu-hero-paused'
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.28),transparent_46%),radial-gradient(circle_at_80%_25%,rgba(191,219,254,0.26),transparent_44%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:32px_32px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-24 top-0 h-[420px] opacity-45 bg-[linear-gradient(115deg,transparent_28%,rgba(255,255,255,0.26)_46%,transparent_64%)] animate-yuu-hero-beam"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[40%] h-[680px] w-[680px] rounded-full border border-dashed border-white/20 animate-yuu-hero-orbit"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[40%] h-[440px] w-[440px] rounded-full border border-white/15 animate-yuu-hero-orbit"
          style={{ animationDuration: '28s', animationDirection: 'reverse' }}
        />
        {[
          { top: '16%', left: '14%', size: 'h-2 w-2', delay: '0s', dur: '6s', alt: false },
          { top: '26%', left: '84%', size: 'h-2.5 w-2.5', delay: '-1.8s', dur: '7s', alt: true },
          { top: '48%', left: '10%', size: 'h-1.5 w-1.5', delay: '-3.1s', dur: '5.5s', alt: false },
          { top: '54%', left: '88%', size: 'h-2 w-2', delay: '-2.4s', dur: '7.2s', alt: true },
          { top: '20%', left: '68%', size: 'h-1.5 w-1.5', delay: '-4.2s', dur: '6.2s', alt: false },
          { top: '38%', left: '24%', size: 'h-2 w-2', delay: '-0.9s', dur: '6.8s', alt: true },
          { top: '14%', left: '46%', size: 'h-1.5 w-1.5', delay: '-2.1s', dur: '5.8s', alt: false }
        ].map((p, idx) => (
          <span
            key={idx}
            aria-hidden="true"
            style={{ top: p.top, left: p.left, animationDelay: p.delay, animationDuration: p.dur }}
            className={cn(
              'pointer-events-none absolute rounded-full bg-white/75',
              p.alt ? 'animate-yuu-hero-float-alt' : 'animate-yuu-hero-float',
              p.size
            )}
          />
        ))}

        <section className="relative z-20 px-4 pt-28 mx-auto max-w-5xl text-center sm:px-6 sm:pt-32">
          <h1 className="animate-yuu-enter mx-auto max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[54px] lg:leading-[1.08] text-balance">
            Satu Ruang Kerja untuk Kanban, Timeline, dan Dokumen Tim
          </h1>

          <p
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed animate-yuu-enter text-white/90 sm:text-base"
            style={{ animationDelay: '80ms' }}
          >
            Papan Kanban multi-view, editor dokumen TipTap dengan daftar isi sticky, serta backend Hono + MySQL/TiDB open-source yang siap di-host sendiri.
          </p>

          <div
            className="animate-yuu-enter mx-auto mt-7 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/20 p-1.5 backdrop-blur-md shadow-xl"
            style={{ animationDelay: '140ms' }}
          >
            <button
              type="button"
              onClick={onOpenAuth}
              className="rounded-xl px-4 py-2 text-xs font-medium text-white transition-[background-color] duration-150 hover:bg-white/15 cursor-pointer"
            >
              Masuk / Atur Profil
            </button>
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B0D12] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97] cursor-pointer"
            >
              <span>Mulai Workspace Gratis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div
            className="grid relative grid-cols-1 gap-4 items-end mx-auto mt-20 max-w-5xl text-left animate-yuu-enter sm:grid-cols-3"
            style={{ animationDelay: '200ms' }}
          >
            <div className="hidden sm:block rounded-t-2xl border border-white/40 dark:border-white/15 bg-white/95 dark:bg-[#141720]/95 p-5 text-slate-900 dark:text-slate-100 shadow-2xl">
              <div className="flex gap-2 items-center mb-3">
                <div className="flex justify-center items-center w-7 h-7 text-blue-600 bg-blue-100 rounded-lg dark:text-blue-400 dark:bg-blue-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold font-display">Dokumen PRD</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="rounded-lg bg-slate-100 dark:bg-white/10 px-2.5 py-1.5 font-medium text-slate-900 dark:text-slate-100">
                  /callout Tips Arsitektur
                </div>
                <div className="flex gap-2 items-center">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Export Markdown (.md)</span>
                </div>
                <div className="flex gap-2 items-center">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Outline Daftar Isi Sticky</span>
                </div>
              </div>
            </div>

            <div className="rounded-t-2xl border border-white/60 dark:border-white/15 bg-white dark:bg-[#141720] p-6 text-slate-900 dark:text-slate-100 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.35)] sm:-mt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                  <Kanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-bold font-display">Roadmap Q4</span>
                </div>
                <span className="rounded-full bg-blue-50 dark:bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-300">
                  YUU-108
                </span>
              </div>
              <p className="mb-3 text-xs font-semibold text-slate-800 dark:text-slate-100">
                Multi-View Sync, WIP Limit &amp; Recurring Tasks
              </p>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="rounded-md bg-blue-50 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  #frontend
                </span>
                <span className="rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                  #backend
                </span>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-white/10">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Progres</span>
                  <span>85%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div className="h-full w-[85%] rounded-full bg-blue-600 dark:bg-blue-400" />
                </div>
              </div>
            </div>

            <div className="hidden sm:block rounded-t-2xl border border-white/40 dark:border-white/15 bg-white/95 dark:bg-[#141720]/95 p-5 text-slate-900 dark:text-slate-100 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold font-display">Realtime &amp; OAuth</span>
                <Radio className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex mb-3 -space-x-2">
                {['Y', 'A', 'C'].map((ch, idx) => (
                  <div
                    key={ch}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-[#141720] text-[10px] font-bold text-white',
                      idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-slate-900' : 'bg-blue-400'
                    )}
                  >
                    {ch}
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-500/15 px-2.5 py-1.5 font-mono text-[10px] font-medium text-blue-700 dark:text-blue-300">
                Hono SSE + GitHub/Google OAuth
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="flex-1">
        <LandingPersonasSection
          personaTab={personaTab}
          setPersonaTab={setPersonaTab}
          onEnterApp={onEnterApp}
        />

        <LandingDocsSection />

        <LandingViewsSection
          viewsSectionRef={viewsSectionRef}
          previewView={previewView}
          viewScrollProgress={viewScrollProgress}
          onSelectStep={scrollToViewStep}
        />

        <LandingOpenSourceSection show3D={show3D} />
      </main>

      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#60A5FA] via-35% to-[#0B45D6] dark:from-[#0B0D12] dark:via-[#1D4ED8] dark:via-40% dark:to-[#0B3AB5]">
        <section data-reveal className="yuu-reveal px-4 pt-20 pb-24 mx-auto max-w-4xl text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B0D12] dark:text-white sm:text-5xl leading-[1.12] text-balance">
            Dirancang untuk <span className="font-serif italic font-normal">tim yang serius</span>{' '}
            membangun produk.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-xs sm:text-sm text-[#3F424A] dark:text-white/85 leading-relaxed">
            Dari catatan cepat hingga roadmap peluncuran berskala besar, mulai tata ruang kerja Yuumotion dalam hitungan detik.
          </p>

          <div className="flex justify-center items-center mt-7">
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-xs font-semibold text-white shadow-[0_12px_28px_-6px_rgba(37,99,235,0.55)] transition-[transform,opacity] duration-150 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.97] cursor-pointer"
            >
              <span>{currentUser ? 'Buka Dashboard' : 'Mulai Workspace Gratis'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <PublicFooter
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onEnterApp={onEnterApp}
          onOpenAuth={onOpenAuth}
        />
      </div>
    </div>
  );
};
