import React, { useState, useEffect, useRef } from 'react';
import {
  Kanban,
  FileText,
  Lightning,
  ShieldCheck,
  Globe,
  ArrowRight,
  Sun,
  Moon,
  Stack,
  Database,
  Table as TableIcon,
  CalendarBlank,
  Clock,
  CheckCircle,
  MagnifyingGlass,
  Gear,
  Compass,
  Code,
  CheckSquare,
  Info,
  CaretRight,
  FolderOpen,
  Sparkle
} from '@phosphor-icons/react';
import { AuthUser } from '../types/board';
import { cn } from '../lib/cn';

interface LandingPageProps {
  currentUser: AuthUser | null;
  onEnterApp: () => void;
  onOpenAuth: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

type PreviewViewMode = 'board' | 'table' | 'calendar' | 'timeline';

function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
  const [previewView, setPreviewView] = useState<PreviewViewMode>('board');

  const ch1 = useRevealOnScroll();
  const ch2 = useRevealOnScroll();
  const ch3 = useRevealOnScroll();
  const ch4 = useRevealOnScroll();
  const preFooter = useRevealOnScroll();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-bg text-text selection:bg-project-soft selection:text-project-solid">
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md border-border bg-bar/85">
        <div className="flex justify-between items-center px-4 mx-auto max-w-6xl h-16 sm:px-6">
          <div className="flex gap-3 items-center">
            <img
              src="/icon.svg"
              alt="Yuumotion Logo"
              className="w-8 h-8 rounded-xl shadow-tactile-btn"
            />
            <div className="flex gap-2 items-center">
              <span className="text-base font-bold tracking-tight font-display text-text">
                Yuumotion
              </span>
              <span className="rounded-full border border-border bg-hover/70 px-2 py-0.5 font-mono text-[10px] font-medium text-muted">
                v0.2 edge
              </span>
            </div>
          </div>

          <nav className="hidden gap-7 items-center text-xs font-medium md:flex text-muted">
            <a href="#kanban" className="transition-colors duration-150 hover:text-text">
              Papan Kanban
            </a>
            <a href="#docs" className="transition-colors duration-150 hover:text-text">
              Dokumen PRD
            </a>
            <a href="#views" className="transition-colors duration-150 hover:text-text">
              Multi-Views
            </a>
            <a href="#architecture" className="transition-colors duration-150 hover:text-text">
              Arsitektur Edge
            </a>
          </nav>

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted transition-[background-color,border-color,color,transform] duration-150 hover:border-border hover:bg-hover hover:text-text active:scale-[0.95] cursor-pointer"
              title="Ganti Tema (Terang / Gelap)"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text shadow-2xs transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.97] cursor-pointer"
            >
              {currentUser ? 'Akun' : 'Masuk'}
            </button>

            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-project-solid px-4 py-2 text-xs font-semibold text-white shadow-tactile-btn transition-[opacity,transform] duration-150 hover:opacity-95 active:scale-[0.97] cursor-pointer"
            >
              <span>Buka Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section: Staggered Physics Entrance */}
        <section className="overflow-hidden relative pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_50%_at_50%_0%,var(--project-soft),transparent)]"
          />

          <div className="px-4 mx-auto max-w-6xl text-center sm:px-6">
            <div
              className="animate-yuu-enter inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-[11px] font-mono text-muted shadow-2xs"
              style={{ animationDelay: '0ms' }}
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Offline-First Workspace • Wasmer Edge &amp; Supabase Realtime</span>
            </div>

            <h1
              className="animate-yuu-enter mx-auto mt-6 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-text sm:text-5xl lg:text-[56px] lg:leading-[1.08] text-balance"
              style={{ animationDelay: '60ms' }}
            >
              Satu ruang kerja presisi untuk ide, dokumen, dan alur tugas tim.
            </h1>

            <p
              className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed animate-yuu-enter text-muted sm:text-base"
              style={{ animationDelay: '120ms' }}
            >
              Menggabungkan kejelasan papan Kanban dengan ketenangan kanvas dokumen TipTap.
              Berjalan instan secara lokal di peramban dan sinkron realtime antar perangkat tanpa biaya server bulanan.
            </p>

            <div
              className="flex flex-wrap gap-3 justify-center items-center mt-8 animate-yuu-enter"
              style={{ animationDelay: '180ms' }}
            >
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 rounded-xl bg-project-solid px-6 py-3 text-sm font-semibold text-white shadow-card-hover transition-[transform,opacity,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.98] cursor-pointer"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text shadow-2xs transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.98] cursor-pointer"
              >
                <span>Kelola Profil &amp; Akses</span>
              </button>
            </div>

            {/* Hero Real UI Mockup: Triple-Panel Shell */}
            <div
              className="overflow-hidden mx-auto mt-14 max-w-5xl text-left rounded-2xl border shadow-2xl animate-yuu-enter border-border bg-surface"
              style={{ animationDelay: '240ms' }}
            >
              <div className="flex items-center justify-between border-b border-border bg-bar px-4 py-2.5">
                <div className="flex gap-2 items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
              </div>

              <div className="flex h-[380px] sm:h-[420px] bg-bg">
                <div className="hidden flex-col justify-between items-center py-3 w-12 border-r sm:flex border-border bg-bar/80 shrink-0">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex justify-center items-center w-7 h-7 text-xs font-bold text-white rounded-lg bg-project-solid font-display">
                      M
                    </div>
                    <div className="flex justify-center items-center w-7 h-7 rounded-lg text-muted">
                      <MagnifyingGlass className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex justify-center items-center w-7 h-7 rounded-lg text-muted">
                      <Gear className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      Y
                    </div>
                  </div>
                </div>

                <div className="hidden flex-col p-3 w-48 border-r md:flex border-border bg-bar/40 shrink-0">
                  <div className="flex gap-2 items-center pb-3 mb-3 border-b border-border">
                    <span className="w-2 h-2 rounded-full bg-project-solid" />
                    <span className="text-xs font-bold truncate font-display text-text">
                      Main Workspace
                    </span>
                  </div>

                  <div className="space-y-3 text-[11px]">
                    <div className="space-y-1">
                      <div className="px-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                        Papan Sprint
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-project-soft px-2 py-1.5 font-semibold text-project-solid border border-project-ring">
                        <span className="truncate">Product Roadmap</span>
                        <span className="font-mono text-[10px]">3</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="px-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                        Dokumen PRD
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">Architecture Specs</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">Release Checklist</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden flex-1 p-4 bg-bg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 h-full">
                    <div className="flex flex-col p-3 rounded-xl border border-border bg-surface/60">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2 items-center">
                          <span className="w-2 h-2 rounded-full bg-project-solid" />
                          <span className="text-xs font-semibold text-text">To Do</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted">2</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="rounded-xl border border-border bg-surface p-3 shadow-card-sm transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-card-hover">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-semibold text-muted">YUU-1</span>
                            <span className="rounded-md bg-status-high-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-high">
                              Tinggi
                            </span>
                          </div>
                          <p className="mb-2 text-xs font-semibold leading-snug text-text">
                            Sistem Token &amp; Tema Dinamis per Project
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-muted pt-1.5 border-t border-border/60">
                            <span className="font-mono">3/3 selesai</span>
                            <span className="h-4 w-4 rounded-full bg-project-solid text-white flex items-center justify-center text-[9px] font-bold">
                              H
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-3 shadow-card-sm transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-card-hover">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-semibold text-muted">YUU-4</span>
                            <span className="rounded-md bg-status-medium-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-medium">
                              Sedang
                            </span>
                          </div>
                          <p className="text-xs font-semibold leading-snug text-text">
                            Panel Outline TOC Sticky pada Dokumen
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden flex-col p-3 rounded-xl border sm:flex border-border bg-surface/60">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2 items-center">
                          <span className="w-2 h-2 bg-amber-500 rounded-full" />
                          <span className="text-xs font-semibold text-text">In Progress</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted">1</span>
                      </div>

                      <div className="rounded-xl border border-project-ring bg-surface p-3 shadow-card-hover transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] font-semibold text-muted">YUU-2</span>
                          <span className="rounded-md bg-status-urgent-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-urgent">
                            Urgent
                          </span>
                        </div>
                        <p className="mb-2 text-xs font-semibold leading-snug text-text">
                          Multi-View Engine: Board, Table, Kalender &amp; Gantt
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="rounded-md bg-hover px-1.5 py-0.5 text-[10px] text-muted">
                            Frontend
                          </span>
                          <span className="rounded-md bg-hover px-1.5 py-0.5 text-[10px] text-muted">
                            Architecture
                          </span>
                        </div>
                        <div className="overflow-hidden w-full h-1 rounded-full bg-hover">
                          <div className="w-2/3 h-full rounded-full bg-project-solid" />
                        </div>
                      </div>
                    </div>

                    <div className="hidden flex-col p-3 rounded-xl border sm:flex border-border bg-surface/60">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2 items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-semibold text-text">Completed</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted">1</span>
                      </div>

                      <div className="rounded-xl border border-border bg-surface p-3 shadow-card-sm opacity-90 transition-[transform,opacity,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:opacity-100 hover:shadow-card-hover">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] font-semibold text-muted">YUU-3</span>
                          <CheckCircle className="h-3.5 w-3.5 text-status-done" weight="fill" />
                        </div>
                        <p className="mb-2 text-xs font-semibold leading-snug text-text">
                          Wasmer Edge &amp; Local MySQL Hybrid Bridge
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-status-done font-medium pt-1.5 border-t border-border/60">
                          <span>100% Terverifikasi</span>
                          <span className="font-mono">11-24</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Chapter 1: Papan Kanban Taktil */}
        <section id="kanban" className="py-20 border-t border-border bg-surface/50 sm:py-24">
          <div
            ref={ch1.ref}
            className={cn(
              'mx-auto max-w-6xl px-4 sm:px-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              ch1.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            )}
          >
            <div className="grid grid-cols-1 gap-10 items-center lg:grid-cols-12 lg:gap-14">
              <div className="space-y-5 lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-2.5 py-1 font-mono text-[11px] font-medium text-muted">
                  <Kanban className="h-3.5 w-3.5 text-project-solid" />
                  <span>BAB 01 • ALUR TUGAS TAKTIL</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight font-display text-text sm:text-3xl text-balance">
                  Anatomi kartu yang tenang, informatif, dan responsif tanpa pergeseran layout.
                </h2>
                <p className="text-sm leading-relaxed text-muted">
                  Setiap kartu dirancang dengan hierarki informasi yang bersih: kode ID monospaced, indikator prioritas terkalibrasi, label tag maksimal tiga item, dan bilah progres checklist mini.
                </p>
                <ul className="pt-2 space-y-3 text-xs text-text">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-project-solid shrink-0 mt-0.5" />
                    <span>Tiga mode pembukaan detail kartu: Side Peek Drawer, Center Modal, atau Full Page Doc.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-project-solid shrink-0 mt-0.5" />
                    <span>Drag-and-drop mulus dengan placeholder presisi agar kolom di sekitarnya tidak melompat.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-project-solid shrink-0 mt-0.5" />
                    <span>Dukungan penuh pintasan keyboard untuk navigasi cepat dan aksesibilitas.</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7">
                <div className="p-6 rounded-2xl border border-border bg-bg shadow-card-sm">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-project-ring bg-surface p-4 shadow-card-hover transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5">
                      <div className="flex justify-center items-center mb-3 w-full h-20 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl border dark:from-indigo-950/60 dark:to-purple-950/40 border-border/50">
                        <Stack className="w-6 h-6 text-project-solid/70" />
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-[11px] font-semibold text-muted">YUU-108</span>
                        <span className="rounded-md bg-status-urgent-bg px-2 py-0.5 text-[10px] font-semibold text-status-urgent">
                          Urgent
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-text mb-2.5">
                        Migrasi Ikon ke Phosphor Icons &amp; Audit Kontras WCAG AA
                      </h3>
                      <div className="flex gap-1.5 mb-3">
                        <span className="rounded-md bg-hover px-2 py-0.5 text-[10px] font-medium text-muted">
                          Design System
                        </span>
                        <span className="rounded-md bg-hover px-2 py-0.5 text-[10px] font-medium text-muted">
                          UI Polish
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-2.5 border-t border-border">
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span className="flex gap-1 items-center">
                            <CheckSquare className="h-3.5 w-3.5 text-status-done" />
                            <span className="font-mono">4/5</span>
                          </span>
                          <span className="font-mono">Besok</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-hover overflow-hidden">
                          <div className="w-4/5 h-full rounded-full bg-status-done" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 justify-center">
                      <div className="p-4 text-center rounded-xl border border-dashed border-project-solid/50 bg-project-soft/30">
                        <span className="font-mono text-[11px] text-project-solid font-medium">
                          Drop Slot Presisi (Zero Layout Shift)
                        </span>
                      </div>
                      <div className="rounded-xl border border-border bg-surface p-3.5 shadow-card-sm transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-card-hover">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] text-muted">YUU-109</span>
                          <span className="rounded-md bg-status-done-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-done">
                            Selesai
                          </span>
                        </div>
                        <p className="text-xs font-medium text-text">
                          Sanitasi Cache LocalStorage &amp; ErrorBoundary
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Chapter 2: TipTap Document Ecosystem */}
        <section id="docs" className="py-20 border-t border-border bg-bg sm:py-24">
          <div
            ref={ch2.ref}
            className={cn(
              'mx-auto max-w-6xl px-4 sm:px-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              ch2.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            )}
          >
            <div className="grid grid-cols-1 gap-10 items-center lg:grid-cols-12 lg:gap-14">
              <div className="order-2 lg:col-span-7 lg:order-1">
                <div className="p-5 rounded-2xl border border-border bg-surface sm:p-6 shadow-card-sm">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
                    <div className="space-y-4 sm:col-span-8">
                      <div className="flex items-center gap-2.5">
                        <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-project-soft text-project-solid">
                          <Compass className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold font-display text-text">
                          Spesifikasi Arsitektur Edge
                        </h3>
                      </div>

                      <div className="rounded-xl border border-border bg-project-soft/40 p-3 flex items-start gap-2.5 text-xs text-text">
                        <Info className="h-4 w-4 text-project-solid shrink-0 mt-0.5" />
                        <span>
                          Semua dokumen tersimpan otomatis di peramban dan mendukung kolaborasi langsung tanpa konflik.
                        </span>
                      </div>

                      <div className="p-2 space-y-1 max-w-xs rounded-xl border border-border bg-surface shadow-popover">
                        <div className="px-2 py-1 font-mono text-[10px] text-muted uppercase tracking-wider">
                          Perintah Slash (/)
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg bg-project-soft px-2.5 py-1.5 text-xs text-project-solid font-medium">
                          <CheckSquare className="h-3.5 w-3.5" />
                          <span>To-do Checklist</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-text">
                          <Code className="h-3.5 w-3.5 text-muted" />
                          <span>Blok Kode Syntax</span>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-text">
                          <Info className="h-3.5 w-3.5 text-muted" />
                          <span>Callout Pastel</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2 border-t sm:col-span-4 sm:border-t-0 sm:border-l border-border sm:pt-0 sm:pl-4">
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Daftar Isi (TOC)
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex gap-1 items-center font-medium text-project-solid">
                          <CaretRight className="w-3 h-3" />
                          <span>Ringkasan Sistem</span>
                        </div>
                        <div className="pl-3 text-muted">Protokol Sync</div>
                        <div className="pl-3 text-muted">Keamanan RBAC</div>
                        <div className="pl-3 text-muted">Deploy Wasmer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 space-y-5 lg:col-span-5 lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-muted">
                  <FileText className="h-3.5 w-3.5 text-project-solid" />
                  <span>BAB 02 • EKOSISTEM DOKUMEN TIPTAP</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight font-display text-text sm:text-3xl text-balance">
                  Kanvas penulisan bebas distraksi dengan perintah slash dan daftar isi otomatis.
                </h2>
                <p className="text-sm leading-relaxed text-muted">
                  Susun PRD, catatan rapat, hingga dokumentasi teknis secara terstruktur. Beralih kapan saja antara mode baca terpusat (740px) atau lebar penuh dengan panel Outline TOC di sisi kanan.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                    Slash Command (/)
                  </span>
                  <span className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                    Full-Width Toggle
                  </span>
                  <span className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                    Viewer Read-Only Lock
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Chapter 3: Multi-View Engine (Interactive View Switcher with Crossfade) */}
        <section id="views" className="py-20 border-t border-border bg-surface/50 sm:py-24">
          <div
            ref={ch3.ref}
            className={cn(
              'mx-auto max-w-6xl px-4 sm:px-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              ch3.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            )}
          >
            <div className="flex flex-col gap-6 justify-between mb-10 md:flex-row md:items-end">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-2.5 py-1 font-mono text-[11px] font-medium text-muted">
                  <Stack className="h-3.5 w-3.5 text-project-solid" />
                  <span>BAB 03 • MULTI-VIEW ENGINE</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight font-display text-text sm:text-3xl">
                  Satu sumber data, empat sudut pandang kerja.
                </h2>
                <p className="text-sm text-muted">
                  Ubah tampilan papan sprint seketika tanpa menyalin ulang data tugas. Klik tab di samping untuk melihat pratinjau langsung.
                </p>
              </div>

              <div className="inline-flex self-start p-1 rounded-xl border border-border bg-bg">
                {(
                  [
                    { id: 'board', label: 'Kanban', icon: <Kanban className="h-3.5 w-3.5" /> },
                    { id: 'table', label: 'Tabel', icon: <TableIcon className="h-3.5 w-3.5" /> },
                    { id: 'calendar', label: 'Kalender', icon: <CalendarBlank className="h-3.5 w-3.5" /> },
                    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-3.5 w-3.5" /> }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPreviewView(tab.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] cursor-pointer',
                      previewView === tab.id
                        ? 'bg-surface text-text shadow-2xs border border-border'
                        : 'text-muted hover:text-text'
                    )}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card-sm min-h-[240px]">
              <div key={previewView} className="animate-yuu-crossfade">
                {previewView === 'board' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      { col: 'To Do', items: ['YUU-11: Audit Kontras AA', 'YUU-12: Shortcut Keyboard'] },
                      { col: 'In Progress', items: ['YUU-13: TipTap Outline TOC'] },
                      { col: 'Done', items: ['YUU-10: Migrasi Phosphor Icons'] }
                    ].map((group) => (
                      <div key={group.col} className="rounded-xl border border-border bg-bg p-3.5 space-y-2.5">
                        <div className="flex justify-between items-center text-xs font-semibold text-text">
                          <span>{group.col}</span>
                          <span className="font-mono text-[11px] text-muted">{group.items.length}</span>
                        </div>
                        {group.items.map((item) => (
                          <div key={item} className="rounded-lg border border-border bg-surface p-2.5 text-xs font-medium text-text shadow-2xs">
                            {item}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {previewView === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted font-mono text-[11px]">
                          <th className="py-2.5 px-3">ID</th>
                          <th className="py-2.5 px-3">Judul Tugas</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Prioritas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="py-2.5 px-3 font-mono text-muted">YUU-10</td>
                          <td className="py-2.5 px-3 font-medium text-text">Migrasi Phosphor Icons</td>
                          <td className="py-2.5 px-3"><span className="rounded bg-status-done-bg px-2 py-0.5 text-status-done font-medium">Done</span></td>
                          <td className="py-2.5 px-3 text-muted">Sedang</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono text-muted">YUU-11</td>
                          <td className="py-2.5 px-3 font-medium text-text">Audit Kontras AA &amp; Token CSS</td>
                          <td className="py-2.5 px-3"><span className="rounded bg-hover px-2 py-0.5 text-text font-medium">To Do</span></td>
                          <td className="py-2.5 px-3 text-status-high font-medium">Tinggi</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono text-muted">YUU-13</td>
                          <td className="py-2.5 px-3 font-medium text-text">TipTap Outline TOC Sticky</td>
                          <td className="py-2.5 px-3"><span className="rounded bg-project-soft px-2 py-0.5 text-project-solid font-medium">In Progress</span></td>
                          <td className="py-2.5 px-3 text-status-urgent font-medium">Urgent</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {previewView === 'calendar' && (
                  <div className="grid grid-cols-7 gap-2 text-xs text-center">
                    {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                      <div key={day} className="font-mono text-[11px] text-muted pb-1">{day}</div>
                    ))}
                    {[23, 24, 25, 26, 27, 28, 29].map((date) => (
                      <div key={date} className={cn(
                        'rounded-xl border border-border p-2.5 min-h-[72px] text-left',
                        date === 25 ? 'bg-project-soft/40 border-project-ring' : 'bg-bg'
                      )}>
                        <span className="font-mono text-[11px] font-semibold text-text">{date}</span>
                        {date === 25 && (
                          <div className="mt-1.5 rounded bg-project-solid px-1.5 py-0.5 text-[10px] text-white truncate">
                            YUU-13 Release
                          </div>
                        )}
                        {date === 28 && (
                          <div className="mt-1.5 rounded bg-status-done-bg px-1.5 py-0.5 text-[10px] text-status-done truncate">
                            YUU-11 QA
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {previewView === 'timeline' && (
                  <div className="py-2 space-y-3">
                    {[
                      { id: 'YUU-10', label: 'Migrasi Phosphor Icons', left: '5%', width: '35%', color: 'bg-status-done' },
                      { id: 'YUU-13', label: 'TipTap Outline TOC & Full Width', left: '30%', width: '45%', color: 'bg-project-solid' },
                      { id: 'YUU-14', label: 'Wasmer Edge Production Deploy', left: '60%', width: '35%', color: 'bg-amber-500' }
                    ].map((bar) => (
                      <div key={bar.id} className="flex gap-4 items-center text-xs">
                        <span className="w-20 font-mono text-[11px] text-muted shrink-0">{bar.id}</span>
                        <div className="flex overflow-hidden relative flex-1 items-center h-8 rounded-lg border bg-bg border-border">
                          <div
                            className={cn('absolute h-6 rounded-md px-2.5 flex items-center text-[11px] font-medium text-white shadow-2xs', bar.color)}
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
        </section>

        {/* 6. Chapter 4: Arsitektur Edge & Zero Server Fees */}
        <section id="architecture" className="py-20 border-t border-border bg-bg sm:py-24">
          <div
            ref={ch4.ref}
            className={cn(
              'mx-auto max-w-6xl px-4 sm:px-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              ch4.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            )}
          >
            <div className="mb-12 space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-muted">
                <Globe className="h-3.5 w-3.5 text-project-solid" />
                <span>BAB 04 • ARSITEKTUR EDGE &amp; OFFLINE-FIRST</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight font-display text-text sm:text-3xl">
                Dirancang tangguh untuk produktivitas tanpa ketergantungan server mahal.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-sm transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-xl bg-project-soft text-project-solid">
                  <Lightning className="w-5 h-5" />
                </div>
                <h3 className="mb-2 text-base font-bold font-display text-text">
                  Sinkronisasi Dual-Layer
                </h3>
                <p className="text-xs leading-relaxed text-muted">
                  Kombinasi BroadcastChannel lokal (latensi 0ms antar tab) dan Supabase Realtime broadcast untuk kolaborasi lintas perangkat secara langsung.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-sm transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-xl bg-status-done-bg text-status-done">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="mb-2 text-base font-bold font-display text-text">
                  Kontrol Akses RBAC Ketat
                </h3>
                <p className="text-xs leading-relaxed text-muted">
                  Pembagian peran Owner, Admin, Member, dan Viewer dengan penguncian kanvas otomatis untuk memastikan dokumen aman saat dibagikan.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-sm transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-xl bg-status-medium-bg text-status-medium">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="mb-2 text-base font-bold font-display text-text">
                  Database Bridge &amp; Wasmer Edge
                </h3>
                <p className="text-xs leading-relaxed text-muted">
                  Ekspor dump SQL terstruktur untuk MySQL atau SQLite kapan saja, serta konfigurasi siap pakai untuk deploy ke CDN global Wasmer Edge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Pre-Footer CTA Band */}
        <section className="py-16 border-t border-border bg-surface/40 sm:py-20">
          <div
            ref={preFooter.ref}
            className={cn(
              'mx-auto max-w-6xl px-4 sm:px-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              preFooter.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            )}
          >
            <div className="overflow-hidden relative p-8 rounded-3xl border border-border bg-surface sm:p-12 shadow-card-sm">
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none bg-project-soft/60"
              />
              <div className="flex relative flex-col gap-8 justify-between md:flex-row md:items-center">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-project-solid">
                    <Sparkle className="h-3.5 w-3.5" />
                    <span>SIAP DIPAKAI SEKARANG</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight font-display text-text sm:text-3xl text-balance">
                    Mulai atur sprint dan dokumentasi tim tanpa setup yang rumit.
                  </h2>
                  <p className="text-sm leading-relaxed text-muted">
                    Seluruh data tersimpan aman secara lokal dan siap disinkronkan ke cloud kapan pun kamu membutuhkannya.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center shrink-0">
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="rounded-xl border border-border bg-bg px-5 py-3 text-xs font-semibold text-text transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.97] cursor-pointer"
                  >
                    Masuk / Daftar
                  </button>
                  <button
                    type="button"
                    onClick={onEnterApp}
                    className="inline-flex items-center gap-2 rounded-xl bg-project-solid px-6 py-3 text-xs font-semibold text-white shadow-card-hover transition-[transform,opacity] duration-150 hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.97] cursor-pointer"
                  >
                    <span>Buka Ruang Kerja</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Ultra-Minimalist Editorial Footer */}
      <footer className="pt-14 pb-10 border-t border-border bg-bar">
        <div className="px-4 mx-auto max-w-6xl sm:px-6">
          <div className="grid grid-cols-1 gap-10 pb-12 border-b sm:grid-cols-12 border-border">
            <div className="space-y-3 sm:col-span-5">
              <div className="flex items-center gap-2.5">
                <img src="/icon.svg" alt="Yuumotion" className="w-6 h-6 rounded-lg" />
                <span className="text-sm font-bold font-display text-text">Yuumotion</span>
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-muted">
                Ruang kerja hibrida yang menyatukan kejelasan Kanban dengan ketenangan kanvas dokumen TipTap secara offline-first.
              </p>
            </div>
          </div>

          {/* Editorial Bottom Row & Subtle Typographic Watermark */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4 text-[11px] text-muted">
            <span>© {new Date().getFullYear()} Yuumotion Workspace.</span>
          </div>

        </div>
      </footer>
    </div>
  );
};
