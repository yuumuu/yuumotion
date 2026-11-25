import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Funnel,
  ArrowsDownUp,
  ArrowUp,
  ArrowDown,
  X,
  User,
  Flame,
  Clock,
  Tag as TagIcon
} from '@phosphor-icons/react';
import { Board, PriorityLevel, WorkspaceMember } from '../types/board';
import {
  BoardFilterState,
  DEFAULT_BOARD_FILTER,
  DuePreset,
  QuickFilterPresetId,
  SortField
} from '../types/filter';
import { hasActiveFilters } from '../lib/cardFilter';
import { cn } from '../lib/cn';

interface FilterSortBarProps {
  board: Board;
  members: WorkspaceMember[];
  currentUserId: string;
  filter: BoardFilterState;
  filteredCount: number;
  totalCount: number;
  onChange: (next: BoardFilterState) => void;
}

const PRIORITY_OPTIONS: { id: PriorityLevel; label: string }[] = [
  { id: 'urgent', label: 'Urgent' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' }
];

const DUE_OPTIONS: { id: DuePreset; label: string }[] = [
  { id: 'all', label: 'Semua Tenggat' },
  { id: 'overdue', label: 'Terlambat' },
  { id: 'today', label: 'Hari Ini' },
  { id: 'week', label: '7 Hari ke Depan' },
  { id: 'no-date', label: 'Tanpa Tanggal' }
];

const SORT_OPTIONS: { id: SortField; label: string }[] = [
  { id: 'manual', label: 'Urutan Manual' },
  { id: 'priority', label: 'Prioritas' },
  { id: 'dueDate', label: 'Tenggat Waktu' },
  { id: 'updatedAt', label: 'Terakhir Diubah' },
  { id: 'title', label: 'Judul A-Z' }
];

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  board,
  members,
  currentUserId,
  filter,
  filteredCount,
  totalCount,
  onChange
}) => {
  const [openMenu, setOpenMenu] = useState<'priority' | 'assignee' | 'tag' | 'due' | 'sort' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const handleOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [openMenu]);

  const allTags = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string }>();
    Object.values(board.cards || {}).forEach((card) => {
      (card.tags || []).forEach((t) => {
        if (!map.has(t.id)) map.set(t.id, t);
      });
    });
    return Array.from(map.values());
  }, [board.cards]);

  const isFiltered = hasActiveFilters(filter);

  const togglePreset = (presetId: QuickFilterPresetId) => {
    if (filter.activePresetId === presetId) {
      onChange(DEFAULT_BOARD_FILTER);
      return;
    }
    if (presetId === 'my-tasks') {
      onChange({
        ...DEFAULT_BOARD_FILTER,
        assigneeIds: [currentUserId],
        activePresetId: 'my-tasks'
      });
    } else if (presetId === 'urgent') {
      onChange({
        ...DEFAULT_BOARD_FILTER,
        priorities: ['urgent', 'high'],
        sortField: 'priority',
        sortDirection: 'desc',
        activePresetId: 'urgent'
      });
    } else if (presetId === 'due-soon') {
      onChange({
        ...DEFAULT_BOARD_FILTER,
        duePreset: 'week',
        sortField: 'dueDate',
        sortDirection: 'asc',
        activePresetId: 'due-soon'
      });
    }
  };

  const toggleArrayItem = <T extends string>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  return (
    <div
      ref={barRef}
      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-border bg-bg sm:px-6 shrink-0"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted mr-1">
          <Funnel className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filter:</span>
        </span>

        {/* Quick Presets */}
        <button
          type="button"
          onClick={() => togglePreset('my-tasks')}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors active:scale-[0.97] cursor-pointer',
            filter.activePresetId === 'my-tasks'
              ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
              : 'border-border bg-surface text-muted hover:text-text hover:bg-hover'
          )}
        >
          <User className="h-3 w-3" />
          <span>Tugas Saya</span>
        </button>

        <button
          type="button"
          onClick={() => togglePreset('urgent')}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors active:scale-[0.97] cursor-pointer',
            filter.activePresetId === 'urgent'
              ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
              : 'border-border bg-surface text-muted hover:text-text hover:bg-hover'
          )}
        >
          <Flame className="h-3 w-3" />
          <span>Urgent &amp; High</span>
        </button>

        <button
          type="button"
          onClick={() => togglePreset('due-soon')}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors active:scale-[0.97] cursor-pointer',
            filter.activePresetId === 'due-soon'
              ? 'border-project-accent bg-project-soft text-project-solid font-semibold'
              : 'border-border bg-surface text-muted hover:text-text hover:bg-hover'
          )}
        >
          <Clock className="h-3 w-3" />
          <span>Jatuh Tempo Segera</span>
        </button>

        <span className="mx-1 h-4 w-px bg-border hidden sm:inline-block" />

        {/* Priority Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'priority' ? null : 'priority')}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
              filter.priorities.length > 0
                ? 'border-project-accent bg-project-soft text-project-solid'
                : 'border-border bg-surface text-text hover:bg-hover'
            )}
          >
            <span>Prioritas{filter.priorities.length > 0 ? ` (${filter.priorities.length})` : ''}</span>
          </button>
          {openMenu === 'priority' && (
            <div className="absolute left-0 top-full z-40 mt-1.5 w-44 rounded-xl border border-border bg-surface p-1.5 shadow-popover">
              {PRIORITY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filter.priorities.includes(opt.id)}
                    onChange={() =>
                      onChange({
                        ...filter,
                        activePresetId: null,
                        priorities: toggleArrayItem(filter.priorities, opt.id)
                      })
                    }
                    className="rounded border-border text-project-solid"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Assignee Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'assignee' ? null : 'assignee')}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
              filter.assigneeIds.length > 0
                ? 'border-project-accent bg-project-soft text-project-solid'
                : 'border-border bg-surface text-text hover:bg-hover'
            )}
          >
            <span>Anggota{filter.assigneeIds.length > 0 ? ` (${filter.assigneeIds.length})` : ''}</span>
          </button>
          {openMenu === 'assignee' && (
            <div className="absolute left-0 top-full z-40 mt-1.5 w-52 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-popover">
              {members.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filter.assigneeIds.includes(m.id)}
                    onChange={() =>
                      onChange({
                        ...filter,
                        activePresetId: null,
                        assigneeIds: toggleArrayItem(filter.assigneeIds, m.id)
                      })
                    }
                    className="rounded border-border text-project-solid"
                  />
                  <span className="truncate">{m.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Tag Dropdown */}
        {allTags.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'tag' ? null : 'tag')}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                filter.tagIds.length > 0
                  ? 'border-project-accent bg-project-soft text-project-solid'
                  : 'border-border bg-surface text-text hover:bg-hover'
              )}
            >
              <TagIcon className="h-3 w-3" />
              <span>Label{filter.tagIds.length > 0 ? ` (${filter.tagIds.length})` : ''}</span>
            </button>
            {openMenu === 'tag' && (
              <div className="absolute left-0 top-full z-40 mt-1.5 w-48 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-popover">
                {allTags.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filter.tagIds.includes(t.id)}
                      onChange={() =>
                        onChange({
                          ...filter,
                          activePresetId: null,
                          tagIds: toggleArrayItem(filter.tagIds, t.id)
                        })
                      }
                      className="rounded border-border text-project-solid"
                    />
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="truncate">{t.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Due Date Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'due' ? null : 'due')}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
              filter.duePreset !== 'all'
                ? 'border-project-accent bg-project-soft text-project-solid'
                : 'border-border bg-surface text-text hover:bg-hover'
            )}
          >
            <span>{DUE_OPTIONS.find((d) => d.id === filter.duePreset)?.label || 'Tenggat'}</span>
          </button>
          {openMenu === 'due' && (
            <div className="absolute left-0 top-full z-40 mt-1.5 w-44 rounded-xl border border-border bg-surface p-1.5 shadow-popover">
              {DUE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange({ ...filter, activePresetId: null, duePreset: opt.id });
                    setOpenMenu(null);
                  }}
                  className={cn(
                    'flex w-full items-center rounded-lg px-2.5 py-1.5 text-xs text-left cursor-pointer',
                    filter.duePreset === opt.id
                      ? 'bg-project-soft font-semibold text-project-solid'
                      : 'text-text hover:bg-hover'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Sort & Reset */}
      <div className="flex items-center gap-2">
        {isFiltered && (
          <span className="font-mono text-[11px] text-muted">
            {filteredCount} / {totalCount} tugas
          </span>
        )}

        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
            className={cn(
              'inline-flex items-center gap-1 rounded-l-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-text hover:bg-hover cursor-pointer',
              filter.sortField !== 'manual' && 'border-project-accent bg-project-soft text-project-solid'
            )}
          >
            <ArrowsDownUp className="h-3 w-3" />
            <span>{SORT_OPTIONS.find((s) => s.id === filter.sortField)?.label}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filter,
                sortDirection: filter.sortDirection === 'asc' ? 'desc' : 'asc'
              })
            }
            title={filter.sortDirection === 'asc' ? 'Urutan Naik (ASC)' : 'Urutan Turun (DESC)'}
            className="inline-flex items-center justify-center rounded-r-lg border border-l-0 border-border bg-surface px-2 py-1 text-muted hover:text-text hover:bg-hover cursor-pointer"
          >
            {filter.sortDirection === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )}
          </button>

          {openMenu === 'sort' && (
            <div className="absolute right-0 top-full z-40 mt-1.5 w-44 rounded-xl border border-border bg-surface p-1.5 shadow-popover">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange({ ...filter, sortField: opt.id });
                    setOpenMenu(null);
                  }}
                  className={cn(
                    'flex w-full items-center rounded-lg px-2.5 py-1.5 text-xs text-left cursor-pointer',
                    filter.sortField === opt.id
                      ? 'bg-project-soft font-semibold text-project-solid'
                      : 'text-text hover:bg-hover'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_BOARD_FILTER)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted hover:text-text hover:bg-hover cursor-pointer"
          >
            <X className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
