import React, { Suspense } from 'react';
import {
  AuthUser,
  Board,
  CloudSyncConfig,
  DatabaseBridgeConfig,
  SyncConnectionStatus,
  Workspace,
  WorkspaceView
} from '../../types/board';
import { AppRoute } from '../../lib/auth';
import { saveStoredDbConfig } from '../../lib/dbBridge';
import { createSyncManager } from '../../lib/sync';
import { BoardTemplate } from '../../data/boardTemplates';
import type { SettingsTab } from '../settings/SettingsHubModal';
import type { ProfileDetailTarget } from '../modals/MemberProfileModal';
import { ConfirmDialog, toast } from '../ui';

const DatabaseBridgeModal = React.lazy(() => import('../modals/DatabaseBridgeModal').then((m) => ({ default: m.DatabaseBridgeModal })));
const WorkspaceMembersModal = React.lazy(() => import('../modals/WorkspaceMembersModal').then((m) => ({ default: m.WorkspaceMembersModal })));
const CommandPalette = React.lazy(() => import('./CommandPalette').then((m) => ({ default: m.CommandPalette })));
const SettingsHubModal = React.lazy(() => import('../settings/SettingsHubModal').then((m) => ({ default: m.SettingsHubModal })));
const BoardTemplateModal = React.lazy(() => import('../modals/BoardTemplateModal').then((m) => ({ default: m.BoardTemplateModal })));
const ShareModal = React.lazy(() => import('../modals/ShareModal').then((m) => ({ default: m.ShareModal })));
const EntitySettingsModal = React.lazy(() => import('../modals/EntitySettingsModal').then((m) => ({ default: m.EntitySettingsModal })));
const MemberProfileModal = React.lazy(() => import('../modals/MemberProfileModal').then((m) => ({ default: m.MemberProfileModal })));
const GuestMigrationModal = React.lazy(() => import('../modals/GuestMigrationModal').then((m) => ({ default: m.GuestMigrationModal })));

interface AppModalsProps {
  activeWorkspace: Workspace;
  activeBoard: Board;
  currentUser: AuthUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser>>;
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  dbConfig: DatabaseBridgeConfig;
  setDbConfig: React.Dispatch<React.SetStateAction<DatabaseBridgeConfig>>;
  cloudConfig: CloudSyncConfig;
  setCloudConfig: React.Dispatch<React.SetStateAction<CloudSyncConfig>>;
  syncStatus: SyncConnectionStatus;
  syncManagerRef: React.MutableRefObject<ReturnType<typeof createSyncManager> | null>;
  isDbModalOpen: boolean;
  setIsDbModalOpen: (open: boolean) => void;
  isMembersModalOpen: boolean;
  setIsMembersModalOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsTab: SettingsTab;
  openSettingsTab: (tab: SettingsTab) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isQuickTaskPromptOpen: boolean;
  setIsQuickTaskPromptOpen: (open: boolean) => void;
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  selectedProfileMember: ProfileDetailTarget | null;
  setSelectedProfileMember: (m: ProfileDetailTarget | null) => void;
  entitySettings: { open: boolean; type: 'workspace' | 'board' };
  setEntitySettings: React.Dispatch<React.SetStateAction<{ open: boolean; type: 'workspace' | 'board' }>>;
  guestMigrationOpen: boolean;
  guestWorkspacesCount: number;
  handleImportGuestWorkspaces: () => void;
  handleSkipGuestMigration: () => void;
  setActiveTarget: React.Dispatch<React.SetStateAction<{ type: 'workspace' | 'board' | 'page'; id: string }>>;
  setActiveView: (v: WorkspaceView) => void;
  setSelectedCardId: (id: string | null) => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  goToRoute: (r: AppRoute) => void;
  handleUpdateActiveWorkspace: (ws: Workspace) => void;
  handleDeleteWorkspace: (wsId: string) => void;
  handleUpdateActiveBoard: (updater: (prev: Board) => Board) => void;
  handleDeleteBoard: (boardId: string) => void;
  handleAddCard: (columnId: string, title: string) => void;
  handleAddPage: (parentId?: string) => void;
  handleCreateBoardFromTemplate: (template: BoardTemplate) => void;
  handleUpdateWipLimit: (columnId: string, wipLimit?: number) => void;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  activeWorkspace,
  activeBoard,
  currentUser,
  setCurrentUser,
  setWorkspaces,
  dbConfig,
  setDbConfig,
  cloudConfig,
  setCloudConfig,
  syncStatus,
  syncManagerRef,
  isDbModalOpen,
  setIsDbModalOpen,
  isMembersModalOpen,
  setIsMembersModalOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  settingsTab,
  openSettingsTab,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  isQuickTaskPromptOpen,
  setIsQuickTaskPromptOpen,
  isTemplateModalOpen,
  setIsTemplateModalOpen,
  isShareModalOpen,
  setIsShareModalOpen,
  selectedProfileMember,
  setSelectedProfileMember,
  entitySettings,
  setEntitySettings,
  guestMigrationOpen,
  guestWorkspacesCount,
  handleImportGuestWorkspaces,
  handleSkipGuestMigration,
  setActiveTarget,
  setActiveView,
  setSelectedCardId,
  setIsSidebarOpen,
  goToRoute,
  handleUpdateActiveWorkspace,
  handleDeleteWorkspace,
  handleUpdateActiveBoard,
  handleDeleteBoard,
  handleAddCard,
  handleAddPage,
  handleCreateBoardFromTemplate,
  handleUpdateWipLimit,
  handleExport,
  handleImport,
  handleLogout
}) => {
  return (
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
        onUpdateWorkspaceJoinPolicy={(joinPolicy: Workspace['joinPolicy']) => {
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
  );
};
