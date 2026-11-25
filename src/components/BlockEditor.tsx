import React, { useState, useEffect, useRef } from 'react';
import {
  TextHOne as Heading1,
  TextHTwo as Heading2,
  TextHThree as Heading3,
  TextAlignLeft as AlignLeft,
  ListBullets as List,
  ListNumbers as ListOrdered,
  Quotes as Quote,
  Code as Code2,
  Minus,
  Plus,
  Trash as Trash2,
  Eye,
  PenNib as PenTool
} from '@phosphor-icons/react';

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bullet'
  | 'numbered'
  | 'quote'
  | 'code'
  | 'divider';

export interface EditorBlock {
  id: string;
  type: BlockType;
  content: string;
}

interface BlockEditorProps {
  value: string;
  onChange: (markdown: string) => void;
}

function parseMarkdownToBlocks(markdown: string): EditorBlock[] {
  if (!markdown || !markdown.trim()) {
    return [{ id: 'b-init', type: 'paragraph', content: '' }];
  }

  const lines = markdown.split('\n');
  const blocks: EditorBlock[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          id: `b-${i}-${Date.now()}`,
          type: 'code',
          content: codeBuffer.join('\n')
        });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push({ id: `b-${i}`, type: 'heading1', content: line.slice(2) });
    } else if (line.startsWith('## ')) {
      blocks.push({ id: `b-${i}`, type: 'heading2', content: line.slice(3) });
    } else if (line.startsWith('### ')) {
      blocks.push({ id: `b-${i}`, type: 'heading3', content: line.slice(4) });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ id: `b-${i}`, type: 'bullet', content: line.slice(2) });
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push({ id: `b-${i}`, type: 'numbered', content: line.replace(/^\d+\.\s/, '') });
    } else if (line.startsWith('> ')) {
      blocks.push({ id: `b-${i}`, type: 'quote', content: line.slice(2) });
    } else if (line.trim() === '---') {
      blocks.push({ id: `b-${i}`, type: 'divider', content: '' });
    } else {
      blocks.push({ id: `b-${i}`, type: 'paragraph', content: line });
    }
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({
      id: `b-code-tail`,
      type: 'code',
      content: codeBuffer.join('\n')
    });
  }

  return blocks.length > 0 ? blocks : [{ id: 'b-init', type: 'paragraph', content: '' }];
}

function serializeBlocksToMarkdown(blocks: EditorBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'heading1':
          return `# ${b.content}`;
        case 'heading2':
          return `## ${b.content}`;
        case 'heading3':
          return `### ${b.content}`;
        case 'bullet':
          return `- ${b.content}`;
        case 'numbered':
          return `1. ${b.content}`;
        case 'quote':
          return `> ${b.content}`;
        case 'code':
          return `\`\`\`\n${b.content}\n\`\`\``;
        case 'divider':
          return '---';
        case 'paragraph':
        default:
          return b.content;
      }
    })
    .join('\n');
}

const BLOCK_DEFINITIONS: { type: BlockType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'paragraph', label: 'Text', icon: AlignLeft },
  { type: 'heading1', label: 'Heading 1', icon: Heading1 },
  { type: 'heading2', label: 'Heading 2', icon: Heading2 },
  { type: 'heading3', label: 'Heading 3', icon: Heading3 },
  { type: 'bullet', label: 'Bullet List', icon: List },
  { type: 'numbered', label: 'Numbered List', icon: ListOrdered },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'code', label: 'Code Block', icon: Code2 },
  { type: 'divider', label: 'Divider', icon: Minus }
];

export const BlockEditor: React.FC<BlockEditorProps> = ({ value, onChange }) => {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => parseMarkdownToBlocks(value));
  const [rawMode, setRawMode] = useState(false);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setBlocks(parseMarkdownToBlocks(value));
  }, [value]);

  const updateBlocks = (next: EditorBlock[]) => {
    setBlocks(next);
    isInternalChange.current = true;
    onChange(serializeBlocksToMarkdown(next));
  };

  const handleContentChange = (id: string, nextContent: string) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, content: nextContent } : b));
    updateBlocks(next);
  };

  const handleTypeChange = (id: string, nextType: BlockType) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, type: nextType } : b));
    updateBlocks(next);
  };

  const handleAddBlockAfter = (index: number, type: BlockType = 'paragraph') => {
    const newBlock: EditorBlock = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      content: ''
    };
    const next = [...blocks];
    next.splice(index + 1, 0, newBlock);
    updateBlocks(next);
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      updateBlocks([{ id: 'b-init', type: 'paragraph', content: '' }]);
      return;
    }
    const next = blocks.filter((b) => b.id !== id);
    updateBlocks(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, block: EditorBlock) => {
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault();
      const nextType = block.type === 'bullet' ? 'bullet' : block.type === 'numbered' ? 'numbered' : 'paragraph';
      handleAddBlockAfter(index, nextType);
    } else if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      handleDeleteBlock(block.id);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-appflowy-border bg-appflowy-bg dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg">
      <div className="flex items-center justify-between border-b border-appflowy-border px-3 py-2 text-xs dark:border-appflowy-darkBorder">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {BLOCK_DEFINITIONS.slice(0, 6).map((def) => {
            const Icon = def.icon;
            return (
              <button
                key={def.type}
                type="button"
                onClick={() => handleAddBlockAfter(blocks.length - 1, def.type)}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-appflowy-muted hover:bg-neutral-200/60 hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-neutral-800 dark:hover:text-appflowy-darkText"
                title={`Insert ${def.label}`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{def.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 pl-2">
          <button
            type="button"
            onClick={() => setRawMode(!rawMode)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-appflowy-muted hover:bg-neutral-200/60 dark:text-appflowy-darkMuted dark:hover:bg-neutral-800"
          >
            {rawMode ? (
              <>
                <Eye className="h-3 w-3" />
                <span>Blocks</span>
              </>
            ) : (
              <>
                <PenTool className="h-3 w-3" />
                <span>Raw Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-3.5">
        {rawMode ? (
          <textarea
            rows={10}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type raw markdown..."
            className="w-full resize-y font-mono text-xs leading-relaxed text-appflowy-text bg-transparent focus:outline-none dark:text-appflowy-darkText"
          />
        ) : (
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className="group relative flex items-start gap-2 rounded-lg py-1 px-1.5 transition-colors hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40"
              >
                <div className="mt-1 flex flex-shrink-0 items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  <select
                    value={block.type}
                    onChange={(e) => handleTypeChange(block.id, e.target.value as BlockType)}
                    className="h-5 cursor-pointer rounded border border-transparent bg-transparent text-[10px] text-appflowy-muted hover:border-appflowy-border hover:bg-appflowy-surface dark:text-appflowy-darkMuted dark:hover:bg-appflowy-darkSurface"
                  >
                    {BLOCK_DEFINITIONS.map((def) => (
                      <option key={def.type} value={def.type}>
                        {def.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0 flex-1">
                  {block.type === 'heading1' && (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      placeholder="Heading 1"
                      className="w-full bg-transparent text-lg font-bold tracking-tight text-appflowy-text focus:outline-none dark:text-appflowy-darkText"
                    />
                  )}

                  {block.type === 'heading2' && (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      placeholder="Heading 2"
                      className="w-full bg-transparent text-base font-semibold tracking-tight text-appflowy-text focus:outline-none dark:text-appflowy-darkText"
                    />
                  )}

                  {block.type === 'heading3' && (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      placeholder="Heading 3"
                      className="w-full bg-transparent text-sm font-semibold text-appflowy-text focus:outline-none dark:text-appflowy-darkText"
                    />
                  )}

                  {block.type === 'bullet' && (
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => handleContentChange(block.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, block)}
                        placeholder="List item..."
                        className="w-full bg-transparent text-xs text-appflowy-text focus:outline-none dark:text-appflowy-darkText"
                      />
                    </div>
                  )}

                  {block.type === 'numbered' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => handleContentChange(block.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, block)}
                        placeholder="List item..."
                        className="w-full bg-transparent text-xs text-appflowy-text focus:outline-none dark:text-appflowy-darkText"
                      />
                    </div>
                  )}

                  {block.type === 'quote' && (
                    <div className="flex items-start gap-2 border-l-2 border-purple-400 pl-2 dark:border-purple-600">
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => handleContentChange(block.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, block)}
                        placeholder="Quote text..."
                        className="w-full bg-transparent text-xs italic text-neutral-600 focus:outline-none dark:text-neutral-300"
                      />
                    </div>
                  )}

                  {block.type === 'code' && (
                    <textarea
                      rows={3}
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      placeholder="// Insert code here..."
                      className="w-full rounded-md border border-neutral-200 bg-neutral-100 p-2 font-mono text-[11px] text-neutral-800 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                    />
                  )}

                  {block.type === 'divider' && (
                    <hr className="my-2 border-appflowy-border dark:border-appflowy-darkBorder" />
                  )}

                  {block.type === 'paragraph' && (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, block)}
                      placeholder="Type text or choose a block format..."
                      className="w-full bg-transparent text-xs text-appflowy-text focus:outline-none dark:text-appflowy-darkText"
                    />
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleAddBlockAfter(index)}
                    className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                    title="Insert block below"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(block.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    title="Delete block"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
