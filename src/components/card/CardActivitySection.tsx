import React, { useState } from 'react';
import { Card, CardActivity, WorkspaceMember } from '../../types/board';
import { MentionPopover } from '../modals/MentionPopover';
import { Button } from '../ui';
import { cn } from '../../lib/cn';
import { ClockCounterClockwise, CaretDown } from '@phosphor-icons/react';

interface CardActivitySectionProps {
  card: Card;
  activities: CardActivity[];
  members?: WorkspaceMember[];
  addActivity: (action: string, extraPatch?: Partial<Card>) => void;
  onMentionUser?: (member: WorkspaceMember, card: Card, commentText: string) => void;
}

export const CardActivitySection: React.FC<CardActivitySectionProps> = ({
  card,
  activities,
  members,
  addActivity,
  onMentionUser
}) => {
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionPopover, setShowMentionPopover] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-bar/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsActivityOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-muted hover:text-text transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <ClockCounterClockwise className="h-3.5 w-3.5" />
          <span>Riwayat Aktivitas Kartu</span>
          <span className="font-mono text-[10px] rounded-md bg-hover px-1.5 py-0.5">
            {activities.length}
          </span>
        </span>
        <CaretDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-150',
            isActivityOpen && 'rotate-180'
          )}
        />
      </button>

      {isActivityOpen && (
        <div className="space-y-2 px-3 pb-3 pt-2 border-t border-border/60">
          <div className="relative">
            <MentionPopover
              isOpen={showMentionPopover}
              query={mentionQuery}
              members={members || []}
              onSelect={(member) => {
                const replaced = commentText.replace(/@([^\s@]*)$/, `@${member.name} `);
                setCommentText(replaced);
                setShowMentionPopover(false);
              }}
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = commentText.trim();
                if (!trimmed) return;
                addActivity(trimmed);
                if (onMentionUser && members) {
                  members.forEach((m) => {
                    if (trimmed.toLowerCase().includes(`@${m.name.toLowerCase()}`)) {
                      onMentionUser(m, card, trimmed);
                    }
                  });
                }
                setCommentText('');
                setShowMentionPopover(false);
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => {
                  const val = e.target.value;
                  setCommentText(val);
                  const match = val.match(/@([^\s@]*)$/);
                  if (match) {
                    setMentionQuery(match[1]);
                    setShowMentionPopover(true);
                  } else {
                    setShowMentionPopover(false);
                  }
                }}
                placeholder="Tulis komentar atau ketik @nama untuk menyebut..."
                className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text placeholder:text-muted focus:border-project-accent focus:outline-none"
              />
              <Button size="xs" variant="secondary" type="submit">
                Kirim
              </Button>
            </form>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border/70 bg-surface p-2 text-[11px]"
              >
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold text-project-accent">{act.userName}:</span>
                  <span className="text-text">{act.action}</span>
                </div>
                <span className="text-[10px] text-muted whitespace-nowrap font-mono">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
