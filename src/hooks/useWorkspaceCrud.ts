import React from 'react';
import { AuthUser, Board, Workspace } from '../types/board';
import { createSyncManager } from '../lib/sync';
import { useBoardCardCrud } from './useBoardCardCrud';
import { useWorkspacePagesCrud } from './useWorkspacePagesCrud';

interface UseWorkspaceCrudParams {
  currentUser: AuthUser;
  canEdit: boolean;
  workspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  activeWorkspace: Workspace;
  activeWorkspaceId: string;
  setActiveWorkspaceIdState: (id: string) => void;
  activeBoard: Board;
  activeTarget: { type: 'workspace' | 'board' | 'page'; id: string };
  setActiveTarget: React.Dispatch<React.SetStateAction<{ type: 'workspace' | 'board' | 'page'; id: string }>>;
  syncManagerRef: React.MutableRefObject<ReturnType<typeof createSyncManager> | null>;
  onSelectWorkspace: (wsId: string) => void;
}

export function useWorkspaceCrud(params: UseWorkspaceCrudParams) {
  const boardCardCrud = useBoardCardCrud(params);
  const workspacePagesCrud = useWorkspacePagesCrud({
    ...params,
    handleUpdateActiveBoard: boardCardCrud.handleUpdateActiveBoard
  });

  return {
    ...workspacePagesCrud,
    ...boardCardCrud
  };
}
