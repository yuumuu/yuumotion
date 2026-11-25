import { useState, useCallback } from 'react';
import { AuthUser, Workspace } from '../types/board';
import {
  getStoredAuthUser,
  saveStoredAuthUser,
  getStoredWorkspaces,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  setActiveSession
} from '../lib/auth';
import {
  isGuestUser,
  readGuestWorkspacesRaw,
  clearGuestWorkspaces,
  hasAccountWorkspacesStored
} from '../lib/storageNamespace';
import { apiClient } from '../services/apiClient';
import { toast } from '../components/ui';

export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => getStoredAuthUser());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => getStoredWorkspaces(currentUser));
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(() =>
    getActiveWorkspaceId(workspaces, currentUser)
  );
  const [guestMigrationOpen, setGuestMigrationOpen] = useState(false);
  const [guestWorkspacesCount, setGuestWorkspacesCount] = useState(0);

  const reloadWorkspacesForUser = useCallback(async (user: AuthUser) => {
    const isGuest = isGuestUser(user);
    if (!isGuest) {
      try {
        const res = await apiClient.workspaces.list();
        const serverWs = (res.workspaces || []) as Workspace[];
        if (serverWs.length > 0) {
          setWorkspaces(serverWs);
          const nextActive = getActiveWorkspaceId(serverWs, user);
          setActiveWorkspaceIdState(nextActive);
          setActiveWorkspaceId(nextActive, user);
          return serverWs;
        }
      } catch {
        // Fallback ke cache lokal namespace akun saat API offline
      }
    }

    const localWs = getStoredWorkspaces(user);
    setWorkspaces(localWs);
    const nextActive = getActiveWorkspaceId(localWs, user);
    setActiveWorkspaceIdState(nextActive);
    setActiveWorkspaceId(nextActive, user);
    return localWs;
  }, []);

  const handleUserChange = useCallback(
    async (nextUser: AuthUser) => {
      setCurrentUser(nextUser);
      saveStoredAuthUser(nextUser);
      setActiveSession(true);

      const loaded = await reloadWorkspacesForUser(nextUser);

      // Poin 3: tawarkan migrasi sekali jika akun baru masih kosong dan ada workspace tamu
      if (!isGuestUser(nextUser) && loaded.length === 0 && !hasAccountWorkspacesStored(nextUser.id)) {
        const guestWs = readGuestWorkspacesRaw();
        if (guestWs.length > 0) {
          setGuestWorkspacesCount(guestWs.length);
          setGuestMigrationOpen(true);
        }
      }
    },
    [reloadWorkspacesForUser]
  );

  const handleImportGuestWorkspaces = useCallback(() => {
    const guestWs = readGuestWorkspacesRaw();
    if (guestWs.length === 0) {
      setGuestMigrationOpen(false);
      return;
    }

    const now = Date.now();
    const migrated: Workspace[] = guestWs.map((ws) => ({
      ...ws,
      id: `ws-${now}-${Math.random().toString(36).slice(2, 6)}`,
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
          joinedAt: now,
          title: currentUser.title,
          bio: currentUser.bio,
          timezone: currentUser.timezone,
          avatarUrl: currentUser.avatarUrl,
          avatarEmoji: currentUser.avatarEmoji,
          presenceStatus: currentUser.presenceStatus
        },
        ...(ws.members || []).filter((m) => !m.id.startsWith('usr-local-') && !m.id.startsWith('usr-guest-'))
      ],
      updatedAt: now
    }));

    setWorkspaces(migrated);
    const firstId = migrated[0]?.id || 'ws-default';
    setActiveWorkspaceIdState(firstId);
    setActiveWorkspaceId(firstId, currentUser);
    clearGuestWorkspaces();
    setGuestMigrationOpen(false);
    toast.success(`${migrated.length} workspace tamu berhasil dipindahkan ke akunmu.`);
  }, [currentUser]);

  const handleSkipGuestMigration = useCallback(() => {
    setGuestMigrationOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.auth.logout();
    } catch {
      // Tetap lanjutkan logout lokal
    }

    const guestUser: AuthUser = {
      id: `usr-local-${Math.random().toString(36).substring(2, 8)}`,
      name: 'Yuu Creator',
      avatar: 'Y',
      color: '#2563EB',
      isCloudAuth: false
    };
    saveStoredAuthUser(guestUser);
    setActiveSession(false);
    setCurrentUser(guestUser);
    const guestWs = getStoredWorkspaces(guestUser);
    setWorkspaces(guestWs);
    setActiveWorkspaceIdState(getActiveWorkspaceId(guestWs, guestUser));
    toast.info('Berhasil keluar dari akun.');
  }, []);

  return {
    currentUser,
    setCurrentUser,
    workspaces,
    setWorkspaces,
    activeWorkspaceId,
    setActiveWorkspaceIdState,
    guestMigrationOpen,
    guestWorkspacesCount,
    handleUserChange,
    handleImportGuestWorkspaces,
    handleSkipGuestMigration,
    handleLogout
  };
}
