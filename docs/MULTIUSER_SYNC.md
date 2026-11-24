# Multi-User Concurrency & Synchronization

Yuumotion supports real-time collaboration so multiple team members can view and update boards simultaneously, similar to Trello and AppFlowy.

## 1. Dual-Tier Synchronization Architecture

To run on Wasmer Edge without maintaining custom stateful servers, Yuumotion employs an active hybrid synchronization model:

1. **Intra-Device Synchronization (BroadcastChannel)**:
   - Always enabled out-of-the-box.
   - Provides instant 0ms latency sync across concurrent browser tabs on the same device without network consumption.

2. **Cross-Device & Cross-Network Synchronization (Supabase Realtime Broadcast)**:
   - Leverages Supabase Realtime's stateless WebSocket broadcast channels (Free Tier includes 200 concurrent connections).
   - Zero database required: events are propagated directly between connected clients via room-based channels (`yuumotion_room_<roomId>`).
   - Configurable at runtime via the Cloud Sync modal in the header or build-time environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

## 2. Event Types & Delta Payloads

Clients broadcast lightweight delta events over the active channel:

```typescript
type BoardSyncEvent =
  | { type: 'CARD_UPSERT'; card: Card; senderId: string }
  | { type: 'CARD_DELETE'; cardId: string; senderId: string; updatedAt: number }
  | { type: 'CARD_MOVE'; cardId: string; targetColumnId: string; targetOrder: number; senderId: string; updatedAt: number }
  | { type: 'COLUMN_UPSERT'; column: Column; senderId: string }
  | { type: 'COLUMN_DELETE'; columnId: string; senderId: string; updatedAt: number }
  | { type: 'BOARD_RESET'; board: Board; senderId: string }
  | { type: 'PRESENCE_PING'; user: UserPresence; senderId: string };
```

## 3. Conflict Resolution

- **Optimistic UI Updates**: Local user actions reflect immediately on the screen.
- **Last-Write-Wins (LWW) with Timestamp Verification**:
  Every mutation carries a high-precision `updatedAt` timestamp. When concurrent updates arrive for the same card or column, the latest timestamp takes precedence.
- **Presence Heartbeats**: Active users send periodic presence pings every 4 seconds, pruning inactive peers after 10 seconds of silence.
