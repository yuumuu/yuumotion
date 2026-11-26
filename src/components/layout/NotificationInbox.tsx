import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Checks, At, Kanban, FileText } from '@phosphor-icons/react';
import { NotificationItem } from '../../types/board';
import { cn } from '../../lib/cn';

interface NotificationInboxProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
}

export const NotificationInbox: React.FC<NotificationInboxProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible = tab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const formatTime = (ts: number) => {
    const diff = Math.max(1, Math.floor((Date.now() - ts) / 60000));
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}j`;
    return `${Math.floor(diff / 1440)}h`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface/60 text-muted hover:bg-hover hover:text-text transition-colors cursor-pointer"
        title="Kotak Masuk Notifikasi"
        aria-label="Notifikasi"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-project-solid px-1 text-[9px] font-bold text-white shadow-2xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-surface shadow-popover animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-bold text-text">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-project-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold text-project-solid">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-project-solid hover:bg-project-soft transition-colors cursor-pointer"
              >
                <Checks className="h-3.5 w-3.5" />
                <span>Tandai dibaca</span>
              </button>
            )}
          </div>

          <div className="flex gap-1 border-b border-border bg-bar/40 px-3 py-1.5">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                tab === 'all' ? 'bg-surface text-text shadow-2xs' : 'text-muted hover:text-text'
              )}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTab('unread')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                tab === 'unread' ? 'bg-surface text-text shadow-2xs' : 'text-muted hover:text-text'
              )}
            >
              Belum Dibaca
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="h-7 w-7 text-muted/40 mb-2" />
                <p className="text-xs font-medium text-text">Tidak ada notifikasi</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Sebutan @mention dan pembaruan tugas akan muncul di sini.
                </p>
              </div>
            ) : (
              visible.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.isRead) onMarkRead(item.id);
                    onSelectNotification(item);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-start gap-2.5 px-3.5 py-2.5 transition-colors cursor-pointer hover:bg-hover/60',
                    !item.isRead && 'bg-project-soft/25'
                  )}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-project-soft text-project-solid">
                    {item.type === 'mention_card' || item.type === 'mention_page' ? (
                      <At className="h-3.5 w-3.5" />
                    ) : item.entityType === 'page' ? (
                      <FileText className="h-3.5 w-3.5" />
                    ) : (
                      <Kanban className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-text">{item.title}</span>
                      <span className="shrink-0 font-mono text-[10px] text-muted">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">{item.snippet}</p>
                    <span className="mt-1 inline-block text-[10px] text-muted/80">
                      Oleh {item.actorName}
                    </span>
                  </div>
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(item.id);
                      }}
                      title="Tandai sudah dibaca"
                      className="mt-1 rounded p-1 text-project-solid hover:bg-project-soft cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
