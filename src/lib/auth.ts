import { AuthUser, UserRole, Workspace, NotionPage } from '../types/board';
import { INITIAL_BOARD } from './constants';
import { createClient } from '@supabase/supabase-js';
import { getStoredCloudConfig } from './sync';

const AUTH_USER_KEY = 'yuumotion_auth_user';
const WORKSPACES_KEY = 'yuumotion_workspaces_list';
const ACTIVE_WORKSPACE_KEY = 'yuumotion_active_workspace_id';

const AVATAR_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export function getStoredAuthUser(): AuthUser {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback if stored profile is malformed
    }
  }

  const defaultUser: AuthUser = {
    id: `usr-local-${Math.random().toString(36).substring(2, 8)}`,
    name: 'Yuu Creator',
    avatar: 'Y',
    color: AVATAR_COLORS[0],
    isCloudAuth: false
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export function saveStoredAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function canEditContent(role: UserRole): boolean {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canManageMembers(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canDeleteWorkspace(role: UserRole): boolean {
  return role === 'owner';
}

export const INITIAL_NOTION_PAGES: NotionPage[] = [
  {
    id: 'page-welcome',
    workspaceId: 'ws-default',
    title: 'Welcome to Yuumotion Docs',
    icon: '📝',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    contentHtml: '<h1>Welcome to your personal and team knowledge base</h1><p>Yuumotion combines the visual modularity of Notion with the workflow clarity of Trello.</p><h3>Quick Guide</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"></label><div><p>Type <code>/</code> inside the document to open Notion slash commands</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Organize standalone docs or Kanban roadmap boards</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div><p>Switch between Board, Calendar, Timeline, and Table views</p></div></li></ul><blockquote><p>Crafted for zero-maintenance edge deployment on Wasmer with 100% offline-first resilience.</p></blockquote>',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now()
  },
  {
    id: 'page-specs',
    workspaceId: 'ws-default',
    title: 'Product Architecture & Edge Specs',
    icon: '⚡',
    contentHtml: '<h2>System Highlights</h2><p>Designed for multi-user collaboration with zero server fees.</p><pre><code>// Dual-tier sync protocol\nBroadcastChannel (local tabs 0ms) + Supabase Realtime (cross-device)</code></pre>',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now()
  }
];

export function getStoredWorkspaces(currentUser: AuthUser): Workspace[] {
  const raw = localStorage.getItem(WORKSPACES_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitasi agar aman terhadap cache versi lama
        const sanitized: Workspace[] = parsed.map((ws: Partial<Workspace>) => {
          const boards = Array.isArray(ws.boards) && ws.boards.length > 0 ? ws.boards : [INITIAL_BOARD];
          const pages = Array.isArray(ws.pages) ? ws.pages : INITIAL_NOTION_PAGES;
          const members = Array.isArray(ws.members) && ws.members.length > 0
            ? ws.members
            : [
                {
                  id: currentUser.id,
                  name: currentUser.name,
                  email: currentUser.email,
                  avatar: currentUser.avatar,
                  color: currentUser.color,
                  role: 'owner' as UserRole,
                  joinedAt: Date.now()
                }
              ];

          return {
            id: ws.id || 'ws-default',
            name: ws.name || 'Main Workspace',
            icon: ws.icon || '🚀',
            ownerId: ws.ownerId || currentUser.id,
            currentRole: ws.currentRole || 'owner',
            members,
            boards,
            pages,
            createdAt: ws.createdAt || Date.now(),
            updatedAt: ws.updatedAt || Date.now()
          };
        });
        return sanitized;
      }
    } catch {
      // Fallback if malformed
    }
  }

  const initialWorkspace: Workspace = {
    id: 'ws-default',
    name: 'Main Workspace',
    icon: '🚀',
    ownerId: currentUser.id,
    currentRole: 'owner',
    members: [
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        color: currentUser.color,
        role: 'owner',
        joinedAt: Date.now()
      },
      {
        id: 'usr-collab-1',
        name: 'Aria Collaborator',
        email: 'aria@example.com',
        avatar: 'A',
        color: '#10B981',
        role: 'member',
        joinedAt: Date.now()
      },
      {
        id: 'usr-viewer-1',
        name: 'Client Reviewer',
        email: 'client@example.com',
        avatar: 'C',
        color: '#F59E0B',
        role: 'viewer',
        joinedAt: Date.now()
      }
    ],
    boards: [INITIAL_BOARD],
    pages: INITIAL_NOTION_PAGES,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  localStorage.setItem(WORKSPACES_KEY, JSON.stringify([initialWorkspace]));
  return [initialWorkspace];
}

export function saveStoredWorkspaces(workspaces: Workspace[]) {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
}

export function getActiveWorkspaceId(workspaces: Workspace[]): string {
  const stored = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  if (stored && workspaces.some((w) => w.id === stored)) {
    return stored;
  }
  return workspaces[0]?.id || 'ws-default';
}

export function setActiveWorkspaceId(workspaceId: string) {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
}

export async function loginWithSupabaseAuth(email: string, password: string):Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const config = getStoredCloudConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return { success: false, message: 'Please configure Supabase Project URL and Anon Key in Cloud Sync settings first.' };
  }

  try {
    const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, message: error.message };
    }

    if (data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Cloud User',
        email: data.user.email,
        avatar: (data.user.email?.charAt(0) || 'U').toUpperCase(),
        color: AVATAR_COLORS[1],
        isCloudAuth: true
      };
      saveStoredAuthUser(authUser);
      return { success: true, user: authUser };
    }

    return { success: false, message: 'No user data received.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Authentication network failure';
    return { success: false, message: errorMsg };
  }
}
