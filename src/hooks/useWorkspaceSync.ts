import { useState, useEffect, useMemo, useRef } from 'react';
import {
  AuthUser,
  Card,
  CloudSyncConfig,
  SyncConnectionStatus,
  UserPresence,
  Workspace
} from '../types/board';
import { createSyncManager, getStoredCloudConfig } from '../lib/sync';

interface UseWorkspaceSyncParams {
  roomId: string;
  currentUser: AuthUser;
  activeWorkspaceId: string;
  activeBoardId: string;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
}

export function useWorkspaceSync({
  roomId,
  currentUser,
  activeWorkspaceId,
  activeBoardId,
  setWorkspaces
}: UseWorkspaceSyncParams) {
  const [syncStatus, setSyncStatus] = useState<SyncConnectionStatus>('local');
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>(() => getStoredCloudConfig());
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});
  const syncManagerRef = useRef<ReturnType<typeof createSyncManager> | null>(null);

  const currentUserPresence: UserPresence = useMemo(() => ({
    id: currentUser.id,
    name: currentUser.name,
    avatar: currentUser.avatar,
    color: currentUser.color,
    lastActive: Date.now()
  }), [currentUser]);

  useEffect(() => {
    const manager = createSyncManager(roomId, currentUserPresence);
    syncManagerRef.current = manager;

    const unsubStatus = manager.onStatusChange((status) => {
      setSyncStatus(status);
    });

    const unsubscribe = manager.subscribe((event) => {
      if (event.senderId === currentUser.id) return;

      if (event.type === 'PRESENCE_PING') {
        setPresenceMap((prev) => ({
          ...prev,
          [event.user.id]: event.user
        }));
        return;
      }

      if (event.type === 'PAGE_UPSERT') {
        setWorkspaces((prevWs) =>
          prevWs.map((ws) =>
            ws.id === activeWorkspaceId
              ? {
                  ...ws,
                  pages: ws.pages.some((p) => p.id === event.page.id)
                    ? ws.pages.map((p) => (p.id === event.page.id ? event.page : p))
                    : [...ws.pages, event.page]
                }
              : ws
          )
        );
        return;
      }

      if (event.type === 'PAGE_DELETE') {
        setWorkspaces((prevWs) =>
          prevWs.map((ws) =>
            ws.id === activeWorkspaceId
              ? {
                  ...ws,
                  pages: ws.pages.filter((p) => p.id !== event.pageId)
                }
              : ws
          )
        );
        return;
      }

      setWorkspaces((prevWs) =>
        prevWs.map((ws) => {
          if (ws.id !== activeWorkspaceId) return ws;

          const updatedBoards = ws.boards.map((b) => {
            if (b.id !== activeBoardId) return b;

            if (event.type === 'CARD_UPSERT') {
              const existing = b.cards[event.card.id];
              if (existing && existing.updatedAt > event.card.updatedAt) return b;
              return {
                ...b,
                updatedAt: Date.now(),
                cards: { ...b.cards, [event.card.id]: event.card }
              };
            }

            if (event.type === 'CARD_DELETE') {
              const nextCards = { ...b.cards };
              delete nextCards[event.cardId];
              return { ...b, updatedAt: Date.now(), cards: nextCards };
            }

            if (event.type === 'CARD_MOVE') {
              const card = b.cards[event.cardId];
              if (!card) return b;
              return {
                ...b,
                updatedAt: Date.now(),
                cards: {
                  ...b.cards,
                  [event.cardId]: {
                    ...card,
                    columnId: event.targetColumnId,
                    order: event.targetOrder,
                    updatedAt: event.updatedAt
                  }
                }
              };
            }

            if (event.type === 'COLUMN_UPSERT') {
              const existingIdx = b.columns.findIndex((c) => c.id === event.column.id);
              const nextCols =
                existingIdx >= 0
                  ? b.columns.map((c) => (c.id === event.column.id ? event.column : c))
                  : [...b.columns, event.column];
              return { ...b, updatedAt: Date.now(), columns: nextCols };
            }

            if (event.type === 'COLUMN_DELETE') {
              const nextCols = b.columns.filter((c) => c.id !== event.columnId);
              const nextCards: Record<string, Card> = {};
              Object.values(b.cards).forEach((c) => {
                if (c.columnId !== event.columnId) nextCards[c.id] = c;
              });
              return { ...b, updatedAt: Date.now(), columns: nextCols, cards: nextCards };
            }

            if (event.type === 'BOARD_RESET') {
              return event.board;
            }

            return b;
          });

          return { ...ws, boards: updatedBoards };
        })
      );
    });

    return () => {
      unsubStatus();
      unsubscribe();
      manager.destroy();
    };
  }, [roomId, currentUserPresence, activeWorkspaceId, activeBoardId, currentUser.id, setWorkspaces]);

  useEffect(() => {
    const pruneInterval = setInterval(() => {
      const now = Date.now();
      setPresenceMap((prev) => {
        const next: Record<string, UserPresence> = {};
        Object.entries(prev).forEach(([id, user]) => {
          if (now - user.lastActive < 10000) {
            next[id] = user;
          }
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(pruneInterval);
  }, []);

  const activeUsersList = useMemo(() => {
    const others = Object.values(presenceMap).filter((u) => u.id !== currentUser.id);
    return [currentUserPresence, ...others];
  }, [presenceMap, currentUserPresence, currentUser.id]);

  return {
    syncStatus,
    cloudConfig,
    setCloudConfig,
    syncManagerRef,
    currentUserPresence,
    activeUsersList
  };
}
