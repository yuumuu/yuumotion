import React, { useState } from 'react';
import {
  Kanban,
  FileText,
  Users,
  Plus,
  Gear,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  SquaresFour
} from '@phosphor-icons/react';
import { UserRole, Workspace } from '../types/board';
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
  onOpenMembers,
  onOpenSettings
}) => {
  const [activeTab, setActiveTab] = useState<OverviewTab>('all');
  const boards = workspace.boards || [];
  const pages = workspace.pages || [];
  const members = workspace.members || [];

  const allCards = boards.flatMap((b) => Object.values(b.cards || {}));
  const doneColumnIds = new Set(
    boards.flatMap((b) =>
      b.columns
        .filter((c) => {
          const t = c.title.toLowerCase();
          return t.includes('done') || t.includes('selesai') || t.includes('completed');
        })
        .map((c) => c.id)
    )
  );
  const completedCount = allCards.filter((c) => doneColumnIds.has(c.columnId)).length;

  const tabs: { id: OverviewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Semua', icon: <SquaresFour className="h-3.5 w-3.5" /> },
    { id: 'boards', label: 'Papan', icon: <Kanban className="h-3.5 w-3.5" /> },
    { id: 'pages', label: 'Dokumen', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'members', label: 'Anggota', icon: <Users className="h-3.5 w-3.5" /> }
  ];

  const showBoards = activeTab === 'all' || activeTab === 'boards';
  const showPages = activeTab === 'all' || activeTab === 'pages';
  const showMembers = activeTab === 'all' || activeTab === 'members';

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
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-white/25 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Anggota</span>
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  title="Pengaturan Workspace"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-white/25 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
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
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-text shadow-2xs">
              <span>{boards.length} Papan</span>
              <span className="text-muted/60">•</span>
              <span>{allCards.length} Tugas ({completedCount} selesai)</span>
              <span className="text-muted/60 hidden sm:inline">•</span>
              <span className="hidden sm:inline">{pages.length} Dokumen</span>
            </span>

            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={onAddBoard}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-project-solid px-3 py-1.5 text-xs font-semibold text-white shadow-tactile-btn transition-[opacity,transform] duration-150 hover:opacity-95 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" weight="bold" />
                  <span>Buat Papan</span>
                </button>
                <button
                  type="button"
                  onClick={onAddPage}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-hover active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
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

      <div className="px-4 py-[var(--space-card-gap)] sm:px-6 space-y-[var(--space-section-gap)]">
        {showBoards && (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                Papan Kerja ({boards.length})
              </h2>
            </div>
            {boards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-center text-xs text-muted">
                Belum ada papan di workspace ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-[var(--space-card-gap)] sm:grid-cols-2 lg:grid-cols-3">
                {boards.map((board) => {
                  const count = Object.keys(board.cards || {}).length;
                  return (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => onSelectBoard(board.id)}
                      className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-[var(--space-card-p)] text-left transition-colors hover:border-project-ring hover:bg-hover/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                    >
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
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted font-mono">
                        <span>{board.columns.length} kolom</span>
                        <span>•</span>
                        <span>{count} kartu</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {(showPages || showMembers) && (
          <div className={cn('grid grid-cols-1 gap-[var(--space-section-gap)]', showPages && showMembers && 'lg:grid-cols-2')}>
            {showPages && (
              <section className="space-y-2.5">
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                  Dokumen Halaman ({pages.length})
                </h2>
                <div className="space-y-2">
                  {pages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-5 text-center text-xs text-muted">
                      Belum ada dokumen di workspace ini.
                    </div>
                  ) : (
                    pages.map((page) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => onSelectPage(page.id)}
                        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left text-xs transition-colors hover:border-project-ring hover:bg-hover/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4 w-4 text-project-solid shrink-0" />
                          <span className="truncate font-semibold text-text">
                            {page.title || 'Untitled Document'}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted shrink-0 ml-2">
                          {new Date(page.updatedAt || Date.now()).toLocaleDateString('id-ID')}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </section>
            )}

            {showMembers && (
              <section className="space-y-2.5">
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                  Anggota Tim ({members.length})
                </h2>
                <div className="space-y-2">
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
        )}
      </div>
    </div>
  );
};
