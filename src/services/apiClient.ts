import { NotificationItem } from '../types/board';

// Klien API terpadu dengan dukungan cookie session & fallback graceful ke mode lokal
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers || {})
    }
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errBody.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  health: () => request<{ ok: boolean; runtime: string }>('/health'),

  auth: {
    me: () => request<{ user: unknown }>('/auth/me'),
    login: (email: string, password: string) =>
      request<{ user: unknown }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    register: (name: string, email: string, password: string) =>
      request<{ user: unknown }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      }),
    logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' })
  },

  workspaces: {
    list: () => request<{ workspaces: unknown[] }>('/workspaces'),
    create: (name: string, icon: string) =>
      request('/workspaces', { method: 'POST', body: JSON.stringify({ name, icon }) }),
    update: (id: string, data: { name?: string; icon?: string; joinPolicy?: string }) =>
      request(`/workspaces/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request(`/workspaces/${id}`, { method: 'DELETE' })
  },

  boards: {
    create: (workspaceId: string, title: string) =>
      request('/boards', { method: 'POST', body: JSON.stringify({ workspaceId, title }) }),
    remove: (id: string) => request(`/boards/${id}`, { method: 'DELETE' }),
    createCard: (boardId: string, data: { columnId: string; title: string; priority?: string }) =>
      request(`/boards/${boardId}/cards`, { method: 'POST', body: JSON.stringify(data) }),
    updateCard: (cardId: string, data: Record<string, unknown>) =>
      request(`/boards/cards/${cardId}`, { method: 'PATCH', body: JSON.stringify(data) })
  },

  pages: {
    create: (data: { workspaceId: string; title?: string; contentHtml?: string; parentId?: string | null; icon?: string }) =>
      request<{ id: string; parentId: string | null; updatedAt: number }>('/pages', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (
      id: string,
      data: { title?: string; contentHtml?: string; shareToken?: string | null; parentId?: string | null; icon?: string; coverImage?: string | null }
    ) => request(`/pages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request(`/pages/${id}`, { method: 'DELETE' })
  },

  notifications: {
    list: () => request<{ notifications: NotificationItem[] }>('/notifications'),
    create: (payload: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) =>
      request<{ notification: NotificationItem }>('/notifications', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    markRead: (id: string) => request<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request<{ ok: boolean }>('/notifications/read-all', { method: 'POST' })
  },

  uploads: {
    uploadFile: (file: File, workspaceId?: string) => {
      const form = new FormData();
      form.append('file', file);
      if (workspaceId) form.append('workspaceId', workspaceId);
      return request<{ id: string; url: string; name: string; mimeType: string; size: number }>(
        '/uploads',
        { method: 'POST', body: form }
      );
    }
  }
};
