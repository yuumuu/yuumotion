# Yuumotion Agent Guidelines & Rules

## 1. Environment & Shell Invariants (Windows PowerShell)
- Shell di environment ini adalah Windows PowerShell.
- **DILARANG** menggunakan operator chaining `&&` di satu baris perintah.
- **GUNAKAN** titik koma `;` untuk menjalankan perintah berurutan (misal: `npm run build; git status`).

## 2. Code Comment Hygiene (/antislop-code)
- Pertahankan komentar kode seringkas mungkin (maksimal 1-2 baris).
- Dilarang membuat banner pemisah dekoratif (`// ====================`).
- Dilarang menarasikan langkah per langkah yang sudah jelas terbaca dari kode program.
- Dilarang menggunakan emoji di dalam komentar kode.
- Tulis komentar hanya untuk menjelaskan batasan platform, alasan arsitektur, atau penanganan error fallback.

## 3. UI, Design System & Accessibility (/antislop-ui & /antislop-human)
- **Aesthetic**: Menjaga estetika AppFlowy yang tenang, rapi, dan bersih dengan palet warna pastel.
- **Copywriting**: Dilarang menggunakan em dash (`—`) dalam teks UI; gunakan koma, titik, titik dua, atau tanda kurung.
- **Affordance**: Pastikan seluruh kontrol interaktif memiliki `cursor: pointer`.
- **Color Tokens**: Dilarang memakai warna hardcoded (`purple-*`) pada komponen `src/components/ui/`; gunakan token sistem (`project-solid`, `project-accent`, `text`, `muted`).
- **RBAC Guardrails**: Komponen penulisan dokumen (TipTap) dan pengelolaan kartu harus selalu menghormati role `Viewer` dengan mengunci kanvas ke mode `editable={false}` dan menyembunyikan tombol mutasi.
- **Micro-Animations**: Pertahankan animasi yang halus, terarah, dan ringan (drag-and-drop tilt, drop target indicator) tanpa menyebabkan pergeseran layout (*layout shift*).

## 4. Auth, Storage & Backend Sync Invariants
- **Storage Isolation**: Semua key `localStorage` data pengguna wajib dipisahkan antara sesi `guest` dan `user_<id>`, serta di-reload otomatis saat login, register, maupun logout.
- **Route Authorization**: Setiap endpoint mutasi di `server/src/routes/` wajib memverifikasi membership & role workspace (`checkWorkspaceRole`), bukan hanya `requireAuth`.
