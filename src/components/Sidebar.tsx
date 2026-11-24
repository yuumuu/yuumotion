import React, { useState } from 'react';
import { Workspace, NotionPage, Board, AuthUser, UserRole } from '../types/board';
import { canEditContent } from '../lib/auth';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Kanban,
  Users,
  ChevronDown,
  Trash2,
  ShieldCheck,
  FolderPlus
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string, icon: string) => void;
  activeTarget: { type: 'board' | 'page'; id: string };
  onSelectTarget: (target: { type: 'board' | 'page'; id: string }) => void;
  pages: NotionPage[];
  boards: Board[];
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onAddBoard: (title: string) => void;
  currentUser: AuthUser;
  currentUserRole: UserRole;
  onOpenAuthModal: () => void;
  onOpenMembersModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  activeTarget,
  onSelectTarget,
  pages,
  boards,
  onAddPage,
  onDeletePage,
  onAddBoard,
  currentUser,
  currentUserRole,
  onOpenAuthModal,
  onOpenMembersModal
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsIcon, setNewWsIcon] = useState('📁');

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const canEdit = canEditContent(currentUserRole);

  const handleCreateWsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    onCreateWorkspace(newWsName.trim(), newWsIcon);
    setNewWsName('');
    setIsCreatingWs(false);
    setShowWorkspaceMenu(false);
  };

  const handleCreateNewBoard = () => {
    const title = prompt('New Kanban Board Title:');
    if (title?.trim()) {
      onAddBoard(title.trim());
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-appflowy-border bg-appflowy-surface/95 backdrop-blur-md transition-all duration-200 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface/95 md:static ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:w-0 md:translate-x-0 overflow-hidden border-none'
        }`}
      >
        <div className="flex h-12 items-center justify-between border-b border-appflowy-border px-3.5 dark:border-appflowy-darkBorder">
          <div className="relative flex-1">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">{activeWorkspace?.icon || '🚀'}</span>
                <span className="truncate">{activeWorkspace?.name || 'Workspace'}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-appflowy-muted" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute left-0 top-10 z-50 w-56 rounded-xl border border-appflowy-border bg-appflowy-surface p-1.5 shadow-xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-appflowy-muted dark:text-appflowy-darkMuted">
                  Switch Workspace
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws.id);
                      setShowWorkspaceMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs ${
                      ws.id === activeWorkspaceId
                        ? 'bg-purple-50 text-purple-700 font-medium dark:bg-purple-950/40 dark:text-purple-300'
                        : 'text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{ws.icon}</span>
                      <span className="truncate">{ws.name}</span>
                    </div>
                  </button>
                ))}

                <div className="my-1 border-t border-appflowy-border dark:border-appflowy-darkBorder" />

                {isCreatingWs ? (
                  <form onSubmit={handleCreateWsSubmit} className="p-1 space-y-1.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        maxLength={2}
                        value={newWsIcon}
                        onChange={(e) => setNewWsIcon(e.target.value)}
                        className="h-6 w-7 rounded border border-appflowy-border text-center text-xs dark:bg-appflowy-darkBg dark:border-appflowy-darkBorder"
                      />
                      <input
                        type="text"
                        placeholder="Workspace name..."
                        value={newWsName}
                        onChange={(e) => setNewWsName(e.target.value)}
                        className="h-6 flex-1 rounded border border-appflowy-border px-1.5 text-xs dark:bg-appflowy-darkBg dark:border-appflowy-darkBorder"
                      />
                    </div>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingWs(false)}
                        className="rounded px-2 py-0.5 text-[10px] text-appflowy-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded bg-purple-600 px-2 py-0.5 text-[10px] text-white"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingWs(true)}
                    className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/30"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    <span>Create Workspace</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowWorkspaceMenu(false);
                    onOpenMembersModal();
                  }}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800"
                >
                  <Users className="h-3.5 w-3.5 text-appflowy-muted" />
                  <span>Members & Roles</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          <div>
            <div className="mb-1 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-appflowy-muted dark:text-appflowy-darkMuted">
              <span>Pages & Docs</span>
              {canEdit && (
                <button
                  onClick={onAddPage}
                  className="flex h-5 w-5 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  title="Add New Notion Page"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {pages.map((page) => {
                const isSelected = activeTarget.type === 'page' && activeTarget.id === page.id;
                return (
                  <div
                    key={page.id}
                    className={`group flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors ${
                      isSelected
                        ? 'bg-purple-50 text-purple-700 font-medium dark:bg-purple-950/40 dark:text-purple-300'
                        : 'text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800'
                    }`}
                  >
                    <button
                      onClick={() => onSelectTarget({ type: 'page', id: page.id })}
                      className="flex flex-1 items-center gap-2 truncate text-left"
                    >
                      <span className="text-xs">{page.icon || '📄'}</span>
                      <span className="truncate">{page.title || 'Untitled Page'}</span>
                    </button>

                    {canEdit && pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete page "${page.title}"?`)) {
                            onDeletePage(page.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500"
                        title="Delete page"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-appflowy-muted dark:text-appflowy-darkMuted">
              <span>Kanban & Roadmaps</span>
              {canEdit && (
                <button
                  onClick={handleCreateNewBoard}
                  className="flex h-5 w-5 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  title="Create New Board"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {boards.map((b) => {
                const isSelected = activeTarget.type === 'board' && activeTarget.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelectTarget({ type: 'board', id: b.id })}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-purple-50 text-purple-700 font-medium dark:bg-purple-950/40 dark:text-purple-300'
                        : 'text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Kanban className="h-3.5 w-3.5 text-purple-500" />
                    <span className="truncate">{b.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-appflowy-border p-3 dark:border-appflowy-darkBorder">
          <div className="flex items-center justify-between rounded-xl bg-neutral-50/80 p-2 text-xs dark:bg-neutral-900/50">
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 text-left truncate flex-1 hover:opacity-80"
              title="Click to change account or login"
            >
              <div
                style={{ backgroundColor: currentUser.color }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white shadow-2xs"
              >
                {currentUser.avatar}
              </div>
              <div className="truncate">
                <div className="truncate font-semibold text-appflowy-text dark:text-appflowy-darkText">
                  {currentUser.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium uppercase">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{currentUserRole}</span>
                </div>
              </div>
            </button>

            <button
              onClick={onOpenMembersModal}
              className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200 dark:hover:bg-neutral-800"
              title="Workspace Members"
            >
              <Users className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-4 left-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl border border-appflowy-border bg-appflowy-surface shadow-md hover:bg-neutral-100 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:hover:bg-neutral-800 md:hidden"
          title="Open Sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </>
  );
};
