import React from 'react';
import { ArrowRight, Compass, Kanban, Code } from '@phosphor-icons/react';
import { cn } from '../../lib/cn';

type PersonaTab = 'personal' | 'product' | 'engineering';

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

interface LandingPersonasSectionProps {
  personaTab: PersonaTab;
  setPersonaTab: (tab: PersonaTab) => void;
  onEnterApp: () => void;
}

export const LandingPersonasSection: React.FC<LandingPersonasSectionProps> = ({
  personaTab,
  setPersonaTab,
  onEnterApp
}) => {
  return (
    <section id="personas" className="py-20 sm:py-24 bg-[#FAF9F6] dark:bg-[#0B0D12]">
      <div data-reveal className="yuu-reveal px-4 mx-auto max-w-6xl sm:px-6">
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
                  <div className="flex justify-between items-center mb-5">
                    <div
                      className={cn(
                        'flex justify-center items-center w-10 h-10 rounded-xl',
                        isSelected ? 'text-white bg-white/20' : 'bg-project-soft text-project-solid'
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
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <h3 className={cn('mb-2 text-lg font-bold font-display', isSelected ? 'text-white' : 'text-text')}>
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
  );
};
