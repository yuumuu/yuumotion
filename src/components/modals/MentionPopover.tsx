import React from 'react';
import { WorkspaceMember } from '../../types/board';

interface MentionPopoverProps {
  isOpen: boolean;
  query: string;
  members: WorkspaceMember[];
  onSelect: (member: WorkspaceMember) => void;
}

export const MentionPopover: React.FC<MentionPopoverProps> = ({
  isOpen,
  query,
  members,
  onSelect
}) => {
  if (!isOpen || members.length === 0) return null;

  const q = query.trim().toLowerCase();
  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q)
  );

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 z-50 mb-1.5 w-64 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-popover animate-in fade-in zoom-in-95 duration-100">
      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
        Sebut Anggota (@mention)
      </div>
      {filtered.slice(0, 6).map((member) => (
        <button
          key={member.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(member);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-text hover:bg-hover transition-colors cursor-pointer"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-project-soft text-[10px] font-bold text-project-solid">
            {member.avatarEmoji || member.name[0]?.toUpperCase() || 'U'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{member.name}</div>
            <div className="truncate text-[10px] text-muted">{member.email}</div>
          </div>
        </button>
      ))}
    </div>
  );
};
