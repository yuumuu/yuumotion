import React from 'react';
import {
  Kanban,
  FileText,
  Users,
  CheckCircle,
  Plus,
  Gear,
  UserPlus,
  ShieldCheck,
  ArrowRight
} from '@phosphor-icons/react';
import { UserRole, Workspace } from '../types/board';
import { Button, Badge } from './ui';

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

  return (
    <div className="flex-1 overflow-y-auto bg-bg p-[var(--space-card-p)] sm:p-6">
      <div className="mx-auto max-w-6xl space-y-[var(--space-section-gap)]">
        {/* Workspace Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-l from-project-solid via-blue-600 to-project-accent p-[var(--space-card-p)] sm:px-6 sm:py-[var(--space-banner-py)] text-white shadow-card-sm">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/15 blur-2xl"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm border border-white/25">
                {workspace.icon || '🚀'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-mono text-[11px] text-white/80">
                  <span>WORKSPACE</span>
                  <span>/</span>
                  <span className="uppercase">{currentUserRole}</span>
                  <span>•</span>
                  <span>{workspace.joinPolicy === 'open' ? 'Terbuka' : 'Khusus Undangan'}</span>
                </div>
                <h1 className="truncate font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {workspace.name}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenMembers}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Anggota ({members.length})</span>
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25 cursor-pointer"
                >
                  <Gear className="h-3.5 w-3.5" />
                  <span>Pengaturan</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Statistik Ringkas */}
        <section className="grid grid-cols-2 gap-[var(--space-card-gap)] lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-[var(--space-card-p)] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Papan Kerja</span>
              <Kanban className="h-4 w-4 text-project-solid" />
            </div>
            <div className="mt-1.5 font-display text-2xl font-bold text-text">{boards.length}</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-[var(--space-card-p)] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Total Tugas</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-text">{allCards.length}</span>
              <span className="text-[11px] text-muted">{completedCount} selesai</span>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-[var(--space-card-p)] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Dokumen Halaman</span>
              <FileText className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-1.5 font-display text-2xl font-bold text-text">{pages.length}</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-[var(--space-card-p)] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Anggota Tim</span>
              <Users className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-1.5 font-display text-2xl font-bold text-text">{members.length}</div>
          </div>
        </section>

        {/* Papan Kerja */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-text">Papan Kerja</h2>
            {canEdit && (
              <Button size="xs" variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={onAddBoard}>
                Tambah Papan
              </Button>
            )}
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
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-[var(--space-card-p)] text-left shadow-2xs transition-all hover:border-project-ring hover:shadow-card-hover cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
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

        {/* Dokumen & Anggota */}
        <div className="grid grid-cols-1 gap-[var(--space-section-gap)] lg:grid-cols-2">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-text">Dokumen Halaman</h2>
              {canEdit && (
                <Button size="xs" variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={onAddPage}>
                  Tambah Dokumen
                </Button>
              )}
            </div>
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
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-surface p-3 text-left text-xs transition-all hover:border-project-ring hover:bg-hover/40 cursor-pointer"
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

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-text">Anggota Tim</h2>
              <Button size="xs" variant="ghost" onClick={onOpenMembers}>
                Kelola
              </Button>
            </div>
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs"
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
        </div>
      </div>
    </div>
  );
};
