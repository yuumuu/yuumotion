import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  TextB as Bold,
  TextItalic as Italic,
  TextStrikethrough as Strikethrough,
  Code,
  TextHOne as Heading1,
  TextHTwo as Heading2,
  TextHThree as Heading3,
  ListBullets as List,
  ListNumbers as ListOrdered,
  CheckSquare,
  Quotes as Quote,
  Minus,
  Image as ImageIcon,
  ArrowCounterClockwise as Undo,
  ArrowClockwise as Redo,
  Info,
  Lightbulb,
  Warning as AlertTriangle,
  Terminal,
  TreeStructure as Workflow,
  Sigma,
  BookmarkSimple as Bookmark,
  ShareNetwork as Share2,
  DownloadSimple
} from '@phosphor-icons/react';
import { cn } from '../lib/cn';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string, json: Record<string, unknown>) => void;
  editable?: boolean;
}

interface CommandItem {
  id: string;
  category: 'Dasar' | 'Struktur' | 'Developer' | 'Embed';
  title: string;
  description: string;
  icon: React.ReactNode;
  run: (editor: ReturnType<typeof useEditor>) => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange, editable = true }) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Placeholder.configure({
        placeholder: "Ketik '/' untuk perintah blok Notion-style atau mulai menulis catatan..."
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      })
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor: currentEditor }) => {
      setSaveStatus('saving');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus('saved'), 1500);
      onChange(currentEditor.getHTML(), currentEditor.getJSON() as Record<string, unknown>);

      const { from } = currentEditor.state.selection;
      const textBefore = currentEditor.state.doc.textBetween(Math.max(0, from - 25), from, '\n', '\0');
      const slashMatch = textBefore.match(/\/([a-zA-Z0-9]*)$/);

      if (slashMatch) {
        setSlashQuery(slashMatch[1].toLowerCase());
        setSelectedIndex(0);
        const coords = currentEditor.view.coordsAtPos(from);
        const menuW = 288;
        const menuH = 320;
        const spaceBelow = window.innerHeight - coords.bottom;
        const top = spaceBelow < menuH + 16
          ? Math.max(12, coords.top - menuH - 8)
          : coords.bottom + 8;
        const left = Math.max(12, Math.min(coords.left, window.innerWidth - menuW - 12));
        setMenuPosition({ top, left });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    }
  });

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      if (!editor.isFocused) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  const deleteSlashQuery = (ed: ReturnType<typeof useEditor>) => {
    if (!ed) return;
    const { from } = ed.state.selection;
    const textBefore = ed.state.doc.textBetween(Math.max(0, from - 25), from, '\n', '\0');
    const slashMatch = textBefore.match(/\/([a-zA-Z0-9]*)$/);
    if (slashMatch) {
      const matchLength = slashMatch[0].length;
      ed.commands.deleteRange({ from: from - matchLength, to: from });
    }
  };

  const commandList: CommandItem[] = [
    // Dasar
    {
      id: 'p',
      category: 'Dasar',
      title: 'Teks Paragraf',
      description: 'Blok teks biasa untuk menulis catatan bebas',
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
      description: 'Judul seksi besar utama',
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
      icon: <Minus className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().setHorizontalRule().run();
      }
    },

    // Struktur & Visual (Callouts tanpa border-left tebal)
    {
      id: 'callout-info',
      category: 'Struktur',
      title: 'Callout Info',
      description: 'Kotak pastel informasi dengan ikon',
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
      icon: <ImageIcon className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        setShowSlashMenu(false);
        fileInputRef.current?.click();
      }
    },

    // Developer & Teknis
    {
      id: 'code',
      category: 'Developer',
      title: 'Code Block',
      description: 'Blok kode dengan font Commit Mono',
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
      icon: <Sigma className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<pre><code>f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x} \\,d\\xi</code></pre>'
        ).run();
      }
    },

    // Embed & Mentions
    {
      id: 'task-mention',
      category: 'Embed',
      title: 'Tautan Tugas (@YUU-xxx)',
      description: 'Tautkan kartu tugas Kanban langsung di dokumen',
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
      icon: <Share2 className="h-4 w-4" />,
      run: (ed) => {
        deleteSlashQuery(ed);
        ed?.chain().focus().insertContent(
          '<p><a href="https://github.com" target="_blank" rel="noopener noreferrer">https://github.com</a></p>'
        ).run();
      }
    }
  ];

  const filteredCommands = commandList.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(slashQuery) ||
      cmd.description.toLowerCase().includes(slashQuery)
  );

  const handleSelectCommand = (cmd: CommandItem) => {
    if (editor) {
      cmd.run(editor);
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSlashMenu) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelectCommand(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        editor.chain().focus().setImage({ src, alt: file.name }).run();
        setShowSlashMenu(false);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleExportMarkdown = () => {
    if (!editor) return;
    const html = editor.getHTML();
    const div = document.createElement('div');
    div.innerHTML = html;

    const convert = (el: Element): string => {
      const tag = el.tagName?.toLowerCase();
      const inner = Array.from(el.childNodes)
        .map((n) => {
          if (n.nodeType === Node.TEXT_NODE) return n.textContent || '';
          return convert(n as Element);
        })
        .join('');

      if (tag === 'h1') return `# ${inner}\n\n`;
      if (tag === 'h2') return `## ${inner}\n\n`;
      if (tag === 'h3') return `### ${inner}\n\n`;
      if (tag === 'p') return `${inner}\n\n`;
      if (tag === 'strong' || tag === 'b') return `**${inner}**`;
      if (tag === 'em' || tag === 'i') return `*${inner}*`;
      if (tag === 's') return `~~${inner}~~`;
      if (tag === 'code') return `\`${inner}\``;
      if (tag === 'pre') return `\`\`\`\n${inner}\n\`\`\`\n\n`;
      if (tag === 'blockquote') return `> ${inner}\n\n`;
      if (tag === 'li') return `- ${inner}\n`;
      if (tag === 'ul' || tag === 'ol') return `${inner}\n`;
      if (tag === 'br') return '\n';
      if (tag === 'hr') return '---\n\n';
      return inner;
    };

    const md = convert(div).replace(/\n{3,}/g, '\n\n').trim();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dokumen.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={editorContainerRef}
      onKeyDown={handleKeyDown}
      className="relative w-full font-sans select-text"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Floating Toolbar saat mode edit */}
      {editable && editor && (
        <div className="mb-3 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-bar p-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn('p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer', editor.isActive('bold') && 'bg-surface text-text font-bold')}
            title="Tebal (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn('p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer', editor.isActive('italic') && 'bg-surface text-text font-bold')}
            title="Miring (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn('p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer', editor.isActive('strike') && 'bg-surface text-text font-bold')}
            title="Coret"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn('p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer', editor.isActive('code') && 'bg-surface text-text font-bold')}
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn('p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer', editor.isActive('bulletList') && 'bg-surface text-text font-bold')}
            title="Daftar Poin"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={cn('p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer', editor.isActive('taskList') && 'bg-surface text-text font-bold')}
            title="Checklist"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn('p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer', editor.isActive('blockquote') && 'bg-surface text-text font-bold')}
            title="Kutipan"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover disabled:opacity-30 cursor-pointer"
            title="Redo"
          >
            <Redo className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer"
            title="Sisipkan Gambar"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer"
            title="Export ke Markdown (.md)"
          >
            <DownloadSimple className="h-3.5 w-3.5" />
          </button>
          {saveStatus !== 'idle' && (
            <span
              className={cn(
                'ml-auto pr-1.5 text-[10px] font-medium transition-opacity duration-300',
                saveStatus === 'saving' ? 'text-muted animate-pulse' : 'text-status-done'
              )}
            >
              {saveStatus === 'saving' ? 'Menyimpan...' : '✓ Tersimpan'}
            </span>
          )}
        </div>
      )}

      {/* Editor Content Canvas */}
      <EditorContent
        editor={editor}
        className={cn(
          'prose dark:prose-invert max-w-none focus:outline-none min-h-[220px]',
          !editable && 'opacity-90 pointer-events-none'
        )}
      />

      {/* Slash Command Menu Popover (Portal + Viewport-Aware) */}
      {showSlashMenu && editable && createPortal(
        <div
          style={{ position: 'fixed', top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, zIndex: 9999 }}
          className="w-72 max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-card-drag animate-yuu-crossfade"
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted border-b border-border mb-1">
            Perintah Blok (Tekan /)
          </div>

          {filteredCommands.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted">
              Tidak ada perintah yang cocok
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => handleSelectCommand(cmd)}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors cursor-pointer',
                  idx === selectedIndex
                    ? 'bg-project-soft text-project-accent font-medium'
                    : 'text-text hover:bg-hover'
                )}
              >
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-bar text-muted shrink-0">
                  {cmd.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-none">{cmd.title}</div>
                  <div className="text-[11px] text-muted truncate mt-1">{cmd.description}</div>
                </div>
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
