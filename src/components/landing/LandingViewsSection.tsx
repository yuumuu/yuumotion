import React, { Suspense } from 'react';
import { Kanban, Table as TableIcon, CalendarBlank, Clock } from '@phosphor-icons/react';
import { INITIAL_BOARD } from '../../lib/constants';
import { cn } from '../../lib/cn';
import { WorkspaceSkeleton } from '../ui';

const KanbanBoard = React.lazy(() => import('../board/KanbanBoard').then((m) => ({ default: m.KanbanBoard })));
const TableDatabaseView = React.lazy(() => import('../board/TableDatabaseView').then((m) => ({ default: m.TableDatabaseView })));
const CalendarView = React.lazy(() => import('../board/CalendarView').then((m) => ({ default: m.CalendarView })));
const TimelineGanttView = React.lazy(() => import('../board/TimelineGanttView').then((m) => ({ default: m.TimelineGanttView })));

export type PreviewViewMode = 'board' | 'table' | 'calendar' | 'timeline';

export const VIEW_STEPS: {
  id: PreviewViewMode;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'board',
    title: 'Kanban Board',
    desc: 'Seret dan lepas kartu antar kolom, batas WIP, dan edit judul langsung di tempat.',
    icon: <Kanban className="w-4 h-4" />
  },
  {
    id: 'table',
    title: 'Tabel Spreadsheet',
    desc: 'Ubah status, prioritas, dan tenggat waktu tugas dalam tampilan baris terstruktur.',
    icon: <TableIcon className="w-4 h-4" />
  },
  {
    id: 'calendar',
    title: 'Kalender Bulanan',
    desc: 'Seret kartu langsung antar tanggal dan pantau event multi-hari sekaligus.',
    icon: <CalendarBlank className="w-4 h-4" />
  },
  {
    id: 'timeline',
    title: 'Gantt Timeline',
    desc: 'Geser jadwal atau tarik tepi bar timeline untuk menyesuaikan durasi pengerjaan.',
    icon: <Clock className="w-4 h-4" />
  }
];

interface LandingViewsSectionProps {
  viewsSectionRef: React.RefObject<HTMLElement>;
  previewView: PreviewViewMode;
  viewScrollProgress: number;
  onSelectStep: (idx: number, id: PreviewViewMode) => void;
}

export const LandingViewsSection: React.FC<LandingViewsSectionProps> = ({
  viewsSectionRef,
  previewView,
  viewScrollProgress,
  onSelectStep
}) => {
  const noop = () => {};

  return (
    <section
      id="views"
      ref={viewsSectionRef}
      className="relative bg-white dark:bg-[#11131A] border-b border-border lg:h-[270vh]"
    >
      <div className="relative flex overflow-hidden items-center py-14 lg:sticky lg:top-0 lg:h-screen lg:py-0">
        <div className="hidden lg:block absolute top-0 inset-x-0 z-20 h-1 bg-border/60">
          <div
            style={{ transform: `scaleX(${Math.max(0.04, viewScrollProgress)})` }}
            className="h-full origin-left bg-gradient-to-r from-[#2563EB] to-[#60A5FA] transition-transform duration-100 ease-out"
          />
        </div>

        <div data-reveal className="yuu-reveal px-4 mx-auto w-full max-w-7xl sm:px-6">
          <div className="grid grid-cols-1 gap-8 items-center lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-project-solid">
                  Progres Tampilan Â· 0{VIEW_STEPS.findIndex((s) => s.id === previewView) + 1} / 0{VIEW_STEPS.length}
                </span>
                <span className="hidden lg:inline-block font-mono text-[11px] text-muted">
                  {Math.round(viewScrollProgress * 100)}%
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight font-display sm:text-4xl text-text">
                  Satu Sumber Data, Empat Perspektif Nyata
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-muted">
                  Scroll atau klik tab untuk melihat perubahan tampilan langsung dari komponen aplikasi.
                </p>
              </div>

              <div className="flex gap-3 items-stretch">
                <div className="hidden lg:block w-1 rounded-full bg-border overflow-hidden shrink-0">
                  <div
                    style={{ height: `${Math.max(12, viewScrollProgress * 100)}%` }}
                    className="w-full rounded-full bg-gradient-to-b from-[#2563EB] to-[#60A5FA] transition-[height] duration-150 ease-out"
                  />
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  {VIEW_STEPS.map((step, idx) => {
                    const isActive = previewView === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => onSelectStep(idx, step.id)}
                        className={cn(
                          'w-full text-left rounded-xl border px-3.5 py-2.5 transition-[border-color,background-color,color] duration-150 cursor-pointer',
                          isActive
                            ? 'border-project-solid bg-[#0B0D12] text-white shadow-md'
                            : 'border-border bg-bg text-text hover:border-project-ring'
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            <span
                              className={cn(
                                'flex justify-center items-center w-6 h-6 rounded-lg',
                                isActive ? 'text-white bg-blue-600' : 'bg-project-soft text-project-solid'
                              )}
                            >
                              {step.icon}
                            </span>
                            <span className="text-xs font-bold font-display">{step.title}</span>
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
            </div>

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

                <div className="overflow-hidden rounded-2xl border shadow-2xl border-border bg-bg">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bar">
                    <div className="flex gap-2 items-center">
                      <img src="/icon.svg" alt="Yuumotion" className="w-5 h-5 rounded-md" />
                      <span className="text-xs font-bold font-display text-text">
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
                    <Suspense fallback={<WorkspaceSkeleton />}>
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
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
