import { AuthUser, Workspace } from '../types/board';

const LEGACY_WORKSPACES_KEY = 'yuumotion_workspaces_list';
const LEGACY_ACTIVE_WS_KEY = 'yuumotion_active_workspace_id';
const SESSION_ACTIVE_KEY = 'yuumotion_session_active';

export function isGuestUser(user?: AuthUser | null): boolean {
  if (!user) return true;
  const sessionActive = localStorage.getItem(SESSION_ACTIVE_KEY) === 'true';
  if (!sessionActive) return true;
  return user.id.startsWith('usr-local-') || user.id.startsWith('usr-guest-');
}

export function getStorageNamespace(user?: AuthUser | null): string {
  if (isGuestUser(user)) return 'guest';
  return `user_${user!.id}`;
}

export function getWorkspacesStorageKey(user?: AuthUser | null): string {
  return `yuumotion_workspaces_${getStorageNamespace(user)}`;
}

export function getActiveWorkspaceStorageKey(user?: AuthUser | null): string {
  return `yuumotion_active_ws_${getStorageNamespace(user)}`;
}

export function getNotificationsStorageKey(user?: AuthUser | null): string {
  return `yuumotion_notifications_${getStorageNamespace(user)}`;
}

/** Migrasi key legacy global ke namespace guest sekali jalan agar tidak bocor ke akun login. */
export function migrateLegacyGlobalWorkspacesToGuest(): void {
  const legacyRaw = localStorage.getItem(LEGACY_WORKSPACES_KEY);
  const guestKey = 'yuumotion_workspaces_guest';
  if (legacyRaw && !localStorage.getItem(guestKey)) {
    localStorage.setItem(guestKey, legacyRaw);
  }
  if (legacyRaw) {
    localStorage.removeItem(LEGACY_WORKSPACES_KEY);
  }

  const legacyActive = localStorage.getItem(LEGACY_ACTIVE_WS_KEY);
  const guestActiveKey = 'yuumotion_active_ws_guest';
  if (legacyActive && !localStorage.getItem(guestActiveKey)) {
    localStorage.setItem(guestActiveKey, legacyActive);
  }
  if (legacyActive) {
    localStorage.removeItem(LEGACY_ACTIVE_WS_KEY);
  }
}

export function readGuestWorkspacesRaw(): Workspace[] {
  migrateLegacyGlobalWorkspacesToGuest();
  const raw = localStorage.getItem('yuumotion_workspaces_guest');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Workspace[]) : [];
  } catch {
    return [];
  }
}

export function clearGuestWorkspaces(): void {
  localStorage.removeItem('yuumotion_workspaces_guest');
  localStorage.removeItem('yuumotion_active_ws_guest');
}

export function hasAccountWorkspacesStored(userId: string): boolean {
  const raw = localStorage.getItem(`yuumotion_workspaces_user_${userId}`);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}
