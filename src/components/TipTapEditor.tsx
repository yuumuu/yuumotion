import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  ImageIcon,
  Undo,
  Redo,
  Sparkles
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string, json: Record<string, unknown>) => void;
}

interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  action: (editor: ReturnType<typeof useEditor>) => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Placeholder.configure({
        placeholder: "Type '/' for Notion-style block commands, or start writing notes..."
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      })
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML(), currentEditor.getJSON() as Record<string, unknown>);

      const { from } = currentEditor.state.selection;
      const textBefore = currentEditor.state.doc.textBetween(Math.max(0, from - 20), from, '\n', '\0');
      const slashMatch = textBefore.match(/\/([a-zA-Z0-9]*)$/);

      if (slashMatch) {
        setSlashQuery(slashMatch[1].toLowerCase());
        const coords = currentEditor.view.coordsAtPos(from);
        if (editorContainerRef.current) {
          const containerRect = editorContainerRef.current.getBoundingClientRect();
          setMenuPosition({
            top: coords.bottom - containerRect.top + 8,
            left: Math.min(coords.left - containerRect.left, containerRect.width - 240)
          });
        }
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    }
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      if (!editor.isFocused) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  const executeSlashAction = (action: (ed: typeof editor) => void) => {
    if (!editor) return;

    const { from } = editor.state.selection;
    const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, '\n', '\0');
    const slashMatch = textBefore.match(/\/([a-zA-Z0-9]*)$/);

    if (slashMatch) {
      const matchLength = slashMatch[0].length;
      editor.commands.deleteRange({ from: from - matchLength, to: from });
    }

    action(editor);
    setShowSlashMenu(false);
  };

  const slashCommands: SlashCommand[] = [
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Large section heading',
      icon: Heading1,
      action: (ed) => ed?.chain().focus().toggleHeading({ level: 1 }).run()
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium sub-heading',
      icon: Heading2,
      action: (ed) => ed?.chain().focus().toggleHeading({ level: 2 }).run()
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small group heading',
      icon: Heading3,
      action: (ed) => ed?.chain().focus().toggleHeading({ level: 3 }).run()
    },
    {
      id: 'task',
      title: 'To-do list',
      description: 'Track tasks with interactive checkboxes',
      icon: CheckSquare,
      action: (ed) => ed?.chain().focus().toggleTaskList().run()
    },
    {
      id: 'bullet',
      title: 'Bulleted list',
      description: 'Create a simple bulleted list',
      icon: List,
      action: (ed) => ed?.chain().focus().toggleBulletList().run()
    },
    {
      id: 'numbered',
      title: 'Numbered list',
      description: 'Create a list with numbering',
      icon: ListOrdered,
      action: (ed) => ed?.chain().focus().toggleOrderedList().run()
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Capture a quote or highlight statement',
      icon: Quote,
      action: (ed) => ed?.chain().focus().toggleBlockquote().run()
    },
    {
      id: 'code',
      title: 'Code Block',
      description: 'Capture code snippet with monospace font',
      icon: Code,
      action: (ed) => ed?.chain().focus().toggleCodeBlock().run()
    },
    {
      id: 'divider',
      title: 'Divider',
      description: 'Visually divide blocks with a line',
      icon: Minus,
      action: (ed) => ed?.chain().focus().setHorizontalRule().run()
    },
    {
      id: 'image',
      title: 'Upload Image',
      description: 'Embed an image from your device',
      icon: ImageIcon,
      action: () => fileInputRef.current?.click()
    }
  ];

  const filteredCommands = slashCommands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(slashQuery) ||
      cmd.description.toLowerCase().includes(slashQuery) ||
      cmd.id.includes(slashQuery)
  );

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      editor.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!editor) return null;

  return (
    <div
      ref={editorContainerRef}
      className="relative flex flex-col rounded-xl border border-appflowy-border bg-appflowy-bg dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between border-b border-appflowy-border px-3 py-1.5 text-xs dark:border-appflowy-darkBorder">
        <div className="flex flex-wrap items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('bold') ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('italic') ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('strike') ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('code') ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </button>

          <div className="mx-1 h-3.5 w-px bg-appflowy-border dark:bg-appflowy-darkBorder" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('heading', { level: 1 }) ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('heading', { level: 2 }) ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('taskList') ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Task List"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('bulletList') ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Bulleted List"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 ${
              editor.isActive('blockquote') ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : ''
            }`}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
            title="Insert Image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="flex h-6 w-6 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 disabled:opacity-30 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
            title="Undo"
          >
            <Undo className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="flex h-6 w-6 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-200/60 disabled:opacity-30 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
            title="Redo"
          >
            <Redo className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="p-4 text-xs leading-relaxed text-appflowy-text dark:text-appflowy-darkText">
        <EditorContent editor={editor} />
      </div>

      {showSlashMenu && filteredCommands.length > 0 && (
        <div
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          className="absolute z-50 max-h-64 w-60 overflow-y-auto rounded-xl border border-appflowy-border bg-appflowy-surface p-1.5 shadow-2xl backdrop-blur-md dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface"
        >
          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Sparkles className="h-3 w-3" />
            <span>Notion Blocks</span>
          </div>
          {filteredCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                type="button"
                onClick={() => executeSlashAction(cmd.action)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-medium text-appflowy-text dark:text-appflowy-darkText">
                    {cmd.title}
                  </div>
                  <div className="text-[10px] text-appflowy-muted dark:text-appflowy-darkMuted">
                    {cmd.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
