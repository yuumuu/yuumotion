import React, { useState } from 'react';
import { Workspace, WorkspaceMember, UserRole, AuthUser } from '../../types/board';
import { canManageMembers } from '../../lib/auth';
import { CustomSelect, Dialog, Button, Input, toast } from '../ui';
import { Users, UserPlus, Shield, Trash, Crown } from '@phosphor-icons/react';
import { MemberProfileModal, ProfileDetailTarget } from './MemberProfileModal';

interface WorkspaceMembersModalProps {
  workspace: Workspace;
  currentUser: AuthUser;
  onUpdateWorkspace: (updated: Workspace) => void;
  onDeleteWorkspace?: (workspaceId: string) => void;
  onClose: () => void;
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Pemilik penuh workspace termasuk pengaturan anggota dan penghapusan',
  admin: 'Mengelola anggota, struktur papan, dan izin dokumen',
  member: 'Membuat, memperbarui, dan mengatur kartu serta dokumen',
  viewer: 'Akses hanya-baca di seluruh papan dan dokumen workspace'
};

export const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({
  workspace,
  currentUser,
  onUpdateWorkspace,
  onClose
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('member');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProfileDetailTarget | null>(null);

  const currentUserRole =
    workspace.members.find((m) => m.id === currentUser.id)?.role || workspace.currentRole;
  const isManager = canManageMembers(currentUserRole);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const colors = ['#2563EB', '#1D4ED8', '#0EA5E9', '#10B981', '#F59E0B', '#64748B'];
    const newMember: WorkspaceMember = {
      id: `usr-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || undefined,
      avatar: newMemberName.trim().charAt(0).toUpperCase(),
      color: colors[Math.floor(Math.random() * colors.length)],
      role: newMemberRole,
      joinedAt: Date.now()
    };

    onUpdateWorkspace({
      ...workspace,
      members: [...workspace.members, newMember],
      updatedAt: Date.now()
    });
    setNewMemberName('');
    setNewMemberEmail('');
    setIsAddingMember(false);
    toast.success(`Anggota "${newMember.name}" ditambahkan.`);
  };

  const handleRoleChange = (memberId: string, role: UserRole) => {
    onUpdateWorkspace({
      ...workspace,
      members: workspace.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
      updatedAt: Date.now()
    });
    toast.info('Peran anggota diperbarui.');
  };

  const handleRemoveMember = (memberId: string) => {
    onUpdateWorkspace({
      ...workspace,
      members: workspace.members.filter((m) => m.id !== memberId),
      updatedAt: Date.now()
    });
    toast.info('Anggota dihapus dari workspace.');
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-project-soft text-project-solid">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-text">Anggota Workspace</div>
            <div className="text-[11px] font-normal text-muted">
              {workspace.name} â€¢ {workspace.members.length} anggota
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex w-full justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Selesai
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-bar p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-text">Peran Kamu di Workspace Ini</span>
            <span className="flex items-center gap-1 font-semibold uppercase text-project-solid">
              {currentUserRole === 'owner' && <Crown className="h-3.5 w-3.5" />}
              {currentUserRole === 'admin' && <Shield className="h-3.5 w-3.5" />}
              {currentUserRole}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">{ROLE_DESCRIPTIONS[currentUserRole]}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>Daftar Anggota</span>
            {isManager && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                onClick={() => setIsAddingMember(!isAddingMember)}
              >
                Tambah Anggota
              </Button>
            )}
          </div>

          {isAddingMember && (
            <form
              onSubmit={handleAddMember}
              className="rounded-xl border border-project-ring bg-project-soft/30 p-3 text-xs space-y-2.5"
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  type="text"
                  placeholder="Nama lengkap..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Email (opsional)..."
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <CustomSelect
                  value={newMemberRole}
                  options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'member', label: 'Member' },
                    { value: 'viewer', label: 'Viewer (Hanya Baca)' }
                  ]}
                  onChange={(r) => setNewMemberRole(r as UserRole)}
                  size="sm"
                />
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="ghost" size="xs" onClick={() => setIsAddingMember(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" size="xs">
                    Simpan
                  </Button>
                </div>
              </div>
            </form>
          )}

          <div className="divide-y divide-border/70 rounded-xl border border-border bg-bar/50 max-h-72 overflow-y-auto">
            {workspace.members.map((member) => {
              const isMemberOwner = member.role === 'owner';
              const isSelf = member.id === currentUser.id;

              return (
                <div key={member.id} className="flex items-center justify-between p-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    title="Lihat detail profil anggota"
                    className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    <div
                      style={{ backgroundColor: member.color }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-2xs overflow-hidden"
                    >
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        member.avatarEmoji || member.avatar
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium text-text">
                        <span className="truncate hover:underline">{member.name}</span>
                        {isSelf && (
                          <span className="text-[10px] text-project-solid font-normal">(Kamu)</span>
                        )}
                      </div>
                      {member.email && <div className="text-[10px] text-muted truncate">{member.email}</div>}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    {isManager && !isMemberOwner && !isSelf ? (
                      <CustomSelect
                        value={member.role}
                        options={[
                          { value: 'admin', label: 'Admin' },
                          { value: 'member', label: 'Member' },
                          { value: 'viewer', label: 'Viewer (Hanya Baca)' }
                        ]}
                        onChange={(r) => handleRoleChange(member.id, r as UserRole)}
                        size="sm"
                      />
                    ) : (
                      <span className="rounded-md bg-hover px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
                        {member.role}
                      </span>
                    )}

                    {isManager && !isMemberOwner && !isSelf && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger cursor-pointer"
                        title="Hapus dari workspace"
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
      </div>

      <MemberProfileModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </Dialog>
  );
};
