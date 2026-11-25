import { Card, PriorityLevel } from '../types/board';
import { BoardFilterState } from '../types/filter';

const PRIORITY_WEIGHT: Record<PriorityLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4
};

function toDateOnlyKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function hasActiveFilters(filter: BoardFilterState): boolean {
  return (
    filter.priorities.length > 0 ||
    filter.assigneeIds.length > 0 ||
    filter.tagIds.length > 0 ||
    filter.duePreset !== 'all' ||
    filter.sortField !== 'manual' ||
    Boolean(filter.activePresetId)
  );
}

export function filterAndSortCards(
  cards: Card[],
  filter: BoardFilterState,
  searchQuery = '',
  currentUserId?: string
): Card[] {
  const q = searchQuery.trim().toLowerCase();
  const today = new Date();
  const todayKey = toDateOnlyKey(today);
  const weekDate = new Date(today);
  weekDate.setDate(today.getDate() + 7);
  const weekKey = toDateOnlyKey(weekDate);

  const filtered = cards.filter((card) => {
    if (q) {
      const inTitle = card.title.toLowerCase().includes(q);
      const inDesc = (card.description || '').toLowerCase().includes(q);
      const inTags = (card.tags || []).some((t) => t.name.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inTags) return false;
    }

    if (filter.priorities.length > 0 && !filter.priorities.includes(card.priority)) {
      return false;
    }

    if (filter.assigneeIds.length > 0) {
      const cardAssignees = card.assignees || [];
      if (!filter.assigneeIds.some((id) => cardAssignees.includes(id))) {
        return false;
      }
    }

    if (filter.tagIds.length > 0) {
      const cardTagIds = (card.tags || []).map((t) => t.id);
      if (!filter.tagIds.some((id) => cardTagIds.includes(id))) {
        return false;
      }
    }

    if (filter.activePresetId === 'my-tasks' && currentUserId) {
      if (!(card.assignees || []).includes(currentUserId)) return false;
    }

    if (filter.duePreset !== 'all') {
      const due = card.dueDate ? card.dueDate.slice(0, 10) : '';
      if (filter.duePreset === 'no-date' && due) return false;
      if (filter.duePreset === 'overdue' && (!due || due >= todayKey)) return false;
      if (filter.duePreset === 'today' && due !== todayKey) return false;
      if (filter.duePreset === 'week' && (!due || due < todayKey || due > weekKey)) return false;
    }

    return true;
  });

  if (filter.sortField === 'manual') {
    return [...filtered].sort((a, b) => a.order - b.order);
  }

  const dir = filter.sortDirection === 'asc' ? 1 : -1;
  return [...filtered].sort((a, b) => {
    switch (filter.sortField) {
      case 'priority':
        return (PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]) * dir;
      case 'dueDate': {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate) * dir;
      }
      case 'updatedAt':
        return (a.updatedAt - b.updatedAt) * dir;
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      default:
        return a.order - b.order;
    }
  });
}
