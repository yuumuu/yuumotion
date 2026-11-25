export type ActivityAction =
  | 'card.created'
  | 'card.moved'
  | 'card.updated'
  | 'card.deleted'
  | 'board.created'
  | 'board.deleted'
  | 'page.updated';

export interface ActivityEvent {
  id: string;
  workspaceId: string;
  boardId?: string;
  cardId?: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  summary: string;
  meta?: Record<string, unknown>;
  createdAt: number;
}

const STORAGE_KEY = 'yuumotion_activity_feed_v1';

// Adapter localStorage yang siap diganti dengan endpoint API / WebSocket backend
export class ActivityService {
  static record(event: Omit<ActivityEvent, 'id' | 'createdAt'>): ActivityEvent {
    const entry: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now()
    };
    const all = this.readAll();
    const next = [entry, ...all].slice(0, 200);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Abaikan jika storage penuh
    }
    return entry;
  }

  static getByWorkspace(workspaceId: string, limit = 30): ActivityEvent[] {
    return this.readAll()
      .filter((e) => e.workspaceId === workspaceId)
      .slice(0, limit);
  }

  static clearWorkspace(workspaceId: string): void {
    const next = this.readAll().filter((e) => e.workspaceId !== workspaceId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Abaikan jika gagal
    }
  }

  private static readAll(): ActivityEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
