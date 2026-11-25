import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Kanban,
  FileText,
  Lightning,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Sun,
  Moon,
  Stack,
  Database,
  Table as TableIcon,
  CalendarBlank,
  Clock,
  Compass,
  Code,
  CheckSquare,
  Info,
  Radio,
  Sparkle,
  Users,
  GithubLogo
} from '@phosphor-icons/react';
import { AuthUser } from '../types/board';
import { cn } from '../lib/cn';
import { PublicFooter, GITHUB_REPO_URL } from './PublicFooter';

const Landing3DCanvas = React.lazy(() => import('./Landing3DCanvas'));

interface LandingPageProps {
  currentUser: AuthUser | null;
  onEnterApp: () => void;
  onOpenAuth: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

type PersonaTab = 'personal' | 'product' | 'engineering';
type PreviewViewMode = 'board' | 'table' | 'calendar' | 'timeline';

function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onEnterApp,
  onOpenAuth,
  isDark,
  onToggleTheme
}) => {
  const [personaTab, setPersonaTab] = useState<PersonaTab>('product');
  const [previewView, setPreviewView] = useState<PreviewViewMode>('board');

  const sec1 = useRevealOnScroll();
  const sec2 = useRevealOnScroll();
  const sec3 = useRevealOnScroll();
  const sec4 = useRevealOnScroll();

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#111113] text-text flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-600">
      {/* 1. Sky-Blue Volumetric Hero + Floating Glassmorphism Navbar */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#6BB5FF] via-[#2F80ED] to-[#1D63FF] text-white">
        {/* Diagonal Soft Light Rays */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-45 bg-[linear-gradient(125deg,rgba(255,255,255,0.28)_0%,transparent_42%,rgba(255,255,255,0.16)_64%,transparent_88%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-white/20 blur-3xl"
        />

        {/* Floating Glassmorphism Navbar */}
        <header className="relative z-30 px-4 pt-5 mx-auto max-w-6xl sm:px-6">
          <div className="flex justify-between items-center px-4 h-14 rounded-2xl border shadow-lg backdrop-blur-md border-white/25 bg-slate-950/25">
            <a href="#top" className="flex items-center gap-2.5">
              <img src="/icon.svg" alt="Yuumotion" className="h-8 w-8 rounded-xl shadow-xs ring-1 ring-white/25" />
              <span className="text-base font-bold tracking-tight text-white font-display">
                Yuumotion
              </span>
            </a>

            <nav className="hidden gap-7 items-center text-xs font-semibold md:flex text-white/95">
              <a href="#personas" className="transition-colors duration-150 hover:text-blue-200">
                Solusi Tim
              </a>
              <a href="#docs" className="transition-colors duration-150 hover:text-blue-200">
                Dokumen PRD
              </a>
              <a href="#views" className="transition-colors duration-150 hover:text-blue-200">
                Multi-View
              </a>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-blue-200"
              >
                <GithubLogo className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>
            </nav>

            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-[background-color,transform] duration-150 hover:bg-white/20 active:scale-[0.95] cursor-pointer"
                title="Ganti Tema Aplikasi"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97] cursor-pointer"
              >
                <span>{currentUser ? 'Buka Workspace' : 'Masuk'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Copy & Inline Pill CTA */}
        <section className="relative z-20 px-4 pt-14 mx-auto max-w-5xl text-center sm:px-6 sm:pt-20">
          <div
            className="animate-yuu-enter inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1 font-mono text-[11px] font-medium text-white backdrop-blur-sm"
            style={{ animationDelay: '0ms' }}
          >
            <Sparkle className="h-3.5 w-3.5 text-white" />
            <span>Workspace Hibrida Offline-First • v0.2 Edge</span>
          </div>

          <h1
            className="animate-yuu-enter mx-auto mt-5 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[54px] lg:leading-[1.08] text-balance"
            style={{ animationDelay: '60ms' }}
          >
            Kelola Tugas dan Dokumen Tim Lebih Cepat, dengan Yuumotion
          </h1>

          <p
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed animate-yuu-enter text-white/85 sm:text-base"
            style={{ animationDelay: '120ms' }}
          >
            Satukan ketajaman papan Kanban dengan ketenangan editor dokumen TipTap. Sinkron instan antar perangkat tanpa biaya server bulanan.
          </p>

          {/* Inline Pill CTA Bar (ala Gambar 1) */}
          <div
            className="animate-yuu-enter mx-auto mt-7 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/20 p-1.5 backdrop-blur-md shadow-xl"
            style={{ animationDelay: '180ms' }}
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97] cursor-pointer"
            >
              <span>Mulai Workspace Gratis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 3 Floating Product UI Cards (mendukung Light & Dark mode) */}
          <div
            className="grid relative grid-cols-1 gap-4 items-end mx-auto mt-20 max-w-5xl text-left animate-yuu-enter sm:grid-cols-3"
            style={{ animationDelay: '240ms' }}
          >
            {/* Floating Left Card: TipTap Doc */}
            <div className="hidden sm:block rounded-t-2xl border border-white/40 dark:border-white/15 bg-white/95 dark:bg-[#141720]/95 p-5 text-slate-800 dark:text-slate-100 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
              <div className="flex gap-2 items-center mb-3">
                <div className="flex justify-center items-center w-7 h-7 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold font-display">Dokumen PRD</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="rounded-lg bg-slate-100 dark:bg-white/10 px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-100">
                  /callout Tips Arsitektur
                </div>
                <div className="flex gap-2 items-center">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sinkronisasi Offline PWA</span>
                </div>
                <div className="flex gap-2 items-center">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Outline Daftar Isi Sticky</span>
                </div>
              </div>
            </div>

            {/* Floating Center Hero Card: Elevated Roadmap Board */}
            <div className="rounded-t-2xl border border-white/60 dark:border-white/15 bg-white dark:bg-[#141720] p-6 text-slate-900 dark:text-slate-100 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.35)] sm:-mt-6 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                  <Kanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-bold font-display">Roadmap Q4</span>
                </div>
                <span className="rounded-full bg-blue-50 dark:bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-300">
                  YUU-108
                </span>
              </div>
              <p className="mb-3 text-xs font-semibold text-slate-800 dark:text-slate-100">
                Peluncuran Multi-View Engine &amp; ClickUp Drag Physics
              </p>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="rounded-md bg-sky-100 dark:bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                  #frontend
                </span>
                <span className="rounded-md bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  #design
                </span>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-white/10">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Progres</span>
                  <span>80%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-blue-600 dark:bg-blue-400" />
                </div>
              </div>
            </div>

            {/* Floating Right Card: Realtime Sync */}
            <div className="hidden sm:block rounded-t-2xl border border-white/40 dark:border-white/15 bg-white/95 dark:bg-[#141720]/95 p-5 text-slate-800 dark:text-slate-100 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold font-display">Realtime Presence</span>
                <Radio className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="flex mb-3 -space-x-2">
                {['Y', 'A', 'C'].map((ch, idx) => (
                  <div
                    key={ch}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-[#141720] text-[10px] font-bold text-white',
                      idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                    )}
                  >
                    {ch}
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1.5 font-mono text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                0ms BroadcastChannel Active
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 2. 4 Highlight Nilai Produk Ringkas */}
      <section className="py-10 border-b border-border bg-surface">
        <div className="px-4 mx-auto max-w-6xl sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <Database className="h-4 w-4 text-[#1D63FF]" />,
                title: 'Offline-First Lokal',
                desc: 'Tetap produktif tanpa internet, seluruh perubahan tersimpan aman di perangkat.'
              },
              {
                icon: <Lightning className="h-4 w-4 text-emerald-500" />,
                title: 'Sinkron Instan 0ms',
                desc: 'Pembaruan seketika antar tab dan perangkat tim secara real-time.'
              },
              {
                icon: <Stack className="h-4 w-4 text-violet-500" />,
                title: 'Multi-View 4-in-1',
                desc: 'Kanban, Tabel, Kalender, dan Gantt Timeline dari satu sumber data.'
              },
              {
                icon: <ShieldCheck className="h-4 w-4 text-amber-500" />,
                title: 'Kontrol Akses RBAC',
                desc: 'Atur hak akses Owner, Admin, Member, hingga Viewer read-only.'
              }
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-bg p-4 shadow-2xs"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xs font-bold text-text">{item.title}</div>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* 3. Section 1: 3-Persona Cards with Highlighted Center (ala Gambar 1) */}
        <section id="personas" className="py-20 sm:py-24">
          <div
            ref={sec1.ref}
            className={cn(
              'mx-auto max-w-6xl px-4 sm:px-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              sec1.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1D63FF]">
                <Sparkle className="w-3 h-3" />
                <span>Dirancang Fleksibel</span>
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight font-display text-text sm:text-4xl text-balance">
                Ruang Kerja Paling Andal untuk{' '}
                <span className="text-[#1D63FF]">Semua Skala Tim</span>
              </h2>

              {/* 3 Persona Tabs */}
              <div className="inline-flex p-1 mt-6 rounded-xl border border-border bg-surface shadow-2xs">
                {(
                  [
                    { id: 'personal', label: 'Kreator Mandiri' },
                    { id: 'product', label: 'Tim Produk' },
                    { id: 'engineering', label: 'Engineering' }
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPersonaTab(t.id)}
                    className={cn(
                      'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-[background-color,color] duration-150 cursor-pointer',
                      personaTab === t.id
                        ? 'bg-[#1D63FF] text-white shadow-xs'
                        : 'text-muted hover:text-text'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Cards Grid (Active Card Changes Dynamically Based on Selected Tab) */}
            <div className="grid grid-cols-1 gap-6 items-center mt-12 md:grid-cols-3">
              {[
                {
                  id: 'personal' as PersonaTab,
                  icon: <Compass className="w-5 h-5" />,
                  title: 'Kreator & Freelancer',
                  desc: 'Kelola daftar proyek klien, catatan ide, dan tenggat waktu dalam satu papan lokal tanpa perlu koneksi internet terus-menerus.',
                  cta: 'Mulai Mandiri'
                },
                {
                  id: 'product' as PersonaTab,
                  icon: <Kanban className="w-5 h-5" />,
                  title: 'Tim Produk & Desain',
                  desc: 'Gabungkan spesifikasi PRD TipTap dengan alur sprint Kanban taktil. Beralih ke Kalender atau Gantt Timeline dalam sekali klik.',
                  cta: 'Buka Workspace Tim'
                },
                {
                  id: 'engineering' as PersonaTab,
                  icon: <Code className="w-5 h-5" />,
                  title: 'Tim Engineering',
                  desc: 'Blok kode syntax, ekspor SQL ke MySQL/SQLite lokal, serta deployment instan di Wasmer Edge CDN tanpa setup backend rumit.',
                  cta: 'Lihat Arsitektur'
                }
              ].map((card) => {
                const isSelected = personaTab === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => setPersonaTab(card.id)}
                    className={cn(
                      'rounded-2xl transition-[transform,box-shadow,background-color,border-color] duration-200 cursor-pointer',
                      isSelected
                        ? 'bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] p-8 text-white shadow-[0_20px_50px_-12px_rgba(37,99,235,0.45)] md:-my-3 hover:-translate-y-1'
                        : 'border border-border bg-surface p-7 shadow-card-sm hover:-translate-y-0.5 hover:shadow-card-hover'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-xl mb-5',
                        isSelected
                          ? 'w-11 h-11 bg-white/20 text-white backdrop-blur-sm'
                          : 'w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-[#1D63FF]'
                      )}
                    >
                      {card.icon}
                    </div>
                    <h3
                      className={cn(
                        'mb-2 font-display font-bold',
                        isSelected ? 'text-xl text-white' : 'text-lg text-text'
                      )}
                    >
                      {card.title}
                    </h3>
                    <p
                      className={cn(
                        'mb-6 text-xs leading-relaxed',
                        isSelected ? 'text-white/85' : 'text-muted'
                      )}
                    >
                      {card.desc}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEnterApp();
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-transform duration-150',
                        isSelected
                          ? 'rounded-xl bg-white px-4 py-2.5 text-[#1D4ED8] shadow-md hover:scale-[1.02] active:scale-[0.98]'
                          : 'text-[#1D63FF] hover:underline'
                      )}
                    >
                      <span>{card.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Section 2: Centered TipTap Docs Showcase (ala Gambar 1) */}
        <section id="docs" className="py-20 border-t border-border bg-surface/50 sm:py-24">
          <div
            ref={sec2.ref}
            className={cn(
              'mx-auto max-w-5xl px-4 sm:px-6 text-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              sec2.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1D63FF]">
              <FileText className="w-3 h-3" />
              <span>Ekosistem Dokumen TipTap</span>
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight font-display text-text sm:text-4xl text-balance">
              Catatan Terstruktur yang{' '}
              <span className="text-[#1D63FF]">Selalu Terhubung</span> dengan Tugas
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-muted">
              Ketik perintah slash (/) untuk menyisipkan checklist, blok kode, atau callout pastel yang rapi dalam hitungan detik.
            </p>

            {/* Centered Large Showcase Card */}
            <div className="p-6 mx-auto mt-10 max-w-2xl text-left rounded-2xl border shadow-xl border-border bg-surface">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-border">
                <div className="flex gap-3 items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D63FF] text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold font-display text-text">
                      Spesifikasi Produk &amp; Edge Sync
                    </div>
                    <div className="font-mono text-[10px] text-muted">
                      Diperbarui otomatis secara lokal
                    </div>
                  </div>
                </div>
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Tersimpan
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
                <div className="p-3 text-xs rounded-xl border border-border bg-bg">
                  <div className="font-mono text-[10px] text-muted mb-1">Perintah Cepat</div>
                  <div className="font-semibold text-text">/todo, /code, /callout</div>
                </div>
                <div className="p-3 text-xs rounded-xl border border-border bg-bg">
                  <div className="font-mono text-[10px] text-muted mb-1">Kontrol Akses</div>
                  <div className="font-semibold text-text">Owner, Member, Viewer Lock</div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 p-3.5 flex items-start gap-2.5 text-xs text-text">
                <Info className="h-4 w-4 text-[#1D63FF] shrink-0 mt-0.5" />
                <span>
                  Setiap dokumen mendukung mode baca terpusat (740px) maupun lebar penuh dengan Daftar Isi (TOC) otomatis.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Section 3: Hub-and-Spoke Realtime Sync Diagram (ala Gambar 1) */}
        <section id="sync" className="py-20 border-t border-border sm:py-24">
          <div
            ref={sec3.ref}
            className={cn(
              'mx-auto max-w-6xl px-4 sm:px-6 text-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              sec3.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1D63FF]">
              <Radio className="w-3 h-3" />
              <span>Keamanan &amp; Sinkronisasi</span>
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight font-display text-text sm:text-4xl text-balance">
              Data Aman di Perangkat,{' '}
              <span className="text-[#1D63FF]">Sinkron Setiap Saat</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-muted">
              Kombinasi BroadcastChannel lokal (0ms) dan Supabase Realtime memastikan tim selalu berada di halaman yang sama.
            </p>

            {/* Hub-and-Spoke Layout */}
            <div className="grid grid-cols-1 gap-6 items-center mt-12 md:grid-cols-12">
              <div className="space-y-4 md:col-span-3">
                <div className="flex gap-3 items-center p-4 text-left rounded-2xl border border-border bg-surface shadow-card-sm">
                  <div className="flex justify-center items-center w-8 h-8 text-xs font-bold text-emerald-600 rounded-full bg-emerald-500/15">
                    <Lightning className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text">Tab Lokal 0ms</div>
                    <div className="font-mono text-[10px] text-muted">BroadcastChannel</div>
                  </div>
                </div>
                <div className="flex gap-3 items-center p-4 text-left rounded-2xl border border-border bg-surface shadow-card-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-[#1D63FF] font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text">RBAC Guardrails</div>
                    <div className="font-mono text-[10px] text-muted">Viewer Read-Only</div>
                  </div>
                </div>
              </div>

              {/* Center Hub Card */}
              <div className="md:col-span-6">
                <div className="rounded-2xl border-2 border-[#1D63FF]/30 bg-surface p-6 shadow-xl">
                  <div className="flex justify-between items-center pb-3 mb-4 border-b border-border">
                    <div className="flex gap-2 items-center">
                      <img src="/icon.svg" alt="Yuumotion" className="w-6 h-6 rounded-md" />
                      <span className="text-sm font-bold font-display text-text">
                        Yuumotion Sync Engine
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600">
                      Online
                    </span>
                  </div>
                  <div className="mb-1 text-2xl font-extrabold font-display text-text">
                    100% Offline-First
                  </div>
                  <p className="mb-4 text-xs text-muted">
                    Tetap bekerja tanpa internet; perubahan otomatis dikirim saat koneksi kembali tersambung.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-xl border bg-bg border-border">
                      <div className="font-mono text-[10px] text-muted">Cadangan</div>
                      <div className="text-xs font-semibold text-text">JSON &amp; SQL Dump</div>
                    </div>
                    <div className="p-3 rounded-xl border bg-bg border-border">
                      <div className="font-mono text-[10px] text-muted">Hosting</div>
                      <div className="text-xs font-semibold text-text">Wasmer Edge CDN</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:col-span-3">
                <div className="flex gap-3 items-center p-4 text-left rounded-2xl border border-border bg-surface shadow-card-sm">
                  <div className="flex justify-center items-center w-8 h-8 text-xs font-bold text-violet-600 rounded-full bg-violet-500/15">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text">Kolaborasi Live</div>
                    <div className="font-mono text-[10px] text-muted">Supabase Realtime</div>
                  </div>
                </div>
                <div className="flex gap-3 items-center p-4 text-left rounded-2xl border border-border bg-surface shadow-card-sm">
                  <div className="flex justify-center items-center w-8 h-8 text-xs font-bold text-amber-600 rounded-full bg-amber-500/15">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text">Database Bridge</div>
                    <div className="font-mono text-[10px] text-muted">MySQL &amp; SQLite</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Section 4: Split Layout Multi-View Engine (ala Gambar 1) */}
        <section id="views" className="py-20 border-t border-border bg-surface/50 sm:py-24">
          <div
            ref={sec4.ref}
            className={cn(
              'mx-auto max-w-6xl px-4 sm:px-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              sec4.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <div className="grid grid-cols-1 gap-10 items-center lg:grid-cols-12 lg:gap-12">
              <div className="space-y-5 lg:col-span-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1D63FF]">
                  <Stack className="w-3 h-3" />
                  <span>Multi-View Engine</span>
                </span>
                <h2 className="text-2xl font-bold tracking-tight font-display text-text sm:text-4xl text-balance">
                  Satu Sumber Data dalam{' '}
                  <span className="text-[#1D63FF]">Hitungan Detik</span>
                </h2>
                <p className="text-sm leading-relaxed text-muted">
                  Lihat papan yang sama sebagai kolom Kanban, tabel Spreadsheet, kalender bulanan, maupun jadwal Gantt Timeline tanpa menyalin data ulang.
                </p>

                {/* 4 Interactive View Pills */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {(
                    [
                      { id: 'board', label: 'Kanban Board', icon: <Kanban className="h-3.5 w-3.5" /> },
                      { id: 'table', label: 'Tabel Data', icon: <TableIcon className="h-3.5 w-3.5" /> },
                      { id: 'calendar', label: 'Kalender', icon: <CalendarBlank className="h-3.5 w-3.5" /> },
                      { id: 'timeline', label: 'Gantt Timeline', icon: <Clock className="h-3.5 w-3.5" /> }
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setPreviewView(v.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] cursor-pointer',
                        previewView === v.id
                          ? 'border-[#1D63FF] bg-[#1D63FF]/10 text-[#1D63FF]'
                          : 'border-border bg-surface text-muted hover:text-text'
                      )}
                    >
                      {v.icon}
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xl min-h-[260px]">
                  <div key={previewView} className="animate-yuu-crossfade">
                    {previewView === 'board' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[
                          { col: 'To Do', bg: 'bg-sky-50 dark:bg-sky-950/30', item: 'YUU-11: Audit Kontras AA' },
                          { col: 'In Progress', bg: 'bg-amber-50 dark:bg-amber-950/30', item: 'YUU-13: ClickUp Drag Physics' },
                          { col: 'Done', bg: 'bg-emerald-50 dark:bg-emerald-950/30', item: 'YUU-10: Phosphor Icons' }
                        ].map((c) => (
                          <div key={c.col} className="rounded-xl border border-border bg-bg p-3 space-y-2.5">
                            <div className="text-xs font-bold text-text">{c.col}</div>
                            <div className={cn('rounded-xl border border-border/70 p-3 text-xs font-medium text-text', c.bg)}>
                              {c.item}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {previewView === 'table' && (
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted font-mono text-[11px]">
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Tugas</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="py-2.5 px-3 font-mono text-muted">YUU-10</td>
                            <td className="py-2.5 px-3 font-medium">Migrasi Phosphor Icons</td>
                            <td className="py-2.5 px-3"><span className="rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-600 font-semibold">Done</span></td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-mono text-muted">YUU-13</td>
                            <td className="py-2.5 px-3 font-medium">ClickUp Drag &amp; Drop</td>
                            <td className="py-2.5 px-3"><span className="rounded bg-blue-500/15 px-2 py-0.5 text-[#1D63FF] font-semibold">In Progress</span></td>
                          </tr>
                        </tbody>
                      </table>
                    )}

                    {previewView === 'calendar' && (
                      <div className="grid grid-cols-7 gap-2 text-xs text-center">
                        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
                          <div key={d} className="font-mono text-[10px] text-muted">{d}</div>
                        ))}
                        {[23, 24, 25, 26, 27, 28, 29].map((date) => (
                          <div
                            key={date}
                            className={cn(
                              'rounded-xl border border-border p-2 min-h-[68px] text-left',
                              date === 25 ? 'border-[#1D63FF] bg-[#1D63FF]/10' : 'bg-bg'
                            )}
                          >
                            <span className="font-mono text-[10px] font-bold">{date}</span>
                            {date === 25 && (
                              <div className="mt-1 rounded bg-[#1D63FF] px-1 py-0.5 text-[9px] text-white truncate">
                                YUU-13
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {previewView === 'timeline' && (
                      <div className="py-3 space-y-3">
                        {[
                          { id: 'YUU-10', label: 'Phosphor Icons', left: '5%', width: '35%', color: 'bg-emerald-500' },
                          { id: 'YUU-13', label: 'ClickUp Drag Physics', left: '30%', width: '48%', color: 'bg-[#1D63FF]' },
                          { id: 'YUU-14', label: 'Wasmer Deploy', left: '62%', width: '33%', color: 'bg-amber-500' }
                        ].map((bar) => (
                          <div key={bar.id} className="flex gap-3 items-center text-xs">
                            <span className="w-16 font-mono text-[10px] text-muted">{bar.id}</span>
                            <div className="flex relative flex-1 items-center h-7 rounded-lg border bg-bg border-border">
                              <div
                                className={cn('absolute h-5 rounded-md px-2 text-[10px] font-medium text-white flex items-center', bar.color)}
                                style={{ left: bar.left, width: bar.width }}
                              >
                                <span className="truncate">{bar.label}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 3D Interactive Visual & Open-Source Repo CTA */}
      <section className="py-16 border-b border-border bg-bg">
        <div className="px-4 mx-auto max-w-6xl sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] font-semibold text-project-solid">
              <Code className="h-3.5 w-3.5" />
              <span>Open-Source • Apache 2.0</span>
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text leading-tight">
              Arsitektur Terbuka, <span className="font-serif italic font-normal">Dibangun untuk Diperluas</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Yuumotion tersedia sebagai proyek open-source dengan frontend React + Vite dan backend Hono + Drizzle MySQL/TiDB siap Wasmer Edge. Jelajahi kode sumber, fork, atau kontribusi fitur langsung di GitHub.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-project-solid px-5 py-2.5 text-xs font-semibold text-white shadow-tactile-btn transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.97]"
              >
                <GithubLogo className="h-4 w-4" />
                <span>Beri Bintang &amp; Lihat Repo</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <span>Coba Demo Langsung</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface/80 p-4 shadow-card-sm overflow-hidden">
            <Suspense
              fallback={
                <div className="flex h-[280px] sm:h-[320px] items-center justify-center text-xs text-muted font-mono">
                  Memuat kanvas 3D...
                </div>
              }
            >
              <Landing3DCanvas isDark={isDark} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* 7. Pre-Footer CTA & Minimalist Krafft-Style Electric Blue Footer (Mengacu Gambar 2) */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#86B6FF] via-35% to-[#0B45D6] dark:from-[#111113] dark:via-[#1D4ED8] dark:via-40% dark:to-[#0B3AB5]">
        {/* Pre-Footer CTA Section */}
        <section className="px-4 pt-20 pb-24 mx-auto max-w-4xl text-center sm:px-6">
          <span className="inline-flex items-center rounded-full border border-border bg-white/90 dark:bg-surface/90 px-3.5 py-1 text-[11px] font-medium text-text shadow-2xs">
            Mari Mulai Bekerja Bersama
          </span>

          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-[#111113] dark:text-white sm:text-5xl leading-[1.12] text-balance">
            Dirancang untuk <span className="font-serif italic font-normal">tim yang serius</span>{' '}
            membangun produk.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-xs sm:text-sm text-[#3F424A] dark:text-white/80 leading-relaxed">
            Dari catatan cepat hingga roadmap peluncuran berskala besar, mulai tata ruang kerja Yuumotion dalam hitungan detik.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-xs font-semibold text-white shadow-[0_12px_28px_-6px_rgba(37,99,235,0.55)] transition-[transform,opacity] duration-150 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.97] cursor-pointer"
            >
              <span>Buka Dashboard</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/20 backdrop-blur-sm px-5 py-3 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
            >
              <GithubLogo className="w-4 h-4" />
              <span>GitHub Repo</span>
            </a>
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
