import React, { useState } from 'react';
import { Kanban, Plus, Sparkle, ArrowRight, FileText, Lightning, CheckCircle } from '@phosphor-icons/react';
import { Button, Input } from './ui';
import { cn } from '../lib/cn';
import { WorkspaceTemplateType } from '../types/board';
import { WORKSPACE_TEMPLATES } from './CreateWorkspaceModal';

interface EmptyWorkspaceOnboardingProps {
  userName: string;
  onCreateWorkspace: (name: string, icon: string, template?: WorkspaceTemplateType) => void;
  onNavigateLanding: () => void;
}

const WORKSPACE_ICONS = ['🚀', '✨', '📋', '💡', '🎯', '⚡', '🌿', '🎨'];

export const EmptyWorkspaceOnboarding: React.FC<EmptyWorkspaceOnboardingProps> = ({
  userName,
  onCreateWorkspace,
  onNavigateLanding
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [template, setTemplate] = useState<WorkspaceTemplateType>('full');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || 'Workspace Baru';
    onCreateWorkspace(trimmed, icon, template);
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--project-soft),transparent_60%)] opacity-80" />

      <div className="relative z-10 w-full max-w-4xl rounded-3xl border border-border bg-surface shadow-popover overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Interactive Workspace Builder */}
        <div className="p-6 sm:p-8 lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <img src="/icon.svg" alt="Yuumotion" className="h-8 w-8 rounded-xl" />
              <span className="font-display text-sm font-bold tracking-tight text-text">Yuumotion</span>
            </div>
            <button
              type="button"
              onClick={onNavigateLanding}
              className="text-xs font-medium text-muted hover:text-text transition-colors cursor-pointer"
            >
              Beranda
            </button>
          </div>

          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-project-soft px-2.5 py-1 text-[11px] font-semibold text-project-solid mb-2.5">
              <Sparkle className="h-3 w-3" weight="fill" />
              <span>Mulai Ruang Kerja Baru</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text mb-1">
              Halo, {userName}
            </h1>
            <p className="text-xs leading-relaxed text-muted">
              Atur identitas dan struktur awal workspace sesuai kebutuhan tim atau proyek pribadi kamu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                Pilih Ikon
              </label>
              <div className="flex flex-wrap gap-2">
                {WORKSPACE_ICONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setIcon(item)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-transform cursor-pointer',
                      icon === item
                        ? 'border-project-accent bg-project-soft scale-105 shadow-2xs'
                        : 'border-border bg-bar hover:bg-hover'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
                Nama Workspace
              </label>
              <Input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Produk Studio, Sprint Q2..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                Struktur Awal Workspace
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WORKSPACE_TEMPLATES.map((tpl) => {
                  const active = template === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplate(tpl.id)}
                      className={cn(
                        'flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors cursor-pointer',
                        active
                          ? 'border-project-accent bg-project-soft/60 text-text'
                          : 'border-border bg-bg text-text hover:bg-hover'
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-lg',
                              active ? 'bg-project-solid text-white' : 'bg-surface text-project-solid'
                            )}
                          >
                            {tpl.icon}
                          </span>
                          <span className="text-xs font-bold font-display">{tpl.label}</span>
                        </div>
                        {tpl.badge && (
                          <span className="rounded-md bg-project-solid px-1.5 py-0.5 text-[9px] font-semibold text-white">
                            {tpl.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-snug text-muted">{tpl.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              leftIcon={<Plus className="h-4 w-4" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Buat Workspace Sekarang
            </Button>
          </form>
        </div>

        {/* Right: Rich Visual Preview Panel */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-gradient-to-b from-[#1D4ED8] to-[#0B3AB5] text-white p-7 relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <span className="text-base">{icon}</span>
              <span className="truncate max-w-[180px]">{name.trim() || 'Workspace Baru'}</span>
            </div>

            <h2 className="font-display text-xl font-bold leading-snug">
              Semua alur kerja tim dalam satu ruang terpadu.
            </h2>

            <div className="space-y-2.5 pt-1">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold mb-1">
                  <Kanban className="h-4 w-4 text-sky-200" />
                  <span>Multi-View Engine</span>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  Kelola tugas dalam mode Kanban, Tabel, Kalender Bulanan, hingga Gantt Timeline.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold mb-1">
                  <FileText className="h-4 w-4 text-sky-200" />
                  <span>Dokumen TipTap + Cover</span>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  Tulis PRD dengan slash command (/), daftar isi sticky otomatis, dan ekspor Markdown.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold mb-1">
                  <Lightning className="h-4 w-4 text-sky-200" />
                  <span>0ms Local &amp; Cloud Sync</span>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  Tersimpan instan di browser serta siap disambungkan ke Hono + TiDB atau Supabase.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[11px] text-white/80 pt-4 border-t border-white/15">
            <CheckCircle className="h-4 w-4 text-sky-200 shrink-0" />
            <span>Bisa ditambah atau diubah kapan saja dari sidebar.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
