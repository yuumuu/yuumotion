# Yuumotion Architecture

Yuumotion is an AppFlowy-inspired collaborative Kanban workspace designed for zero-maintenance, zero-cost edge deployment on Wasmer Edge Free Tier, paired with seamless multi-user real-time synchronization.

## 1. High-Level Architecture

```
+-----------------------------------------------------------+
|                      Wasmer Edge                          |
|             (wasmer/static-web-server)                    |
|    +-------------------------------------------------+    |
|    |           Yuumotion Static Web SPA              |    |
|    |      (React 18 + Vite + Tailwind CSS + Lucide)  |    |
|    +-------------------------------------------------+    |
+-----------------------------+-----------------------------+
                              |
       +----------------------+----------------------+
       |                                             |
       v                                             v
+-------------------------------+       +-------------------------------+
|      Local State & Cache      |       |      Multi-User Realtime      |
|  - IndexedDB / localStorage   |       |  - Supabase Realtime / Rooms  |
|  - Instant 0ms read/write     |       |  - Broadcast Channel / PubSub |
|  - Offline-first resilience   |       |  - Live Board & Card Sync     |
+-------------------------------+       +-------------------------------+
```

## 2. Core Principles

1. **Edge-Hosted Static Client**:

   - The application compiles into pure static HTML, JavaScript, CSS, and asset files.
   - Hosted via `wasmer/static-web-server` on Wasmer Edge at zero cost.
2. **Offline-First & Local-First**:

   - Every board change updates the local memory and persists immediately into browser storage.
   - Users can create boards, rearrange cards, and edit documents even without internet connectivity.
3. **Multi-User Realtime Synchronization**:

   - Board updates propagate across concurrent sessions using a room-based pub/sub broker (Supabase Realtime Broadcast or WebRTC / PartyKit).
   - Card movements and edits include client timestamps to resolve concurrent edits cleanly with optimistic UI updates.
4. **AppFlowy Aesthetic**:

   - Clean, distraction-free typography and modern spacing.
   - Every Kanban card expands into a full document canvas with rich metadata (status, tags, priority, dates, and markdown-like block notes).
