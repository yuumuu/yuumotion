import { BoardSyncEvent, UserPresence } from '../types/board';

type SyncListener = (event: BoardSyncEvent) => void;

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private roomId: string;
  private heartbeatInterval: number | null = null;
  private activeUser: UserPresence;

  constructor(roomId: string, user: UserPresence) {
    this.roomId = roomId;
    this.activeUser = user;
    this.initChannel();
    this.startPresenceHeartbeat();
  }

  private initChannel() {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    this.channel = new BroadcastChannel(`yuumotion_room_${this.roomId}`);
    this.channel.onmessage = (messageEvent: MessageEvent<BoardSyncEvent>) => {
      this.listeners.forEach((listener) => listener(messageEvent.data));
    };
  }

  private startPresenceHeartbeat() {
    this.broadcast({
      type: 'PRESENCE_PING',
      user: this.activeUser,
      senderId: this.activeUser.id
    });

    this.heartbeatInterval = window.setInterval(() => {
      this.broadcast({
        type: 'PRESENCE_PING',
        user: { ...this.activeUser, lastActive: Date.now() },
        senderId: this.activeUser.id
      });
    }, 4000);
  }

  public setRoom(newRoomId: string) {
    if (this.roomId === newRoomId) return;

    if (this.channel) {
      this.channel.close();
    }
    this.roomId = newRoomId;
    this.initChannel();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(event: BoardSyncEvent) {
    if (this.channel) {
      this.channel.postMessage(event);
    }
  }

  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

export function createSyncManager(roomId: string, user: UserPresence) {
  return new RealtimeSyncManager(roomId, user);
}
