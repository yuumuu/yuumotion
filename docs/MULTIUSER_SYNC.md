# Multi-User Concurrency & Synchronization

Yuumotion supports real-time collaboration so multiple team members can view and update boards simultaneously, similar to Trello.

## 1. Synchronization Architecture

To run on Wasmer Edge without maintaining custom stateful servers, Yuumotion uses a hybrid collaboration model:

1. **Room-Based Channel**:
   - Each board belongs to a `boardId` room.
   - Connected clients subscribe to the room channel.

2. **Backend Provider Options**:
   - **Supabase Realtime (Recommended & Free)**: Free tier includes 200 concurrent connections, Postgres change streams, and Broadcast channels.
   - **P2P / WebRTC (Serverless zero-cost)**: Direct peer-to-peer data channels using public STUN signaling.
   - **Local BroadcastChannel**: Seamless sync across multiple browser tabs on the same client device for instant validation.

## 2. Event Types

Clients broadcast lightweight delta events over the channel:

```typescript
type BoardEvent =
  | { type: 'CARD_MOVED'; boardId: string; cardId: string; sourceColumnId: string; targetColumnId: string; newIndex: number; updatedAt: number }
  | { type: 'CARD_CREATED'; boardId: string; columnId: string; card: Card; updatedAt: number }
  | { type: 'CARD_UPDATED'; boardId: string; cardId: string; updates: Partial<Card>; updatedAt: number }
  | { type: 'CARD_DELETED'; boardId: string; cardId: string; updatedAt: number }
  | { type: 'COLUMN_CREATED'; boardId: string; column: Column; updatedAt: number }
  | { type: 'COLUMN_UPDATED'; boardId: string; columnId: string; updates: Partial<Column>; updatedAt: number }
  | { type: 'USER_PRESENCE'; boardId: string; user: { id: string; name: string; avatar: string; color: string } }
```

## 3. Conflict Resolution

- **Optimistic UI**: Local user interactions update the UI instantly without waiting for network acknowledgment.
- **Last-Write-Wins (LWW) with Timestamp Verification**:
  Every mutation carries a high-precision `updatedAt` timestamp. When concurrent updates arrive for the same card or column, the latest timestamp takes precedence.
