import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { BoardSyncEvent, CloudSyncConfig, SyncConnectionStatus, UserPresence } from '../types/board';

type SyncListener = (event: BoardSyncEvent) => void;
type StatusListener = (status: SyncConnectionStatus) => void;

const CLOUD_CONFIG_KEY = 'yuumotion_cloud_sync_config';

export function getStoredCloudConfig(): CloudSyncConfig {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        supabaseUrl: parsed.supabaseUrl || envUrl,
        supabaseAnonKey: parsed.supabaseAnonKey || envKey,
        enabled: parsed.enabled ?? Boolean(envUrl && envKey)
      };
    } catch {
      // Return defaults if stored settings are malformed
    }
  }

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    enabled: Boolean(envUrl && envKey)
  };
}

export function saveStoredCloudConfig(config: CloudSyncConfig) {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota exceeded
  }
}

class RealtimeSyncManager {
  private localChannel: BroadcastChannel | null = null;
  private supabaseClient: SupabaseClient | null = null;
  private supabaseChannel: RealtimeChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private roomId: string;
  private heartbeatInterval: number | null = null;
  private activeUser: UserPresence;
  private status: SyncConnectionStatus = 'local';
  private cloudConfig: CloudSyncConfig;

  constructor(roomId: string, user: UserPresence) {
    this.roomId = roomId;
    this.activeUser = user;
    this.cloudConfig = getStoredCloudConfig();

    this.initLocalChannel();
    this.initCloudChannel();
    this.startPresenceHeartbeat();
  }

  private initLocalChannel() {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    if (this.localChannel) {
      this.localChannel.close();
    }

    this.localChannel = new BroadcastChannel(`yuumotion_room_${this.roomId}`);
    this.localChannel.onmessage = (messageEvent: MessageEvent<BoardSyncEvent>) => {
      this.dispatchToListeners(messageEvent.data);
    };
  }

  private initCloudChannel() {
    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe();
      this.supabaseChannel = null;
    }

    if (!this.cloudConfig.enabled || !this.cloudConfig.supabaseUrl || !this.cloudConfig.supabaseAnonKey) {
      this.updateStatus('local');
      return;
    }

    this.updateStatus('connecting');

    try {
      if (!this.supabaseClient) {
        this.supabaseClient = createClient(
          this.cloudConfig.supabaseUrl,
          this.cloudConfig.supabaseAnonKey,
          {
            realtime: {
              params: {
                eventsPerSecond: 10
              }
            }
          }
        );
      }

      const channelName = `yuumotion_room_${this.roomId}`;
      this.supabaseChannel = this.supabaseClient.channel(channelName, {
        config: {
          broadcast: { ack: false, self: false }
        }
      });

      this.supabaseChannel
        .on('broadcast', { event: 'board-sync' }, (payload) => {
          if (payload.payload) {
            this.dispatchToListeners(payload.payload as BoardSyncEvent);
          }
        })
        .subscribe((subscriptionStatus) => {
          if (subscriptionStatus === 'SUBSCRIBED') {
            this.updateStatus('connected');
          } else if (subscriptionStatus === 'CLOSED' || subscriptionStatus === 'CHANNEL_ERROR') {
            this.updateStatus('error');
          }
        });
    } catch {
      this.updateStatus('error');
    }
  }

  private updateStatus(newStatus: SyncConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }

  private dispatchToListeners(event: BoardSyncEvent) {
    this.listeners.forEach((listener) => listener(event));
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

    this.roomId = newRoomId;
    this.initLocalChannel();
    this.initCloudChannel();
  }

  public updateCloudConfig(newConfig: CloudSyncConfig) {
    this.cloudConfig = newConfig;
    saveStoredCloudConfig(newConfig);
    this.supabaseClient = null;
    this.initCloudChannel();
  }

  public getStatus(): SyncConnectionStatus {
    return this.status;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public broadcast(event: BoardSyncEvent) {
    if (this.localChannel) {
      this.localChannel.postMessage(event);
    }

    if (this.supabaseChannel && this.status === 'connected') {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'board-sync',
        payload: event
      });
    }
  }

  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.localChannel) {
      this.localChannel.close();
      this.localChannel = null;
    }
    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe();
      this.supabaseChannel = null;
    }
    this.listeners.clear();
    this.statusListeners.clear();
  }
}

export function createSyncManager(roomId: string, user: UserPresence) {
  return new RealtimeSyncManager(roomId, user);
}
