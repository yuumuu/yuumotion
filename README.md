# Yuumotion

Workspace kolaboratif hibrida (**Kanban + Dokumen TipTap + Multi-View Sync**) dengan desain **Biru, Hitam, Putih (60/30/10)**, arsitektur **offline-first**, serta backend **Hono + Drizzle ORM (MySQL/TiDB)** siap **Wasmer Edge**.

## Fitur Utama

- **Multi-View Workspace**: Kanban Board (pointer + keyboard DnD, inline edit, WIP limit, column reorder), Database Spreadsheet, Kalender Bulanan, dan Timeline Gantt (drag & resize durasi).
- **Editor Dokumen TipTap**: Slash commands (`/`), auto-save indicator, daftar isi sticky, serta export ke Markdown (`.md`).
- **Kolaborasi & Produktivitas**: 12 Board Templates (Produk, Engineering, Marketing, Personal), Card Dependencies (`blockedBy`), Recurring Tasks, Guest Link Sharing (`#share/:token`), dan `@mention` Assignee.
- **Backend Monorepo (`server/`)**: Hono + TypeScript + Drizzle ORM untuk MySQL/TiDB (Wasmer Edge), autentikasi JWT cookie + OAuth, SSE realtime stream, dan endpoint upload ke Wasmer Storage.

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Untuk menjalankan backend API (setelah menyalin `.env.example` ke `.env`):

```bash
npm run db:push
npm run dev:server
```

## Lisensi

Proyek ini dirilis di bawah lisensi [Apache License 2.0](LICENSE).
