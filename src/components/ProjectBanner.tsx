import React from 'react';
import {
  Kanban,
  Table as TableIcon,
  CalendarBlank,
  Clock,
  Plus,
  UserPlus,
  Calendar,
  Tag
} from '@phosphor-icons/react';
import { Board, WorkspaceMember, WorkspaceView, UserRole } from '../types/board';
import { cn } from '../lib/cn';

interface ProjectBannerProps {
  workspaceName: string;
  board: Board;
  members: WorkspaceMember[];
  currentUserRole: UserRole;
  activeView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  onQuickCreateTask?: () => void;
  onOpenMembersModal: () => void;
  canEdit: boolean;
}

export const ProjectBanner: React.FC<ProjectBannerProps> = ({
  workspaceName,
  board,
  members,
  currentUserRole,
  activeView,
  onViewChange,
  onQuickCreateTask,
  onOpenMembersModal,
  canEdit
}) => {
  const totalTasks = Object.keys(board?.cards || {}).length;
  const safeMembers = members || [];

  const viewItems: { id: WorkspaceView; label: string; icon: React.ReactNode }[] = [
    { id: 'board', label: 'Kanban', icon: <Kanban className="h-3.5 w-3.5" /> },
    { id: 'table', label: 'Tabel', icon: <TableIcon className="h-3.5 w-3.5" /> },
    { id: 'calendar', label: 'Kalender', icon: <CalendarBlank className="h-3.5 w-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="h-3.5 w-3.5" /> }
  ];

  return (
    <div className="px-4 pt-4 pb-2 sm:px-6 bg-bg shrink-0 select-none">
      {/* Banner Utama (Gaya Quickit) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#3B82F6] px-5 py-4 sm:px-6 sm:py-5 text-white shadow-card-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl"
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/80">
              <span>{workspaceName}</span>
              <span>/</span>
              <span className="uppercase">{currentUserRole}</span>
            </div>
            <h1 className="font-display text-lg sm:text-2xl font-bold tracking-tight truncate">
              {board?.title || 'Project Board'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex -space-x-2">
              {safeMembers.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  title={`${m.name} (${m.role})`}
                  style={{ backgroundColor: m.color || '#6366F1' }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#2563EB] text-[10px] font-bold text-white shadow-2xs"
                >
                  {m.avatar || m.name?.[0]?.toUpperCase() || 'U'}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onOpenMembersModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-white/25 active:scale-[0.97] cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Anggota ({safeMembers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Baris Metadata & Toolbar Ringkas */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-text shadow-2xs">
            <span>{totalTasks} Tugas</span>
          </span>

          {canEdit && onQuickCreateTask && (
            <button
              type="button"
              onClick={onQuickCreateTask}
              className="inline-flex items-center gap-1.5 rounded-xl bg-project-solid px-3 py-1.5 text-xs font-semibold text-white shadow-tactile-btn transition-[opacity,transform] duration-150 hover:opacity-95 active:scale-[0.97] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" weight="bold" />
              <span>Buat Tugas</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-3 pl-2 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Sprint Aktif</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              <span>Multi-View Sync</span>
            </span>
          </div>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center rounded-xl border border-border bg-hover/60 p-0.5 text-xs">
          {viewItems.map((v) => {
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onViewChange(v.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-[background-color,color,box-shadow] duration-150 cursor-pointer',
                  isActive
                    ? 'bg-surface text-text font-semibold shadow-card-sm'
                    : 'text-muted hover:text-text'
                )}
              >
                <span className={isActive ? 'text-project-solid' : 'text-muted'}>{v.icon}</span>
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
