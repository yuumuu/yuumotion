import React, { useState, useEffect, useMemo, Suspense } from 'react';
import {
  Board,
  Card,
  DatabaseBridgeConfig,
  NotificationItem,
  UserRole,
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
import { useNotifications } from './hooks/useNotifications';
import { useWorkspaceCrud } from './hooks/useWorkspaceCrud';
import { useWorkspaceSync } from './hooks/useWorkspaceSync';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { getStoredDbConfig } from './lib/dbBridge';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NavigationRail } from './components/layout/NavigationRail';
import { ProjectExplorer } from './components/layout/ProjectExplorer';
import { ProjectBanner } from './components/layout/ProjectBanner';
import { FilterSortBar } from './components/board/FilterSortBar';
import { BoardFilterState, DEFAULT_BOARD_FILTER } from './types/filter';
import { filterAndSortCards } from './lib/cardFilter';
import { KanbanBoard } from './components/board/KanbanBoard';
import { EmptyWorkspaceOnboarding } from './components/workspace/EmptyWorkspaceOnboarding';
import { EmptyWorkspaceContent } from './components/workspace/EmptyWorkspaceContent';
import type { SettingsTab } from './components/settings/SettingsHubModal';
import type { ProfileDetailTarget } from './components/modals/MemberProfileModal';
import { SharedBoardView } from './components/board/SharedBoardView';
import { AppModals } from './components/layout/AppModals';
import { ToastContainer, LoadingScreen, WorkspaceSkeleton } from './components/ui';
import { usePreferences } from './context/PreferencesContext';
import { Plus, Kanban, FileText, UserPlus } from '@phosphor-icons/react';

const LandingPage = React.lazy(() => import('./components/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const AuthPage = React.lazy(() => import('./components/auth/AuthPage').then((m) => ({ default: m.AuthPage })));
const CalendarView = React.lazy(() => import('./components/board/CalendarView').then((m) => ({ default: m.CalendarView })));
const TimelineGanttView = React.lazy(() => import('./components/board/TimelineGanttView').then((m) => ({ default: m.TimelineGanttView })));
const TableDatabaseView = React.lazy(() => import('./components/board/TableDatabaseView').then((m) => ({ default: m.TableDatabaseView })));
const StandalonePageDoc = React.lazy(() => import('./components/docs/StandalonePageDoc').then((m) => ({ default: m.StandalonePageDoc })));
const WorkspaceOverview = React.lazy(() => import('./components/workspace/WorkspaceOverview').then((m) => ({ default: m.WorkspaceOverview })));
const CardDetailModal = React.lazy(() => import('./components/card/CardDetailModal').then((m) => ({ default: m.CardDetailModal })));
const GuestMigrationModal = React.lazy(() => import('./components/modals/GuestMigrationModal').then((m) => ({ default: m.GuestMigrationModal })));

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
      icon: 'Ã°Å¸Å¡â‚¬',
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

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const [dbConfig, setDbConfig] = useState<DatabaseBridgeConfig>(() => getStoredDbConfig());

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

  useGlobalShortcuts({
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    selectedCardId,
    setSelectedCardId,
    isDbModalOpen,
    setIsDbModalOpen,
    isMembersModalOpen,
    setIsMembersModalOpen,
    isFabOpen,
    setIsFabOpen,
    setIsSidebarOpen,
    setActiveView,
    openSettingsTab
  });

  const {
    syncStatus,
    cloudConfig,
    setCloudConfig,
    syncManagerRef,
    currentUserPresence,
    activeUsersList
  } = useWorkspaceSync({
    roomId,
    currentUser,
    activeWorkspaceId,
    activeBoardId: activeBoard.id,
    setWorkspaces
  });

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

  const {
    notifications,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleMentionUser
  } = useNotifications(currentUser, activeWorkspaceId, activeBoard.id);

  const {
    handleCreateWorkspace,
    handleUpdateActiveWorkspace,
    handleDeleteWorkspace,
    handleAddPage,
    handleUpdatePage,
    handleRenamePage,
    handleDeletePage,
    handleAddBoard,
    handleRenameBoard,
    handleDeleteBoard,
    handleUpdateActiveBoard,
    handleAddCard,
    handleAddCardOnDate,
    handleUpdateCard,
    handleDeleteCard,
    handleConvertChecklistToCard,
    handleDropCard,
    handleCreateBoardFromTemplate,
    handleAddColumn,
    handleDeleteColumn,
    handleReorderColumns,
    handleUpdateWipLimit,
    handleRenameCard,
    handleExport,
    handleImport
  } = useWorkspaceCrud({
    currentUser,
    canEdit,
    workspaces,
    setWorkspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceIdState,
    activeBoard,
    activeTarget,
    setActiveTarget,
    syncManagerRef,
    onSelectWorkspace: handleSelectWorkspace
  });

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
        <SharedBoardView
          board={sharedBoard}
          onExitShare={() => {
            setShareTokenParam(null);
            goToRoute(hasActiveSession() ? 'app' : 'landing');
          }}
        />
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
        onRenameBoard={handleRenameBoard}
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
        onRenamePage={handleRenamePage}
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
                  onRenameBoard={handleRenameBoard}
                  onDeleteBoard={handleDeleteBoard}
                  onOpenBoardSettings={(boardId) => {
                    setActiveTarget({ type: 'board', id: boardId });
                    setEntitySettings({ open: true, type: 'board' });
                  }}
                  onShareBoard={(boardId) => {
                    setActiveTarget({ type: 'board', id: boardId });
                    setIsShareModalOpen(true);
                  }}
                  onRenamePage={handleRenamePage}
                  onDeletePage={handleDeletePage}
                  onAddSubPage={(parentId) => handleAddPage(parentId)}
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

      <AppModals
        activeWorkspace={activeWorkspace}
        activeBoard={activeBoard}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setWorkspaces={setWorkspaces}
        dbConfig={dbConfig}
        setDbConfig={setDbConfig}
        cloudConfig={cloudConfig}
        setCloudConfig={setCloudConfig}
        syncStatus={syncStatus}
        syncManagerRef={syncManagerRef}
        isDbModalOpen={isDbModalOpen}
        setIsDbModalOpen={setIsDbModalOpen}
        isMembersModalOpen={isMembersModalOpen}
        setIsMembersModalOpen={setIsMembersModalOpen}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        settingsTab={settingsTab}
        openSettingsTab={openSettingsTab}
        isCommandPaletteOpen={isCommandPaletteOpen}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        isQuickTaskPromptOpen={isQuickTaskPromptOpen}
        setIsQuickTaskPromptOpen={setIsQuickTaskPromptOpen}
        isTemplateModalOpen={isTemplateModalOpen}
        setIsTemplateModalOpen={setIsTemplateModalOpen}
        isShareModalOpen={isShareModalOpen}
        setIsShareModalOpen={setIsShareModalOpen}
        selectedProfileMember={selectedProfileMember}
        setSelectedProfileMember={setSelectedProfileMember}
        entitySettings={entitySettings}
        setEntitySettings={setEntitySettings}
        guestMigrationOpen={guestMigrationOpen}
        guestWorkspacesCount={guestWorkspacesCount}
        handleImportGuestWorkspaces={handleImportGuestWorkspaces}
        handleSkipGuestMigration={handleSkipGuestMigration}
        setActiveTarget={setActiveTarget}
        setActiveView={setActiveView}
        setSelectedCardId={setSelectedCardId}
        setIsSidebarOpen={setIsSidebarOpen}
        goToRoute={goToRoute}
        handleUpdateActiveWorkspace={handleUpdateActiveWorkspace}
        handleDeleteWorkspace={handleDeleteWorkspace}
        handleUpdateActiveBoard={handleUpdateActiveBoard}
        handleDeleteBoard={handleDeleteBoard}
        handleAddCard={handleAddCard}
        handleAddPage={handleAddPage}
        handleCreateBoardFromTemplate={handleCreateBoardFromTemplate}
        handleUpdateWipLimit={handleUpdateWipLimit}
        handleExport={handleExport}
        handleImport={handleImport}
        handleLogout={handleLogout}
      />

      <ToastContainer />
    </div>
  );
};
