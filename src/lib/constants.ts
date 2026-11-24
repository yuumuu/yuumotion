import { Board, CardTag, UserPresence } from '../types/board';

export const TAG_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  purple: { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  green: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  neutral: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-700 dark:text-neutral-300', dot: 'bg-neutral-400' }
};

export const INITIAL_TAGS: CardTag[] = [
  { id: 'tag-1', name: 'Design', color: 'purple' },
  { id: 'tag-2', name: 'Frontend', color: 'blue' },
  { id: 'tag-3', name: 'Backend', color: 'green' },
  { id: 'tag-4', name: 'Bug', color: 'rose' },
  { id: 'tag-5', name: 'Research', color: 'amber' }
];

export const INITIAL_BOARD: Board = {
  id: 'yuumotion-primary-board',
  title: 'Product Roadmap & Tasks',
  updatedAt: Date.now(),
  columns: [
    { id: 'col-todo', title: 'To Do', color: '#6B7280', order: 0, updatedAt: Date.now() },
    { id: 'col-progress', title: 'In Progress', color: '#3B82F6', order: 1, updatedAt: Date.now() },
    { id: 'col-review', title: 'In Review', color: '#F59E0B', order: 2, updatedAt: Date.now() },
    { id: 'col-done', title: 'Completed', color: '#10B981', order: 3, updatedAt: Date.now() }
  ],
  cards: {
    'card-1': {
      id: 'card-1',
      columnId: 'col-todo',
      title: 'AppFlowy-style design system implementation',
      description: '# Specification\nAdopt subtle border lines, rounded cards, and calm pastel tag labels across all viewport sizes.',
      tags: [INITIAL_TAGS[0], INITIAL_TAGS[1]],
      priority: 'high',
      dueDate: '2026-11-28',
      checklist: [
        { id: 'c1', text: 'Define surface colors for light & dark mode', completed: true },
        { id: 'c2', text: 'Build responsive Kanban columns', completed: true },
        { id: 'c3', text: 'Card document preview modal', completed: false }
      ],
      order: 0,
      updatedAt: Date.now()
    },
    'card-2': {
      id: 'card-2',
      columnId: 'col-progress',
      title: 'Real-time multi-user concurrency synchronization',
      description: 'Implement optimistic state replication over local broadcast channels and external edge pub/sub brokers.',
      tags: [INITIAL_TAGS[1], INITIAL_TAGS[2]],
      priority: 'urgent',
      dueDate: '2026-11-26',
      checklist: [
        { id: 'c4', text: 'Broadcast delta events', completed: true },
        { id: 'c5', text: 'Handle last-write-wins timestamp validation', completed: true }
      ],
      order: 0,
      updatedAt: Date.now()
    },
    'card-3': {
      id: 'card-3',
      columnId: 'col-done',
      title: 'Wasmer Edge configuration with static web server',
      description: 'Package client artifacts into dist/ and wire wasmer.toml for frictionless edge deployment.',
      tags: [INITIAL_TAGS[2]],
      priority: 'medium',
      dueDate: '2026-11-24',
      checklist: [
        { id: 'c6', text: 'Verify wasmer/static-web-server binding', completed: true }
      ],
      order: 0,
      updatedAt: Date.now()
    }
  }
};

const RANDOM_NAMES = ['Aura', 'Kael', 'Rin', 'Mira', 'Vance', 'Lyra', 'Zeph'];
const AVATAR_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export function generateLocalUser(): UserPresence {
  const stored = localStorage.getItem('yuumotion_current_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback to generating a fresh user profile if stored state is malformed
    }
  }

  const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const user: UserPresence = {
    id: `usr-${Math.random().toString(36).substring(2, 9)}`,
    name,
    avatar: name.charAt(0),
    color,
    lastActive: Date.now()
  };

  localStorage.setItem('yuumotion_current_user', JSON.stringify(user));
  return user;
}
