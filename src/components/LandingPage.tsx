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
  Table as TableIcon,
  CalendarBlank,
  Clock,
  Compass,
  Code,
  CheckSquare,
  Radio,
  GithubLogo,
  ListBullets
} from '@phosphor-icons/react';
import { AuthUser } from '../types/board';
import { INITIAL_BOARD } from '../lib/constants';
import { cn } from '../lib/cn';
import { PublicFooter, GITHUB_REPO_URL } from './PublicFooter';
import { KanbanBoard } from './KanbanBoard';
import { TableDatabaseView } from './TableDatabaseView';
import { CalendarView } from './CalendarView';
import { TimelineGanttView } from './TimelineGanttView';

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

const VIEW_STEPS: {
  id: PreviewViewMode;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'board',
    title: 'Kanban Board',
    desc: 'Seret dan lepas kartu antar kolom, batas WIP, dan edit judul langsung di tempat.',
    icon: <Kanban className="h-4 w-4" />
  },
  {
    id: 'table',
    title: 'Tabel Spreadsheet',
    desc: 'Ubah status, prioritas, dan tenggat waktu tugas dalam tampilan baris terstruktur.',
    icon: <TableIcon className="h-4 w-4" />
  },
  {
    id: 'calendar',
    title: 'Kalender Bulanan',
    desc: 'Seret kartu langsung antar tanggal dan pantau event multi-hari sekaligus.',
    icon: <CalendarBlank className="h-4 w-4" />
  },
  {
    id: 'timeline',
    title: 'Gantt Timeline',
    desc: 'Geser jadwal atau tarik tepi bar timeline untuk menyesuaikan durasi pengerjaan.',
    icon: <Clock className="h-4 w-4" />
  }
];

function PersonaCardArtwork({ variant, isSelected }: { variant: PersonaTab; isSelected: boolean }) {
  const strokeMain = isSelected ? 'rgba(255,255,255,0.45)' : 'rgba(37,99,235,0.32)';
  const strokeSub = isSelected ? 'rgba(255,255,255,0.22)' : 'rgba(37,99,235,0.16)';
  const fillSoft = isSelected ? 'rgba(255,255,255,0.16)' : 'rgba(37,99,235,0.12)';

  if (variant === 'personal') {
    return (
      <svg viewBox="0 0 360 120" className="w-full h-28 pointer-events-none select-none" preserveAspectRatio="none">
        <defs>
          <radialGradient id="yuu-ripple" cx="50%" cy="85%" r="65%">
            <stop offset="0%" stopColor={isSelected ? '#FFFFFF' : '#2563EB'} stopOpacity="0.28" />
            <stop offset="100%" stopColor={isSelected ? '#2563EB' : '#FFFFFF'} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="360" height="120" fill="url(#yuu-ripple)" />
        {[34, 58, 84, 114, 146].map((r, i) => (
          <ellipse
            key={r}
            cx="180"
            cy="108"
            rx={r * 1.45}
            ry={r * 0.52}
            fill="none"
            stroke={i % 2 === 0 ? strokeMain : strokeSub}
            strokeWidth="1.5"
          />
        ))}
      </svg>
    );
  }

  if (variant === 'product') {
    return (
      <svg viewBox="0 0 360 120" className="w-full h-28 pointer-events-none select-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="yuu-wave-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isSelected ? '#FFFFFF' : '#3B82F6'} stopOpacity="0.32" />
            <stop offset="100%" stopColor={isSelected ? '#93C5FD' : '#1D4ED8'} stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <path
          d="M0 78 C 80 28, 160 112, 245 48 C 295 12, 330 42, 360 28 L 360 120 L 0 120 Z"
          fill="url(#yuu-wave-grad)"
        />
        <path
          d="M0 95 C 95 52, 185 118, 285 62 C 320 44, 342 54, 360 48"
          fill="none"
          stroke={strokeMain}
          strokeWidth="1.75"
        />
        <path
          d="M0 64 C 70 24, 155 95, 250 38 C 300 10, 335 32, 360 20"
          fill="none"
          stroke={strokeSub}
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 120" className="w-full h-28 pointer-events-none select-none" preserveAspectRatio="none">
      <ellipse cx="76" cy="84" rx="34" ry="34" fill={fillSoft} stroke={strokeMain} strokeWidth="1.2" />
      <ellipse cx="144" cy="72" rx="18" ry="34" fill={fillSoft} stroke={strokeMain} strokeWidth="1.2" />
      <ellipse cx="212" cy="86" rx="30" ry="30" fill={fillSoft} stroke={strokeSub} strokeWidth="1.2" />
      <ellipse cx="272" cy="68" rx="16" ry="32" fill={fillSoft} stroke={strokeMain} strokeWidth="1.2" />
      <ellipse cx="318" cy="90" rx="28" ry="28" fill={fillSoft} stroke={strokeSub} strokeWidth="1.2" />
    </svg>
  );
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
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const viewsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const section = viewsSectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScrollable = Math.max(1, rect.height - window.innerHeight);

      // Sembunyikan navbar ketika sticky Multi-View sedang menguasai layar
      const inStickyZone = rect.top <= 40 && rect.bottom >= window.innerHeight * 0.65;
      setIsNavbarHidden(inStickyZone);

      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        const progress = Math.min(0.999, Math.max(0, -rect.top / totalScrollable));
        const idx = Math.floor(progress * VIEW_STEPS.length);
        const nextView = VIEW_STEPS[idx]?.id;
        if (nextView) setPreviewView(nextView);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToViewStep = (idx: number, id: PreviewViewMode) => {
    setPreviewView(id);
    const section = viewsSectionRef.current;
    if (!section) return;
    const totalScrollable = Math.max(1, section.offsetHeight - window.innerHeight);
    const targetTop = section.offsetTop + (idx / VIEW_STEPS.length) * totalScrollable + 24;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  const noop = () => {};

  return (
    <div id="top" className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B0D12] text-text flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-600">
      {/* Fixed Floating Navbar (otomatis sembunyi ke atas saat di section Multi-View) */}
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 px-4 pt-4 sm:px-6 pointer-events-none transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          isNavbarHidden ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
        )}
      >
        <div className="pointer-events-auto mx-auto max-w-6xl flex justify-between items-center px-4 h-14 rounded-2xl border shadow-lg backdrop-blur-md border-black/10 bg-white/85 text-[#0B0D12] dark:border-white/15 dark:bg-[#0B0D12]/80 dark:text-white transition-colors duration-200">
          <a href="#top" className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="Yuumotion" className="h-8 w-8 rounded-xl shadow-xs ring-1 ring-black/10 dark:ring-white/25" />
            <span className="text-base font-bold tracking-tight font-display">
              Yuumotion
            </span>
          </a>

          <nav className="hidden gap-7 items-center text-xs font-semibold md:flex text-slate-700 dark:text-slate-200">
            <a href="#personas" className="transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400">
              Solusi Tim
            </a>
            <a href="#docs" className="transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400">
              Dokumen &amp; Sync
            </a>
            <a href="#views" className="transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400">
              Multi-View
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <GithubLogo className="h-3.5 w-3.5" />
              <span>GitHub</span>
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

      {/* 1. Sky-Blue Volumetric Hero + Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#6BB5FF] via-[#2563EB] to-[#1D4ED8] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-[460px] w-[460px] rounded-full bg-white/20 blur-3xl animate-yuu-hero-drift"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-16 -right-24 h-[520px] w-[520px] rounded-full bg-blue-300/25 blur-3xl animate-yuu-hero-drift"
          style={{ animationDelay: '-7s' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35 bg-[linear-gradient(125deg,rgba(255,255,255,0.28)_0%,transparent_42%,rgba(255,255,255,0.14)_64%,transparent_88%)]"
        />

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

          {/* 3 Floating Product UI Cards */}
          <div
            className="grid relative grid-cols-1 gap-4 items-end mx-auto mt-20 max-w-5xl text-left animate-yuu-enter sm:grid-cols-3"
            style={{ animationDelay: '200ms' }}
          >
            <div className="hidden sm:block rounded-t-2xl border border-white/40 dark:border-white/15 bg-white/95 dark:bg-[#141720]/95 p-5 text-slate-900 dark:text-slate-100 shadow-2xl">
              <div className="flex gap-2 items-center mb-3">
                <div className="flex justify-center items-center w-7 h-7 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
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
                  <Kanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
        {/* 2. Section Persona Cards dengan Bottom Fluid Artwork */}
        <section id="personas" className="py-20 sm:py-24 bg-[#FAF9F6] dark:bg-[#0B0D12]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight font-display text-text sm:text-4xl text-balance">
                Ruang Kerja Andal untuk{' '}
                <span className="font-serif italic font-normal text-project-solid">Semua Skala Tim</span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted">
                Pilih mode kerja sesuai kebutuhan tanpa kehilangan kecepatan akses lokal maupun kolaborasi.
              </p>

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
                      'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-[background-color,color] duration-150 cursor-pointer',
                      personaTab === t.id
                        ? 'bg-project-solid text-white shadow-xs'
                        : 'text-muted hover:text-text'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 items-stretch mt-12 md:grid-cols-3">
              {[
                {
                  id: 'personal' as PersonaTab,
                  icon: <Compass className="w-5 h-5" />,
                  title: 'Kreator & Freelancer',
                  desc: 'Kelola proyek klien, catatan ide, dan tenggat waktu dalam satu papan lokal tanpa ketergantungan koneksi.',
                  cta: 'Mulai Mandiri'
                },
                {
                  id: 'product' as PersonaTab,
                  icon: <Kanban className="w-5 h-5" />,
                  title: 'Tim Produk & Desain',
                  desc: 'Gabungkan spesifikasi PRD TipTap dengan alur sprint Kanban. Beralih ke Kalender atau Gantt Timeline seketika.',
                  cta: 'Buka Workspace Tim'
                },
                {
                  id: 'engineering' as PersonaTab,
                  icon: <Code className="w-5 h-5" />,
                  title: 'Tim Engineering',
                  desc: 'Blok kode terstruktur, skema Drizzle MySQL/TiDB, serta backend Hono yang siap dijalankan di Wasmer Edge.',
                  cta: 'Lihat Arsitektur'
                }
              ].map((card) => {
                const isSelected = personaTab === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => setPersonaTab(card.id)}
                    className={cn(
                      'relative overflow-hidden rounded-3xl flex flex-col justify-between transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none cursor-pointer',
                      isSelected
                        ? 'bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_20px_50px_-14px_rgba(37,99,235,0.5)] md:-my-2'
                        : 'border border-border bg-surface text-text shadow-card-sm hover:-translate-y-0.5'
                    )}
                  >
                    <div className="p-7 pb-3">
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className={cn(
                            'flex items-center justify-center rounded-xl w-10 h-10',
                            isSelected ? 'bg-white/20 text-white' : 'bg-project-soft text-project-solid'
                          )}
                        >
                          {card.icon}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEnterApp();
                          }}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer transition-transform duration-150 active:scale-[0.97]',
                            isSelected
                              ? 'bg-white text-[#1D4ED8] shadow-sm'
                              : 'bg-[#0B0D12] text-white dark:bg-white dark:text-[#0B0D12]'
                          )}
                        >
                          <span>{card.cta}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      <h3 className={cn('mb-2 font-display text-lg font-bold', isSelected ? 'text-white' : 'text-text')}>
                        {card.title}
                      </h3>
                      <p className={cn('text-xs leading-relaxed', isSelected ? 'text-white/85' : 'text-muted')}>
                        {card.desc}
                      </p>
                    </div>

                    <PersonaCardArtwork variant={card.id} isSelected={isSelected} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Section Editorial Hitam (Layout Terbalik: Preview App Shell di Kiri, Copy di Kanan) */}
        <section id="docs" className="bg-[#0B0D12] text-white py-20 sm:py-24 border-y border-white/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Miniature Real App Shell Preview (Rail + Explorer + TipTap + Sticky TOC) */}
            <div className="lg:col-span-7 lg:order-1">
              <div className="rounded-2xl border border-white/15 bg-[#12151E] shadow-2xl overflow-hidden flex h-[370px] sm:h-[400px] select-none">
                {/* Mini Blue Navigation Rail */}
                <div className="w-11 bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] flex flex-col items-center py-3 gap-3 shrink-0 border-r border-white/15">
                  <img src="/icon.svg" alt="Yuumotion" className="h-6 w-6 rounded-lg ring-1 ring-white/25" />
                  <div className="w-5 border-t border-white/20" />
                  <div className="h-6 w-6 rounded-lg bg-white/25 ring-1 ring-white/40 flex items-center justify-center text-[10px] font-bold">
                    Y
                  </div>
                  <div className="h-6 w-6 rounded-lg text-white/70 flex items-center justify-center text-[10px] font-bold">
                    D
                  </div>
                </div>

                {/* Mini Project Explorer */}
                <div className="hidden sm:flex w-44 flex-col border-r border-white/10 bg-[#141720] p-3 shrink-0">
                  <div className="text-[11px] font-bold text-white mb-3 truncate">Yuumotion Studio</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Papan Sprint
                  </div>
                  <div className="rounded-lg px-2 py-1 text-[11px] text-slate-300 flex items-center gap-1.5 mb-3">
                    <Kanban className="h-3 w-3 text-slate-400" />
                    <span className="truncate">Roadmap Q4</span>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Dokumen &amp; PRD
                  </div>
                  <div className="rounded-lg bg-blue-600/20 border border-blue-500/40 px-2 py-1 text-[11px] font-semibold text-blue-300 flex items-center gap-1.5">
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="truncate">Arsitektur v2</span>
                  </div>
                </div>

                {/* Mini TipTap Canvas + Sticky TOC */}
                <div className="flex-1 bg-[#0B0D12] p-5 flex gap-4 overflow-hidden">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className="font-display text-sm font-bold text-white truncate">
                        Arsitektur Ruang Kerja
                      </span>
                      <span className="font-mono text-[10px] text-blue-400 shrink-0">✓ Tersimpan</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {['Meeting Notes', 'PRD', 'Roadmap'].map((t) => (
                        <span key={t} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                      <div className="font-display text-xs font-bold text-white">1. Ringkasan Sistem</div>
                      <p className="text-slate-400">
                        Ketik perintah slash <span className="font-mono text-blue-400">/image</span> atau{' '}
                        <span className="font-mono text-blue-400">/code</span> untuk menyisipkan blok terstruktur secara instan.
                      </p>
                      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5 text-[11px] text-blue-200">
                        TipTap terhubung langsung dengan tombol Export Markdown (.md).
                      </div>
                    </div>
                  </div>

                  {/* Mini Sticky TOC */}
                  <div className="hidden md:block w-32 shrink-0 rounded-xl border border-white/10 bg-[#141720] p-2.5 h-fit">
                    <div className="flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-400 pb-1.5 mb-1.5 border-b border-white/10">
                      <ListBullets className="h-3 w-3 text-blue-400" />
                      <span>Daftar Isi</span>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="text-white font-semibold truncate">1. Ringkasan</div>
                      <div className="text-slate-400 pl-2 truncate">2. Skema DB</div>
                      <div className="text-slate-400 pl-2 truncate">3. RBAC Policy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy Editorial */}
            <div className="lg:col-span-5 lg:order-2 space-y-5">
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Tulis Spesifikasi,{' '}
                <span className="font-serif italic font-normal text-blue-400">Simpan Otomatis</span> di Perangkat.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Editor TipTap dengan perintah slash (/), daftar isi sticky otomatis, export Markdown (.md), serta sinkronisasi 0ms antar tab dan RBAC Owner hingga Viewer.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Lightning className="h-4 w-4 text-blue-400" />
                    <span>0ms Local Sync</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    BroadcastChannel lokal plus SSE stream saat terhubung ke server.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    <span>RBAC Guardrails</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Role Viewer terkunci read-only baik di kanvas dokumen maupun papan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Full-Viewport Sticky Multi-View Showcase (Navbar auto-hides while scrolling inside) */}
        <section
          id="views"
          ref={viewsSectionRef}
          className="relative bg-white dark:bg-[#11131A] border-b border-border lg:h-[270vh]"
        >
          <div className="lg:sticky lg:top-0 lg:h-screen flex items-center overflow-hidden py-14 lg:py-0">
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Compact Normal-Sized Tabs */}
                <div className="lg:col-span-4 space-y-5">
                  <div>
                    <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-text">
                      Satu Sumber Data, Empat Perspektif Nyata
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-muted">
                      Scroll atau klik tab untuk melihat perubahan tampilan langsung dari komponen aplikasi.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {VIEW_STEPS.map((step, idx) => {
                      const isActive = previewView === step.id;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => scrollToViewStep(idx, step.id)}
                          className={cn(
                            'w-full text-left rounded-xl border px-3.5 py-2.5 transition-[border-color,background-color,color] duration-150 cursor-pointer',
                            isActive
                              ? 'border-project-solid bg-[#0B0D12] text-white shadow-md'
                              : 'border-border bg-bg text-text hover:border-project-ring'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'flex h-6 w-6 items-center justify-center rounded-lg',
                                  isActive ? 'bg-blue-600 text-white' : 'bg-project-soft text-project-solid'
                                )}
                              >
                                {step.icon}
                              </span>
                              <span className="font-display text-xs font-bold">{step.title}</span>
                            </div>
                            <span className="font-mono text-[10px] opacity-60">0{idx + 1}</span>
                          </div>
                          {isActive && (
                            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                              {step.desc}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Oversized Real App Preview (bleeds past right edge cleanly) */}
                <div className="lg:col-span-8">
                  <div className="relative lg:w-[114%]">
                    <div
                      aria-hidden="true"
                      className="mx-6 h-3.5 rounded-t-2xl border border-b-0 border-border bg-[#0B0D12]/80 dark:bg-white/10"
                    />
                    <div
                      aria-hidden="true"
                      className="mx-3 h-3.5 rounded-t-2xl border border-b-0 border-border bg-[#1D4ED8]/85"
                    />

                    <div className="rounded-2xl border border-border bg-bg shadow-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bar">
                        <div className="flex items-center gap-2">
                          <img src="/icon.svg" alt="Yuumotion" className="h-5 w-5 rounded-md" />
                          <span className="font-display text-xs font-bold text-text">
                            {INITIAL_BOARD.title}
                          </span>
                        </div>
                        <span className="rounded-md bg-project-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-project-solid">
                          {VIEW_STEPS.find((s) => s.id === previewView)?.title}
                        </span>
                      </div>

                      <div
                        key={previewView}
                        className="h-[460px] sm:h-[560px] lg:h-[72vh] overflow-hidden pointer-events-none select-none animate-yuu-crossfade"
                      >
                        {previewView === 'board' && (
                          <KanbanBoard
                            board={INITIAL_BOARD}
                            searchQuery=""
                            onCardClick={noop}
                            onAddCard={noop}
                            onAddColumn={noop}
                            onDeleteColumn={noop}
                            onDropCard={noop}
                          />
                        )}
                        {previewView === 'table' && (
                          <TableDatabaseView
                            board={INITIAL_BOARD}
                            searchQuery=""
                            onCardClick={noop}
                            onUpdateCard={noop}
                            onAddCard={noop}
                          />
                        )}
                        {previewView === 'calendar' && (
                          <CalendarView
                            board={INITIAL_BOARD}
                            searchQuery=""
                            onCardClick={noop}
                            onAddCardOnDate={noop}
                          />
                        )}
                        {previewView === 'timeline' && (
                          <TimelineGanttView
                            board={INITIAL_BOARD}
                            searchQuery=""
                            onCardClick={noop}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Full-Bleed 3D Open-Source Section */}
        <section className="relative overflow-hidden bg-[#0B0D12] text-white py-28 sm:py-36 border-b border-white/10">
          <div className="absolute inset-0 pointer-events-none">
            <Suspense fallback={null}>
              <Landing3DCanvas isDark={true} />
            </Suspense>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B0D12] via-[#0B0D12]/75 via-40% to-transparent"
          />

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-lg space-y-5">
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                Arsitektur Terbuka,{' '}
                <span className="font-serif italic font-normal text-blue-400">Siap Diperluas</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dibangun dalam satu repositori dengan frontend React + Vite dan backend Hono + Drizzle ORM untuk MySQL/TiDB di Wasmer Edge. Berlisensi Apache 2.0.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.97]"
                >
                  <GithubLogo className="h-4 w-4" />
                  <span>Beri Bintang &amp; Lihat Repo</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onEnterApp}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <span>Coba Demo Langsung</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Pre-Footer CTA & Krafft-Style Electric Blue Footer */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#60A5FA] via-35% to-[#0B45D6] dark:from-[#0B0D12] dark:via-[#1D4ED8] dark:via-40% dark:to-[#0B3AB5]">
        <section className="px-4 pt-20 pb-24 mx-auto max-w-4xl text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B0D12] dark:text-white sm:text-5xl leading-[1.12] text-balance">
            Dirancang untuk <span className="font-serif italic font-normal">tim yang serius</span>{' '}
            membangun produk.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-xs sm:text-sm text-[#3F424A] dark:text-white/85 leading-relaxed">
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
