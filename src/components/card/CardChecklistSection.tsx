import React, { useState } from 'react';
import {
  Card,
  Column,
  ChecklistGroup,
  ChecklistItem,
  WorkspaceMember
} from '../../types/board';
import { Button } from '../ui';
import { cn } from '../../lib/cn';
import {
  CheckSquare,
  Plus,
  PencilSimple,
  Trash,
  User,
  CalendarBlank,
  ArrowSquareOut,
  X
} from '@phosphor-icons/react';

interface CardChecklistSectionProps {
  card: Card;
  columns: Column[];
  columnId: string;
  setColumnId: (id: string) => void;
  autoMoveDone: boolean;
  members?: WorkspaceMember[];
  syncChanges: (patch: Partial<Card>) => void;
  addActivity: (action: string, extraPatch?: Partial<Card>) => void;
  onConvertChecklistToCard?: (sourceCardId: string, item: ChecklistItem) => void;
}

export const CardChecklistSection: React.FC<CardChecklistSectionProps> = ({
  card,
  columns,
  columnId,
  setColumnId,
  autoMoveDone,
  members,
  syncChanges,
  addActivity,
  onConvertChecklistToCard
}) => {
  const [newChecklistTexts, setNewChecklistTexts] = useState<Record<string, string>>({});
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState('');

  const effectiveGroups: ChecklistGroup[] =
    card.checklistGroups && card.checklistGroups.length > 0
      ? [...card.checklistGroups].sort((a, b) => a.order - b.order)
      : [{ id: 'default', title: 'Checklist Tugas', order: 0 }];

  const handleAddChecklistGroup = () => {
    const baseGroups =
      card.checklistGroups && card.checklistGroups.length > 0
        ? card.checklistGroups
        : [{ id: 'default', title: 'Checklist Tugas', order: 0 }];
    const newGroup: ChecklistGroup = {
      id: `grp-${Date.now()}`,
      title: `Checklist ${baseGroups.length + 1}`,
      order: baseGroups.length
    };
    const normalizedChecklist =
      card.checklistGroups && card.checklistGroups.length > 0
        ? card.checklist
        : card.checklist.map((item) => ({ ...item, groupId: item.groupId || 'default' }));
    syncChanges({
      checklistGroups: [...baseGroups, newGroup],
      checklist: normalizedChecklist
    });
    addActivity(`Menambahkan grup checklist "${newGroup.title}"`);
  };

  const handleRenameChecklistGroup = (groupId: string) => {
    const trimmed = editingGroupTitle.trim();
    setEditingGroupId(null);
    if (!trimmed) return;
    const baseGroups =
      card.checklistGroups && card.checklistGroups.length > 0
        ? card.checklistGroups
        : [{ id: 'default', title: 'Checklist Tugas', order: 0 }];
    const nextGroups = baseGroups.map((g) => (g.id === groupId ? { ...g, title: trimmed } : g));
    syncChanges({ checklistGroups: nextGroups });
  };

  const handleDeleteChecklistGroup = (groupId: string) => {
    const baseGroups = card.checklistGroups || [];
    if (baseGroups.length <= 1) return;
    const nextGroups = baseGroups.filter((g) => g.id !== groupId);
    const nextChecklist = card.checklist.filter((item) => item.groupId !== groupId);
    syncChanges({ checklistGroups: nextGroups, checklist: nextChecklist });
  };

  const handleAddChecklistItem = (e: React.FormEvent, groupId: string) => {
    e.preventDefault();
    const text = (newChecklistTexts[groupId] || '').trim();
    if (!text) return;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      text,
      completed: false,
      groupId: card.checklistGroups && card.checklistGroups.length > 0 ? groupId : undefined
    };

    const nextChecklist = [...card.checklist, newItem];
    syncChanges({ checklist: nextChecklist });
    setNewChecklistTexts((prev) => ({ ...prev, [groupId]: '' }));
    addActivity(`Menambahkan checklist "${newItem.text}"`);
  };

  const handleUpdateChecklistItemMeta = (
    id: string,
    patch: Partial<Pick<ChecklistItem, 'assigneeId' | 'dueDate'>>
  ) => {
    const nextChecklist = card.checklist.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    syncChanges({ checklist: nextChecklist });
  };

  const handleToggleChecklist = (id: string) => {
    const nextChecklist = card.checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    const isAllCompleted =
      nextChecklist.length > 0 && nextChecklist.every((item) => item.completed);

    let nextColumnId = columnId;
    if (isAllCompleted && autoMoveDone) {
      const doneCol = columns.find(
        (c) =>
          c.title.toLowerCase().includes('done') ||
          c.title.toLowerCase().includes('selesai')
      );
      if (doneCol && doneCol.id !== columnId) {
        nextColumnId = doneCol.id;
        setColumnId(doneCol.id);
        addActivity('Semua checklist selesai: kartu otomatis dipindahkan ke Done');
      }
    }

    syncChanges({ checklist: nextChecklist, columnId: nextColumnId });
  };

  const handleDeleteChecklistItem = (id: string) => {
    const nextChecklist = card.checklist.filter((item) => item.id !== id);
    syncChanges({ checklist: nextChecklist });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <CheckSquare className="h-3.5 w-3.5" />
          Checklist Tugas
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">
            {card.checklist.filter((i) => i.completed).length}/{card.checklist.length} Selesai
          </span>
          <Button
            size="xs"
            variant="secondary"
            type="button"
            leftIcon={<Plus className="h-3 w-3" />}
            onClick={handleAddChecklistGroup}
          >
            Tambah Grup
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {effectiveGroups.map((group, groupIdx) => {
          const groupItems = card.checklist.filter((item) => {
            if (!item.groupId) return groupIdx === 0;
            const matchesAny = effectiveGroups.some((g) => g.id === item.groupId);
            return matchesAny ? item.groupId === group.id : groupIdx === 0;
          });
          const doneCount = groupItems.filter((i) => i.completed).length;
          const pct = groupItems.length > 0 ? Math.round((doneCount / groupItems.length) * 100) : 0;

          return (
            <div key={group.id} className="rounded-xl border border-border bg-surface-alt/40 p-2.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                {editingGroupId === group.id ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingGroupTitle}
                    onChange={(e) => setEditingGroupTitle(e.target.value)}
                    onBlur={() => handleRenameChecklistGroup(group.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameChecklistGroup(group.id);
                      if (e.key === 'Escape') setEditingGroupId(null);
                    }}
                    className="flex-1 rounded border border-project-accent bg-surface px-2 py-0.5 text-xs font-semibold text-text focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setEditingGroupTitle(group.title);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-text hover:text-project-solid cursor-pointer"
                  >
                    <span>{group.title}</span>
                    <PencilSimple className="h-3 w-3 text-muted" />
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted">
                    {doneCount}/{groupItems.length}
                  </span>
                  {effectiveGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistGroup(group.id)}
                      title="Hapus grup"
                      className="p-0.5 rounded text-muted hover:text-danger cursor-pointer"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {groupItems.length > 0 && (
                <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-border/60">
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width] duration-200',
                      pct === 100 ? 'bg-status-done' : 'bg-project-solid'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              <div className="space-y-1.5 mb-2">
                {groupItems.map((item) => {
                  const assignedMember = members?.find((m) => m.id === item.assigneeId);
                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap gap-1.5 justify-between items-center p-2 text-xs rounded-lg border border-border bg-surface"
                    >
                      <label className="flex flex-1 gap-2 items-center min-w-[140px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklist(item.id)}
                          className="rounded border-border text-project-solid focus:ring-project-accent cursor-pointer"
                        />
                        <span className={cn('truncate', item.completed && 'line-through text-muted')}>
                          {item.text}
                        </span>
                      </label>

                      <div className="flex items-center gap-1">
                        {members && members.length > 0 && (
                          <label
                            title={assignedMember ? `Ditugaskan: ${assignedMember.name}` : 'Pilih penanggung jawab'}
                            className="inline-flex items-center gap-1 rounded border border-border/70 bg-surface-alt px-1.5 py-0.5 text-[10px] text-muted hover:text-text cursor-pointer"
                          >
                            <User className="h-2.5 w-2.5 shrink-0" />
                            <select
                              value={item.assigneeId || ''}
                              onChange={(e) =>
                                handleUpdateChecklistItemMeta(item.id, {
                                  assigneeId: e.target.value || undefined
                                })
                              }
                              className="max-w-[72px] bg-transparent text-[10px] text-text focus:outline-none cursor-pointer"
                            >
                              <option value="">-</option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}

                        <label
                          title="Tenggat sub-tugas"
                          className="inline-flex items-center gap-1 rounded border border-border/70 bg-surface-alt px-1.5 py-0.5 text-[10px] text-muted hover:text-text cursor-pointer"
                        >
                          <CalendarBlank className="h-2.5 w-2.5 shrink-0" />
                          <input
                            type="date"
                            value={item.dueDate || ''}
                            onChange={(e) =>
                              handleUpdateChecklistItemMeta(item.id, {
                                dueDate: e.target.value || undefined
                              })
                            }
                            className="w-[92px] bg-transparent text-[10px] text-text focus:outline-none cursor-pointer"
                          />
                        </label>

                        {onConvertChecklistToCard && (
                          <button
                            type="button"
                            onClick={() => onConvertChecklistToCard(card.id, item)}
                            title="Jadikan Kartu"
                            className="inline-flex items-center gap-0.5 rounded border border-border/70 bg-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-muted hover:text-project-solid hover:border-project-accent/40 cursor-pointer"
                          >
                            <ArrowSquareOut className="h-2.5 w-2.5" />
                            <span className="hidden sm:inline">Kartu</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="p-1 rounded text-muted hover:text-danger cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={(e) => handleAddChecklistItem(e, group.id)} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah item checklist..."
                  value={newChecklistTexts[group.id] || ''}
                  onChange={(e) =>
                    setNewChecklistTexts((prev) => ({ ...prev, [group.id]: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-project-accent focus:outline-none"
                />
                <Button size="sm" variant="secondary" type="submit" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Tambah
                </Button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
};
