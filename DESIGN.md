# Yuumotion Design System & Konsep Layout

**Nama Produk:** Yuumotion  
**Register:** `product` (workspace kolaborasi gabungan Standalone Page Doc ala Notion dan papan Kanban ala Trello + Multi-views untuk tim teknis dan pengguna umum)  
**Stack Target:** React 18, TypeScript, Vite 6, Tailwind CSS (PostCSS + Autoprefixer), `clsx`, `tailwind-merge`, `lucide-react`, TipTap, Supabase, PWA  
**Filosofi Visual:** Playful Tactile yang tenang dan presisi. **Light mode adalah default** dengan dukungan penuh **Dark mode**, aksen warna **dinamis per project**, serta opsi kepadatan **Comfortable** dan **Compact**.

## 1. Prinsip & Aturan Hygiene Desain

1. **Playful lewat bentuk, gerak, dan warna, bukan emoji atau ASCII.** Karakter ramah hadir lewat sudut membulat taktil, aksen warna dinamis per project, ikon garis tajam `lucide-react`, dan mikro-interaksi lembut. Hindari emoji pada header kolom, badge status, atau tombol sistem, serta hindari dekorasi ASCII pada antarmuka.
2. **Kanvas terang yang nyaman dipakai seharian.** Light mode memakai latar kertas hangat (`#FAF9F6`), bukan putih klinis yang menyilaukan. Dark mode memakai arang netral lembut (`#111113`), bukan hitam pekat berkontras ekstrem.
3. **Batas 1px yang rapi dengan elevasi taktil.** Setiap kontainer, kolom, dan kartu punya garis batas `1px --border` yang tegas. Saat disentuh atau ditarik, elemen merespons secara fisik lewat bayangan hangat dan transisi pegas halus.
4. **Aksen dinamis per project.** Setiap project di dalam workspace memiliki warna identitas sendiri (`--project-accent`) yang otomatis mewarnai tombol primer, ring fokus, tab aktif, dan sorotan drop zone di dalam project tersebut, sementara elemen global tetap netral.
5. **Satu sistem untuk tim teknis dan umum.** Bahasa UI lugas, santai, dan bebas jargon berat, tetapi tetap menyediakan kontrol tingkat lanjut seperti blok kode, diagram Mermaid, pintasan keyboard, dan tampilan densitas *Compact*.
6. **Gerak halus ala AppFlowy, ClickUp, dan Trello tanpa layout shift.** Drag-and-drop kartu dan blok editor harus mulus tanpa lompatan posisi, selalu menyediakan placeholder setinggi elemen, dan tunduk pada `prefers-reduced-motion`.
7. **Larangan mutlak.** Dilarang memakai teks gradasi, `border-left` berwarna tebal pada kartu atau callout, animasi memantul terus-menerus, emoji di komponen sistem, dan em dash pada seluruh teks antarmuka.

## 2. Token Desain

### Warna Netral & Status

| Token | Light (Default) | Dark | Pemakaian |
| :--- | :--- | :--- | :--- |
| `--bg` | `#FAF9F6` | `#111113` | Kanvas utama (warm paper / soft charcoal) |
| `--bar` | `#F3F1EC` | `#17171A` | Sidebar, top header, latar kolom Kanban |
| `--surface` | `#FFFFFF` | `#1C1C20` | Kartu Kanban, modal, drawer, popover, tabel |
| `--hover` | `#EAE7E0` | `#25252B` | Hover permukaan, tombol sekunder |
| `--border` | `#E3DFD7` | `#2B2B32` | Garis batas 1px standar |
| `--border-strong` | `#CFC9BE` | `#3D3D47` | Garis batas hover, input aktif, divider tegas |
| `--text` | `#18181B` | `#F4F3F0` | Teks utama (kontras >= 15.3:1) |
| `--muted` | `#5F5E5B` | `#A3A29E` | Teks sekunder, label, metadata (kontras >= 5.7:1) |
| `--danger` | `#DC2626` | `#DC2626` | Tombol aksi destruktif (teks putih, kontras 4.83:1) |
| `--urgent` / `--urgent-bg` | `#9F1239` / `#FFE4E6` | `#FDA4AF` / `#3B1821` | Prioritas Urgent |
| `--high` / `--high-bg` | `#92400E` / `#FEF3C7` | `#FCD34D` / `#362812` | Prioritas High |
| `--medium` / `--medium-bg` | `#1E40AF` / `#DBEAFE` | `#93C5FD` / `#182942` | Prioritas Medium |
| `--done` / `--done-bg` | `#065F46` / `#D1FAE5` | `#6EE7B7` / `#133328` | Status Selesai / Sukses |

### Preset Warna Aksen Dinamis per Project

Setiap project menyimpan field `accent_theme` di Supabase (`violet`, `cobalt`, `coral`, `emerald`, `berry`, `amber`) yang dipasang ke atribut `data-project-theme` pada kontainer project. Seluruh 6 preset sudah diuji memenuhi **WCAG AA (>= 4.5:1)** untuk tombol solid berteks putih maupun teks aksen di atas latar soft dan surface pada kedua mode.

| Preset (`data-project-theme`) | `--project-solid` (Tombol) | `--project-accent` (Light / Dark) | `--project-soft` (Light / Dark) | Kontras Tombol |
| :--- | :--- | :--- | :--- | :--- |
| `violet` (Default) | `#6D28D9` | `#6D28D9` / `#A78BFA` | `#F3EEFF` / `#261E3B` | `7.10:1` |
| `cobalt` | `#2563EB` | `#1D4ED8` / `#60A5FA` | `#EBF3FF` / `#18263D` | `5.17:1` |
| `coral` | `#C84228` | `#B9381F` / `#FB8B72` | `#FFF0EC` / `#381E19` | `4.92:1` |
| `emerald` | `#047857` | `#047857` / `#34D399` | `#E8FAF3` / `#132E25` | `5.48:1` |
| `berry` | `#BE185D` | `#BE185D` / `#F472B6` | `#FDECF4` / `#361928` | `6.04:1` |
| `amber` | `#B45309` | `#92400E` / `#FBBF24` | `#FEF4E3` / `#332512` | `5.02:1` |

### Token Kepadatan (Comfortable & Compact)

Kepadatan dikendalikan lewat atribut `data-density="comfortable"` (default) atau `data-density="compact"` pada elemen `<html>`, tersinkronisasi dari Halaman Preferensi.

| Token | Comfortable (Default) | Compact | Pemakaian |
| :--- | :--- | :--- | :--- |
| `--space-card-p` | `14px` | `10px` | Padding internal kartu Kanban |
| `--space-card-gap` | `12px` | `8px` | Jarak vertikal antar kartu dalam kolom |
| `--space-col-w` | `304px` | `276px` | Lebar tetap kolom Kanban |
| `--space-row-h` | `42px` | `34px` | Tinggi baris Spreadsheet dan item list |
| `--space-nav-h` | `34px` | `28px` | Tinggi item navigasi sidebar |
| `--space-cover-h` | `96px` | `72px` | Tinggi cover banner pada kartu Kanban |
| `--text-ui` | `14px` | `13px` | Ukuran teks body UI |

```css
/* src/styles/tokens.css */
:root {
  --bg: #FAF9F6;
  --bar: #F3F1EC;
  --surface: #FFFFFF;
  --hover: #EAE7E0;
  --border: #E3DFD7;
  --border-strong: #CFC9BE;
  --text: #18181B;
  --muted: #5F5E5B;
  --danger: #DC2626;

  --urgent: #9F1239; --urgent-bg: #FFE4E6;
  --high: #92400E; --high-bg: #FEF3C7;
  --medium: #1E40AF; --medium-bg: #DBEAFE;
  --done: #065F46; --done-bg: #D1FAE5;

  /* Default Project Accent: Violet */
  --project-solid: #6D28D9;
  --project-accent: #6D28D9;
  --project-soft: #F3EEFF;
  --project-ring: rgba(109, 40, 217, 0.22);

  /* Default Density: Comfortable */
  --space-card-p: 14px;
  --space-card-gap: 12px;
  --space-col-w: 304px;
  --space-row-h: 42px;
  --space-nav-h: 34px;
  --space-cover-h: 96px;
  --text-ui: 14px;
}

.dark {
  --bg: #111113;
  --bar: #17171A;
  --surface: #1C1C20;
  --hover: #25252B;
  --border: #2B2B32;
  --border-strong: #3D3D47;
  --text: #F4F3F0;
  --muted: #A3A29E;

  --urgent: #FDA4AF; --urgent-bg: #3B1821;
  --high: #FCD34D; --high-bg: #362812;
  --medium: #93C5FD; --medium-bg: #182942;
  --done: #6EE7B7; --done-bg: #133328;

  --project-accent: #A78BFA;
  --project-soft: #261E3B;
  --project-ring: rgba(167, 139, 250, 0.28);
}

/* Dynamic Project Accent Overrides */
[data-project-theme="cobalt"] { --project-solid: #2563EB; --project-accent: #1D4ED8; --project-soft: #EBF3FF; --project-ring: rgba(37, 99, 235, 0.22); }
.dark [data-project-theme="cobalt"] { --project-accent: #60A5FA; --project-soft: #18263D; --project-ring: rgba(96, 165, 250, 0.28); }

[data-project-theme="coral"] { --project-solid: #C84228; --project-accent: #B9381F; --project-soft: #FFF0EC; --project-ring: rgba(200, 66, 40, 0.22); }
.dark [data-project-theme="coral"] { --project-accent: #FB8B72; --project-soft: #381E19; --project-ring: rgba(251, 139, 114, 0.28); }

[data-project-theme="emerald"] { --project-solid: #047857; --project-accent: #047857; --project-soft: #E8FAF3; --project-ring: rgba(4, 120, 87, 0.22); }
.dark [data-project-theme="emerald"] { --project-accent: #34D399; --project-soft: #132E25; --project-ring: rgba(52, 211, 153, 0.28); }

[data-project-theme="berry"] { --project-solid: #BE185D; --project-accent: #BE185D; --project-soft: #FDECF4; --project-ring: rgba(190, 24, 93, 0.22); }
.dark [data-project-theme="berry"] { --project-accent: #F472B6; --project-soft: #361928; --project-ring: rgba(244, 114, 182, 0.28); }

[data-project-theme="amber"] { --project-solid: #B45309; --project-accent: #92400E; --project-soft: #FEF4E3; --project-ring: rgba(180, 83, 9, 0.22); }
.dark [data-project-theme="amber"] { --project-accent: #FBBF24; --project-soft: #332512; --project-ring: rgba(251, 191, 36, 0.28); }

/* Density Mode: Compact */
[data-density="compact"] {
  --space-card-p: 10px;
  --space-card-gap: 8px;
  --space-col-w: 276px;
  --space-row-h: 34px;
  --space-nav-h: 28px;
  --space-cover-h: 72px;
  --text-ui: 13px;
}
```

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bar: 'var(--bar)',
        surface: 'var(--surface)',
        hover: 'var(--hover)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        danger: 'var(--danger)',
        project: {
          solid: 'var(--project-solid)',
          accent: 'var(--project-accent)',
          soft: 'var(--project-soft)',
        },
        status: {
          urgent: 'var(--urgent)',
          'urgent-bg': 'var(--urgent-bg)',
          high: 'var(--high)',
          'high-bg': 'var(--high-bg)',
          medium: 'var(--medium)',
          'medium-bg': 'var(--medium-bg)',
          done: 'var(--done)',
          'done-bg': 'var(--done-bg)',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"Onest"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Commit Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card-rest': '0 1px 2px rgba(24, 24, 27, 0.05)',
        'card-hover': '0 6px 18px rgba(24, 24, 27, 0.09)',
        'card-drag': '0 18px 36px rgba(24, 24, 27, 0.18), 0 0 0 2px var(--project-accent)',
        'tactile-btn': 'inset 0 -2px 0 rgba(0, 0, 0, 0.16)',
        'focus-project': '0 0 0 3px var(--project-ring)',
      },
      transitionTimingFunction: {
        'spring-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'drag-glide': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
```

### Tipografi Khusus (Karakter Unik, Jarang Dipakai)

Alih-alih memakai font SaaS yang terlalu umum (seperti Inter, Roboto, atau Poppins), Yuumotion memadukan tiga typeface open-source yang punya kepribadian playful-humanis namun tetap tajam untuk kerja panjang:

| Peran | Font | Alasan Pemilihan & Pemakaian |
| :--- | :--- | :--- |
| **Display & Heading** | `Bricolage Grotesque` | Grotesque ekspresif dengan lekukan hangat yang langsung membedakan Yuumotion dari aplikasi generik. Dipakai pada judul halaman Doc, nama project, judul modal, dan heading H1/H2. Berat `600` sampai `700`, tracking `-0.02em`. |
| **Body UI & Editor Doc** | `Onest` | Dirancang khusus untuk antarmuka digital dan bacaan panjang dengan keterbacaan tinggi pada ukuran kecil (`13px` sampai `15px`). Tidak melelahkan mata di dokumen panjang maupun tabel padat. |
| **Kode, Kbd & Counter** | `Commit Mono` | Monospace modern yang ringan dan netral untuk kode ID tugas (`YUU-142`), `Kbd`, penghitung checklist (`3/5`), serta blok kode TipTap. |

**Skala ukuran:** `12px` (badge, kbd, metadata), `13px` (label field, body Compact), `14px` (body UI Comfortable), `15px` (body paragraf Page Doc, `line-height: 1.65`), `18px` (judul panel/modal), `24px` (H2 dokumen), `34px` (judul Standalone Page Doc). Panjang baris baca dokumen maksimal `70ch`.

### Radius, Elevasi & Fisika Gerak (Micro-Delight + Smooth DnD)

| Elemen | Nilai & Aturan |
| :--- | :--- |
| Radius | `rounded-md` (`6px`) untuk `Kbd` dan chip mini; `rounded-lg` (`10px`) untuk tombol, input, item sidebar; `rounded-xl` (`14px`) untuk kartu Kanban, toast, callout; `rounded-2xl` (`18px`) untuk kolom Kanban, modal, popover slash menu. |
| Efek tekan tombol | `active:translate-y-[1px]` dengan `shadow-tactile-btn` tipis pada tombol primer. |
| **Smooth Kanban Drag-and-Drop** | Saat kartu diangkat (`onDragStart`): skala naik mulus ke `scale-[1.03]`, rotasi ringan `rotate-[2deg]` (menyesuaikan arah tarik horizontal), bayangan `shadow-card-drag`, dan ring `--project-accent`. Slot asal menampilkan placeholder putus-putus (`border-dashed border-project-accent/50 bg-project-soft/60`) setinggi kartu persis (zero layout shift). Kartu tetangga di kolom tujuan bergeser halus dengan `transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)`. Saat dijatuhkan (`onDragEnd`), kartu mendarat dengan kurva `spring-soft` (`220ms`). |
| **Completion Micro-Delight** | Saat checkbox dicentang atau kartu dipindahkan ke kolom `Done`, ikon centang `lucide-react` menjalankan animasi stroke-draw `240ms` disertai pulse ring tipis warna `--done` (`<= 380ms`), tanpa confetti penuh layar. |
| Reduced Motion | Di `@media (prefers-reduced-motion: reduce)` atau jika toggle "Kurangi animasi" aktif di Preferensi, semua rotasi drag, spring, dan pulse diganti fade `100ms`. |

## 3. Komponen Kit Reusable (React 18 + TS + Tailwind + `lucide-react`)

Semua komponen menggunakan helper `cn()` dari `clsx` + `tailwind-merge` dan wajib memiliki 6 state: **default**, **hover**, **active**, **fokus** (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent`), **disabled**, dan **loading**.

```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Button

| Varian | Pemakaian | Gaya Inti |
| :--- | :--- | :--- |
| `primary` | Aksi utama (satu per layar/dialog) | `bg-project-solid text-white shadow-tactile-btn hover:brightness-105 active:translate-y-[1px]` |
| `soft` | Aksi ramah sekunder ("Tambah kartu", "Sisipkan blok") | `bg-project-soft text-project-accent hover:brightness-95 dark:hover:brightness-110` |
| `secondary` | Aksi pendukung netral | `bg-surface text-text border border-border shadow-card-rest hover:bg-hover` |
| `ghost` | Aksi toolbar, ikon header | `bg-transparent text-muted hover:bg-hover hover:text-text` |
| `danger` | Aksi destruktif permanen | `bg-danger text-white shadow-tactile-btn hover:brightness-105` |

```tsx
// src/components/ui/Button.tsx
import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'soft' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-project-solid text-white shadow-tactile-btn hover:brightness-105 active:translate-y-[1px]',
  soft: 'bg-project-soft text-project-accent hover:brightness-95 active:translate-y-[1px]',
  secondary: 'bg-surface text-text border border-border shadow-card-rest hover:bg-hover active:translate-y-[1px]',
  ghost: 'bg-transparent text-muted hover:bg-hover hover:text-text',
  danger: 'bg-danger text-white shadow-tactile-btn hover:brightness-105 active:translate-y-[1px]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-9 px-3.5 text-sm rounded-lg',
  lg: 'h-11 px-5 text-sm rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
```

### Badge, Kbd, Input, Switch & Checkbox

- **Badge Status & Tag:** Pil `rounded-full h-6 px-2.5 text-xs font-medium`, latar pastel semantik (`bg-status-urgent-bg text-status-urgent`, dst.) atau tag netral (`bg-bar text-text border border-border`). Memakai ikon `lucide-react` `12px` (`Flag`, `Clock`, `CheckCircle2`) atau dot `6px`, tanpa emoji.
- **Kbd:** Monospace `12px` (`font-mono`), `bg-surface border border-border border-b-2 border-b-border-strong rounded-md px-1.5 py-0.5 text-muted`.
- **Input & Textarea:** Tinggi `40px` (`h-10`), `rounded-lg border border-border bg-surface px-3`, fokus `border-project-accent shadow-focus-project`. Label `<label for>` selalu terlihat di atas field; error memakai `border-danger` dan pesan korektif di bawahnya.
- **Switch & Checkbox:** Switch `<button role="switch" aria-checked>` ukuran `40x22px` penuh bulat (`bg-project-solid` saat aktif). Checkbox berdimensi `18x18px` (`rounded-md`) dengan ikon `Check` `lucide-react` animasi `spring-soft`, dibungkus `<label>` berarea sentuh minimal `44px`.

### Kanban Card & Column (Anatomi Bersih + Smooth DnD)

Rekomendasi anatomi kartu yang seimbang antara informatif dan tenang:
- **Cover Banner (opsional):** `h-[var(--space-cover-h)]`, tint warna project atau gambar, `rounded-t-[13px] border-b border-border`.
- **Baris Atas:** Kode ID monospaced (`YUU-142`) di kiri + indikator prioritas (`Flag` atau dot warna status + `aria-label`) di kanan.
- **Judul:** `text-[var(--text-ui)] font-semibold text-text line-clamp-2`.
- **Baris Tag:** Maksimal 2 sampai 3 pill pastel ringkas (selebihnya `+N`).
- **Baris Meta Bawah:** Progress checklist (`CheckSquare` + `3/5` mono + progress bar mini `h-1`), tanggal jatuh tempo (`Calendar` + highlight `--urgent` jika lewat), jumlah komentar (`MessageSquare`), dan maksimal 3 avatar tumpuk.
- **Quick Actions saat Hover:** Tombol mini di pojok kanan atas kartu (buka detail, ubah status, menu titik tiga) tampil via opacity tanpa menggeser teks.

```tsx
// src/components/kanban/KanbanCard.tsx
import { Calendar, CheckSquare, Flag, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/cn';

interface KanbanCardProps {
  code: string;
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'done';
  tags?: string[];
  checklist?: { done: number; total: number };
  dueDate?: string;
  commentsCount?: number;
  isDragging?: boolean;
  onOpen: () => void;
}

const priorityColor = {
  urgent: 'text-status-urgent',
  high: 'text-status-high',
  medium: 'text-status-medium',
  done: 'text-status-done',
};

export function KanbanCard({
  code, title, priority, tags = [], checklist, dueDate, commentsCount = 0, isDragging, onOpen,
}: KanbanCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      style={{ padding: 'var(--space-card-p)' }}
      className={cn(
        'group relative cursor-grab rounded-xl border border-border bg-surface text-left',
        'shadow-card-rest transition-[transform,box-shadow,border-color] duration-200 ease-drag-glide',
        'hover:border-border-strong hover:shadow-card-hover',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent',
        isDragging && 'cursor-grabbing scale-[1.03] rotate-[2deg] shadow-card-drag border-project-accent z-50',
        'motion-reduce:transform-none motion-reduce:transition-none'
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted">{code}</span>
        <Flag className={cn('h-3.5 w-3.5', priorityColor[priority])} aria-label={`Prioritas ${priority}`} />
      </div>

      <h3 className="line-clamp-2 text-[var(--text-ui)] font-semibold leading-snug text-text">
        {title}
      </h3>

      {tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-project-soft px-2 py-0.5 text-[11px] font-medium text-project-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-xs text-muted">
        <div className="flex items-center gap-3 font-mono tabular-nums">
          {checklist && (
            <span className="inline-flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
              {checklist.done}/{checklist.total}
            </span>
          )}
          {commentsCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              {commentsCount}
            </span>
          )}
        </div>
        {dueDate && (
          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {dueDate}
          </span>
        )}
      </div>
    </article>
  );
}
```

### Standalone Page Doc (TipTap Rich Block Ecosystem)

Kanvas dokumen memakai lebar optimal `max-w-[740px] mx-auto` di atas `--bg`, dengan header opsional (cover gradien lembut atau pola titik halus `h-44 rounded-2xl border border-border`, ikon `lucide-react` dalam kotak `rounded-xl bg-project-soft text-project-accent` bukan emoji, dan judul `font-display text-[34px] font-bold`).

**Katalog Blok Slash Command (`/`) yang Wajib Didukung TipTap:**

| Kategori | Daftar Blok | Detail Desain & Interaksi |
| :--- | :--- | :--- |
| **Teks & Daftar** | Paragraph, Heading 1-3 (`Bricolage Grotesque`), Bullet List, Numbered List, To-do Checklist, Toggle/Accordion, Divider | Checklist memakai animasi centang `spring-soft`; Toggle bisa buka-tutup halus |
| **Struktur & Visual** | Callout (Info, Tips, Warning, Success), Multi-Column (2 atau 3 kolom), Blockquote, Tabel Interaktif (resize kolom + header sticky), Image & Gallery | Callout memakai latar pastel penuh + border `1px` + ikon `lucide-react` (tanpa `border-left` tebal) |
| **Teknis & Developer** | Code Block (syntax highlight + selector bahasa + tombol Salin), Inline Math & Formula Block (KaTeX), Mermaid Diagram Block (live preview + edit kode), Key-Value / API Spec Card | Font `Commit Mono`, latar `--bar`, border `1px --border`, radius `12px` |
| **Live Embeds Yuumotion** | Embed Kanban Board/Column (filterable), Linked Task Mention (`@YUU-142` menampilkan status live dari Supabase), Mention Anggota (`@nama`), Date Chip (`@tanggal`), Table of Contents otomatis, Web Bookmark Preview | Klik Linked Task langsung membuka kartu mengikuti preferensi Card Open Mode pengguna |

- **Kontrol Blok:** Handle drag `GripVertical` (`lucide-react`) dan tombol `Plus` di margin kiri baru muncul saat blok di-hover atau fokus. Memblok teks menampilkan **Floating Bubble Menu** (`rounded-xl border border-border bg-surface shadow-card-hover`) untuk format cepat, tautan, warna teks, dan "Jadikan Tugas Kanban".
- **Role Viewer:** Editor dikunci (`editable: false`), handle drag, tombol `+`, dan slash menu disembunyikan, disertai banner tipis `1px` di atas kanvas: "Mode baca saja. Hubungi pemilik project untuk meminta akses edit."

## 4. Konsep Layout & Arsitektur Tampilan

### Hierarki Navigasi: Workspace -> Project -> Views & Docs

Sidebar kiri (`w-64` di Comfortable, `w-56` di Compact, dapat dilipat ke `w-14` lewat pintasan `[`) mengorganisir seluruh konten berdasarkan **Project di dalam Workspace aktif**:

1. **Workspace Switcher (Top Sidebar):** Nama workspace aktif + tombol dropdown pindah workspace + tombol cepat Command Palette (`Cmd/Ctrl + K`).
2. **Akses Cepat:** `Pencarian`, `Tugas Saya`, dan `Favorit` (item terpin).
3. **Daftar Project (Inti Navigasi):** Setiap project ditampilkan sebagai folder expandable dengan dot/ikon warna aksen dinamisnya (`--project-solid`). Di dalam tiap project terdapat:
   - **Papan Kanban** (pilar utama tugas)
   - **Tampilan Lain** (Spreadsheet, Gantt, Kalender, bisa ditampilkan atau disembunyikan per project)
   - **Dokumen Project** (pohon halaman *nested* Standalone Page Docs milik project tersebut)
4. **Footer Sidebar:** Indikator status sinkronisasi **Supabase + PWA** (Online / Sinkronisasi / Offline), tombol cepat ganti tema Light/Dark, dan tautan **Preferensi**.

### Dua Pilar Utama & Multi-Views Sekunder

| Tampilan | Peran | Konsep Layout |
| :--- | :--- | :--- |
| **Standalone Page Doc** | Pilar Utama 1 | Kanvas baca/tulis terpusat (`max-w-[740px]`), header breadcrumb tipis (`h-12`) dengan indikator kolaborator realtime Supabase, panel Outline (Daftar Isi) opsional di sisi kanan pada layar lebar (`>= 1280px`), dan komentar inline per blok. |
| **Kanban Board** | Pilar Utama 2 | Toolbar filter/sort/group ringkas (`h-11 border-b border-border`), area papan scroll horizontal (`gap-4 p-5`), kolom lebar `var(--space-col-w)` berlatar `--bar` (`rounded-2xl border border-border`), virtualisasi kartu untuk `100+` item, dan tombol "+ Tambah kartu" inline di bawah kolom. |
| **Spreadsheet** | Multi-View | Grid tabel berbatas `1px` dengan tinggi baris `var(--space-row-h)`, kolom ID dan Judul sticky di kiri, edit sel inline tanpa modal. |
| **Gantt / Timeline** | Multi-View | Split-pane daftar tugas di kiri (`w-72`) dan kanvas timeline di kanan dengan garis "Hari ini" berwarna `--project-accent` dan bar durasi yang bisa digeser. |
| **Kalender** | Multi-View | Grid 7 kolom berbatas `1px`, tanggal monospaced di pojok kanan atas sel, chip tugas dengan dot status dan "+N lainnya". |

### Tiga Mode Pembukaan Detail Kartu (Konfigurasi Pengguna)

Saat pengguna mengklik kartu Kanban, baris Spreadsheet, atau Linked Task di dalam dokumen, detail kartu dibuka sesuai pilihan di Halaman Preferensi (dengan tombol pintas di pojok kanan atas detail untuk beralih mode kapan saja):

1. **Side Peek Drawer:** Panel geser dari sisi kanan (`w-[540px] max-w-[90vw] border-l border-border bg-surface shadow-card-hover`), papan di belakang tetap bisa dilihat dan di-scroll.
2. **Center Modal:** Dialog terpusat (`max-w-3xl w-full max-h-[86vh] rounded-2xl border border-border bg-surface`) dengan backdrop blur halus (`bg-black/30 dark:bg-black/60 backdrop-blur-[2px]`).
3. **Full Page:** Membuka tugas sebagai halaman penuh di kanvas utama (identik dengan Standalone Page Doc lengkap dengan breadcrumb kembali ke papan).

### Halaman Preferensi (`Preferences View`)

Halaman khusus (`/settings/preferences` atau modal preferensi penuh) yang menyimpan konfigurasi ke tabel `user_preferences` di Supabase sekaligus cache `localStorage` agar langsung aktif saat PWA offline:

| Seksi Preferensi | Kontrol UI | Opsi & Efek Langsung |
| :--- | :--- | :--- |
| **Tampilan & Tema** | Segmented Control dengan preview mini | `Terang` (Default), `Gelap`, `Ikuti Sistem` |
| **Kepadatan Antarmuka** | Kartu pilihan visual (2 kolom) | `Comfortable` (lega, ideal untuk menulis & baca) atau `Compact` (padat, muat lebih banyak kartu & baris) |
| **Cara Membuka Kartu** | Kartu pilihan visual (3 kolom) | `Side Peek Drawer`, `Center Modal`, atau `Halaman Penuh` |
| **Gerak & Micro-Delight** | Toggle Switch | Aktifkan efek drag-and-drop halus & animasi selesai tugas; opsi paksa `Kurangi animasi` |
| **PWA & Mode Offline** | Status Card + Tombol Aksi | Status sinkronisasi Supabase, tombol "Install ke Perangkat" (jika belum terpasang), dan tombol "Sinkronkan ulang cache lokal" |

### Responsif & Pengalaman PWA

| Breakpoint | Adaptasi Layout |
| :--- | :--- |
| Desktop (`>1024px`) | Sidebar collapsible (`256px` / `56px`), Kanban 3+ kolom sejajar, Outline Doc di sisi kanan pada `>= 1280px` |
| Tablet (`768px` sampai `1024px`) | Sidebar menjadi overlay drawer, Kanban scroll horizontal dengan snap, Side Peek otomatis menyesuaikan lebar `460px` |
| Mobile (`<768px`) | Satu kolom Kanban penuh per layar (swipe antar kolom), navigasi bawah dengan safe-area PWA (`pb-[env(safe-area-inset-bottom)]`), Slash Menu dan detail kartu tampil sebagai bottom sheet atau Full Page |

## 5. Kasus Tepi, Aksesibilitas & Audit Teknis

### Kasus Tepi (Termasuk Realtime Supabase & PWA)

| Situasi | Perilaku |
| :--- | :--- |
| Judul kartu panjang | Maksimal 2 baris (`line-clamp-2`) di Kanban; tampil utuh saat detail kartu dibuka |
| Kolom kosong | Area drop tetap terbuka dengan teks: "Belum ada tugas di sini. Tarik kartu atau tambah tugas baru." |
| Banyak kartu (`100+`) | Virtualisasi daftar per kolom agar animasi drag tetap 60fps; penghitung monospaced tetap akurat |
| Memuat data | Skeleton berwarna `--hover` dengan tinggi persis kartu/blok (tanpa layout shift) |
| Konflik edit realtime | Avatar kolaborator tampil di header Doc dan kartu aktif via Supabase Presence; konflik blok ditangani lewat CRDT/TipTap Collaboration atau notifikasi gabung versi |
| Offline (PWA) | Banner pastel `--high-bg` di atas kanvas: "Sedang offline. Perubahan disimpan di perangkat dan akan tersinkron otomatis saat terhubung." |

### Aksesibilitas & Pintasan Keyboard

- **Kontras:** Semua teks reguler >= `4.5:1` dan grafis UI >= `3:1` di seluruh 6 preset warna project pada Light maupun Dark mode.
- **Target Sentuh:** Minimal `44x44px` untuk seluruh tombol, checkbox, switch, dan kontrol mobile.
- **Drag-and-Drop Keyboard:** Fokus kartu Kanban atau handle blok Doc, tekan `Spasi` untuk mengangkat, `Panah` untuk memindahkan posisi atau kolom, `Spasi` untuk menaruh, `Esc` untuk membatalkan; diumumkan lewat `aria-live="assertive"`.
- **Pintasan Global:** `Cmd/Ctrl + K` (Command Palette), `/` (Slash Command di Doc / Fokus Filter di Kanban), `C` (Buat tugas cepat di project aktif), `[` (Lipat/buka sidebar), `1` sampai `5` (Pindah view project), `Esc` (Tutup modal/drawer/popover).
- **Ikon & Semantik:** Semua tombol ikon `lucide-react` wajib membawa `aria-label`; ikon dekoratif diberi `aria-hidden="true"`.

### Audit Teknis Awal

| Area | Temuan & Risiko | Solusi di Sistem Ini |
| :--- | :--- | :--- |
| Warna aksen dinamis per project | Warna kustom bebas sering melanggar kontras teks tombol atau mode gelap | Batasi ke 6 preset kurasi (`violet`, `cobalt`, `coral`, `emerald`, `berry`, `amber`) yang seluruh pasangan Light/Dark-nya sudah terverifikasi WCAG AA |
| Playful tanpa terlihat kekanak-kanakan | Emoji dan ASCII di UI cepat membuat antarmuka terasa berantakan saat data banyak | Ganti dekorasi emoji dengan ikon `lucide-react`, font `Bricolage Grotesque`, radius lembut, dan fisika drag-and-drop yang halus |
| Transisi Compact vs Comfortable | Hardcoding kelas padding (`p-4`, `h-10`) membuat fitur density sulit dirawat | Alihkan padding, gap, lebar kolom, dan tinggi baris ke CSS variables berbasis `[data-density]` |
| PWA + Preferensi Pengguna | Flash tema/density (FOUC) saat halaman dibuka ulang | Baca cache `localStorage` di inline script `index.html` sebelum React mount, lalu sinkronkan dengan tabel `user_preferences` di Supabase |
