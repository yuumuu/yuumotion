import React, { useMemo, useState } from 'react';
import {
  Kanban,
  FileText,
  Users,
  Plus,
  Gear,
  UserPlus,
  ShieldCheck,
  SquaresFour,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  CircleDashed
} from '@phosphor-icons/react';
import { UserRole, Workspace } from '../../types/board';
import { ActivityService } from '../../services/activityService';
import { Badge } from '../ui';
import { cn } from '../../lib/cn';
import { WorkspaceBoardsGrid } from './WorkspaceBoardsGrid';
import { WorkspaceDocsSection } from './WorkspaceDocsSection';
import { WorkspaceActivityPanel } from './WorkspaceActivityPanel';

interface WorkspaceOverviewProps {
  workspace: Workspace;
  currentUserRole: UserRole;
  canEdit: boolean;
  onSelectBoard: (boardId: string) => void;
  onSelectPage: (pageId: string) => void;
  onAddBoard: () => void;
  onAddPage: () => void;
  onAddPageFromTemplate?: (template: { title: string; contentHtml: string; icon?: string }) => void;
  onRenameBoard?: (boardId: string, newTitle: string) => void;
  onDeleteBoard?: (boardId: string) => void;
  onOpenBoardSettings?: (boardId: string) => void;
  onShareBoard?: (boardId: string) => void;
  onRenamePage?: (pageId: string, newTitle: string) => void;
  onDeletePage?: (pageId: string) => void;
  onAddSubPage?: (parentId: string) => void;
  onOpenMembers: () => void;
  onOpenSettings: () => void;
}

type OverviewTab = 'all' | 'boards' | 'pages' | 'members';

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({
  workspace,
  currentUserRole,
  canEdit,
  onSelectBoard,
  onSelectPage,
  onAddBoard,
  onAddPage,
  onAddPageFromTemplate,
  onRenameBoard,
  onDeleteBoard,
  onOpenBoardSettings,
  onShareBoard,
  onRenamePage,
  onDeletePage,
  onAddSubPage,
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
            <WorkspaceBoardsGrid
              boards={filteredBoards}
              canEdit={canEdit}
              onSelectBoard={onSelectBoard}
              onAddBoard={onAddBoard}
              onRenameBoard={onRenameBoard}
              onDeleteBoard={onDeleteBoard}
              onOpenBoardSettings={onOpenBoardSettings}
              onShareBoard={onShareBoard}
            />
          )}

          {showPages && (
            <WorkspaceDocsSection
              allPages={pages}
              filteredPages={filteredPages}
              rootPages={rootPages}
              childCountByPageId={childCountByPageId}
              canEdit={canEdit}
              onSelectPage={onSelectPage}
              onAddPage={onAddPage}
              onAddPageFromTemplate={onAddPageFromTemplate}
              onRenamePage={onRenamePage}
              onDeletePage={onDeletePage}
              onAddSubPage={onAddSubPage}
            />
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

        <WorkspaceActivityPanel
          stats={stats}
          recentActivities={recentActivities}
          members={members}
          onOpenMembers={onOpenMembers}
        />
      </div>
    </div>
  );
};
