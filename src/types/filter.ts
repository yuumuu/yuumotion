import { PriorityLevel } from './board';

export type SortField = 'manual' | 'priority' | 'dueDate' | 'updatedAt' | 'title';
export type SortDirection = 'asc' | 'desc';
export type DuePreset = 'all' | 'overdue' | 'today' | 'week' | 'no-date';
export type QuickFilterPresetId = 'my-tasks' | 'urgent' | 'due-soon';

export interface BoardFilterState {
  priorities: PriorityLevel[];
  assigneeIds: string[];
  tagIds: string[];
  duePreset: DuePreset;
  sortField: SortField;
  sortDirection: SortDirection;
  activePresetId?: QuickFilterPresetId | null;
}

export const DEFAULT_BOARD_FILTER: BoardFilterState = {
  priorities: [],
  assigneeIds: [],
  tagIds: [],
  duePreset: 'all',
  sortField: 'manual',
  sortDirection: 'asc',
  activePresetId: null
};
