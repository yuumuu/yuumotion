import React, { useState } from 'react';
import { Kanban, Plus, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { Button, Input } from './ui';
import { cn } from '../lib/cn';

interface EmptyWorkspaceOnboardingProps {
  userName: string;
  onCreateWorkspace: (name: string, icon: string) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || 'Workspace Baru';
    onCreateWorkspace(trimmed, icon);
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--project-soft),transparent_55%)] opacity-70" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-popover">
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

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-project-soft px-2.5 py-1 text-[11px] font-semibold text-project-solid mb-3">
            <Sparkle className="h-3 w-3" weight="fill" />
            <span>Mulai Ruang Kerja Baru</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text mb-1.5">
            Halo, {userName}
          </h1>
          <p className="text-xs leading-relaxed text-muted">
            Belum ada workspace aktif. Buat workspace baru untuk mulai menyusun papan Kanban, timeline, dan dokumen tim kamu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                    'flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-all cursor-pointer',
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

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            leftIcon={<Plus className="h-4 w-4" />}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Buat Workspace &amp; Papan Pertama
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-[11px] text-muted">
          <Kanban className="h-3.5 w-3.5 text-project-solid shrink-0" />
          <span>Otomatis dilengkapi papan Kanban &amp; editor dokumen siap pakai.</span>
        </div>
      </div>
    </div>
  );
};
