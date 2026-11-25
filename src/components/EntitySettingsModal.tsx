import React, { useState, useEffect } from 'react';
import { Board, Workspace } from '../types/board';
import { Dialog, Button, Input, ConfirmDialog } from './ui';
import { cn } from '../lib/cn';
import { Gear, Kanban, ClockCounterClockwise, Trash, Warning, Users, Globe, Sparkle } from '@phosphor-icons/react';
import { ActivityService, ActivityEvent } from '../services/activityService';

export type EntitySettingsTab = 'general' | 'members' | 'columns' | 'activity' | 'danger';

interface EntitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'workspace' | 'board';
  workspace: Workspace;
  board?: Board;
  onRenameWorkspace?: (name: string, icon?: string) => void;
  onUpdateWorkspaceJoinPolicy?: (policy: 'invite' | 'link' | 'open') => void;
  onOpenMembersModal?: () => void;
  onDeleteWorkspace?: (workspaceId: string) => void;
  onRenameBoard?: (title: string) => void;
  onUpdateColumnWip?: (columnId: string, wipLimit?: number) => void;
  onShareBoard?: () => void;
  onOpenTemplates?: () => void;
  onDeleteBoard?: (boardId: string) => void;
  canDeleteBoard?: boolean;
}

const WORKSPACE_ICONS = ['🚀', '✨', '📋', '💡', '🎯', '⚡', '🌿', '🎨'];

export const EntitySettingsModal: React.FC<EntitySettingsModalProps> = ({
  isOpen,
  onClose,
  entityType,
  workspace,
  board,
  onRenameWorkspace,
  onUpdateWorkspaceJoinPolicy,
  onOpenMembersModal,
  onDeleteWorkspace,
  onRenameBoard,
  onUpdateColumnWip,
  onShareBoard,
  onOpenTemplates,
  onDeleteBoard,
  canDeleteBoard = true
}) => {
  const [activeTab, setActiveTab] = useState<EntitySettingsTab>('general');
  const [nameInput, setNameInput] = useState('');
  const [iconInput, setIconInput] = useState(workspace.icon || '🚀');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('general');
    setNameInput(entityType === 'board' ? board?.title || '' : workspace.name);
    setIconInput(workspace.icon || '🚀');
    setActivities(ActivityService.getByWorkspace(workspace.id, 30));
  }, [isOpen, entityType, board?.title, workspace.id, workspace.name, workspace.icon]);

  const tabs: { id: EntitySettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'Umum', icon: <Gear className="h-4 w-4" /> },
    ...(entityType === 'workspace'
      ? [{ id: 'members' as const, label: 'Anggota & Akses', icon: <Users className="h-4 w-4" /> }]
      : []),
    ...(entityType === 'board' && board
      ? [{ id: 'columns' as const, label: 'Kolom & WIP', icon: <Kanban className="h-4 w-4" /> }]
      : []),
    { id: 'activity', label: 'Aktivitas', icon: <ClockCounterClockwise className="h-4 w-4" /> },
    { id: 'danger', label: 'Zona Bahaya', icon: <Warning className="h-4 w-4 text-danger" /> }
  ];

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (entityType === 'board') {
      onRenameBoard?.(trimmed);
    } else {
      onRenameWorkspace?.(trimmed, iconInput);
    }
    onClose();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="2xl"
        title={
          entityType === 'board'
            ? `Pengaturan Papan: ${board?.title || ''}`
            : `Pengaturan Workspace: ${workspace.name}`
        }
      >
        <div className="flex flex-col sm:flex-row gap-5 min-h-[300px]">
          <nav className="flex sm:flex-col gap-1 sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left',
                  activeTab === t.id
                    ? 'bg-project-soft text-project-solid font-semibold'
                    : 'text-muted hover:text-text hover:bg-hover'
                )}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0">
            {activeTab === 'general' && (
              <form onSubmit={handleSaveName} className="space-y-4">
                {entityType === 'workspace' && (
                  <div>
                    <label className="block text-xs font-semibold text-text mb-2">
                      Ikon Workspace
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {WORKSPACE_ICONS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setIconInput(item)}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-transform cursor-pointer',
                            iconInput === item
                              ? 'border-project-accent bg-project-soft scale-105 shadow-2xs'
                              : 'border-border bg-bg hover:bg-hover'
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">
                    {entityType === 'board' ? 'Nama Papan' : 'Nama Workspace'}
                  </label>
                  <Input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Masukkan nama..."
                  />
                </div>
                {entityType === 'board' && (onShareBoard || onOpenTemplates) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    {onShareBoard && (
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        leftIcon={<Globe className="h-3.5 w-3.5" />}
                        onClick={() => {
                          onClose();
                          onShareBoard();
                        }}
                      >
                        Bagikan Link Papan
                      </Button>
                    )}
                    {onOpenTemplates && (
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        leftIcon={<Sparkle className="h-3.5 w-3.5" />}
                        onClick={() => {
                          onClose();
                          onOpenTemplates();
                        }}
                      >
                        Buat Papan dari Template
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button type="submit" size="sm" variant="primary">
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'members' && entityType === 'workspace' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-2">
                    Siapa yang dapat bergabung ke workspace ini?
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        { id: 'invite', title: 'Hanya Undangan', desc: 'Hanya anggota yang diundang admin atau owner.' },
                        { id: 'link', title: 'Melalui Tautan Workspace', desc: 'Siapa pun yang memiliki tautan undangan dapat bergabung.' },
                        { id: 'open', title: 'Terbuka (Tim Internal)', desc: 'Pengguna terdaftar dapat langsung meminta bergabung.' }
                      ] as const
                    ).map((opt) => {
                      const active = (workspace.joinPolicy || 'invite') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onUpdateWorkspaceJoinPolicy?.(opt.id)}
                          className={cn(
                            'w-full rounded-xl border p-3 text-left transition-colors cursor-pointer',
                            active
                              ? 'border-project-accent bg-project-soft/40'
                              : 'border-border bg-bar hover:bg-hover'
                          )}
                        >
                          <div className="text-xs font-semibold text-text">{opt.title}</div>
                          <div className="text-[11px] text-muted mt-0.5">{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {onOpenMembersModal && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted">
                      {workspace.members.length} anggota terdaftar
                    </span>
                    <Button
                      size="xs"
                      variant="secondary"
                      leftIcon={<Users className="h-3.5 w-3.5" />}
                      onClick={() => {
                        onClose();
                        onOpenMembersModal();
                      }}
                    >
                      Kelola Daftar Anggota
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'columns' && entityType === 'board' && board && (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                <p className="text-xs text-muted mb-2">
                  Atur batas WIP (Work In Progress) untuk tiap kolom di papan ini.
                </p>
                {board.columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bar px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-1 rounded-full shrink-0"
                        style={{ backgroundColor: col.color || '#6366F1' }}
                      />
                      <span className="text-xs font-semibold text-text truncate">{col.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted">WIP:</span>
                      <input
                        type="number"
                        min={0}
                        value={col.wipLimit ?? ''}
                        placeholder="∞"
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          onUpdateColumnWip?.(col.id, v > 0 ? v : undefined);
                        }}
                        className="w-16 rounded-lg border border-border bg-surface px-2 py-1 text-xs font-mono text-text focus:border-project-accent focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activities.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted">
                    Belum ada catatan aktivitas di workspace ini.
                  </div>
                ) : (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-border/70 bg-bar/60 p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-project-solid">{act.userName}</span>{' '}
                        <span className="text-text">{act.summary}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted shrink-0">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 space-y-3">
                <div className="text-xs font-bold text-danger">
                  {entityType === 'board' ? 'Hapus Papan Ini' : 'Hapus Workspace Ini'}
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {entityType === 'board'
                    ? 'Seluruh kolom dan kartu di papan ini akan dihapus permanen.'
                    : 'Seluruh papan dan dokumen di dalam workspace ini akan dihapus permanen.'}
                </p>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={entityType === 'board' && !canDeleteBoard}
                  leftIcon={<Trash className="h-3.5 w-3.5" />}
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  {entityType === 'board' ? 'Hapus Papan' : 'Hapus Workspace'}
                </Button>
                {entityType === 'board' && !canDeleteBoard && (
                  <p className="text-[11px] text-muted">
                    Minimal harus ada 1 papan tersisa di workspace.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title={entityType === 'board' ? 'Hapus Papan' : 'Hapus Workspace'}
        description={
          entityType === 'board'
            ? `Yakin ingin menghapus papan "${board?.title || ''}"?`
            : `Yakin ingin menghapus workspace "${workspace.name}"?`
        }
        variant="danger"
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (entityType === 'board' && board) {
            onDeleteBoard?.(board.id);
          } else {
            onDeleteWorkspace?.(workspace.id);
          }
          onClose();
        }}
      />
    </>
  );
};
