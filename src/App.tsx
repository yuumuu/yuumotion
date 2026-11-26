import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import {
  Board,
  Card,
  ChecklistItem,
  CloudSyncConfig,
  Column,
  DatabaseBridgeConfig,
  NotificationItem,
  NotionPage,
  SyncConnectionStatus,
  UserPresence,
  UserRole,
  Workspace,
  WorkspaceTemplateType,
  WorkspaceView
} from './types/board';
import { INITIAL_BOARD } from './lib/constants';
import {
  saveStoredWorkspaces,
  setActiveWorkspaceId,
  canEditContent,
  hasActiveSession,
  resolveRouteWithAuthGuard,
  navigateWithGuard,
  setActiveSession,
  extractShareTokenFromLocation,
  AppRoute
} from './lib/auth';
import { useAuthSession } from './hooks/useAuthSession';
import { getNotificationsStorageKey, isGuestUser } from './lib/storageNamespace';
import { createSyncManager, getStoredCloudConfig } from './lib/sync';
import { getStoredDbConfig, saveStoredDbConfig } from './lib/dbBridge';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NavigationRail } from './components/NavigationRail';
import { ProjectExplorer } from './components/ProjectExplorer';
import { ProjectBanner } from './components/ProjectBanner';
import { FilterSortBar } from './components/FilterSortBar';
import { BoardFilterState, DEFAULT_BOARD_FILTER } from './types/filter';
import { filterAndSortCards } from './lib/cardFilter';
import { KanbanBoard } from './components/KanbanBoard';
import { EmptyWorkspaceOnboarding } from './components/EmptyWorkspaceOnboarding';
import { EmptyWorkspaceContent } from './components/EmptyWorkspaceContent';
import type { SettingsTab } from './components/SettingsHubModal';
import type { ProfileDetailTarget } from './components/MemberProfileModal';
import { BoardTemplate } from './data/boardTemplates';
import { ActivityService } from './services/activityService';
import { apiClient } from './services/apiClient';
import { ToastContainer, ConfirmDialog, LoadingScreen, WorkspaceSkeleton, toast } from './components/ui';
import { usePreferences } from './context/PreferencesContext';
import { Plus, Kanban, FileText, UserPlus } from '@phosphor-icons/react';

const LandingPage = React.lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })));
const AuthPage = React.lazy(() => import('./components/AuthPage').then((m) => ({ default: m.AuthPage })));
const CalendarView = React.lazy(() => import('./components/CalendarView').then((m) => ({ default: m.CalendarView })));
const TimelineGanttView = React.lazy(() => import('./components/TimelineGanttView').then((m) => ({ default: m.TimelineGanttView })));
const TableDatabaseView = React.lazy(() => import('./components/TableDatabaseView').then((m) => ({ default: m.TableDatabaseView })));
const StandalonePageDoc = React.lazy(() => import('./components/StandalonePageDoc').then((m) => ({ default: m.StandalonePageDoc })));
const WorkspaceOverview = React.lazy(() => import('./components/WorkspaceOverview').then((m) => ({ default: m.WorkspaceOverview })));
const CardDetailModal = React.lazy(() => import('./components/CardDetailModal').then((m) => ({ default: m.CardDetailModal })));
const DatabaseBridgeModal = React.lazy(() => import('./components/DatabaseBridgeModal').then((m) => ({ default: m.DatabaseBridgeModal })));
const WorkspaceMembersModal = React.lazy(() => import('./components/WorkspaceMembersModal').then((m) => ({ default: m.WorkspaceMembersModal })));
const CommandPalette = React.lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const SettingsHubModal = React.lazy(() => import('./components/SettingsHubModal').then((m) => ({ default: m.SettingsHubModal })));
const BoardTemplateModal = React.lazy(() => import('./components/BoardTemplateModal').then((m) => ({ default: m.BoardTemplateModal })));
const ShareModal = React.lazy(() => import('./components/ShareModal').then((m) => ({ default: m.ShareModal })));
const EntitySettingsModal = React.lazy(() => import('./components/EntitySettingsModal').then((m) => ({ default: m.EntitySettingsModal })));
const MemberProfileModal = React.lazy(() => import('./components/MemberProfileModal').then((m) => ({ default: m.MemberProfileModal })));
const GuestMigrationModal = React.lazy(() => import('./components/GuestMigrationModal').then((m) => ({ default: m.GuestMigrationModal })));

export const App: React.FC = () => {
  const [appRoute, setAppRoute] = useState<AppRoute>(() => resolveRouteWithAuthGuard());
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('profile');
  const [isQuickTaskPromptOpen, setIsQuickTaskPromptOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedProfileMember, setSelectedProfileMember] = useState<ProfileDetailTarget | null>(null);
  const [entitySettings, setEntitySettings] = useState<{ open: boolean; type: 'workspace' | 'board' }>({
    open: false,
    type: 'board'
  });
  const [shareTokenParam, setShareTokenParam] = useState<string | null>(() =>
    extractShareTokenFromLocation()
  );

  const openSettingsTab = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const goToRoute = (target: AppRoute) => {
    const resolved = navigateWithGuard(target);
    setAppRoute(resolved);
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setShareTokenParam(extractShareTokenFromLocation());
      setAppRoute(resolveRouteWithAuthGuard());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);
  const {
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
    handleLogout: performLogout
  } = useAuthSession();

  const activeWorkspace = useMemo(() => {
    return workspaces?.find((w) => w.id === activeWorkspaceId) || workspaces?.[0] || {
      id: 'ws-default',
      name: 'Main Workspace',
      icon: '🚀',
      ownerId: currentUser.id,
      currentRole: 'owner' as UserRole,
      members: [],
      boards: [INITIAL_BOARD],
      pages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }, [workspaces, activeWorkspaceId, currentUser]);

  const currentUserRole: UserRole = useMemo(() => {
    if (!activeWorkspace || !Array.isArray(activeWorkspace.members)) return 'owner';
    const member = activeWorkspace.members.find((m) => m?.id === currentUser?.id);
    return member?.role || activeWorkspace.currentRole || 'member';
  }, [activeWorkspace, currentUser]);

  const canEdit = canEditContent(currentUserRole);

  const [activeTarget, setActiveTarget] = useState<{ type: 'workspace' | 'board' | 'page'; id: string }>(() => {
    const boards = activeWorkspace?.boards || [];
    if (boards.length > 0) {
      return { type: 'board', id: boards[0].id };
    }
    return { type: 'board', id: 'yuumotion-primary-board' };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [roomId] = useState('general');
  const [activeView, setActiveView] = useState<WorkspaceView>('board');
  const { preferences, updatePreferences } = usePreferences();
  const isDark =
    preferences.theme === 'dark' ||
    (preferences.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [searchQuery] = useState('');
  const [boardFilter, setBoardFilter] = useState<BoardFilterState>(DEFAULT_BOARD_FILTER);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const raw = localStorage.getItem(getNotificationsStorageKey(currentUser));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const [syncStatus, setSyncStatus] = useState<SyncConnectionStatus>('local');
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>(() => getStoredCloudConfig());
  const [dbConfig, setDbConfig] = useState<DatabaseBridgeConfig>(() => getStoredDbConfig());

  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});
  const syncManagerRef = useRef<ReturnType<typeof createSyncManager> | null>(null);

  const activeBoard = useMemo(() => {
    const boards = activeWorkspace?.boards || [INITIAL_BOARD];
    if (activeTarget.type === 'board') {
      const b = boards.find((x) => x?.id === activeTarget.id);
      return b || boards[0] || INITIAL_BOARD;
    }
    return boards[0] || INITIAL_BOARD;
  }, [activeWorkspace, activeTarget]);

  const activePage = useMemo(() => {
    const pages = activeWorkspace?.pages || [];
    if (activeTarget.type === 'page') {
      return pages.find((p) => p?.id === activeTarget.id) || pages[0];
    }
    return undefined;
  }, [activeWorkspace, activeTarget]);

  const totalBoardCardsCount = useMemo(
    () => Object.keys(activeBoard.cards || {}).length,
    [activeBoard.cards]
  );

  const filteredCardsList = useMemo(() => {
    const allCards = Object.values(activeBoard.cards || {});
    return filterAndSortCards(allCards, boardFilter, searchQuery, currentUser.id);
  }, [activeBoard.cards, boardFilter, searchQuery, currentUser.id]);

  const filteredBoard = useMemo<Board>(() => {
    const cardsMap: Record<string, Card> = {};
    filteredCardsList.forEach((c, idx) => {
      cardsMap[c.id] = boardFilter.sortField === 'manual' ? c : { ...c, order: idx };
    });
    return { ...activeBoard, cards: cardsMap };
  }, [activeBoard, filteredCardsList, boardFilter.sortField]);

  useEffect(() => {
    saveStoredWorkspaces(workspaces, currentUser);
  }, [workspaces, currentUser]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(getNotificationsStorageKey(currentUser));
      setNotifications(raw ? JSON.parse(raw) : []);
    } catch {
      setNotifications([]);
    }
    if (!isGuestUser(currentUser)) {
      apiClient.notifications
        .list()
        .then((res) => {
          if (Array.isArray(res.notifications)) {
            setNotifications(res.notifications);
          }
        })
        .catch(() => {});
    }
  }, [currentUser.id]);

  useEffect(() => {
    try {
      localStorage.setItem(getNotificationsStorageKey(currentUser), JSON.stringify(notifications));
    } catch {
      // Ignore storage quota errors
    }
  }, [notifications, currentUser]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (selectedCardId) {
          setSelectedCardId(null);
          return;
        }
        if (isDbModalOpen) {
          setIsDbModalOpen(false);
          return;
        }
        if (isMembersModalOpen) {
          setIsMembersModalOpen(false);
          return;
        }
        if (isFabOpen) {
          setIsFabOpen(false);
          return;
        }
      }

      if (isInputActive) return;

      if (e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        openSettingsTab('shortcuts');
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        setActiveView('board');
      } else if (e.key === 'c' || e.key === 'C') {
        setActiveView('calendar');
      } else if (e.key === 't' || e.key === 'T') {
        setActiveView('timeline');
      } else if (e.key === 's' || e.key === 'S') {
        setActiveView('table');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isCommandPaletteOpen,
    isSettingsOpen,
    selectedCardId,
    isDbModalOpen,
    isMembersModalOpen,
    isFabOpen
  ]);

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
            if (b.id !== activeBoard.id) return b;

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
  }, [roomId, currentUserPresence, activeWorkspaceId, activeBoard.id, currentUser.id]);

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

  const toggleTheme = () => {
    updatePreferences({ theme: isDark ? 'light' : 'dark' });
  };

  const handleSelectWorkspace = (newWsId: string) => {
    setActiveWorkspaceIdState(newWsId);
    setActiveWorkspaceId(newWsId, currentUser);
    const targetWs = workspaces.find((w) => w.id === newWsId);
    if (targetWs && Array.isArray(targetWs.boards) && targetWs.boards.length > 0) {
      setActiveTarget({ type: 'board', id: targetWs.boards[0].id });
    }
  };

  const handleCreateWorkspace = (
    name: string,
    icon: string,
    template: WorkspaceTemplateType = 'full'
  ) => {
    const wsId = `ws-${Date.now()}`;
    const includeBoard = template === 'full' || template === 'board';
    const includeDocs = template === 'full' || template === 'docs';
    const starterBoardId = `board-${Date.now()}`;
    const starterPageId = `page-${Date.now()}`;

    const newWs: Workspace = {
      id: wsId,
      name,
      icon,
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
          joinedAt: Date.now(),
          title: currentUser.title,
          bio: currentUser.bio,
          timezone: currentUser.timezone,
          avatarUrl: currentUser.avatarUrl,
          avatarEmoji: currentUser.avatarEmoji,
          presenceStatus: currentUser.presenceStatus
        }
      ],
      boards: includeBoard
        ? [
            {
              ...INITIAL_BOARD,
              id: starterBoardId,
              workspaceId: wsId,
              title: `${name} Roadmap`,
              updatedAt: Date.now()
            }
          ]
        : [],
      pages: includeDocs
        ? [
            {
              id: starterPageId,
              workspaceId: wsId,
              title: `Panduan ${name}`,
              icon: '📝',
              coverImage:
                'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
              contentHtml: `<h1>Selamat datang di ${name}</h1><p>Mulai tulis catatan, spesifikasi PRD, atau dokumentasi tim di sini. Ketik <code>/</code> untuk membuka menu blok cepat.</p>`,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ]
        : [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceIdState(wsId);
    setActiveWorkspaceId(wsId, currentUser);
    if (includeBoard) {
      setActiveTarget({ type: 'board', id: starterBoardId });
    } else if (includeDocs) {
      setActiveTarget({ type: 'page', id: starterPageId });
    }
    toast.success(`Workspace "${name}" berhasil dibuat.`);
  };

  const handleUpdateActiveWorkspace = (updated: Workspace) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleDeleteWorkspace = (wsId: string) => {
    const nextWs = workspaces.filter((w) => w.id !== wsId);
    setWorkspaces(nextWs);
    if (nextWs.length > 0) {
      handleSelectWorkspace(nextWs[0].id);
    } else {
      setActiveWorkspaceIdState('');
    }
    toast.info('Workspace telah dihapus.');
  };

  const handleAddPage = (
    parentId?: string,
    initial?: { title: string; contentHtml: string; icon?: string }
  ) => {
    if (!canEdit) return;

    const newPage: NotionPage = {
      id: `page-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      parentId,
      title: initial?.title || (parentId ? 'Sub-halaman Baru' : 'Untitled Document'),
      icon: initial?.icon || '📄',
      contentHtml: initial?.contentHtml || '<p></p>',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId ? { ...ws, pages: [...ws.pages, newPage] } : ws
      )
    );
    setActiveTarget({ type: 'page', id: newPage.id });

    syncManagerRef.current?.broadcast({
      type: 'PAGE_UPSERT',
      page: newPage,
      senderId: currentUser.id
    });
    toast.success('Halaman dokumen baru berhasil dibuat.');
  };

  const handleUpdatePage = (updated: NotionPage) => {
    if (!canEdit) return;

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              pages: ws.pages.map((p) => (p.id === updated.id ? updated : p))
            }
          : ws
      )
    );

    syncManagerRef.current?.broadcast({
      type: 'PAGE_UPSERT',
      page: updated,
      senderId: currentUser.id
    });
  };

  const handleDeletePage = (pageId: string) => {
    if (!canEdit) return;

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? { ...ws, pages: ws.pages.filter((p) => p.id !== pageId) }
          : ws
      )
    );

    if (activeTarget.type === 'page' && activeTarget.id === pageId) {
      const remainingPages = activeWorkspace.pages.filter((p) => p.id !== pageId);
      if (remainingPages.length > 0) {
        setActiveTarget({ type: 'page', id: remainingPages[0].id });
      } else if (activeWorkspace.boards.length > 0) {
        setActiveTarget({ type: 'board', id: activeWorkspace.boards[0].id });
      }
    }

    syncManagerRef.current?.broadcast({
      type: 'PAGE_DELETE',
      pageId,
      senderId: currentUser.id,
      updatedAt: Date.now()
    });
    toast.info('Halaman dokumen telah dihapus.');
  };

  const handleAddBoard = (title: string) => {
    if (!canEdit) return;

    const newBoard: Board = {
      id: `board-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      title,
      columns: INITIAL_BOARD.columns.map((c) => ({ ...c, updatedAt: Date.now() })),
      cards: {},
      updatedAt: Date.now()
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId ? { ...ws, boards: [...ws.boards, newBoard] } : ws
      )
    );
    setActiveTarget({ type: 'board', id: newBoard.id });
    toast.success(`Board "${title}" berhasil dibuat.`);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (!canEdit) return;

    const remainingBoards = activeWorkspace.boards.filter((b) => b.id !== boardId);
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId ? { ...ws, boards: remainingBoards } : ws
      )
    );

    if (activeTarget.type === 'board' && activeTarget.id === boardId) {
      if (remainingBoards.length > 0) {
        setActiveTarget({ type: 'board', id: remainingBoards[0].id });
      } else if (activeWorkspace.pages.length > 0) {
        setActiveTarget({ type: 'page', id: activeWorkspace.pages[0].id });
      }
    }
    toast.success('Papan Kanban berhasil dihapus.');
  };

  const handleUpdateActiveBoard = (updater: (prevBoard: Board) => Board) => {
    if (!canEdit) return;

    setWorkspaces((prevWs) =>
      prevWs.map((ws) => {
        if (ws.id !== activeWorkspaceId) return ws;
        const nextBoards = ws.boards.map((b) => (b.id === activeBoard.id ? updater(b) : b));
        return { ...ws, boards: nextBoards };
      })
    );
  };

  const handleAddCard = (columnId: string, title: string) => {
    if (!canEdit) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      columnId,
      title,
      description: '',
      tags: [],
      priority: 'low',
      checklist: [],
      attachments: [],
      order: Object.values(activeBoard.cards).filter((c) => c.columnId === columnId).length,
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [newCard.id]: newCard }
    }));

    syncManagerRef.current?.broadcast({
      type: 'CARD_UPSERT',
      card: newCard,
      senderId: currentUser.id
    });
    ActivityService.record({
      workspaceId: activeWorkspace.id,
      boardId: activeBoard.id,
      cardId: newCard.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'card.created',
      summary: `menambahkan kartu "${title}"`
    });
    toast.success(`Kartu "${title}" berhasil ditambahkan.`);
  };

  const handleAddCardOnDate = (columnId: string, title: string, dueDate: string) => {
    if (!canEdit) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      columnId,
      title,
      description: '',
      tags: [],
      priority: 'medium',
      dueDate,
      checklist: [],
      attachments: [],
      order: Object.values(activeBoard.cards).filter((c) => c.columnId === columnId).length,
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [newCard.id]: newCard }
    }));

    syncManagerRef.current?.broadcast({
      type: 'CARD_UPSERT',
      card: newCard,
      senderId: currentUser.id
    });
    ActivityService.record({
      workspaceId: activeWorkspace.id,
      boardId: activeBoard.id,
      cardId: newCard.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'card.created',
      summary: `menambahkan kartu "${title}"`
    });
    toast.success(`Kartu "${title}" berhasil ditambahkan.`);
  };

  const handleUpdateCard = (updated: Card) => {
    if (!canEdit) return;

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [updated.id]: updated }
    }));

    syncManagerRef.current?.broadcast({
      type: 'CARD_UPSERT',
      card: updated,
      senderId: currentUser.id
    });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!canEdit) return;

    handleUpdateActiveBoard((prev) => {
      const next = { ...prev.cards };
      delete next[cardId];
      return { ...prev, updatedAt: Date.now(), cards: next };
    });

    syncManagerRef.current?.broadcast({
      type: 'CARD_DELETE',
      cardId,
      senderId: currentUser.id,
      updatedAt: Date.now()
    });
    toast.info('Kartu telah dihapus.');
  };

  const handleConvertChecklistToCard = (sourceCardId: string, item: ChecklistItem) => {
    if (!canEdit) return;
    const sourceCard = activeBoard.cards[sourceCardId];
    if (!sourceCard) return;

    const newCardId = `card-${Date.now()}`;
    const newCard: Card = {
      id: newCardId,
      columnId: sourceCard.columnId,
      title: item.text,
      description: '',
      tags: [],
      priority: 'medium',
      dueDate: item.dueDate,
      assignees: item.assigneeId ? [item.assigneeId] : undefined,
      checklist: [],
      attachments: [],
      order: Object.values(activeBoard.cards).filter((c) => c.columnId === sourceCard.columnId).length,
      updatedAt: Date.now()
    };

    const updatedSource: Card = {
      ...sourceCard,
      checklist: sourceCard.checklist.filter((c) => c.id !== item.id),
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: {
        ...prev.cards,
        [sourceCardId]: updatedSource,
        [newCardId]: newCard
      }
    }));

    syncManagerRef.current?.broadcast({ type: 'CARD_UPSERT', card: updatedSource, senderId: currentUser.id });
    syncManagerRef.current?.broadcast({ type: 'CARD_UPSERT', card: newCard, senderId: currentUser.id });
    toast.success(`Sub-tugas "${item.text}" dijadikan kartu baru.`);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (!isGuestUser(currentUser)) {
      apiClient.notifications.markRead(id).catch(() => {});
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (!isGuestUser(currentUser)) {
      apiClient.notifications.markAllRead().catch(() => {});
    }
  };

  const handleSelectNotification = (item: NotificationItem) => {
    if (item.workspaceId && item.workspaceId !== activeWorkspaceId) {
      handleSelectWorkspace(item.workspaceId);
    }
    if (item.entityType === 'page') {
      setActiveTarget({ type: 'page', id: item.entityId });
    } else {
      if (item.boardId) setActiveTarget({ type: 'board', id: item.boardId });
      setSelectedCardId(item.entityId);
    }
  };

  const handleMentionUser = (
    member: { id: string; name: string },
    card: Card,
    commentText: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      workspaceId: activeWorkspaceId,
      recipientUserId: member.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      type: 'mention_card',
      entityType: 'card',
      entityId: card.id,
      boardId: activeBoard.id,
      title: `${currentUser.name} menyebut Anda di "${card.title}"`,
      snippet: commentText,
      isRead: false,
      createdAt: Date.now()
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
    if (!isGuestUser(currentUser)) {
      apiClient.notifications
        .create({
          workspaceId: activeWorkspaceId,
          recipientUserId: member.id,
          actorId: currentUser.id,
          actorName: currentUser.name,
          type: 'mention_card',
          entityType: 'card',
          entityId: card.id,
          boardId: activeBoard.id,
          title: newNotif.title,
          snippet: commentText
        })
        .catch(() => {});
    }
    toast.info(`Notifikasi @mention dikirim ke ${member.name}.`);
  };

  const handleDropCard = (cardId: string, targetColumnId: string) => {
    if (!canEdit) return;

    const card = activeBoard.cards[cardId];
    if (!card || card.columnId === targetColumnId) return;

    const targetOrder = Object.values(activeBoard.cards).filter((c) => c.columnId === targetColumnId).length;
    const updatedCard: Card = {
      ...card,
      columnId: targetColumnId,
      order: targetOrder,
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [cardId]: updatedCard }
    }));

    const targetCol = activeBoard.columns.find((c) => c.id === targetColumnId);
    const isDoneCol = Boolean(
      targetCol &&
        (targetCol.title.toLowerCase().includes('done') ||
          targetCol.title.toLowerCase().includes('selesai') ||
          targetCol.title.toLowerCase().includes('completed'))
    );

    if (isDoneCol && card.recurrence && activeBoard.columns[0]) {
      const firstColId = activeBoard.columns[0].id;
      const baseDate = card.dueDate ? new Date(card.dueDate) : new Date();
      const nextDate = new Date(baseDate);
      if (card.recurrence.frequency === 'daily') {
        nextDate.setDate(baseDate.getDate() + card.recurrence.interval);
      } else if (card.recurrence.frequency === 'weekly') {
        nextDate.setDate(baseDate.getDate() + card.recurrence.interval * 7);
      } else {
        nextDate.setMonth(baseDate.getMonth() + card.recurrence.interval);
      }
      const nextDueStr = nextDate.toISOString().slice(0, 10);
      const recurringCard: Card = {
        ...card,
        id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        columnId: firstColId,
        dueDate: nextDueStr,
        checklist: card.checklist.map((item) => ({ ...item, completed: false })),
        order: Object.values(activeBoard.cards).filter((c) => c.columnId === firstColId).length,
        updatedAt: Date.now()
      };
      handleUpdateActiveBoard((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        cards: { ...prev.cards, [recurringCard.id]: recurringCard }
      }));
      toast.success(`Tugas berulang dibuat untuk ${nextDueStr}.`);
    }

    ActivityService.record({
      workspaceId: activeWorkspace.id,
      boardId: activeBoard.id,
      cardId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'card.moved',
      summary: `memindahkan kartu "${card.title}" ke ${targetCol?.title || 'kolom baru'}`
    });

    syncManagerRef.current?.broadcast({
      type: 'CARD_MOVE',
      cardId,
      targetColumnId,
      targetOrder,
      senderId: currentUser.id,
      updatedAt: updatedCard.updatedAt
    });
    toast.info('Kartu dipindahkan.');
  };

  const handleCreateBoardFromTemplate = (template: BoardTemplate) => {
    if (!canEdit) return;
    const boardId = `board-${Date.now()}`;
    const columns: Column[] = template.columns.map((col, idx) => ({
      id: `col-${Date.now()}-${idx}`,
      title: col.title,
      color: col.color,
      order: idx,
      wipLimit: col.wipLimit,
      updatedAt: Date.now()
    }));

    const cards: Record<string, Card> = {};
    template.sampleCards.forEach((sc, idx) => {
      const targetCol = columns[sc.columnIndex] || columns[0];
      if (!targetCol) return;
      const cid = `card-${Date.now()}-${idx}`;
      cards[cid] = {
        id: cid,
        columnId: targetCol.id,
        title: sc.title,
        description: sc.description,
        tags: [],
        priority: sc.priority,
        checklist: [],
        attachments: [],
        order: idx,
        updatedAt: Date.now()
      };
    });

    const newBoard: Board = {
      id: boardId,
      workspaceId: activeWorkspace.id,
      title: template.name,
      columns,
      cards,
      updatedAt: Date.now()
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspace.id ? { ...ws, boards: [...ws.boards, newBoard] } : ws
      )
    );
    setActiveTarget({ type: 'board', id: boardId });
    ActivityService.record({
      workspaceId: activeWorkspace.id,
      boardId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'board.created',
      summary: `membuat papan "${template.name}" dari template`
    });
    toast.success(`Papan "${template.name}" berhasil dibuat.`);
  };

  const handleAddColumn = (title: string, color: string) => {
    if (!canEdit) return;

    const newCol: Column = {
      id: `col-${Date.now()}`,
      title,
      color,
      order: activeBoard.columns.length,
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      columns: [...prev.columns, newCol]
    }));

    syncManagerRef.current?.broadcast({
      type: 'COLUMN_UPSERT',
      column: newCol,
      senderId: currentUser.id
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!canEdit) return;

    handleUpdateActiveBoard((prev) => {
      const nextCols = prev.columns.filter((c) => c.id !== columnId);
      const nextCards: Record<string, Card> = {};
      Object.values(prev.cards).forEach((c) => {
        if (c.columnId !== columnId) nextCards[c.id] = c;
      });
      return { ...prev, updatedAt: Date.now(), columns: nextCols, cards: nextCards };
    });

    syncManagerRef.current?.broadcast({
      type: 'COLUMN_DELETE',
      columnId,
      senderId: currentUser.id,
      updatedAt: Date.now()
    });
  };

  const handleReorderColumns = (columnId: string, targetIndex: number) => {
    if (!canEdit) return;
    handleUpdateActiveBoard((prev) => {
      const sorted = [...prev.columns].sort((a, b) => a.order - b.order);
      const col = sorted.find((c) => c.id === columnId);
      if (!col) return prev;
      const without = sorted.filter((c) => c.id !== columnId);
      without.splice(targetIndex, 0, col);
      return {
        ...prev,
        updatedAt: Date.now(),
        columns: without.map((c, idx) => ({ ...c, order: idx, updatedAt: Date.now() }))
      };
    });
  };

  const handleUpdateWipLimit = (columnId: string, wipLimit?: number) => {
    if (!canEdit) return;
    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, wipLimit, updatedAt: Date.now() } : c
      )
    }));
  };

  const handleRenameCard = (cardId: string, newTitle: string) => {
    if (!canEdit) return;
    const card = activeBoard.cards[cardId];
    if (!card) return;
    handleUpdateCard({ ...card, title: newTitle, updatedAt: Date.now() });
  };

  const handleExport = () => {
    const exportData = {
      workspace: activeWorkspace,
      exportedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yuumotion-workspace-${activeWorkspace.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed?.workspace?.boards) {
          handleUpdateActiveWorkspace({ ...parsed.workspace, updatedAt: Date.now() });
        } else if (parsed?.columns && parsed?.cards) {
          handleUpdateActiveBoard(() => ({ ...parsed, updatedAt: Date.now() }));
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activeUsersList = useMemo(() => {
    const others = Object.values(presenceMap).filter((u) => u.id !== currentUser.id);
    return [currentUserPresence, ...others];
  }, [presenceMap, currentUserPresence, currentUser.id]);

  const selectedCard = selectedCardId ? activeBoard.cards[selectedCardId] : null;

  const handleLogout = async () => {
    await performLogout();
    setIsSettingsOpen(false);
    goToRoute('landing');
  };

  if (shareTokenParam) {
    const sharedBoard = workspaces
      .flatMap((ws) => ws.boards)
      .find((b) => b.shareToken === shareTokenParam);

    if (sharedBoard) {
      return (
        <div className="min-h-screen bg-bg text-text flex flex-col">
          <header className="flex h-14 items-center justify-between border-b border-border bg-bar px-6 shrink-0">
            <div className="flex items-center gap-2.5">
              <img src="/icon.svg" alt="Yuumotion" className="h-7 w-7 rounded-lg" />
              <span className="font-display text-sm font-bold">{sharedBoard.title}</span>
              <span className="rounded-full bg-project-soft px-2 py-0.5 text-[10px] font-semibold text-project-solid">
                Tamu (Read-Only)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShareTokenParam(null);
                goToRoute(hasActiveSession() ? 'app' : 'landing');
              }}
              className="text-xs font-medium text-project-solid hover:underline cursor-pointer"
            >
              Masuk ke Yuumotion
            </button>
          </header>
          <main className="flex-1 overflow-auto">
            <KanbanBoard
              board={sharedBoard}
              searchQuery=""
              onCardClick={() => toast.info('Mode tamu hanya-baca.')}
              onAddCard={() => {}}
              onAddColumn={() => {}}
              onDeleteColumn={() => {}}
              onDropCard={() => {}}
            />
          </main>
          <ToastContainer />
        </div>
      );
    }
  }

  if (appRoute === 'landing') {
    const authed = hasActiveSession();
    return (
      <Suspense fallback={<LoadingScreen label="Memuat halaman utama..." />}>
        <LandingPage
          currentUser={authed ? currentUser : null}
          onEnterApp={() => {
            if (hasActiveSession()) {
              goToRoute('app');
            } else {
              goToRoute('auth');
            }
          }}
          onOpenAuth={() => goToRoute('auth')}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      </Suspense>
    );
  }

  if (appRoute === 'auth') {
    return (
      <Suspense fallback={<LoadingScreen label="Menyiapkan halaman masuk..." />}>
        <AuthPage
          currentUser={currentUser}
          onUserChange={(user) => {
            void handleUserChange(user);
          }}
          onNavigateHome={() => goToRoute('landing')}
          onEnterApp={() => {
            setActiveSession(true);
            goToRoute('app');
          }}
        />
      </Suspense>
    );
  }

  if (workspaces.length === 0) {
    return (
      <>
        <EmptyWorkspaceOnboarding
          userName={currentUser.name}
          onCreateWorkspace={handleCreateWorkspace}
          onNavigateLanding={() => goToRoute('landing')}
        />
        <Suspense fallback={null}>
          <GuestMigrationModal
            isOpen={guestMigrationOpen}
            guestWorkspaceCount={guestWorkspacesCount}
            userName={currentUser.name}
            onImportGuestWorkspaces={handleImportGuestWorkspaces}
            onStartFresh={handleSkipGuestMigration}
          />
        </Suspense>
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg font-sans text-text">
      {/* Panel 1: Primary Navigation Rail */}
      <NavigationRail
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        onOpenWorkspaceSettings={() => setEntitySettings({ open: true, type: 'workspace' })}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenSettings={openSettingsTab}
        currentUser={currentUser}
      />

      {/* Panel 2: Project Context Explorer */}
      <ProjectExplorer
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        projectName={activeWorkspace?.name || 'Workspace'}
        activeTarget={activeTarget}
        onSelectTarget={setActiveTarget}
        boards={activeWorkspace?.boards || []}
        pages={activeWorkspace?.pages || []}
        onAddBoard={handleAddBoard}
        onRenameBoard={(boardId, newTitle) => {
          if (!canEdit) return;
          setWorkspaces((prev) =>
            prev.map((ws) =>
              ws.id === activeWorkspaceId
                ? {
                    ...ws,
                    boards: ws.boards.map((b) =>
                      b.id === boardId ? { ...b, title: newTitle, updatedAt: Date.now() } : b
                    )
                  }
                : ws
            )
          );
          toast.success('Nama papan diperbarui.');
        }}
        onDeleteBoard={handleDeleteBoard}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenWorkspaceSettings={() => setEntitySettings({ open: true, type: 'workspace' })}
        onDeleteWorkspace={() => setEntitySettings({ open: true, type: 'workspace' })}
        onOpenBoardSettings={(boardId) => {
          setActiveTarget({ type: 'board', id: boardId });
          setEntitySettings({ open: true, type: 'board' });
        }}
        onShareBoard={(boardId) => {
          setActiveTarget({ type: 'board', id: boardId });
          setIsShareModalOpen(true);
        }}
        onAddPage={() => handleAddPage()}
        onAddSubPage={(parentId) => handleAddPage(parentId)}
        onRenamePage={(pageId, newTitle) => {
          if (!canEdit) return;
          setWorkspaces((prev) =>
            prev.map((ws) =>
              ws.id === activeWorkspaceId
                ? {
                    ...ws,
                    pages: ws.pages.map((p) =>
                      p.id === pageId ? { ...p, title: newTitle, updatedAt: Date.now() } : p
                    )
                  }
                : ws
            )
          );
          toast.success('Nama dokumen diperbarui.');
        }}
        onDeletePage={handleDeletePage}
        currentUserRole={currentUserRole}
      />

      {/* Mobile Drawer Fallback */}
      <div className="md:hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          activeTarget={activeTarget}
          onSelectTarget={setActiveTarget}
          pages={activeWorkspace?.pages || []}
          boards={activeWorkspace?.boards || []}
          onAddPage={() => handleAddPage()}
          onAddSubPage={(parentId) => handleAddPage(parentId)}
          onDeletePage={handleDeletePage}
          onAddBoard={handleAddBoard}
          onDeleteBoard={handleDeleteBoard}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          onOpenAuthModal={() => openSettingsTab('profile')}
          onOpenMembersModal={() => setIsMembersModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenPreferences={() => openSettingsTab('appearance')}
        />
      </div>

      {/* Panel 3: Main App Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          board={activeBoard}
          activePage={activePage}
          currentMode={activeTarget.type}
          workspaceName={activeWorkspace.name}
          currentUserRole={currentUserRole}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onlineUsers={activeUsersList}
          currentUser={currentUserPresence}
          syncStatus={syncStatus}
          onLogout={handleLogout}
          onNavigateToLanding={() => goToRoute('landing')}
          onSelectWorkspaceOverview={() => setActiveTarget({ type: 'workspace', id: activeWorkspace.id })}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={openSettingsTab}
          onSelectOnlineUser={(u) => setSelectedProfileMember(u)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectNotification={handleSelectNotification}
        />

        {/* Split-View Container for Main Canvas & Push Inspector */}
        <div className="flex flex-1 overflow-hidden min-w-0">
          <main className="flex-1 overflow-hidden min-w-0 flex flex-col">
            {activeWorkspace.boards.length === 0 && activeWorkspace.pages.length === 0 ? (
              <EmptyWorkspaceContent
                workspaceName={activeWorkspace.name}
                canEdit={canEdit}
                onCreateBoard={() => handleAddBoard('Papan Baru')}
                onOpenTemplates={() => setIsTemplateModalOpen(true)}
                onCreatePage={() => handleAddPage()}
              />
            ) : activeTarget.type === 'workspace' ? (
              <Suspense fallback={<WorkspaceSkeleton />}>
                <WorkspaceOverview
                  workspace={activeWorkspace}
                  currentUserRole={currentUserRole}
                  canEdit={canEdit}
                  onSelectBoard={(boardId) => setActiveTarget({ type: 'board', id: boardId })}
                  onSelectPage={(pageId) => setActiveTarget({ type: 'page', id: pageId })}
                  onAddBoard={() => handleAddBoard('Papan Baru')}
                  onAddPage={() => handleAddPage()}
                  onAddPageFromTemplate={(tpl) => handleAddPage(undefined, tpl)}
                  onOpenMembers={() => setIsMembersModalOpen(true)}
                  onOpenSettings={() => setEntitySettings({ open: true, type: 'workspace' })}
                />
              </Suspense>
            ) : activeTarget.type === 'page' && activePage ? (
              <Suspense fallback={<WorkspaceSkeleton />}>
                <StandalonePageDoc
                  key={activePage.id}
                  page={activePage}
                  allPages={activeWorkspace?.pages || []}
                  currentUserRole={currentUserRole}
                  onUpdatePage={handleUpdatePage}
                  onSelectPage={(pageId) => setActiveTarget({ type: 'page', id: pageId })}
                />
              </Suspense>
            ) : (
              <>
                <ProjectBanner
                  workspaceName={activeWorkspace?.name || 'Workspace'}
                  board={activeBoard}
                  members={activeWorkspace?.members || []}
                  currentUserRole={currentUserRole}
                  activeView={activeView}
                  onViewChange={setActiveView}
                  onOpenMembersModal={() => setIsMembersModalOpen(true)}
                  onOpenBoardSettings={() => setEntitySettings({ open: true, type: 'board' })}
                  onSelectWorkspaceOverview={() => setActiveTarget({ type: 'workspace', id: activeWorkspace.id })}
                  canEdit={canEdit}
                  onQuickCreateTask={() => {
                    const firstCol = activeBoard.columns[0];
                    if (firstCol) handleAddCard(firstCol.id, 'Tugas Baru');
                  }}
                />

                <FilterSortBar
                  board={activeBoard}
                  members={activeWorkspace?.members || []}
                  currentUserId={currentUser.id}
                  filter={boardFilter}
                  filteredCount={filteredCardsList.length}
                  totalCount={totalBoardCardsCount}
                  onChange={setBoardFilter}
                />

                {activeView === 'board' && (
                  <KanbanBoard
                    board={filteredBoard}
                    members={activeWorkspace?.members || []}
                    searchQuery={searchQuery}
                    onCardClick={(card) => setSelectedCardId(card.id)}
                    onAddCard={handleAddCard}
                    onRenameCard={handleRenameCard}
                    onAddColumn={handleAddColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onReorderColumns={handleReorderColumns}
                    onUpdateWipLimit={handleUpdateWipLimit}
                    onDropCard={handleDropCard}
                  />
                )}

                {activeView === 'calendar' && (
                  <Suspense fallback={<WorkspaceSkeleton />}>
                    <CalendarView
                      board={filteredBoard}
                      searchQuery={searchQuery}
                      onCardClick={(card) => setSelectedCardId(card.id)}
                      onAddCardOnDate={handleAddCardOnDate}
                      onUpdateCard={handleUpdateCard}
                    />
                  </Suspense>
                )}

                {activeView === 'timeline' && (
                  <Suspense fallback={<WorkspaceSkeleton />}>
                    <TimelineGanttView
                      board={filteredBoard}
                      searchQuery={searchQuery}
                      onCardClick={(card) => setSelectedCardId(card.id)}
                      onUpdateCard={handleUpdateCard}
                    />
                  </Suspense>
                )}

                {activeView === 'table' && (
                  <Suspense fallback={<WorkspaceSkeleton />}>
                    <TableDatabaseView
                      board={filteredBoard}
                      searchQuery={searchQuery}
                      onCardClick={(card) => setSelectedCardId(card.id)}
                      onUpdateCard={handleUpdateCard}
                      onAddCard={handleAddCard}
                    />
                  </Suspense>
                )}
              </>
            )}
          </main>

          {/* Panel 4: Side Peek Split Inspector */}
          {selectedCard && (
            <Suspense fallback={null}>
              <CardDetailModal
                card={selectedCard}
                columns={activeBoard.columns}
                allCards={Object.values(activeBoard.cards)}
                members={activeWorkspace?.members || []}
                onClose={() => setSelectedCardId(null)}
                onUpdate={handleUpdateCard}
                onDelete={handleDeleteCard}
                onConvertChecklistToCard={handleConvertChecklistToCard}
                onMentionUser={handleMentionUser}
              />
            </Suspense>
          )}
        </div>

        {/* Floating Action Button (+) ala Quickit */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 select-none">
          {isFabOpen && (
            <div className="w-48 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-popover backdrop-blur-md animate-yuu-crossfade">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const firstCol = activeBoard.columns[0];
                    if (firstCol) handleAddCard(firstCol.id, 'Tugas Baru');
                    setIsFabOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text hover:bg-hover transition-colors cursor-pointer"
                >
                  <Kanban className="h-4 w-4 text-project-solid" />
                  <span>Buat Tugas Baru</span>
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    handleAddPage();
                    setIsFabOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text hover:bg-hover transition-colors cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-sky-500" />
                  <span>Buat Dokumen PRD</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMembersModalOpen(true);
                  setIsFabOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text hover:bg-hover transition-colors cursor-pointer"
              >
                <UserPlus className="h-4 w-4 text-emerald-500" />
                <span>Undang Anggota</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-project-solid text-white shadow-[0_12px_28px_-6px_var(--project-ring)] transition-[transform,opacity] duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            title="Aksi Cepat"
          >
            <Plus
              className={`h-5 w-5 transition-transform duration-200 ${isFabOpen ? 'rotate-45' : ''}`}
              weight="bold"
            />
          </button>
        </div>
      </div>

      <Suspense fallback={null}>
        {isDbModalOpen && (
          <DatabaseBridgeModal
          board={activeBoard}
          config={dbConfig}
          onSaveConfig={(next) => {
            setDbConfig(next);
            saveStoredDbConfig(next);
          }}
          onClose={() => setIsDbModalOpen(false)}
        />
      )}

      {isMembersModalOpen && (
        <WorkspaceMembersModal
          workspace={activeWorkspace}
          currentUser={currentUser}
          onUpdateWorkspace={handleUpdateActiveWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onClose={() => setIsMembersModalOpen(false)}
        />
      )}

      <SettingsHubModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
        currentUser={currentUser}
        onUserChange={(updated) => {
          setCurrentUser(updated);
          setWorkspaces((prev) =>
            prev.map((ws) => ({
              ...ws,
              members: ws.members.map((m) =>
                m.id === updated.id
                  ? {
                      ...m,
                      name: updated.name,
                      email: updated.email,
                      avatar: updated.avatar,
                      color: updated.color,
                      title: updated.title,
                      bio: updated.bio,
                      timezone: updated.timezone,
                      avatarUrl: updated.avatarUrl,
                      avatarEmoji: updated.avatarEmoji,
                      presenceStatus: updated.presenceStatus
                    }
                  : m
              )
            }))
          );
        }}
        cloudConfig={cloudConfig}
        syncStatus={syncStatus}
        onSaveCloudConfig={(next) => {
          setCloudConfig(next);
          syncManagerRef.current?.updateCloudConfig(next);
        }}
        onOpenDbBridge={() => setIsDbModalOpen(true)}
        onExportBackup={handleExport}
        onImportBackup={handleImport}
        onLogout={handleLogout}
      />

      <MemberProfileModal
        member={selectedProfileMember}
        onClose={() => setSelectedProfileMember(null)}
      />

      {isCommandPaletteOpen && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigateView={(v) => {
            setActiveTarget({ type: 'board', id: activeBoard.id });
            setActiveView(v as WorkspaceView);
          }}
          onQuickCreateTask={() => setIsQuickTaskPromptOpen(true)}
          onQuickCreatePage={() => handleAddPage()}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenShare={() => setIsShareModalOpen(true)}
          onOpenMembers={() => setIsMembersModalOpen(true)}
          onExportBackup={handleExport}
          onOpenPreferences={() => openSettingsTab('appearance')}
          onOpenSettings={openSettingsTab}
          onNavigateHome={() => goToRoute('landing')}
          boards={activeWorkspace?.boards || []}
          pages={activeWorkspace?.pages || []}
          onNavigateToBoard={(boardId) => {
            setActiveTarget({ type: 'board', id: boardId });
          }}
          onNavigateToPage={(pageId) => {
            setActiveTarget({ type: 'page', id: pageId });
          }}
          onNavigateToCard={(boardId, cardId) => {
            setActiveTarget({ type: 'board', id: boardId });
            setActiveView('board');
            setSelectedCardId(cardId);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={isQuickTaskPromptOpen}
        onClose={() => setIsQuickTaskPromptOpen(false)}
        title="Buat Tugas Baru"
        mode="prompt"
        placeholder="Tulis judul tugas..."
        confirmLabel="Buat Tugas"
        onConfirm={(title) => {
          if (title && activeBoard.columns[0]) {
            handleAddCard(activeBoard.columns[0].id, title);
          }
        }}
      />

      <BoardTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleCreateBoardFromTemplate}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={activeBoard.title}
        shareToken={activeBoard.shareToken}
        onToggleShare={(enable) => {
          handleUpdateActiveBoard((prev) => ({
            ...prev,
            shareToken: enable ? prev.shareToken || crypto.randomUUID() : undefined,
            updatedAt: Date.now()
          }));
        }}
      />

      <EntitySettingsModal
        isOpen={entitySettings.open}
        onClose={() => setEntitySettings((prev) => ({ ...prev, open: false }))}
        entityType={entitySettings.type}
        workspace={activeWorkspace}
        board={activeBoard}
        canDeleteBoard={true}
        onRenameWorkspace={(name, icon) => {
          handleUpdateActiveWorkspace({
            ...activeWorkspace,
            name,
            icon: icon || activeWorkspace.icon,
            updatedAt: Date.now()
          });
          toast.success('Pengaturan workspace diperbarui.');
        }}
        onUpdateWorkspaceJoinPolicy={(joinPolicy) => {
          handleUpdateActiveWorkspace({ ...activeWorkspace, joinPolicy, updatedAt: Date.now() });
          toast.success('Kebijakan gabung workspace diperbarui.');
        }}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        onDeleteWorkspace={handleDeleteWorkspace}
        onRenameBoard={(title) => {
          handleUpdateActiveBoard((prev) => ({ ...prev, title, updatedAt: Date.now() }));
          toast.success('Nama papan diperbarui.');
        }}
        onUpdateColumnWip={handleUpdateWipLimit}
        onShareBoard={() => setIsShareModalOpen(true)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onDeleteBoard={handleDeleteBoard}
      />

      <GuestMigrationModal
        isOpen={guestMigrationOpen}
        guestWorkspaceCount={guestWorkspacesCount}
        userName={currentUser.name}
        onImportGuestWorkspaces={handleImportGuestWorkspaces}
        onStartFresh={handleSkipGuestMigration}
      />
      </Suspense>

      <ToastContainer />
    </div>
  );
};
