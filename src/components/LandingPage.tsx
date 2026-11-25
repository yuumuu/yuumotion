import React, { useState } from 'react';
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
  Radio
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

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onEnterApp,
  onOpenAuth,
  isDark,
  onToggleTheme
}) => {
  const [previewView, setPreviewView] = useState<PreviewViewMode>('board');

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans selection:bg-project-soft selection:text-project-solid">
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-bar/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              alt="Yuumotion Logo"
              className="h-8 w-8 rounded-xl shadow-tactile-btn"
            />
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold tracking-tight text-text">
                Yuumotion
              </span>
              <span className="rounded-full border border-border bg-hover/70 px-2 py-0.5 font-mono text-[10px] font-medium text-muted">
                v0.2 edge
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-muted">
            <a href="#kanban" className="transition-colors hover:text-text">
              Papan Kanban
            </a>
            <a href="#docs" className="transition-colors hover:text-text">
              Dokumen PRD
            </a>
            <a href="#views" className="transition-colors hover:text-text">
              Multi-Views
            </a>
            <a href="#architecture" className="transition-colors hover:text-text">
              Arsitektur Edge
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted transition-colors hover:border-border hover:bg-hover hover:text-text cursor-pointer"
              title="Ganti Tema (Terang / Gelap)"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text shadow-2xs transition-all hover:bg-hover active:scale-[0.98] cursor-pointer"
            >
              {currentUser ? 'Akun' : 'Masuk'}
            </button>

            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-project-solid px-4 py-2 text-xs font-semibold text-white shadow-tactile-btn transition-all hover:opacity-95 active:scale-[0.98] cursor-pointer"
            >
              <span>Buka Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section: Display Headline & Real Triple-Panel App Shell Mockup */}
        <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_50%_at_50%_0%,var(--project-soft),transparent)]"
          />

          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-[11px] font-mono text-muted shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Offline-First Workspace • Wasmer Edge &amp; Supabase Realtime</span>
            </div>

            <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-text sm:text-5xl lg:text-[56px] lg:leading-[1.08] text-balance">
              Satu ruang kerja presisi untuk ide, dokumen, dan alur tugas tim.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Menggabungkan kejelasan papan Kanban dengan ketenangan kanvas dokumen TipTap.
              Berjalan instan secara lokal di peramban dan sinkron realtime antar perangkat tanpa biaya server bulanan.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 rounded-xl bg-project-solid px-6 py-3 text-sm font-semibold text-white shadow-card-hover transition-all hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 cursor-pointer"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text shadow-2xs transition-all hover:bg-hover active:scale-[0.98] cursor-pointer"
              >
                <span>Kelola Profil &amp; Akses</span>
              </button>
            </div>

            {/* Hero Real UI Mockup: Triple-Panel Shell */}
            <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl text-left">
              {/* Browser Window Top Bar */}
              <div className="flex items-center justify-between border-b border-border bg-bar px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-3 rounded-md border border-border bg-bg px-2.5 py-0.5 font-mono text-[11px] text-muted">
                    yuumotion.app / main-workspace / roadmap
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  <Radio className="h-3 w-3" />
                  <span>Realtime Active</span>
                </div>
              </div>

              {/* Triple-Panel Interior */}
              <div className="flex h-[380px] sm:h-[420px] bg-bg">
                {/* Panel 1: Mini Navigation Rail */}
                <div className="hidden sm:flex w-12 flex-col items-center justify-between border-r border-border bg-bar/80 py-3 shrink-0">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-project-solid text-white font-display text-xs font-bold">
                      M
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-muted">
                      <MagnifyingGlass className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-muted">
                      <Gear className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      Y
                    </div>
                  </div>
                </div>

                {/* Panel 2: Mini Project Explorer */}
                <div className="hidden md:flex w-48 flex-col border-r border-border bg-bar/40 p-3 shrink-0">
                  <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
                    <span className="h-2 w-2 rounded-full bg-project-solid" />
                    <span className="font-display text-xs font-bold text-text truncate">
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
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">Architecture Specs</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">Release Checklist</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Kanban Canvas */}
                <div className="flex-1 overflow-hidden p-4 bg-bg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 h-full">
                    {/* Column 1: To Do */}
                    <div className="flex flex-col rounded-xl border border-border bg-surface/60 p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-project-solid" />
                          <span className="text-xs font-semibold text-text">To Do</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted">2</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="rounded-xl border border-border bg-surface p-3 shadow-card-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-semibold text-muted">YUU-1</span>
                            <span className="rounded-md bg-status-high-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-high">
                              Tinggi
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-text leading-snug mb-2">
                            Sistem Token &amp; Tema Dinamis per Project
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-muted pt-1.5 border-t border-border/60">
                            <span className="font-mono">3/3 selesai</span>
                            <span className="h-4 w-4 rounded-full bg-project-solid text-white flex items-center justify-center text-[9px] font-bold">
                              H
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-3 shadow-card-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-semibold text-muted">YUU-4</span>
                            <span className="rounded-md bg-status-medium-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-medium">
                              Sedang
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-text leading-snug">
                            Panel Outline TOC Sticky pada Dokumen
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: In Progress */}
                    <div className="hidden sm:flex flex-col rounded-xl border border-border bg-surface/60 p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          <span className="text-xs font-semibold text-text">In Progress</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted">1</span>
                      </div>

                      <div className="rounded-xl border border-project-ring bg-surface p-3 shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] font-semibold text-muted">YUU-2</span>
                          <span className="rounded-md bg-status-urgent-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-urgent">
                            Urgent
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-text leading-snug mb-2">
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
                        <div className="w-full h-1 rounded-full bg-hover overflow-hidden">
                          <div className="h-full w-2/3 bg-project-solid rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Completed */}
                    <div className="hidden sm:flex flex-col rounded-xl border border-border bg-surface/60 p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-semibold text-text">Completed</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted">1</span>
                      </div>

                      <div className="rounded-xl border border-border bg-surface p-3 shadow-card-sm opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] font-semibold text-muted">YUU-3</span>
                          <CheckCircle className="h-3.5 w-3.5 text-status-done" weight="fill" />
                        </div>
                        <p className="text-xs font-semibold text-text leading-snug mb-2">
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
        <section id="kanban" className="border-t border-border bg-surface/50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-2.5 py-1 font-mono text-[11px] font-medium text-muted">
                  <Kanban className="h-3.5 w-3.5 text-project-solid" />
                  <span>BAB 01 • ALUR TUGAS TAKTIL</span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl text-balance">
                  Anatomi kartu yang tenang, informatif, dan responsif tanpa pergeseran layout.
                </h2>
                <p className="text-sm leading-relaxed text-muted">
                  Setiap kartu dirancang dengan hierarki informasi yang bersih: kode ID monospaced, indikator prioritas terkalibrasi, label tag maksimal tiga item, dan bilah progres checklist mini.
                </p>
                <ul className="space-y-3 pt-2 text-xs text-text">
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
                <div className="rounded-2xl border border-border bg-bg p-6 shadow-card-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Detailed Card Example */}
                    <div className="rounded-2xl border border-project-ring bg-surface p-4 shadow-card-hover transition-transform duration-200 hover:-translate-y-0.5">
                      <div className="h-20 w-full rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-950/60 dark:to-purple-950/40 border border-border/50 mb-3 flex items-center justify-center">
                        <Stack className="h-6 w-6 text-project-solid/70" />
                      </div>
                      <div className="flex items-center justify-between mb-2">
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
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-3.5 w-3.5 text-status-done" />
                            <span className="font-mono">4/5</span>
                          </span>
                          <span className="font-mono">Besok</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-hover overflow-hidden">
                          <div className="h-full w-4/5 rounded-full bg-status-done" />
                        </div>
                      </div>
                    </div>

                    {/* Drop Slot & Dragging State Visual */}
                    <div className="flex flex-col gap-3 justify-center">
                      <div className="rounded-xl border border-dashed border-project-solid/50 bg-project-soft/30 p-4 text-center">
                        <span className="font-mono text-[11px] text-project-solid font-medium">
                          Drop Slot Presisi (Zero Layout Shift)
                        </span>
                      </div>
                      <div className="rounded-xl border border-border bg-surface p-3.5 shadow-card-sm transition-transform duration-200 hover:-translate-y-0.5">
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
        <section id="docs" className="border-t border-border bg-bg py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                    {/* Doc Editor Area */}
                    <div className="sm:col-span-8 space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-project-soft text-project-solid">
                          <Compass className="h-4 w-4" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-text">
                          Spesifikasi Arsitektur Edge
                        </h3>
                      </div>

                      <div className="rounded-xl border border-border bg-project-soft/40 p-3 flex items-start gap-2.5 text-xs text-text">
                        <Info className="h-4 w-4 text-project-solid shrink-0 mt-0.5" />
                        <span>
                          Semua dokumen tersimpan otomatis di peramban dan mendukung kolaborasi langsung tanpa konflik.
                        </span>
                      </div>

                      {/* Slash Command Popover Simulation */}
                      <div className="rounded-xl border border-border bg-surface p-2 shadow-popover max-w-xs space-y-1">
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

                    {/* Sticky Outline TOC Preview */}
                    <div className="sm:col-span-4 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4 space-y-2">
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Daftar Isi (TOC)
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="font-medium text-project-solid flex items-center gap-1">
                          <CaretRight className="h-3 w-3" />
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

              <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-muted">
                  <FileText className="h-3.5 w-3.5 text-project-solid" />
                  <span>BAB 02 • EKOSISTEM DOKUMEN TIPTAP</span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl text-balance">
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

        {/* 5. Chapter 3: Multi-View Engine (Interactive View Switcher) */}
        <section id="views" className="border-t border-border bg-surface/50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-2.5 py-1 font-mono text-[11px] font-medium text-muted">
                  <Stack className="h-3.5 w-3.5 text-project-solid" />
                  <span>BAB 03 • MULTI-VIEW ENGINE</span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
                  Satu sumber data, empat sudut pandang kerja.
                </h2>
                <p className="text-sm text-muted">
                  Ubah tampilan papan sprint seketika tanpa menyalin ulang data tugas. Klik tab di samping untuk melihat pratinjau langsung.
                </p>
              </div>

              {/* Interactive Switcher */}
              <div className="inline-flex rounded-xl border border-border bg-bg p-1 self-start">
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
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
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

            {/* Interactive Preview Container */}
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card-sm min-h-[240px]">
              {previewView === 'board' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { col: 'To Do', items: ['YUU-11: Audit Kontras AA', 'YUU-12: Shortcut Keyboard'] },
                    { col: 'In Progress', items: ['YUU-13: TipTap Outline TOC'] },
                    { col: 'Done', items: ['YUU-10: Migrasi Phosphor Icons'] }
                  ].map((group) => (
                    <div key={group.col} className="rounded-xl border border-border bg-bg p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-text">
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
                  <table className="w-full text-left border-collapse text-xs">
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
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
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
                <div className="space-y-3 py-2">
                  {[
                    { id: 'YUU-10', label: 'Migrasi Phosphor Icons', left: '5%', width: '35%', color: 'bg-status-done' },
                    { id: 'YUU-13', label: 'TipTap Outline TOC & Full Width', left: '30%', width: '45%', color: 'bg-project-solid' },
                    { id: 'YUU-14', label: 'Wasmer Edge Production Deploy', left: '60%', width: '35%', color: 'bg-amber-500' }
                  ].map((bar) => (
                    <div key={bar.id} className="flex items-center gap-4 text-xs">
                      <span className="w-20 font-mono text-[11px] text-muted shrink-0">{bar.id}</span>
                      <div className="relative flex-1 h-8 rounded-lg bg-bg border border-border overflow-hidden flex items-center">
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
        </section>

        {/* 6. Chapter 4: Arsitektur Edge & Zero Server Fees */}
        <section id="architecture" className="border-t border-border bg-bg py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-muted">
                <Globe className="h-3.5 w-3.5 text-project-solid" />
                <span>BAB 04 • ARSITEKTUR EDGE &amp; OFFLINE-FIRST</span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
                Dirancang tangguh untuk produktivitas tanpa ketergantungan server mahal.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-project-soft text-project-solid mb-4">
                  <Lightning className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-text mb-2">
                  Sinkronisasi Dual-Layer
                </h3>
                <p className="text-xs leading-relaxed text-muted">
                  Kombinasi BroadcastChannel lokal (latensi 0ms antar tab) dan Supabase Realtime broadcast untuk kolaborasi lintas perangkat secara langsung.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-done-bg text-status-done mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-text mb-2">
                  Kontrol Akses RBAC Ketat
                </h3>
                <p className="text-xs leading-relaxed text-muted">
                  Pembagian peran Owner, Admin, Member, dan Viewer dengan penguncian kanvas otomatis untuk memastikan dokumen aman saat dibagikan.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-medium-bg text-status-medium mb-4">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-text mb-2">
                  Database Bridge &amp; Wasmer Edge
                </h3>
                <p className="text-xs leading-relaxed text-muted">
                  Ekspor dump SQL terstruktur untuk MySQL atau SQLite kapan saja, serta konfigurasi siap pakai untuk deploy ke CDN global Wasmer Edge.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Minimalist Footer */}
      <footer className="border-t border-border bg-bar py-8">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 text-xs text-muted">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="Yuumotion" className="h-5 w-5 rounded-md" />
            <span className="font-display font-bold text-text">Yuumotion</span>
            <span className="text-border">|</span>
            <span>Offline-First PWA &amp; Workspace Docs</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onOpenAuth}
              className="hover:text-text transition-colors cursor-pointer"
            >
              Autentikasi Akun
            </button>
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-1 font-medium text-project-solid hover:underline cursor-pointer"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Buka Ruang Kerja</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
