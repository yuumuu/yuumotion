import React, { useMemo, useState } from 'react';
import {
  Kanban,
  FileText,
  Users,
  Plus,
  Gear,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  SquaresFour,
  FolderSimple,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  CircleDashed,
  BookOpen,
  Stack,
  Compass
} from '@phosphor-icons/react';
import { UserRole, Workspace } from '../types/board';
import { ActivityService } from '../services/activityService';
import { Badge } from './ui';
import { cn } from '../lib/cn';

interface WorkspaceOverviewProps {
  workspace: Workspace;
  currentUserRole: UserRole;
  canEdit: boolean;
  onSelectBoard: (boardId: string) => void;
  onSelectPage: (pageId: string) => void;
  onAddBoard: () => void;
  onAddPage: () => void;
  onAddPageFromTemplate?: (template: { title: string; contentHtml: string; icon?: string }) => void;
  onOpenMembers: () => void;
  onOpenSettings: () => void;
}

type OverviewTab = 'all' | 'boards' | 'pages' | 'members';

const QUICK_DOC_TEMPLATES = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    desc: 'Notulensi rapat tim, poin keputusan, dan daftar tindak lanjut.',
    docTitle: 'Notulensi Rapat Tim',
    icon: <BookOpen className="h-4 w-4" />,
    docIcon: 'book',
    contentHtml: '<h2>Agenda Rapat</h2><p>Ringkasan topik pembahasan tim.</p><h3>Poin Keputusan</h3><ul><li>Prioritas sprint minggu ini.</li></ul>'
  },
  {
    id: 'prd-spec',
    title: 'Product Specs (PRD)',
    desc: 'Dokumen kebutuhan fitur, sasaran pengguna, dan kriteria rilis.',
    docTitle: 'Product Requirement Document',
    icon: <Stack className="h-4 w-4" />,
    docIcon: 'layers',
    contentHtml: '<h2>1. Latar Belakang</h2><p>Ringkasan masalah dan tujuan fitur.</p><h2>2. Sasaran Pengguna</h2><p>Pengguna utama dan skenario pemakaian.</p>'
  },
  {
    id: 'sprint-roadmap',
    title: 'Sprint Roadmap',
    desc: 'Target sprint, tonggak rilis, dan dependensi lintas tim.',
    docTitle: 'Sprint Planning Roadmap',
    icon: <Compass className="h-4 w-4" />,
    docIcon: 'compass',
    contentHtml: '<h2>Sprint Goal</h2><p>Target utama yang ingin dicapai pada siklus ini.</p><ul><li>Deliverable utama</li></ul>'
  }
];

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({
  workspace,
  currentUserRole,
  canEdit,
  onSelectBoard,
  onSelectPage,
  onAddBoard,
  onAddPage,
  onAddPageFromTemplate,
  onOpenMembers,
  onOpenSettings
}) => {
  const [activeTab, setActiveTab] = useState<OverviewTab>('all');
  const [hubQuery, setHubQuery] = useState('');

  const boards = workspace.boards || [];
  const pages = workspace.pages || [];
  const members = workspace.members || [];

  const stats = useMemo(() => {
    let todo = 0;
    let inProgress = 0;
    let done = 0;

    boards.forEach((b) => {
      const doneColIds = new Set<string>();
      const progressColIds = new Set<string>();
      b.columns.forEach((c) => {
        const t = c.title.toLowerCase();
        if (t.includes('done') || t.includes('selesai') || t.includes('completed')) {
          doneColIds.add(c.id);
        } else if (t.includes('progress') || t.includes('review') || t.includes('kerjakan')) {
          progressColIds.add(c.id);
        }
      });

      Object.values(b.cards || {}).forEach((card) => {
        if (doneColIds.has(card.columnId)) done += 1;
        else if (progressColIds.has(card.columnId)) inProgress += 1;
        else todo += 1;
      });
    });

    const total = todo + inProgress + done;
    return { todo, inProgress, done, total };
  }, [boards]);

  const recentActivities = useMemo(() => {
    const logged = ActivityService.getByWorkspace(workspace.id, 6);
    if (logged.length > 0) return logged;

    return boards
      .flatMap((b) =>
        Object.values(b.cards || {}).map((c) => ({
          id: `fallback-${c.id}`,
          workspaceId: workspace.id,
          boardId: b.id,
          cardId: c.id,
          userId: 'system',
          userName: b.title,
          action: 'card.updated' as const,
          summary: `Kartu "${c.title}" diperbarui`,
          createdAt: c.updatedAt || Date.now()
        }))
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [workspace.id, boards]);

  const q = hubQuery.trim().toLowerCase();
  const filteredBoards = useMemo(
    () => (q ? boards.filter((b) => b.title.toLowerCase().includes(q)) : boards),
    [boards, q]
  );
  const filteredPages = useMemo(
    () => (q ? pages.filter((p) => (p.title || 'Untitled Document').toLowerCase().includes(q)) : pages),
    [pages, q]
  );

  const rootPages = useMemo(() => {
    const ids = new Set(pages.map((p) => p.id));
    return filteredPages.filter((p) => !p.parentId || !ids.has(p.parentId));
  }, [filteredPages, pages]);

  const childCountByPageId = useMemo(() => {
    const map: Record<string, number> = {};
    pages.forEach((p) => {
      if (p.parentId) map[p.parentId] = (map[p.parentId] || 0) + 1;
    });
    return map;
  }, [pages]);

  const tabs: { id: OverviewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Semua', icon: <SquaresFour className="h-3.5 w-3.5" /> },
    { id: 'boards', label: 'Papan', icon: <Kanban className="h-3.5 w-3.5" /> },
    { id: 'pages', label: 'Dokumen', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'members', label: 'Anggota', icon: <Users className="h-3.5 w-3.5" /> }
  ];

  const showBoards = activeTab === 'all' || activeTab === 'boards';
  const showPages = activeTab === 'all' || activeTab === 'pages';
  const showMembers = activeTab === 'members';

  const maxBar = Math.max(1, stats.todo, stats.inProgress, stats.done);
  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="px-4 pt-[var(--space-card-gap)] pb-2 select-none sm:px-6 shrink-0">
        <div className="overflow-hidden relative px-5 py-[var(--space-banner-py)] text-white bg-gradient-to-l via-blue-600 rounded-2xl from-project-solid to-project-accent sm:px-6 shadow-card-sm">
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl pointer-events-none bg-white/15"
          />
          <div className="flex relative flex-col gap-3 justify-between sm:flex-row sm:items-center">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/85">
                <span>WORKSPACE</span>
                <span>/</span>
                <span className="uppercase">{currentUserRole}</span>
                <span>/</span>
                <span>{workspace.joinPolicy === 'open' ? 'Terbuka' : 'Undangan'}</span>
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0" aria-hidden="true">
                  {workspace.icon || '🚀'}
                </span>
                <h1 className="text-lg font-bold tracking-tight truncate font-display sm:text-2xl">
                  {workspace.name}
                </h1>
              </div>
            </div>

            <div className="flex gap-3 items-center shrink-0">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    title={`${m.name} (${m.role})`}
                    style={{ backgroundColor: m.color || '#2563EB' }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#2563EB] text-[10px] font-bold text-white shadow-2xs"
                  >
                    {m.avatarEmoji || m.avatar || m.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onOpenMembers}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-[background-color,transform] duration-150 ease-out hover:bg-white/25 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Anggota</span>
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  title="Pengaturan Workspace"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-[background-color,transform] duration-150 ease-out hover:bg-white/25 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
                >
                  <Gear className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Pengaturan</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-between items-center pb-3 mt-3 border-b border-border">
          <div className="flex flex-wrap gap-2 items-center sm:gap-2.5">
            <div className="relative flex items-center">
              <MagnifyingGlass className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                value={hubQuery}
                onChange={(e) => setHubQuery(e.target.value)}
                placeholder="Cari papan atau dokumen..."
                className="h-8 w-48 sm:w-56 rounded-xl border border-border bg-surface pl-8 pr-3 text-xs text-text placeholder:text-muted focus:border-project-accent focus:outline-none"
              />
            </div>

            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={onAddBoard}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-project-solid px-3 py-1.5 text-xs font-semibold text-white shadow-tactile-btn transition-[opacity,transform] duration-150 ease-out hover:opacity-95 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" weight="bold" />
                  <span>Buat Papan</span>
                </button>
                <button
                  type="button"
                  onClick={onAddPage}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text transition-[background-color,transform] duration-150 ease-out hover:bg-hover active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-project-solid" weight="bold" />
                  <span>Buat Dokumen</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center rounded-xl border border-border bg-hover/60 p-0.5 text-xs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-project-accent cursor-pointer',
                    isActive
                      ? 'bg-surface text-text font-semibold shadow-card-sm'
                      : 'text-muted hover:text-text'
                  )}
                >
                  <span className={isActive ? 'text-project-solid' : 'text-muted'}>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-[var(--space-card-gap)] sm:px-6 grid grid-cols-1 gap-[var(--space-section-gap)] lg:grid-cols-[minmax(0,1fr)_310px] items-start">
        <div className="space-y-[var(--space-section-gap)] min-w-0">
          {/* Quick Progress Strip */}
          <div className="grid grid-cols-3 gap-[var(--space-card-gap)]">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-[var(--space-card-p)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-hover text-muted">
                <CircleDashed className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-muted truncate">
                  {stats.todo}/{stats.total} tugas
                </div>
                <div className="truncate font-display text-xs font-bold text-text">Perlu Dikerjakan</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-[var(--space-card-p)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-project-soft text-project-solid">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-muted truncate">
                  {stats.inProgress}/{stats.total} tugas
                </div>
                <div className="truncate font-display text-xs font-bold text-text">Sedang Berjalan</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-[var(--space-card-p)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-status-done-bg text-status-done">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-muted truncate">
                  {stats.done}/{stats.total} tugas
                </div>
                <div className="truncate font-display text-xs font-bold text-text">Selesai</div>
              </div>
            </div>
          </div>

          {showBoards && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                  Papan Kerja ({filteredBoards.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-[var(--space-card-gap)] sm:grid-cols-2 xl:grid-cols-3">
                {filteredBoards.map((board) => {
                  const cards = Object.values(board.cards || {});
                  const doneIds = new Set(
                    board.columns
                      .filter((c) => {
                        const t = c.title.toLowerCase();
                        return t.includes('done') || t.includes('selesai') || t.includes('completed');
                      })
                      .map((c) => c.id)
                  );
                  const doneCount = cards.filter((c) => doneIds.has(c.columnId)).length;
                  const pct = cards.length > 0 ? Math.round((doneCount / cards.length) * 100) : 0;

                  return (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => onSelectBoard(board.id)}
                      className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-[var(--space-card-p)] text-left transition-[border-color,background-color,transform] duration-150 ease-out hover:border-project-ring hover:bg-hover/30 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-project-soft text-project-solid">
                              <Kanban className="h-4 w-4" />
                            </div>
                            <span className="truncate font-display text-sm font-bold text-text group-hover:text-project-solid">
                              {board.title}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                            <span>{board.columns.length} kolom • {cards.length} kartu</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                            <div
                              className="h-full rounded-full bg-project-solid transition-[width] duration-200"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {canEdit && (
                  <button
                    type="button"
                    onClick={onAddBoard}
                    className="flex min-h-[108px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-surface/40 p-[var(--space-card-p)] text-xs font-semibold text-muted transition-[border-color,color,background-color,transform] duration-150 ease-out hover:border-project-accent hover:bg-project-soft/20 hover:text-project-solid active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Tambah Papan Baru</span>
                  </button>
                )}
              </div>
            </section>
          )}

          {showPages && (
            <section className="space-y-4">
              <div className="space-y-3">
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                  Folder & Dokumen ({filteredPages.length})
                </h2>

                <div className="grid grid-cols-2 gap-[var(--space-card-gap)] sm:grid-cols-3 xl:grid-cols-4">
                  {rootPages.map((page) => {
                    const subCount = childCountByPageId[page.id] || 0;
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => onSelectPage(page.id)}
                        className="group flex flex-col items-start justify-between rounded-2xl border border-border bg-surface p-[var(--space-card-p)] text-left transition-[border-color,background-color,transform] duration-150 ease-out hover:border-project-ring hover:bg-hover/30 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bar text-text border border-border/70">
                            {subCount > 0 ? (
                              <FolderSimple className="h-4 w-4 text-project-solid" weight="duotone" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted group-hover:text-project-solid" />
                            )}
                          </div>
                          {subCount > 0 && (
                            <span className="rounded-full bg-hover px-2 py-0.5 font-mono text-[10px] font-semibold text-muted">
                              {subCount} sub
                            </span>
                          )}
                        </div>
                        <div className="mt-3 w-full">
                          <div className="truncate font-display text-xs font-bold text-text group-hover:text-project-solid">
                            {page.title || 'Untitled Document'}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted">
                            {new Date(page.updatedAt || Date.now()).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {canEdit && (
                    <button
                      type="button"
                      onClick={onAddPage}
                      className="flex min-h-[108px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-surface/40 p-[var(--space-card-p)] text-xs font-semibold text-muted transition-[border-color,color,background-color,transform] duration-150 ease-out hover:border-project-accent hover:bg-project-soft/20 hover:text-project-solid active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Tambah Dokumen</span>
                    </button>
                  )}
                </div>
              </div>

              {canEdit && onAddPageFromTemplate && (
                <div className="space-y-2.5">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                    Template Dokumen Cepat
                  </h3>
                  <div className="grid grid-cols-1 gap-[var(--space-card-gap)] sm:grid-cols-3">
                    {QUICK_DOC_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-[var(--space-card-p)]"
                      >
                        <div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bar text-text border border-border/70">
                            {tpl.icon}
                          </div>
                          <div className="mt-2.5 font-display text-xs font-bold text-text">{tpl.title}</div>
                          <p className="mt-1 text-[11px] leading-relaxed text-muted">{tpl.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onAddPageFromTemplate({
                              title: tpl.docTitle,
                              contentHtml: tpl.contentHtml,
                              icon: tpl.docIcon
                            })
                          }
                          className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-bar px-2.5 py-1 text-[11px] font-medium text-text transition-colors hover:border-project-accent hover:text-project-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Gunakan</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredPages.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                    Daftar Dokumen
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="grid grid-cols-[minmax(0,1fr)_120px_96px] gap-2 border-b border-border bg-bar/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                      <span>Nama Dokumen</span>
                      <span>Induk</span>
                      <span className="text-right">Diperbarui</span>
                    </div>
                    <div className="divide-y divide-border/60">
                      {filteredPages.map((page) => {
                        const parent = page.parentId ? pages.find((p) => p.id === page.parentId) : null;
                        return (
                          <button
                            key={page.id}
                            type="button"
                            onClick={() => onSelectPage(page.id)}
                            className="grid w-full grid-cols-[minmax(0,1fr)_120px_96px] items-center gap-2 px-4 h-[var(--space-row-h)] text-left text-xs transition-colors hover:bg-hover/50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-project-accent cursor-pointer"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <FileText className="h-3.5 w-3.5 text-project-solid shrink-0" />
                              <span className="truncate font-medium text-text">
                                {page.title || 'Untitled Document'}
                              </span>
                            </span>
                            <span className="truncate text-[11px] text-muted">
                              {parent ? parent.title : 'Root'}
                            </span>
                            <span className="text-right font-mono text-[10px] text-muted">
                              {new Date(page.updatedAt || Date.now()).toLocaleDateString('id-ID')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {showMembers && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                  Anggota Tim ({members.length})
                </h2>
                <button
                  type="button"
                  onClick={onOpenMembers}
                  className="text-xs font-medium text-project-solid hover:underline cursor-pointer"
                >
                  Kelola Anggota
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        style={{ backgroundColor: m.color || '#2563EB' }}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      >
                        {m.avatarEmoji || m.avatar || m.name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-text">{m.name}</div>
                        <div className="truncate text-[10px] text-muted">{m.title || m.email}</div>
                      </div>
                    </div>
                    <Badge variant="neutral" className="uppercase text-[10px]">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      {m.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Panel: Real Progress Chart & Recent Activity */}
        <aside className="space-y-[var(--space-card-gap)]">
          <div className="rounded-2xl border border-border bg-surface p-[var(--space-card-p)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                Progres Tugas
              </h2>
              <span className="font-mono text-xs font-bold text-project-solid">{completionPct}%</span>
            </div>

            <div className="grid grid-cols-3 gap-3 items-end h-28 pt-2 px-2 rounded-xl bg-bar/50 border border-border/60">
              {[
                { label: 'Todo', value: stats.todo, colorClass: 'bg-muted/40' },
                { label: 'Proses', value: stats.inProgress, colorClass: 'bg-project-solid' },
                { label: 'Selesai', value: stats.done, colorClass: 'bg-status-done' }
              ].map((bar) => {
                const hPct = stats.total > 0 ? Math.max(12, Math.round((bar.value / maxBar) * 100)) : 12;
                return (
                  <div key={bar.label} className="flex flex-col items-center justify-end h-full gap-1 pb-2">
                    <span className="font-mono text-[10px] font-semibold text-text">{bar.value}</span>
                    <div className="w-full flex items-end justify-center flex-1">
                      <div
                        className={cn('w-7 rounded-t-lg transition-[height] duration-200', bar.colorClass)}
                        style={{ height: `${hPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-[var(--space-card-p)] space-y-2.5">
            <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
              Aktivitas Terbaru
            </h2>
            {recentActivities.length === 0 ? (
              <p className="text-[11px] text-muted py-2">Belum ada aktivitas tercatat.</p>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((act) => (
                  <div key={act.id} className="rounded-xl border border-border/60 bg-bar/40 px-3 py-2 text-[11px]">
                    <div className="font-medium text-text line-clamp-2">{act.summary}</div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted font-mono">
                      <span className="truncate">{act.userName}</span>
                      <span>
                        {new Date(act.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-[var(--space-card-p)] space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                Tim ({members.length})
              </h2>
              <button
                type="button"
                onClick={onOpenMembers}
                className="text-[11px] font-medium text-project-solid hover:underline cursor-pointer"
              >
                Kelola
              </button>
            </div>
            <div className="space-y-1.5">
              {members.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 py-1 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      style={{ backgroundColor: m.color || '#2563EB' }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    >
                      {m.avatarEmoji || m.avatar || m.name[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="truncate font-medium text-text">{m.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-muted shrink-0">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
