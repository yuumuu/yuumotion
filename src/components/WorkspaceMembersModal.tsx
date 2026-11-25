import React, { useState } from 'react';
import { Workspace, WorkspaceMember, UserRole, AuthUser } from '../types/board';
import { canManageMembers, canDeleteWorkspace } from '../lib/auth';
import { CustomSelect } from './ui/CustomSelect';
import { X, Users, UserPlus, Shield, Trash, Crown, Warning } from '@phosphor-icons/react';

interface WorkspaceMembersModalProps {
  workspace: Workspace;
  currentUser: AuthUser;
  onUpdateWorkspace: (updated: Workspace) => void;
  onDeleteWorkspace?: (workspaceId: string) => void;
  onClose: () => void;
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Full workspace authority and ownership deletion rights',
  admin: 'Manage members, board structures, and document permissions',
  member: 'Create, update, and organize cards and documents',
  viewer: 'Read-only access across all workspace documents and boards'
};

export const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({
  workspace,
  currentUser,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onClose
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('member');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const currentUserRole = workspace.members.find((m) => m.id === currentUser.id)?.role || workspace.currentRole;
  const isManager = canManageMembers(currentUserRole);
  const isOwner = canDeleteWorkspace(currentUserRole);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];
    const newMember: WorkspaceMember = {
      id: `usr-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || undefined,
      avatar: newMemberName.trim().charAt(0).toUpperCase(),
      color: colors[Math.floor(Math.random() * colors.length)],
      role: newMemberRole,
      joinedAt: Date.now()
    };

    const nextWorkspace: Workspace = {
      ...workspace,
      members: [...workspace.members, newMember],
      updatedAt: Date.now()
    };

    onUpdateWorkspace(nextWorkspace);
    setNewMemberName('');
    setNewMemberEmail('');
    setIsAddingMember(false);
  };

  const handleRoleChange = (memberId: string, role: UserRole) => {
    const nextMembers = workspace.members.map((m) =>
      m.id === memberId ? { ...m, role } : m
    );

    onUpdateWorkspace({
      ...workspace,
      members: nextMembers,
      updatedAt: Date.now()
    });
  };

  const handleRemoveMember = (memberId: string) => {
    const nextMembers = workspace.members.filter((m) => m.id !== memberId);
    onUpdateWorkspace({
      ...workspace,
      members: nextMembers,
      updatedAt: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <div className="flex items-center justify-between border-b border-appflowy-border pb-3 dark:border-appflowy-darkBorder">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-appflowy-text dark:text-appflowy-darkText">
                Workspace Members & RBAC
              </h2>
              <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                {workspace.name} • {workspace.members.length} members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="rounded-xl border border-appflowy-border bg-neutral-50/70 p-3 text-xs dark:border-appflowy-darkBorder dark:bg-neutral-900/40">
            <div className="flex items-center justify-between">
              <span className="font-medium text-appflowy-text dark:text-appflowy-darkText">
                Your Role in this Workspace
              </span>
              <span className="flex items-center gap-1 font-semibold uppercase text-purple-600 dark:text-purple-400">
                {currentUserRole === 'owner' && <Crown className="h-3 w-3" />}
                {currentUserRole === 'admin' && <Shield className="h-3 w-3" />}
                {currentUserRole}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
              {ROLE_DESCRIPTIONS[currentUserRole]}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
              <span>Members Roster</span>
              {isManager && (
                <button
                  type="button"
                  onClick={() => setIsAddingMember(!isAddingMember)}
                  className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:underline dark:text-purple-400"
                >
                  <UserPlus className="h-3 w-3" />
                  <span>Add Member</span>
                </button>
              )}
            </div>

            {isAddingMember && (
              <form onSubmit={handleAddMember} className="rounded-xl border border-purple-200 bg-purple-50/40 p-3 dark:border-purple-900/40 dark:bg-purple-950/20 text-xs space-y-2.5">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Full name..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="h-7 rounded border border-appflowy-border bg-appflowy-surface px-2 text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)..."
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="h-7 rounded border border-appflowy-border bg-appflowy-surface px-2 text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <CustomSelect
                    value={newMemberRole}
                    options={[
                      { value: 'admin', label: 'Admin' },
                      { value: 'member', label: 'Member' },
                      { value: 'viewer', label: 'Viewer (Read Only)' }
                    ]}
                    onChange={(r) => setNewMemberRole(r as UserRole)}
                    size="sm"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingMember(false)}
                      className="rounded px-2.5 py-1 text-xs text-appflowy-muted hover:bg-neutral-200/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700"
                    >
                      Confirm Add
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="divide-y divide-appflowy-border/60 rounded-xl border border-appflowy-border bg-appflowy-bg dark:divide-appflowy-darkBorder/60 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg">
              {workspace.members.map((member) => {
                const isMemberOwner = member.role === 'owner';
                const isSelf = member.id === currentUser.id;

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{ backgroundColor: member.color }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white shadow-2xs"
                      >
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-appflowy-text dark:text-appflowy-darkText">
                          <span>{member.name}</span>
                          {isSelf && <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">(You)</span>}
                        </div>
                        {member.email && (
                          <div className="text-[10px] text-appflowy-muted dark:text-appflowy-darkMuted">
                            {member.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isManager && !isMemberOwner && !isSelf ? (
                        <CustomSelect
                          value={member.role}
                          options={[
                            { value: 'admin', label: 'Admin' },
                            { value: 'member', label: 'Member' },
                            { value: 'viewer', label: 'Viewer (Read Only)' }
                          ]}
                          onChange={(r) => handleRoleChange(member.id, r as UserRole)}
                          size="sm"
                        />
                      ) : (
                        <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium uppercase text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {member.role}
                        </span>
                      )}

                      {isManager && !isMemberOwner && !isSelf && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="flex h-7 w-7 items-center justify-center rounded text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          title="Remove from workspace"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isOwner && onDeleteWorkspace && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-medium">
                <Warning className="h-4 w-4" />
                <span>Danger Zone</span>
              </div>
              <p className="mt-1 text-[11px] text-rose-600/90 dark:text-rose-400/90">
                Deleting this workspace will remove all nested pages and boards.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete workspace "${workspace.name}"?`)) {
                    onDeleteWorkspace(workspace.id);
                    onClose();
                  }
                }}
                className="mt-2.5 rounded bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
              >
                Delete Workspace
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-appflowy-border pt-3 dark:border-appflowy-darkBorder">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-purple-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
