import React from 'react';
import {
  Kanban,
  FileText,
  Lightning,
  ShieldCheck,
  Globe,
  ArrowRight,
  Sun,
  Moon,
  Sparkle,
  Stack,
  Database
} from '@phosphor-icons/react';
import { AuthUser } from '../types/board';

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
  return (
    <div className="min-h-screen bg-appflowy-bg text-appflowy-text dark:bg-appflowy-darkBg dark:text-appflowy-darkText flex flex-col selection:bg-purple-500/20">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-appflowy-border/80 bg-appflowy-surface/80 backdrop-blur-md dark:border-appflowy-darkBorder/80 dark:bg-appflowy-darkSurface/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-purple-500/20">
              <Stack className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-appflowy-text dark:text-appflowy-darkText">
                Yuumotion
              </span>
              <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                Edge v0.1
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
            <a href="#features" className="transition-colors hover:text-purple-600 dark:hover:text-purple-400">
              Fitur Utama
            </a>
            <a href="#views" className="transition-colors hover:text-purple-600 dark:hover:text-purple-400">
              Multi-View Engine
            </a>
            <a href="#architecture" className="transition-colors hover:text-purple-600 dark:hover:text-purple-400">
              Arsitektur Edge
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-appflowy-muted transition-colors hover:bg-neutral-100 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
              title="Ganti Tema"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {currentUser ? (
              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-md cursor-pointer"
              >
                <span>Buka Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="rounded-xl px-3.5 py-2 text-xs font-medium text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={onEnterApp}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-md cursor-pointer"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_20%,rgba(147,51,234,0.08),transparent)] dark:bg-[radial-gradient(45%_35%_at_50%_20%,rgba(168,85,247,0.12),transparent)]" />
        
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/70 px-3.5 py-1 text-xs font-medium text-purple-700 backdrop-blur-xs dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300">
            <Sparkle className="h-3.5 w-3.5" />
            <span>Notion + Trello Fusion • Ditenagai Wasmer Edge</span>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
            Satu Ruang Kerja untuk Ide, Catatan, dan Manajemen Tugas Tim
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-appflowy-muted dark:text-appflowy-darkMuted sm:text-base">
            Menggabungkan ketenangan dokumen ala AppFlowy dan kelincahan visual Kanban Trello.
            Sepenuhnya offline-first, gratis tanpa biaya server, dan sinkron realtime antar perangkat.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onEnterApp}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:bg-purple-700 hover:shadow-lg cursor-pointer"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="rounded-xl border border-appflowy-border bg-appflowy-surface px-5 py-3 text-sm font-medium text-appflowy-text shadow-2xs transition-all hover:bg-neutral-50 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText dark:hover:bg-neutral-800/60 cursor-pointer"
            >
              Kelola Akun & Profil
            </button>
          </div>

          {/* Interactive Feature Mockup Preview */}
          <div className="mt-14 overflow-hidden rounded-2xl border border-appflowy-border bg-appflowy-surface p-2 shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
            <div className="flex items-center gap-2 border-b border-appflowy-border/80 px-4 py-3 dark:border-appflowy-darkBorder/80">
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
                yuumotion.wasmer.app • Live Multi-User Board
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-appflowy-bg/50 dark:bg-appflowy-darkBg/50 rounded-xl text-left">
              <div className="rounded-xl border border-appflowy-border bg-appflowy-surface p-3.5 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">TODO (3)</span>
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                </div>
                <div className="rounded-lg border border-appflowy-border p-2.5 text-xs bg-appflowy-bg dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg mb-2">
                  <p className="font-medium">Setup Wasmer Edge deploy config</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-appflowy-muted">
                    <span className="rounded bg-purple-100 px-1 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Infra</span>
                    <span>Tomorrow</span>
                  </div>
                </div>
                <div className="rounded-lg border border-appflowy-border p-2.5 text-xs bg-appflowy-bg dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg">
                  <p className="font-medium">Desain Cover Image & Dokumen TipTap</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-appflowy-muted">
                    <span className="rounded bg-blue-100 px-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300">UI/UX</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-appflowy-border bg-appflowy-surface p-3.5 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">IN PROGRESS (2)</span>
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <div className="rounded-lg border border-appflowy-border p-2.5 text-xs bg-appflowy-bg dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg">
                  <p className="font-medium">Integrasi Supabase Realtime Broadcast</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>⚡ 0ms local tab latency</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-appflowy-border bg-appflowy-surface p-3.5 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">DONE (4)</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="rounded-lg border border-appflowy-border p-2.5 text-xs bg-appflowy-bg dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg">
                  <p className="font-medium">Custom Select & Date Picker Components</p>
                  <div className="mt-2 text-[10px] text-appflowy-muted">
                    <span>Compliant WCAG AA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="border-t border-appflowy-border/80 bg-neutral-50/50 py-16 dark:border-appflowy-darkBorder/80 dark:bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Kemampuan Penuh untuk Produktivitas Mandiri & Tim
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-appflowy-muted dark:text-appflowy-darkMuted">
              Dirancang tanpa beban ketergantungan server berbayar, aman, dan fleksibel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300 mb-4">
                <Kanban className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">4 Tampilan Interaktif</h3>
              <p className="text-xs leading-relaxed text-appflowy-muted dark:text-appflowy-darkMuted">
                Pindah seketika antara Kanban Board, Kalender Bulanan, Gantt Timeline, dan Tabel Database Spreadsheet.
              </p>
            </div>

            <div className="rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Editor Dokumen TipTap</h3>
              <p className="text-xs leading-relaxed text-appflowy-muted dark:text-appflowy-darkMuted">
                Tulis catatan dengan perintah slash (/), task list checklist interaktif, kutipan, dan blok kode dengan mudah.
              </p>
            </div>

            <div className="rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 mb-4">
                <Lightning className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Sinkronisasi Instan Bebas Biaya</h3>
              <p className="text-xs leading-relaxed text-appflowy-muted dark:text-appflowy-darkMuted">
                Kombinasi BroadcastChannel lokal dan Supabase Realtime broadcast tanpa database berbayar untuk multi-user live.
              </p>
            </div>

            <div className="rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Role-Based Access Control</h3>
              <p className="text-xs leading-relaxed text-appflowy-muted dark:text-appflowy-darkMuted">
                Tingkatan hak akses rapi (Owner, Admin, Member, Viewer) untuk menjaga keamanan dokumen saat dibagikan.
              </p>
            </div>

            <div className="rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Database Bridge & SQL Export</h3>
              <p className="text-xs leading-relaxed text-appflowy-muted dark:text-appflowy-darkMuted">
                Unduh dump SQL terstruktur untuk MySQL lokal atau SQLite Wasmer tanpa setup rumit.
              </p>
            </div>

            <div className="rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 mb-4">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Wasmer Edge Deployment</h3>
              <p className="text-xs leading-relaxed text-appflowy-muted dark:text-appflowy-darkMuted">
                Konfigurasi `wasmer.toml` siap saji untuk deploy instan ke CDN global Wasmer Edge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-appflowy-border bg-appflowy-surface py-8 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 text-xs text-appflowy-muted dark:text-appflowy-darkMuted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-appflowy-text dark:text-appflowy-darkText">Yuumotion</span>
            <span>•</span>
            <span>Estetika AppFlowy dengan Fleksibilitas Notion</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenAuth} className="hover:underline cursor-pointer">
              Autentikasi & Akun
            </button>
            <button onClick={onEnterApp} className="hover:underline cursor-pointer">
              Buka Board Langsung
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};