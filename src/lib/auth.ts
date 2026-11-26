import { AuthUser, UserRole, Workspace, NotionPage } from '../types/board';
import { INITIAL_BOARD } from './constants';
import { createClient } from '@supabase/supabase-js';
import { getStoredCloudConfig } from './sync';
import {
  getWorkspacesStorageKey,
  getActiveWorkspaceStorageKey,
  isGuestUser,
  migrateLegacyGlobalWorkspacesToGuest,
  safeSetStorageItem
} from './storageNamespace';

const AUTH_USER_KEY = 'yuumotion_auth_user';

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

  safeSetStorageItem(AUTH_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export function saveStoredAuthUser(user: AuthUser) {
  safeSetStorageItem(AUTH_USER_KEY, JSON.stringify(user));
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
  migrateLegacyGlobalWorkspacesToGuest();
  const storageKey = getWorkspacesStorageKey(currentUser);
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        const sanitized: Workspace[] = parsed.map((ws: Partial<Workspace>) => {
          const boards = Array.isArray(ws.boards) ? ws.boards : [INITIAL_BOARD];
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

  // Akun login baru mulai kosong agar tidak tercampur data tamu.
  if (!isGuestUser(currentUser)) {
    return [];
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
        color: '#2563EB',
        role: 'member',
        joinedAt: Date.now(),
        title: 'Product Designer',
        bio: 'Merancang alur interaksi Kanban, sistem komponen, dan dokumen spesifikasi produk.',
        timezone: 'Asia/Jakarta (WIB)',
        presenceStatus: 'online'
      },
      {
        id: 'usr-viewer-1',
        name: 'Client Reviewer',
        email: 'client@example.com',
        avatar: 'C',
        color: '#0EA5E9',
        role: 'viewer',
        joinedAt: Date.now(),
        title: 'Stakeholder & QA',
        bio: 'Meninjau progres sprint mingguan serta memberikan catatan pada dokumen rilis.',
        timezone: 'Asia/Singapore (SGT)',
        presenceStatus: 'away'
      }
    ],
    boards: [INITIAL_BOARD],
    pages: INITIAL_NOTION_PAGES,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  safeSetStorageItem(storageKey, JSON.stringify([initialWorkspace]));
  return [initialWorkspace];
}

export function saveStoredWorkspaces(workspaces: Workspace[], currentUser?: AuthUser | null) {
  safeSetStorageItem(getWorkspacesStorageKey(currentUser), JSON.stringify(workspaces));
}

export function getActiveWorkspaceId(workspaces: Workspace[], currentUser?: AuthUser | null): string {
  const stored = localStorage.getItem(getActiveWorkspaceStorageKey(currentUser));
  if (stored && workspaces.some((w) => w.id === stored)) {
    return stored;
  }
  return workspaces[0]?.id || 'ws-default';
}

export function setActiveWorkspaceId(workspaceId: string, currentUser?: AuthUser | null) {
  safeSetStorageItem(getActiveWorkspaceStorageKey(currentUser), workspaceId);
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

export type AppRoute = 'app' | 'landing' | 'auth';
const SESSION_ACTIVE_KEY = 'yuumotion_session_active';

export function hasActiveSession(): boolean {
  return localStorage.getItem(SESSION_ACTIVE_KEY) === 'true';
}

export function setActiveSession(active: boolean) {
  safeSetStorageItem(SESSION_ACTIVE_KEY, active ? 'true' : 'false');
}

const LANDING_SECTION_PATHS = new Set(['', 'landing', 'top', 'personas', 'docs', 'views', 'open-source']);

function routeToCleanPath(route: AppRoute): string {
  return route === 'landing' ? '/' : `/${route}`;
}

export function extractShareTokenFromLocation(): string | null {
  const path = window.location.pathname;
  if (path.startsWith('/share/')) {
    const token = path.slice('/share/'.length).replace(/\/+$/, '');
    if (token) return token;
  }
  const hash = window.location.hash;
  if (hash.startsWith('#share/')) {
    const token = hash.slice('#share/'.length);
    if (token) {
      window.history.replaceState(null, '', `/share/${token}`);
      return token;
    }
  }
  return null;
}

export function resolveRouteWithAuthGuard(): AppRoute {
  const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const isAuthed = hasActiveSession();

  // Migrasi URL hash lama (#/landing, #/app, #/auth) ke clean URL tanpa #
  const candidate = rawHash || rawPath;

  if (candidate.startsWith('share/')) {
    return isAuthed ? 'app' : 'landing';
  }
  if (candidate === 'auth') {
    if (window.location.pathname !== '/auth' || window.location.hash) {
      window.history.replaceState(null, '', '/auth');
    }
    return 'auth';
  }
  if (candidate === 'app') {
    if (!isAuthed) {
      window.history.replaceState(null, '', '/auth');
      return 'auth';
    }
    if (window.location.pathname !== '/app' || window.location.hash) {
      window.history.replaceState(null, '', '/app');
    }
    return 'app';
  }
  if (rawHash && LANDING_SECTION_PATHS.has(rawHash)) {
    window.history.replaceState(null, '', '/');
    return 'landing';
  }
  if (rawPath === 'landing') {
    window.history.replaceState(null, '', '/');
    return 'landing';
  }

  const defaultRoute: AppRoute = isAuthed ? 'app' : 'landing';
  const targetPath = routeToCleanPath(defaultRoute);
  if (window.location.pathname !== targetPath || window.location.hash) {
    window.history.replaceState(null, '', targetPath);
  }
  return defaultRoute;
}

export function navigateWithGuard(target: AppRoute): AppRoute {
  const resolved: AppRoute = target === 'app' && !hasActiveSession() ? 'auth' : target;
  const targetPath = routeToCleanPath(resolved);
  if (window.location.pathname !== targetPath || window.location.hash) {
    window.history.pushState(null, '', targetPath);
  }
  return resolved;
}
