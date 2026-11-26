import React from 'react';
import { Kanban, FileText, ListBullets, Lightning, ShieldCheck } from '@phosphor-icons/react';

export const LandingDocsSection: React.FC = () => {
  return (
    <section id="docs" className="bg-[#0B0D12] text-white py-20 sm:py-24 border-y border-white/10">
      <div data-reveal className="yuu-reveal grid grid-cols-1 gap-10 items-center px-4 mx-auto max-w-7xl sm:px-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8 lg:order-1">
          <div className="rounded-2xl border border-white/15 bg-[#12151E] shadow-2xl overflow-hidden flex h-[520px] sm:h-[580px] select-none">
            <div className="w-11 bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] flex flex-col items-center py-3 gap-3 shrink-0 border-r border-white/15">
              <img src="/icon.svg" alt="Yuumotion" className="w-6 h-6 rounded-lg ring-1 ring-white/25" />
              <div className="w-5 border-t border-white/20" />
              <div className="h-6 w-6 rounded-lg bg-white/25 ring-1 ring-white/40 flex items-center justify-center text-[10px] font-bold">
                Y
              </div>
              <div className="h-6 w-6 rounded-lg text-white/70 flex items-center justify-center text-[10px] font-bold">
                D
              </div>
            </div>

            <div className="hidden sm:flex w-44 flex-col border-r border-white/10 bg-[#141720] p-3 shrink-0">
              <div className="text-[11px] font-bold text-white mb-3 truncate">Yuumotion Studio</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Papan Sprint
              </div>
              <div className="rounded-lg px-2 py-1 text-[11px] text-slate-300 flex items-center gap-1.5 mb-3">
                <Kanban className="w-3 h-3 text-slate-400" />
                <span className="truncate">Roadmap Q4</span>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Dokumen &amp; PRD
              </div>
              <div className="rounded-lg bg-blue-600/20 border border-blue-500/40 px-2 py-1 text-[11px] font-semibold text-blue-300 flex items-center gap-1.5">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">Arsitektur v2</span>
              </div>
            </div>

            <div className="flex-1 bg-[#0B0D12] flex flex-col overflow-hidden">
              <div className="relative h-32 sm:h-36 w-full shrink-0 overflow-hidden border-b border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80"
                  alt="Cover Dokumen Yuumotion"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12]/70 via-transparent to-transparent" />
                <span className="absolute right-3 top-3 rounded-lg border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  Ganti Cover
                </span>
              </div>

              <div className="flex-1 px-6 py-5 flex gap-5 overflow-hidden">
                <div className="flex-1 space-y-3.5 min-w-0">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#141720] text-lg shadow-md shrink-0">
                        📝
                      </span>
                      <span className="text-base sm:text-lg font-bold text-white truncate font-display">
                        Arsitektur Ruang Kerja
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-blue-400 shrink-0">✓ Tersimpan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {['Meeting Notes', 'PRD', 'Roadmap'].map((t) => (
                      <span key={t} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                    <div className="text-sm font-bold text-white font-display">1. Ringkasan Sistem</div>
                    <p className="text-slate-400">
                      Ketik perintah slash <span className="font-mono text-blue-400">/image</span> atau{' '}
                      <span className="font-mono text-blue-400">/code</span> untuk menyisipkan blok terstruktur secara instan.
                    </p>
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-[11px] text-blue-200">
                      TipTap terhubung langsung dengan tombol Export Markdown (.md).
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#141720] p-3 font-mono text-[10px] text-slate-300">
                      BroadcastChannel (0ms) + Hono SSE Realtime
                    </div>
                  </div>
                </div>

                <div className="hidden md:block w-36 shrink-0 rounded-xl border border-white/10 bg-[#141720] p-3 h-fit">
                  <div className="flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-400 pb-2 mb-2 border-b border-white/10">
                    <ListBullets className="w-3 h-3 text-blue-400" />
                    <span>Daftar Isi</span>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="font-semibold text-white truncate">1. Ringkasan</div>
                    <div className="pl-2 truncate text-slate-400">2. Skema DB</div>
                    <div className="pl-2 truncate text-slate-400">3. RBAC Policy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-4 lg:order-2">
          <h2 className="text-3xl font-bold tracking-tight leading-tight font-display sm:text-4xl">
            Tulis Spesifikasi,{' '}
            <span className="font-serif italic font-normal text-blue-400">Simpan Otomatis</span> di Perangkat.
          </h2>
          <p className="text-xs leading-relaxed sm:text-sm text-slate-300">
            Editor TipTap dengan perintah slash (/), daftar isi sticky otomatis, export Markdown (.md), serta sinkronisasi 0ms antar tab dan RBAC Owner hingga Viewer.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
            <div>
              <div className="flex gap-2 items-center mb-1 text-xs font-bold text-white">
                <Lightning className="w-4 h-4 text-blue-400" />
                <span>0ms Local Sync</span>
              </div>
              <p className="text-[11px] text-slate-400">
                BroadcastChannel lokal plus SSE stream saat terhubung ke server.
              </p>
            </div>
            <div>
              <div className="flex gap-2 items-center mb-1 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
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
  );
};
