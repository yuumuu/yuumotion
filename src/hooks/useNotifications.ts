import { useState, useEffect } from 'react';
import { AuthUser, Card, NotificationItem } from '../types/board';
import { getNotificationsStorageKey, isGuestUser } from '../lib/storageNamespace';
import { apiClient } from '../services/apiClient';
import { toast } from '../components/ui';

export function useNotifications(currentUser: AuthUser, activeWorkspaceId: string, activeBoardId: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const raw = localStorage.getItem(getNotificationsStorageKey(currentUser));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(getNotificationsStorageKey(currentUser));
      setNotifications(raw ? JSON.parse(raw) : []);
    } catch {
      setNotifications([]);
    }
    if (!isGuestUser(currentUser)) {
      apiClient.notifications
        .list()
        .then((res) => {
          if (Array.isArray(res.notifications)) {
            setNotifications(res.notifications);
          }
        })
        .catch(() => {});
    }
  }, [currentUser.id]);

  useEffect(() => {
    try {
      localStorage.setItem(getNotificationsStorageKey(currentUser), JSON.stringify(notifications));
    } catch {
      // Abaikan jika kuota localStorage penuh
    }
  }, [notifications, currentUser]);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (!isGuestUser(currentUser)) {
      apiClient.notifications.markRead(id).catch(() => {});
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (!isGuestUser(currentUser)) {
      apiClient.notifications.markAllRead().catch(() => {});
    }
  };

  const handleMentionUser = (
    member: { id: string; name: string },
    card: Card,
    commentText: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      workspaceId: activeWorkspaceId,
      recipientUserId: member.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      type: 'mention_card',
      entityType: 'card',
      entityId: card.id,
      boardId: activeBoardId,
      title: `${currentUser.name} menyebut Anda di "${card.title}"`,
      snippet: commentText,
      isRead: false,
      createdAt: Date.now()
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
    if (!isGuestUser(currentUser)) {
      apiClient.notifications
        .create({
          workspaceId: activeWorkspaceId,
          recipientUserId: member.id,
          actorId: currentUser.id,
          actorName: currentUser.name,
          type: 'mention_card',
          entityType: 'card',
          entityId: card.id,
          boardId: activeBoardId,
          title: newNotif.title,
          snippet: commentText
        })
        .catch(() => {});
    }
    toast.info(`Notifikasi @mention dikirim ke ${member.name}.`);
  };

  return {
    notifications,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleMentionUser
  };
}
