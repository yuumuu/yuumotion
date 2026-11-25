import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AuthUser,
  Board,
  Card,
  CloudSyncConfig,
  Column,
  DatabaseBridgeConfig,
  NotionPage,
  SyncConnectionStatus,
  UserPresence,
  UserRole,
  Workspace,
  WorkspaceView
} from './types/board';
import { INITIAL_BOARD } from './lib/constants';
import {
  getStoredAuthUser,
  saveStoredAuthUser,
  getStoredWorkspaces,
  saveStoredWorkspaces,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  canEditContent
} from './lib/auth';
import { createSyncManager, getStoredCloudConfig } from './lib/sync';
import { getStoredDbConfig, saveStoredDbConfig } from './lib/dbBridge';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NavigationRail } from './components/NavigationRail';
import { ProjectExplorer } from './components/ProjectExplorer';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { TimelineGanttView } from './components/TimelineGanttView';
import { TableDatabaseView } from './components/TableDatabaseView';
import { StandalonePageDoc } from './components/StandalonePageDoc';
import { CardDetailModal } from './components/CardDetailModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { DatabaseBridgeModal } from './components/DatabaseBridgeModal';
import { AuthModal } from './components/AuthModal';
import { WorkspaceMembersModal } from './components/WorkspaceMembersModal';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CommandPalette } from './components/CommandPalette';
import { PreferencesModal } from './components/PreferencesModal';
import { ToastContainer, toast } from './components/ui';

export const App: React.FC = () => {
  const [appRoute, setAppRoute] = useState<'app' | 'landing' | 'auth'>('app');
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => getStoredAuthUser());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => getStoredWorkspaces(currentUser));
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(() =>
    getActiveWorkspaceId(workspaces)
  );

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

  const [activeTarget, setActiveTarget] = useState<{ type: 'board' | 'page'; id: string }>(() => {
    const boards = activeWorkspace?.boards || [];
    if (boards.length > 0) {
      return { type: 'board', id: boards[0].id };
    }
    return { type: 'board', id: 'yuumotion-primary-board' };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [roomId, setRoomId] = useState('general');
  const [activeView, setActiveView] = useState<WorkspaceView>('board');
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  useEffect(() => {
    saveStoredWorkspaces(workspaces);
  }, [workspaces]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (selectedCardId) {
          setSelectedCardId(null);
          return;
        }
        if (isSyncModalOpen) {
          setIsSyncModalOpen(false);
          return;
        }
        if (isDbModalOpen) {
          setIsDbModalOpen(false);
          return;
        }
        if (isAuthModalOpen) {
          setIsAuthModalOpen(false);
          return;
        }
        if (isMembersModalOpen) {
          setIsMembersModalOpen(false);
          return;
        }
      }

      if (isInputActive) return;

      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('search-input-field')?.focus();
        return;
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
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
    isShortcutsModalOpen,
    selectedCardId,
    isSyncModalOpen,
    isDbModalOpen,
    isAuthModalOpen,
    isMembersModalOpen
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
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleSelectWorkspace = (newWsId: string) => {
    setActiveWorkspaceIdState(newWsId);
    setActiveWorkspaceId(newWsId);
    const targetWs = workspaces.find((w) => w.id === newWsId);
    if (targetWs && Array.isArray(targetWs.boards) && targetWs.boards.length > 0) {
      setActiveTarget({ type: 'board', id: targetWs.boards[0].id });
    }
  };

  const handleCreateWorkspace = (name: string, icon: string) => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
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
          joinedAt: Date.now()
        }
      ],
      boards: [
        {
          ...INITIAL_BOARD,
          id: `board-${Date.now()}`,
          title: `${name} Roadmap`,
          updatedAt: Date.now()
        }
      ],
      pages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setWorkspaces((prev) => [...prev, newWs]);
    handleSelectWorkspace(newWs.id);
    toast.success(`Workspace "${name}" berhasil dibuat.`);
  };

  const handleUpdateActiveWorkspace = (updated: Workspace) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleDeleteWorkspace = (wsId: string) => {
    if (workspaces.length <= 1) {
      alert('Cannot delete the only remaining workspace.');
      return;
    }
    const nextWs = workspaces.filter((w) => w.id !== wsId);
    setWorkspaces(nextWs);
    handleSelectWorkspace(nextWs[0].id);
  };

  const handleAddPage = () => {
    if (!canEdit) return;

    const newPage: NotionPage = {
      id: `page-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      title: 'Untitled Document',
      icon: '📄',
      contentHtml: '<p></p>',
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

  const handleLogout = () => {
    const guestUser: AuthUser = {
      id: `usr-guest-${Math.random().toString(36).substring(2, 7)}`,
      name: 'Guest Collab',
      avatar: 'G',
      color: '#10B981',
      isCloudAuth: false
    };
    saveStoredAuthUser(guestUser);
    setCurrentUser(guestUser);
    setAppRoute('landing');
  };

  if (appRoute === 'landing') {
    return (
      <LandingPage
        currentUser={currentUser}
        onEnterApp={() => setAppRoute('app')}
        onOpenAuth={() => setAppRoute('auth')}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (appRoute === 'auth') {
    return (
      <AuthPage
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
        }}
        onNavigateHome={() => setAppRoute('landing')}
        onEnterApp={() => setAppRoute('app')}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg font-sans text-text">
      {/* Panel 1: Primary Navigation Rail */}
      <NavigationRail
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenPreferences={() => setIsPreferencesModalOpen(true)}
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
        onAddPage={handleAddPage}
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
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onAddBoard={handleAddBoard}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenMembersModal={() => setIsMembersModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenPreferences={() => setIsPreferencesModalOpen(true)}
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
          currentRoom={roomId}
          onRoomChange={setRoomId}
          onlineUsers={activeUsersList}
          currentUser={currentUserPresence}
          syncStatus={syncStatus}
          activeView={activeView}
          onViewChange={setActiveView}
          onOpenSyncSettings={() => setIsSyncModalOpen(true)}
          onOpenDbBridge={() => setIsDbModalOpen(true)}
          onOpenMembersModal={() => setIsMembersModalOpen(true)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={handleExport}
          onImport={handleImport}
          onLogout={handleLogout}
          onNavigateToLanding={() => setAppRoute('landing')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenPreferences={() => setIsPreferencesModalOpen(true)}
        />

        {/* Split-View Container for Main Canvas & Push Inspector */}
        <div className="flex flex-1 overflow-hidden min-w-0">
          <main className="flex-1 overflow-hidden min-w-0 flex flex-col">
            {activeTarget.type === 'page' && activePage ? (
              <StandalonePageDoc
                page={activePage}
                currentUserRole={currentUserRole}
                onUpdatePage={handleUpdatePage}
              />
            ) : (
              <>
                {activeView === 'board' && (
                  <KanbanBoard
                    board={activeBoard}
                    searchQuery={searchQuery}
                    onCardClick={(card) => setSelectedCardId(card.id)}
                    onAddCard={handleAddCard}
                    onAddColumn={handleAddColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onDropCard={handleDropCard}
                  />
                )}

                {activeView === 'calendar' && (
                  <CalendarView
                    board={activeBoard}
                    searchQuery={searchQuery}
                    onCardClick={(card) => setSelectedCardId(card.id)}
                    onAddCardOnDate={handleAddCardOnDate}
                  />
                )}

                {activeView === 'timeline' && (
                  <TimelineGanttView
                    board={activeBoard}
                    searchQuery={searchQuery}
                    onCardClick={(card) => setSelectedCardId(card.id)}
                  />
                )}

                {activeView === 'table' && (
                  <TableDatabaseView
                    board={activeBoard}
                    searchQuery={searchQuery}
                    onCardClick={(card) => setSelectedCardId(card.id)}
                    onUpdateCard={handleUpdateCard}
                    onAddCard={handleAddCard}
                  />
                )}
              </>
            )}
          </main>

          {/* Panel 4: Side Peek Split Inspector */}
          {selectedCard && (
            <CardDetailModal
              card={selectedCard}
              columns={activeBoard.columns}
              onClose={() => setSelectedCardId(null)}
              onUpdate={handleUpdateCard}
              onDelete={handleDeleteCard}
            />
          )}
        </div>
      </div>

      {isSyncModalOpen && (
        <CloudSyncModal
          config={cloudConfig}
          status={syncStatus}
          onSave={(next) => {
            setCloudConfig(next);
            syncManagerRef.current?.updateCloudConfig(next);
          }}
          onClose={() => setIsSyncModalOpen(false)}
        />
      )}

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

      {isAuthModalOpen && (
        <AuthModal
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          onClose={() => setIsAuthModalOpen(false)}
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

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateView={(v) => setActiveView(v as WorkspaceView)}
        onQuickCreateTask={() => {
          const title = prompt('Judul Tugas Baru:');
          if (title?.trim() && activeBoard.columns[0]) {
            handleAddCard(activeBoard.columns[0].id, title.trim());
          }
        }}
        onOpenPreferences={() => setIsPreferencesModalOpen(true)}
      />

      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};
