import React from 'react';
import {
  AuthUser,
  Board,
  NotionPage,
  Workspace,
  WorkspaceTemplateType
} from '../types/board';
import { INITIAL_BOARD } from '../lib/constants';
import { setActiveWorkspaceId } from '../lib/auth';
import { createSyncManager } from '../lib/sync';
import { toast } from '../components/ui';

export interface UseWorkspacePagesCrudParams {
  currentUser: AuthUser;
  canEdit: boolean;
  workspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  activeWorkspace: Workspace;
  activeWorkspaceId: string;
  setActiveWorkspaceIdState: (id: string) => void;
  activeTarget: { type: 'workspace' | 'board' | 'page'; id: string };
  setActiveTarget: React.Dispatch<React.SetStateAction<{ type: 'workspace' | 'board' | 'page'; id: string }>>;
  syncManagerRef: React.MutableRefObject<ReturnType<typeof createSyncManager> | null>;
  onSelectWorkspace: (wsId: string) => void;
  handleUpdateActiveBoard: (updater: (prevBoard: Board) => Board) => void;
}

export function useWorkspacePagesCrud({
  currentUser,
  canEdit,
  workspaces,
  setWorkspaces,
  activeWorkspace,
  activeWorkspaceId,
  setActiveWorkspaceIdState,
  activeTarget,
  setActiveTarget,
  syncManagerRef,
  onSelectWorkspace,
  handleUpdateActiveBoard
}: UseWorkspacePagesCrudParams) {
  const handleCreateWorkspace = (
    name: string,
    icon: string,
    template: WorkspaceTemplateType = 'full'
  ) => {
    const wsId = `ws-${Date.now()}`;
    const starterBoardId = `board-${Date.now()}`;
    const starterPageId = `page-${Date.now() + 1}`;
    const includeBoard = template === 'board' || template === 'full';
    const includeDocs = template === 'docs' || template === 'full';

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
      onSelectWorkspace(nextWs[0].id);
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

  const handleRenamePage = (pageId: string, newTitle: string) => {
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

  return {
    handleCreateWorkspace,
    handleUpdateActiveWorkspace,
    handleDeleteWorkspace,
    handleAddPage,
    handleUpdatePage,
    handleRenamePage,
    handleDeletePage,
    handleExport,
    handleImport
  };
}
