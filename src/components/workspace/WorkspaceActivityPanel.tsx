import React from 'react';
import { WorkspaceMember } from '../../types/board';
import { cn } from '../../lib/cn';

interface ActivityItem {
  id: string;
  userName: string;
  summary: string;
  createdAt: number;
}

interface WorkspaceActivityPanelProps {
  stats: { todo: number; inProgress: number; done: number; total: number };
  recentActivities: ActivityItem[];
  members: WorkspaceMember[];
  onOpenMembers: () => void;
}

export const WorkspaceActivityPanel: React.FC<WorkspaceActivityPanelProps> = ({
  stats,
  recentActivities,
  members,
  onOpenMembers
}) => {
  const maxBar = Math.max(1, stats.todo, stats.inProgress, stats.done);
  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
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
  );
};
