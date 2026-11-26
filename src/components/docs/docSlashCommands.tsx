import React from 'react';
import { useEditor } from '@tiptap/react';
import {
  TextHOne as Heading1,
  TextHTwo as Heading2,
  TextHThree as Heading3,
  ListBullets as List,
  ListNumbers as ListOrdered,
  CheckSquare,
  Quotes as Quote,
  Minus,
  Image as ImageIcon,
  Info,
  Lightbulb,
  Warning as AlertTriangle,
  Terminal,
  TreeStructure as Workflow,
  Sigma,
  BookmarkSimple as Bookmark,
  ShareNetwork as Share2,
  Table as TableIcon
} from '@phosphor-icons/react';

export type SlashCategory = 'Semua' | 'Dasar' | 'Struktur' | 'Developer' | 'Embed';

export interface SlashCommandItem {
  id: string;
  category: Exclude<SlashCategory, 'Semua'>;
  title: string;
  description: string;
  shortcut?: string;
  keywords?: string;
  icon: React.ReactNode;
  run: (editor: ReturnType<typeof useEditor>) => void;
}

export const deleteSlashQuery = (ed: ReturnType<typeof useEditor>) => {
  if (!ed) return;
  const { from } = ed.state.selection;
  const textBefore = ed.state.doc.textBetween(Math.max(0, from - 30), from, '\n', '\0');
  const slashMatch = textBefore.match(/\/([a-zA-Z0-9-]*)$/);
  if (slashMatch) {
    ed.commands.deleteRange({ from: from - slashMatch[0].length, to: from });
  }
};

export function createSlashCommands(onPickImage: () => void): SlashCommandItem[] {
  return [
    {
      id: 'p',
      category: 'Dasar',
      title: 'Teks Paragraf',
      description: 'Blok teks biasa untuk menulis catatan bebas',
      shortcut: 'p',
      keywords: 'text paragraph biasa',
      icon: <span className="font-serif font-bold text-sm">T</span>,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().setParagraph().run();
      }
    },
    {
      id: 'h1',
      category: 'Dasar',
      title: 'Heading 1',
      description: 'Judul seksi utama berukuran besar',
      shortcut: '#',
      keywords: 'judul title h1',
      icon: <Heading1 className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().toggleHeading({ level: 1 }).run();
      }
    },
    {
      id: 'h2',
      category: 'Dasar',
      title: 'Heading 2',
      description: 'Sub-judul bagian menengah',
      shortcut: '##',
      keywords: 'subjudul h2',
      icon: <Heading2 className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().toggleHeading({ level: 2 }).run();
      }
    },
    {
      id: 'h3',
      category: 'Dasar',
      title: 'Heading 3',
      description: 'Sub-judul bagian kecil',
      shortcut: '###',
      keywords: 'subjudul h3',
      icon: <Heading3 className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().toggleHeading({ level: 3 }).run();
      }
    },
    {
      id: 'todo',
      category: 'Dasar',
      title: 'To-do Checklist',
      description: 'Daftar tugas dengan kotak centang interaktif',
      shortcut: '[]',
      keywords: 'task checklist centang',
      icon: <CheckSquare className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().toggleTaskList().run();
      }
    },
    {
      id: 'bullet',
      category: 'Dasar',
      title: 'Bullet List',
      description: 'Daftar poin dengan bullet',
      shortcut: '-',
      keywords: 'list poin ul',
      icon: <List className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().toggleBulletList().run();
      }
    },
    {
      id: 'number',
      category: 'Dasar',
      title: 'Numbered List',
      description: 'Daftar terurut angka',
      shortcut: '1.',
      keywords: 'angka ol urutan',
      icon: <ListOrdered className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().toggleOrderedList().run();
      }
    },
    {
      id: 'divider',
      category: 'Dasar',
      title: 'Divider',
      description: 'Garis pemisah horizontal 1px',
      shortcut: '---',
      keywords: 'hr garis pemisah',
      icon: <Minus className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().setHorizontalRule().run();
      }
    },
    {
      id: 'tabel',
      category: 'Struktur',
      title: 'Tabel (3x3)',
      description: 'Sisipkan tabel terstruktur dengan header baris',
      shortcut: 'table',
      keywords: 'grid baris kolom',
      icon: <TableIcon className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      }
    },
    {
      id: 'callout-info',
      category: 'Struktur',
      title: 'Callout Info',
      description: 'Kotak pastel informasi dengan ikon',
      keywords: 'note catatan info',
      icon: <Info className="h-4 w-4 text-project-accent" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<blockquote style="border: 1px solid var(--project-accent); background: var(--project-soft); border-radius: 12px; padding: 12px 16px;"><p><strong>Info:</strong> Tulis catatan informasi penting di sini...</p></blockquote>'
        ).run();
      }
    },
    {
      id: 'callout-tips',
      category: 'Struktur',
      title: 'Callout Tips',
      description: 'Kotak tips produktivitas hijau',
      keywords: 'tips saran hijau',
      icon: <Lightbulb className="h-4 w-4 text-status-done" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<blockquote style="border: 1px solid var(--done); background: var(--done-bg); color: var(--done); border-radius: 12px; padding: 12px 16px;"><p><strong>Tips:</strong> Gunakan pintasan keyboard Cmd+K untuk navigasi cepat...</p></blockquote>'
        ).run();
      }
    },
    {
      id: 'callout-warning',
      category: 'Struktur',
      title: 'Callout Peringatan',
      description: 'Kotak peringatan oranye hangat',
      keywords: 'warning bahaya hati-hati',
      icon: <AlertTriangle className="h-4 w-4 text-status-high" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<blockquote style="border: 1px solid var(--high); background: var(--high-bg); color: var(--high); border-radius: 12px; padding: 12px 16px;"><p><strong>Perhatian:</strong> Perubahan skema data ini memerlukan migrasi...</p></blockquote>'
        ).run();
      }
    },
    {
      id: 'quote',
      category: 'Struktur',
      title: 'Kutipan / Blockquote',
      description: 'Kutipan teks bergaris aksen',
      shortcut: '>',
      keywords: 'quote kutipan',
      icon: <Quote className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().toggleBlockquote().run();
      }
    },
    {
      id: 'image',
      category: 'Struktur',
      title: 'Gambar & Foto',
      description: 'Unggah file gambar dari perangkat',
      keywords: 'foto image upload',
      icon: <ImageIcon className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        onPickImage();
      }
    },
    {
      id: 'code',
      category: 'Developer',
      title: 'Code Block',
      description: 'Blok kode monospace',
      shortcut: '```',
      keywords: 'kode snippet',
      icon: <Terminal className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().toggleCodeBlock().run();
      }
    },
    {
      id: 'mermaid',
      category: 'Developer',
      title: 'Mermaid Diagram',
      description: 'Diagram alur sistem atau arsitektur Mermaid',
      keywords: 'flowchart diagram',
      icon: <Workflow className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<pre><code>graph TD\n  A[Mulai] --&gt; B(Proses Algoritma)\n  B --&gt; C{Kondisi Selesai?}\n  C --&gt;|Ya| D[Hasil Sukses]</code></pre>'
        ).run();
      }
    },
    {
      id: 'math',
      category: 'Developer',
      title: 'Rumus Matematika',
      description: 'Blok rumus dan persamaan formula KaTeX',
      keywords: 'katex latex math',
      icon: <Sigma className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<pre><code>f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x} \\,d\\xi</code></pre>'
        ).run();
      }
    },
    {
      id: 'task-mention',
      category: 'Embed',
      title: 'Tautan Tugas (@YUU-xxx)',
      description: 'Tautkan kartu tugas Kanban langsung di dokumen',
      keywords: 'mention card kanban',
      icon: <Bookmark className="h-4 w-4 text-project-accent" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<span style="background: var(--project-soft); color: var(--project-accent); padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 600;">@YUU-104 (In Progress)</span> '
        ).run();
      }
    },
    {
      id: 'share-link',
      category: 'Embed',
      title: 'Web Bookmark / Link Card',
      description: 'Kartu tautan web eksternal',
      keywords: 'url link web',
      icon: <Share2 className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<p><a href="https://github.com" target="_blank" rel="noopener noreferrer">https://github.com</a></p>'
        ).run();
      }
    }
  ];
}
