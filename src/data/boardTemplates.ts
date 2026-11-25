import { PriorityLevel } from '../types/board';

export type TemplateCategory = 'Produk' | 'Engineering' | 'Marketing' | 'Personal';

export interface BoardTemplateColumn {
  title: string;
  color: string;
  wipLimit?: number;
}

export interface BoardTemplateCard {
  columnIndex: number;
  title: string;
  description: string;
  priority: PriorityLevel;
}

export interface BoardTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  icon: string;
  columns: BoardTemplateColumn[];
  sampleCards: BoardTemplateCard[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Produk',
  'Engineering',
  'Marketing',
  'Personal'
];

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: 'tpl-product-roadmap',
    name: 'Roadmap Produk',
    category: 'Produk',
    description: 'Pantau inisiatif produk dari kuartal ke kuartal.',
    icon: '🗺️',
    columns: [
      { title: 'Now (Q1)', color: '#6366F1' },
      { title: 'Next (Q2)', color: '#0EA5E9' },
      { title: 'Later', color: '#8B5CF6' },
      { title: 'Done', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 0, title: 'Rilis Kolaborasi Realtime v2', description: 'Sinkronisasi antar tab & indikator presence.', priority: 'high' },
      { columnIndex: 1, title: 'Integrasi Webhook & API Publik', description: 'Dokumentasi OpenAPI dan token akses.', priority: 'medium' }
    ]
  },
  {
    id: 'tpl-sprint-planning',
    name: 'Sprint Planning',
    category: 'Produk',
    description: 'Alur Scrum sprint dua mingguan lengkap dengan review.',
    icon: '⚡',
    columns: [
      { title: 'Product Backlog', color: '#64748B' },
      { title: 'Sprint Todo', color: '#6366F1' },
      { title: 'In Progress', color: '#F59E0B', wipLimit: 4 },
      { title: 'Review', color: '#EC4899' },
      { title: 'Done', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 1, title: 'Audit Performa Rendering Kanban', description: 'Optimasi virtualisasi atau memoization kartu.', priority: 'high' },
      { columnIndex: 2, title: 'Perbaiki Aksesibilitas Keyboard', description: 'Pastikan navigasi Tab dan Enter konsisten.', priority: 'medium' }
    ]
  },
  {
    id: 'tpl-user-story',
    name: 'User Story Map',
    category: 'Produk',
    description: 'Petakan kebutuhan pengguna dari discovery hingga validasi.',
    icon: '🧩',
    columns: [
      { title: 'Discovery', color: '#8B5CF6' },
      { title: 'Wireframe', color: '#0EA5E9' },
      { title: 'Build', color: '#F59E0B' },
      { title: 'Validated', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 0, title: 'Wawancara 5 Pengguna Aktif', description: 'Validasi alur onboarding workspace baru.', priority: 'medium' }
    ]
  },
  {
    id: 'tpl-feature-prio',
    name: 'Feature Prioritization',
    category: 'Produk',
    description: 'Klasifikasikan ide fitur berdasarkan dampak dan usaha.',
    icon: '🎯',
    columns: [
      { title: 'High Impact / Low Effort', color: '#10B981' },
      { title: 'Big Bets', color: '#6366F1' },
      { title: 'Quick Fixes', color: '#0EA5E9' },
      { title: 'Icebox', color: '#64748B' }
    ],
    sampleCards: [
      { columnIndex: 0, title: 'Shortcut Keyboard Global', description: 'Navigasi cepat tanpa menyentuh mouse.', priority: 'high' }
    ]
  },
  {
    id: 'tpl-bug-tracker',
    name: 'Bug Tracker',
    category: 'Engineering',
    description: 'Lacak laporan bug dari triase sampai terverifikasi.',
    icon: '🐞',
    columns: [
      { title: 'Reported', color: '#EC4899' },
      { title: 'Triage', color: '#F59E0B' },
      { title: 'Fixing', color: '#6366F1', wipLimit: 3 },
      { title: 'Done', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 0, title: 'Dropdown terpotong di layar kecil', description: 'Gunakan portal agar selalu mengikuti viewport.', priority: 'urgent' },
      { columnIndex: 1, title: 'Sync state antar tab lambat', description: 'Periksa debounce BroadcastChannel.', priority: 'high' }
    ]
  },
  {
    id: 'tpl-code-review',
    name: 'Code Review',
    category: 'Engineering',
    description: 'Antrean PR dan review arsitektur tim engineering.',
    icon: '🔍',
    columns: [
      { title: 'Draft PR', color: '#64748B' },
      { title: 'Needs Review', color: '#0EA5E9' },
      { title: 'Changes Requested', color: '#F59E0B' },
      { title: 'Merged', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 1, title: 'PR #42: Refactor Service Layer', description: 'Memisahkan storage local dan API adapter.', priority: 'medium' }
    ]
  },
  {
    id: 'tpl-devops',
    name: 'DevOps Pipeline',
    category: 'Engineering',
    description: 'Kelola rilis infrastruktur, staging, dan produksi.',
    icon: '🚀',
    columns: [
      { title: 'Planned', color: '#6366F1' },
      { title: 'Staging', color: '#F59E0B' },
      { title: 'Canary', color: '#EC4899' },
      { title: 'Production', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 1, title: 'Setup CI Build & Typecheck', description: 'Otomatisasi tsc + vite build sebelum deploy.', priority: 'high' }
    ]
  },
  {
    id: 'tpl-tech-debt',
    name: 'Tech Debt',
    category: 'Engineering',
    description: 'Catat dan cicil utang teknis agar codebase tetap sehat.',
    icon: '🛠️',
    columns: [
      { title: 'Identified', color: '#64748B' },
      { title: 'Scoped', color: '#0EA5E9' },
      { title: 'Refactoring', color: '#F59E0B' },
      { title: 'Resolved', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 0, title: 'Pecah App.tsx menjadi custom hooks', description: 'Pisahkan state workspace dan board handler.', priority: 'low' }
    ]
  },
  {
    id: 'tpl-content-cal',
    name: 'Content Calendar',
    category: 'Marketing',
    description: 'Rencanakan artikel, video, dan rilis media sosial.',
    icon: '📅',
    columns: [
      { title: 'Ide Konten', color: '#8B5CF6' },
      { title: 'Drafting', color: '#0EA5E9' },
      { title: 'Desain & Edit', color: '#F59E0B' },
      { title: 'Published', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 1, title: 'Artikel: Workflow Produktif Tanpa Ribet', description: 'Studi kasus penggunaan Kanban + Docs.', priority: 'medium' }
    ]
  },
  {
    id: 'tpl-campaign',
    name: 'Campaign Tracker',
    category: 'Marketing',
    description: 'Monitor kampanye peluncuran dari persiapan hingga evaluasi.',
    icon: '📣',
    columns: [
      { title: 'Briefing', color: '#6366F1' },
      { title: 'Asset Production', color: '#EC4899' },
      { title: 'Live', color: '#F59E0B' },
      { title: 'Done', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 0, title: 'Launch Yuumotion v2', description: 'Siapkan landing page, demo video, dan release notes.', priority: 'high' }
    ]
  },
  {
    id: 'tpl-personal-kanban',
    name: 'Personal Kanban',
    category: 'Personal',
    description: 'Papan simpel 3 kolom untuk tugas harian pribadi.',
    icon: '🌿',
    columns: [
      { title: 'To Do', color: '#6366F1' },
      { title: 'Doing', color: '#F59E0B', wipLimit: 3 },
      { title: 'Done', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 0, title: 'Review catatan mingguan', description: 'Rangkum pencapaian dan prioritas minggu depan.', priority: 'low' }
    ]
  },
  {
    id: 'tpl-goals',
    name: 'Goals Tracker',
    category: 'Personal',
    description: 'Pantau target jangka pendek hingga pencapaian utama.',
    icon: '🏆',
    columns: [
      { title: 'Target Baru', color: '#8B5CF6' },
      { title: 'Sedang Dikejar', color: '#0EA5E9' },
      { title: 'Tercapai', color: '#10B981' }
    ],
    sampleCards: [
      { columnIndex: 1, title: 'Selesaikan proyek aplikasi full-stack', description: 'Frontend rapi, lanjut bangun backend terintegrasi.', priority: 'high' }
    ]
  }
];
