import React from 'react';
import { Kanban, FileText, Sparkle, Plus, ArrowRight, Lightning, CalendarBlank, Keyboard } from '@phosphor-icons/react';
import { cn } from '../lib/cn';

interface EmptyWorkspaceContentProps {
  workspaceName: string;
  canEdit: boolean;
  onCreateBoard: () => void;
  onOpenTemplates: () => void;
  onCreatePage: () => void;
}

export const EmptyWorkspaceContent: React.FC<EmptyWorkspaceContentProps> = ({
  workspaceName,
  canEdit,
  onCreateBoard,
  onOpenTemplates,
  onCreatePage
}) => {
  const starterCards = [
    {
      title: 'Buat Papan Kanban',
      desc: 'Susun alur kerja sprint, kolom WIP, dan switch ke Kalender atau Timeline.',
      cta: 'Papan Baru',
      icon: <Kanban className="h-5 w-5" />,
      primary: true,
      onClick: onCreateBoard
    },
    {
      title: 'Pakai Template Siap',
      desc: 'Pilih template Roadmap Produk, Sprint Mingguan, atau Content Pipeline.',
      cta: 'Lihat Template',
      icon: <Sparkle className="h-5 w-5" weight="fill" />,
      primary: false,
      onClick: onOpenTemplates
    },
    {
      title: 'Tulis Dokumen & Wiki',
      desc: 'Editor TipTap dengan perintah slash (/), daftar isi sticky, dan cover.',
      cta: 'Dokumen Baru',
      icon: <FileText className="h-5 w-5" />,
      primary: false,
      onClick: onCreatePage
    }
  ];

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-y-auto bg-bg p-6 sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--project-soft),transparent_58%)] opacity-60" />

      <div className="relative z-10 w-full max-w-3xl space-y-6">
        <div className="rounded-3xl border border-border bg-surface p-7 sm:p-9 shadow-card-sm text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-project-soft px-3 py-1 text-[11px] font-semibold text-project-solid">
            <Sparkle className="h-3.5 w-3.5" weight="fill" />
            <span>Ruang Kerja Siap Diisi</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
            {workspaceName} masih kosong
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-muted leading-relaxed">
            Pilih titik awal di bawah ini untuk langsung membangun papan kerja, memakai template, atau menulis dokumen tim pertama kamu.
          </p>

          {canEdit ? (
            <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3 text-left">
              {starterCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={card.onClick}
                  className={cn(
                    'group flex flex-col justify-between rounded-2xl border p-4 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 cursor-pointer',
                    card.primary
                      ? 'border-project-accent bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] text-white shadow-md'
                      : 'border-border bg-bg text-text hover:border-project-ring hover:shadow-sm'
                  )}
                >
                  <div>
                    <div
                      className={cn(
                        'mb-3 flex h-10 w-10 items-center justify-center rounded-xl',
                        card.primary ? 'bg-white/20 text-white' : 'bg-project-soft text-project-solid'
                      )}
                    >
                      {card.icon}
                    </div>
                    <h3 className={cn('font-display text-sm font-bold', card.primary ? 'text-white' : 'text-text')}>
                      {card.title}
                    </h3>
                    <p className={cn('mt-1 text-[11px] leading-relaxed', card.primary ? 'text-white/85' : 'text-muted')}>
                      {card.desc}
                    </p>
                  </div>

                  <div
                    className={cn(
                      'mt-4 inline-flex items-center gap-1.5 text-xs font-semibold',
                      card.primary ? 'text-white' : 'text-project-solid'
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{card.cta}</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-xs text-muted italic">
              Hubungi admin workspace untuk menambahkan papan atau dokumen.
            </p>
          )}
        </div>

        {/* Bottom Tips Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-muted">
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3">
            <Keyboard className="h-4 w-4 text-project-solid shrink-0" />
            <span>Tekan <strong className="text-text font-mono">⌘K</strong> untuk pencarian &amp; aksi cepat</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3">
            <CalendarBlank className="h-4 w-4 text-project-solid shrink-0" />
            <span>4 mode tampilan: Board, Tabel, Kalender, Gantt</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3">
            <Lightning className="h-4 w-4 text-project-solid shrink-0" />
            <span>Otomatis tersimpan lokal &amp; siap sinkron cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
