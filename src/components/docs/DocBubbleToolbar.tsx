import React from 'react';
import { createPortal } from 'react-dom';
import { Editor } from '@tiptap/react';
import {
  TextB as Bold,
  TextItalic as Italic,
  TextStrikethrough as Strikethrough,
  Code,
  Quotes as Quote,
  CheckSquare
} from '@phosphor-icons/react';
import { cn } from '../../lib/cn';

interface DocBubbleToolbarProps {
  editor: Editor | null;
  position: { top: number; left: number } | null;
}

export const DocBubbleToolbar: React.FC<DocBubbleToolbarProps> = ({ editor, position }) => {
  if (!editor || !position) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 9998
      }}
      onMouseDown={(e) => e.preventDefault()}
      className="flex items-center gap-0.5 rounded-xl border border-border bg-surface px-1.5 py-1 shadow-card-drag animate-yuu-crossfade"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={cn(
          'px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors',
          editor.isActive('paragraph') && !editor.isActive('heading')
            ? 'bg-project-soft text-project-solid'
            : 'text-muted hover:text-text hover:bg-hover'
        )}
        title="Paragraf"
      >
        T
      </button>
      {([1, 2, 3] as const).map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          className={cn(
            'px-1.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors',
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
        className={cn(
          'p-1.5 rounded-lg cursor-pointer transition-colors',
          editor.isActive('bold')
            ? 'bg-project-soft text-project-solid'
            : 'text-muted hover:text-text hover:bg-hover'
        )}
        title="Tebal"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'p-1.5 rounded-lg cursor-pointer transition-colors',
          editor.isActive('italic')
            ? 'bg-project-soft text-project-solid'
            : 'text-muted hover:text-text hover:bg-hover'
        )}
        title="Miring"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          'p-1.5 rounded-lg cursor-pointer transition-colors',
          editor.isActive('strike')
            ? 'bg-project-soft text-project-solid'
            : 'text-muted hover:text-text hover:bg-hover'
        )}
        title="Coret"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          'p-1.5 rounded-lg cursor-pointer transition-colors',
          editor.isActive('code')
            ? 'bg-project-soft text-project-solid'
            : 'text-muted hover:text-text hover:bg-hover'
        )}
        title="Inline Code"
      >
        <Code className="h-3.5 w-3.5" />
      </button>
      <div className="h-4 w-px bg-border mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          'p-1.5 rounded-lg cursor-pointer transition-colors',
          editor.isActive('blockquote')
            ? 'bg-project-soft text-project-solid'
            : 'text-muted hover:text-text hover:bg-hover'
        )}
        title="Kutipan"
      >
        <Quote className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn(
          'p-1.5 rounded-lg cursor-pointer transition-colors',
          editor.isActive('taskList')
            ? 'bg-project-soft text-project-solid'
            : 'text-muted hover:text-text hover:bg-hover'
        )}
        title="Checklist"
      >
        <CheckSquare className="h-3.5 w-3.5" />
      </button>
    </div>,
    document.body
  );
};
