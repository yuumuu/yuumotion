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
  Table as TableIcon,
  CalendarBlank,
  Clock,
  Compass,
  Code,
  CheckSquare,
  Radio,
  Sparkle,
  GithubLogo
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
  subtitle: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'board',
    title: 'Kanban Board',
    subtitle: 'Alur Kerja Taktil',
    desc: 'Seret dan lepas kartu antar kolom dengan rotasi fisik halus, batas WIP per kolom, dan edit judul langsung di tempat.',
    icon: <Kanban className="h-4 w-4" />
  },
  {
    id: 'table',
    title: 'Tabel Spreadsheet',
    subtitle: 'Kendali Data Terstruktur',
    desc: 'Ubah status, prioritas, dan tenggat waktu puluhan tugas sekaligus dalam tampilan baris terstruktur.',
    icon: <TableIcon className="h-4 w-4" />
  },
  {
    id: 'calendar',
    title: 'Kalender Bulanan',
    subtitle: 'Jadwal & Event Multi-Hari',
    desc: 'Seret kartu langsung antar tanggal di kalender dan pantau rentang pengerjaan beberapa hari sekaligus.',
    icon: <CalendarBlank className="h-4 w-4" />
  },
  {
    id: 'timeline',
    title: 'Gantt Timeline',
    subtitle: 'Durasi & Roadmap',
    desc: 'Geser posisi jadwal atau tarik tepi kiri-kanan bar timeline untuk menyesuaikan durasi pengerjaan secara presisi.',
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
  const viewStepRefs = useRef<Record<PreviewViewMode, HTMLDivElement | null>>({
    board: null,
    table: null,
    calendar: null,
    timeline: null
  });

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-view-step') as PreviewViewMode | null;
            if (id) setPreviewView(id);
          }
        });
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.1 }
    );

    Object.values(viewStepRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const noop = () => {};

  return (
    <div id="top" className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B0D12] text-text flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-600">
      {/* 1. Sky-Blue Volumetric Hero + Floating Navbar */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#6BB5FF] via-[#2563EB] to-[#1D4ED8] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(125deg,rgba(255,255,255,0.28)_0%,transparent_42%,rgba(255,255,255,0.14)_64%,transparent_88%)]"
        />

        {/* Fixed Floating Navbar */}
        <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4 sm:px-6 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-6xl flex justify-between items-center px-4 h-14 rounded-2xl border shadow-lg backdrop-blur-md border-white/25 bg-slate-950/55">
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
                Dokumen &amp; Sync
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B0D12] px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97] cursor-pointer"
              >
                <span>{currentUser ? 'Buka Workspace' : 'Masuk'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Copy & Inline Pill CTA */}
        <section className="relative z-20 px-4 pt-28 mx-auto max-w-5xl text-center sm:px-6 sm:pt-32">
          <div className="animate-yuu-enter inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1 font-mono text-[11px] font-medium text-white backdrop-blur-sm">
            <Sparkle className="h-3.5 w-3.5 text-white" />
            <span>Workspace Hibrida Offline-First • Open Source</span>
          </div>

          <h1
            className="animate-yuu-enter mx-auto mt-5 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[54px] lg:leading-[1.08] text-balance"
            style={{ animationDelay: '60ms' }}
          >
            Kelola Tugas dan Dokumen Tim Lebih Cepat, dengan Yuumotion
          </h1>

          <p
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed animate-yuu-enter text-white/90 sm:text-base"
            style={{ animationDelay: '120ms' }}
          >
            Satukan ketajaman papan Kanban dengan ketenangan editor dokumen TipTap. Sinkron instan antar perangkat dalam satu ruang kerja.
          </p>

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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B0D12] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97] cursor-pointer"
            >
              <span>Mulai Workspace Gratis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 3 Floating Product UI Cards (Light & Dark Mode, Blue-Black-White) */}
          <div
            className="grid relative grid-cols-1 gap-4 items-end mx-auto mt-20 max-w-5xl text-left animate-yuu-enter sm:grid-cols-3"
            style={{ animationDelay: '240ms' }}
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
                  <span>Sinkronisasi Offline PWA</span>
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
                Peluncuran Multi-View Engine &amp; Drag Physics
              </p>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="rounded-md bg-blue-50 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  #frontend
                </span>
                <span className="rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
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

            <div className="hidden sm:block rounded-t-2xl border border-white/40 dark:border-white/15 bg-white/95 dark:bg-[#141720]/95 p-5 text-slate-900 dark:text-slate-100 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold font-display">Realtime Presence</span>
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
                0ms BroadcastChannel Active
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="flex-1">
        {/* 2. Section Persona Cards dengan Bottom Fluid Artwork (ala Gambar Referensi 1, palet Biru-Hitam-Putih) */}
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

        {/* 3. Section Editorial Hitam: Dokumen TipTap & Sinkronisasi Offline-First */}
        <section id="docs" className="bg-[#0B0D12] text-white py-20 sm:py-24 border-y border-white/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-blue-400">
                Dokumen &amp; Sinkronisasi
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Tulis Spesifikasi,{' '}
                <span className="font-serif italic font-normal text-blue-400">Simpan Otomatis</span> di Perangkat.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Editor TipTap dengan slash commands (/), daftar isi sticky otomatis, export Markdown (.md), serta sinkronisasi 0ms antar tab dan RBAC Owner hingga Viewer.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
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

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-white/15 bg-[#141720] p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold font-display text-white">
                        Arsitektur Ruang Kerja Yuumotion
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        TipTap Rich Canvas • Export .md
                      </div>
                    </div>
                  </div>
                  <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 font-mono text-[10px] font-semibold text-blue-300">
                    ✓ Tersimpan
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 font-mono text-[11px]">
                    <span className="text-blue-400">/callout</span> — Seluruh papan, kalender, dan timeline membaca satu sumber data real-time.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-[#0B0D12] p-3">
                      <div className="font-mono text-[10px] text-slate-400 mb-1">Perintah Slash</div>
                      <div className="font-semibold text-white">/todo, /code, /image</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#0B0D12] p-3">
                      <div className="font-mono text-[10px] text-slate-400 mb-1">Mode Baca</div>
                      <div className="font-semibold text-white">740px &amp; Lebar Penuh</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Section Multi-View Engine: Scrollable Stacking Deck + Komponen App Nyata */}
        <section id="views" className="py-20 sm:py-28 bg-white dark:bg-[#11131A] border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-project-solid mb-3">
                <Stack className="h-3.5 w-3.5" />
                <span>Multi-View Engine</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text">
                Satu Sumber Data, Empat Perspektif Nyata
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left: Scrollable & Clickable View Steps */}
              <div className="lg:col-span-4 space-y-4">
                {VIEW_STEPS.map((step, idx) => {
                  const isActive = previewView === step.id;
                  return (
                    <div
                      key={step.id}
                      ref={(el) => {
                        viewStepRefs.current[step.id] = el;
                      }}
                      data-view-step={step.id}
                      onClick={() => setPreviewView(step.id)}
                      className={cn(
                        'rounded-2xl border p-5 transition-[border-color,background-color,transform] duration-200 cursor-pointer',
                        isActive
                          ? 'border-project-solid bg-[#0B0D12] text-white shadow-xl'
                          : 'border-border bg-bg text-text hover:border-project-ring'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-lg',
                              isActive ? 'bg-blue-600 text-white' : 'bg-project-soft text-project-solid'
                            )}
                          >
                            {step.icon}
                          </span>
                          <span className="font-display text-sm font-bold">{step.title}</span>
                        </div>
                        <span className="font-mono text-[10px] opacity-60">0{idx + 1}</span>
                      </div>
                      <p className={cn('text-xs leading-relaxed', isActive ? 'text-slate-300' : 'text-muted')}>
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Right: Sticky Stacking Deck Rendering Real App Components */}
              <div className="lg:col-span-8 lg:sticky lg:top-20">
                <div className="relative pt-4">
                  {/* Stacked deck background layers (ala gambar referensi) */}
                  <div
                    aria-hidden="true"
                    className="mx-6 h-4 rounded-t-2xl border border-b-0 border-border bg-[#0B0D12]/80 dark:bg-white/10"
                  />
                  <div
                    aria-hidden="true"
                    className="mx-3 h-4 rounded-t-2xl border border-b-0 border-border bg-[#1D4ED8]/85"
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
                      className="h-[380px] sm:h-[420px] overflow-hidden pointer-events-none select-none animate-yuu-crossfade"
                    >
                      {previewView === 'board' && (
                        <div className="h-full scale-[0.88] origin-top-left w-[113.6%]">
                          <KanbanBoard
                            board={INITIAL_BOARD}
                            searchQuery=""
                            onCardClick={noop}
                            onAddCard={noop}
                            onAddColumn={noop}
                            onDeleteColumn={noop}
                            onDropCard={noop}
                          />
                        </div>
                      )}
                      {previewView === 'table' && (
                        <div className="h-full overflow-hidden">
                          <TableDatabaseView
                            board={INITIAL_BOARD}
                            searchQuery=""
                            onCardClick={noop}
                            onUpdateCard={noop}
                            onAddCard={noop}
                          />
                        </div>
                      )}
                      {previewView === 'calendar' && (
                        <div className="h-full overflow-hidden">
                          <CalendarView
                            board={INITIAL_BOARD}
                            searchQuery=""
                            onCardClick={noop}
                            onAddCardOnDate={noop}
                          />
                        </div>
                      )}
                      {previewView === 'timeline' && (
                        <div className="h-full overflow-hidden">
                          <TimelineGanttView
                            board={INITIAL_BOARD}
                            searchQuery=""
                            onCardClick={noop}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Full-Bleed 3D Open-Source Section (Overflow-Clipped Three.js) */}
        <section className="relative overflow-hidden bg-[#0B0D12] text-white py-24 sm:py-32 border-b border-white/10">
          <div className="absolute inset-0 pointer-events-none">
            <Suspense fallback={null}>
              <Landing3DCanvas isDark={true} />
            </Suspense>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B0D12]/90 via-[#0B0D12]/65 to-transparent"
          />

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-xl space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold text-blue-300 backdrop-blur-sm">
                <Code className="h-3.5 w-3.5" />
                <span>Open-Source • Apache 2.0</span>
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                Arsitektur Terbuka,{' '}
                <span className="font-serif italic font-normal text-blue-400">Siap Diperluas</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dibangun dalam satu repositori dengan frontend React + Vite dan backend Hono + Drizzle ORM untuk MySQL/TiDB di Wasmer Edge. Jelajahi kode sumber atau kontribusi langsung di GitHub.
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
          <span className="inline-flex items-center rounded-full border border-border bg-white/90 dark:bg-surface/90 px-3.5 py-1 text-[11px] font-medium text-text shadow-2xs">
            Mari Mulai Bekerja Bersama
          </span>

          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-[#0B0D12] dark:text-white sm:text-5xl leading-[1.12] text-balance">
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
