import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import {
  TextB as Bold,
  TextItalic as Italic,
  TextStrikethrough as Strikethrough,
  Code,
  ListBullets as List,
  CheckSquare,
  Quotes as Quote,
  Image as ImageIcon,
  ArrowCounterClockwise as Undo,
  ArrowClockwise as Redo,
  DownloadSimple,
  Table as TableIcon
} from '@phosphor-icons/react';
import { cn } from '../../lib/cn';
import { createSlashCommands, SlashCategory, SlashCommandItem } from './docSlashCommands';
import { DocSlashMenu } from './DocSlashMenu';
import { DocBubbleToolbar } from './DocBubbleToolbar';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string, json: Record<string, unknown>) => void;
  editable?: boolean;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  editable = true
}) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashCategory, setSlashCategory] = useState<SlashCategory>('Semua');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [bubblePosition, setBubblePosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: "Ketik '/' untuk perintah blok Notion-style atau mulai menulis..."
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: content || '<p></p>',
    onSelectionUpdate: ({ editor: currentEditor }) => {
      if (!editable) {
        setBubblePosition(null);
        return;
      }
      const { from, to, empty } = currentEditor.state.selection;
      if (empty || to - from < 1) {
        setBubblePosition(null);
        return;
      }
      const start = currentEditor.view.coordsAtPos(from);
      const end = currentEditor.view.coordsAtPos(to);
      const left = Math.max(140, Math.min((start.left + end.left) / 2, window.innerWidth - 140));
      const top = Math.max(52, Math.min(start.top, end.top) - 10);
      setBubblePosition({ top, left });
    },
    onBlur: () => {
      setTimeout(() => setBubblePosition(null), 150);
    },
    onUpdate: ({ editor: currentEditor }) => {
      setSaveStatus('saving');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus('saved'), 1500);
      onChange(currentEditor.getHTML(), currentEditor.getJSON() as Record<string, unknown>);

      const { from } = currentEditor.state.selection;
      const textBefore = currentEditor.state.doc.textBetween(Math.max(0, from - 30), from, '\n', '\0');
      const slashMatch = textBefore.match(/\/([a-zA-Z0-9-]*)$/);

      if (slashMatch) {
        setSlashQuery(slashMatch[1].toLowerCase());
        setSelectedIndex(0);
        const coords = currentEditor.view.coordsAtPos(from);
        const menuW = 320;
        const menuH = 340;
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
    if (editor && content && editor.getHTML() !== content && !editor.isFocused) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const allCommands = useMemo(
    () =>
      createSlashCommands(() => {
        setShowSlashMenu(false);
        fileInputRef.current?.click();
      }),
    []
  );

  const filteredCommands = useMemo(
    () =>
      allCommands.filter((cmd) => {
        if (slashCategory !== 'Semua' && cmd.category !== slashCategory) return false;
        if (!slashQuery) return true;
        return (
          cmd.title.toLowerCase().includes(slashQuery) ||
          cmd.description.toLowerCase().includes(slashQuery) ||
          (cmd.keywords || '').toLowerCase().includes(slashQuery)
        );
      }),
    [allCommands, slashCategory, slashQuery]
  );

  const handleSelectCommand = (cmd: SlashCommandItem) => {
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
    const div = document.createElement('div');
    div.innerHTML = editor.getHTML();

    const convert = (el: Element): string => {
      const tag = el.tagName?.toLowerCase();
      const inner = Array.from(el.childNodes)
        .map((n) => (n.nodeType === Node.TEXT_NODE ? n.textContent || '' : convert(n as Element)))
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
    <div onKeyDown={handleKeyDown} className="relative w-full select-text">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {editable && editor && (
        <div className="mb-3 flex flex-wrap items-center gap-0.5 rounded-xl border border-border bg-bar p-1 shadow-2xs">
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={cn(
                'px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer',
                editor.isActive('heading', { level })
                  ? 'bg-project-soft text-project-solid'
                  : 'text-muted hover:text-text hover:bg-hover'
              )}
              title={`Heading ${level}`}
            >
              H{level}
            </button>
          ))}
          <div className="h-4 w-px bg-border mx-1" />
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
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className={cn('p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover cursor-pointer', editor.isActive('table') && 'bg-surface text-text font-bold')}
            title="Sisipkan Tabel 3x3"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </button>
          {editor.isActive('table') && (
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface px-1 py-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="px-1.5 py-0.5 rounded text-muted hover:text-text hover:bg-hover cursor-pointer"
              >
                +Kolom
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="px-1.5 py-0.5 rounded text-muted hover:text-text hover:bg-hover cursor-pointer"
              >
                +Baris
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="px-1.5 py-0.5 rounded text-danger hover:bg-danger/10 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          )}
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

      <EditorContent
        editor={editor}
        className={cn(
          'max-w-none focus:outline-none min-h-[240px]',
          !editable && 'opacity-90 pointer-events-none'
        )}
      />

      <DocBubbleToolbar editor={editor} position={bubblePosition} />

      <DocSlashMenu
        isOpen={showSlashMenu && editable}
        position={menuPosition}
        slashQuery={slashQuery}
        activeCategory={slashCategory}
        onSelectCategory={(cat) => {
          setSlashCategory(cat);
          setSelectedIndex(0);
        }}
        commands={filteredCommands}
        selectedIndex={selectedIndex}
        onSelectCommand={handleSelectCommand}
      />
    </div>
  );
};
