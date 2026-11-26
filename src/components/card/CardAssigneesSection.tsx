import React, { useState } from 'react';
import { Card, WorkspaceMember } from '../../types/board';
import { Users, X } from '@phosphor-icons/react';

interface CardAssigneesSectionProps {
  card: Card;
  members: WorkspaceMember[];
  syncChanges: (patch: Partial<Card>) => void;
  addActivity: (action: string, extraPatch?: Partial<Card>) => void;
}

export const CardAssigneesSection: React.FC<CardAssigneesSectionProps> = ({
  card,
  members,
  syncChanges,
  addActivity
}) => {
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);

  const filteredMembers = members.filter((m) => {
    const q = assigneeQuery.replace(/^@/, '').trim().toLowerCase();
    return !(card.assignees || []).includes(m.id) && (!q || m.name.toLowerCase().includes(q));
  });

  return (
    <div className="relative">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-2">
        <Users className="h-3.5 w-3.5" />
        Ditugaskan Ke
      </label>

      {(card.assignees || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(card.assignees || []).map((memberId) => {
            const m = members.find((x) => x.id === memberId);
            if (!m) return null;
            return (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-project-ring bg-project-soft px-2.5 py-1 text-xs font-semibold text-project-solid"
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
                  style={{ backgroundColor: m.color || '#6366F1' }}
                >
                  {m.avatar || m.name.slice(0, 2).toUpperCase()}
                </span>
                <span>{m.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = (card.assignees || []).filter((id) => id !== m.id);
                    syncChanges({ assignees: next });
                    addActivity(`Melepas tugas dari ${m.name}`);
                  }}
                  className="ml-0.5 rounded-full hover:text-danger cursor-pointer"
                  title={`Hapus ${m.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <input
        type="text"
        value={assigneeQuery}
        onFocus={() => setShowAssigneeMenu(true)}
        onBlur={() => setTimeout(() => setShowAssigneeMenu(false), 150)}
        onChange={(e) => {
          setAssigneeQuery(e.target.value);
          setShowAssigneeMenu(true);
        }}
        placeholder="Ketik @ atau cari nama anggota..."
        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-project-accent focus:outline-none"
      />

      {showAssigneeMenu && (
        <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-popover">
          {filteredMembers.map((m) => (
            <button
              key={m.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                const next = [...(card.assignees || []), m.id];
                syncChanges({ assignees: next });
                addActivity(`Menugaskan ke ${m.name}`);
                setAssigneeQuery('');
                setShowAssigneeMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text hover:bg-hover transition-colors cursor-pointer text-left"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: m.color || '#6366F1' }}
              >
                {m.avatar || m.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="font-medium truncate">{m.name}</span>
              <span className="ml-auto text-[10px] text-muted uppercase">{m.role}</span>
            </button>
          ))}
          {filteredMembers.length === 0 && (
            <div className="px-2.5 py-2 text-[11px] text-muted text-center">
              Tidak ada anggota yang cocok.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
