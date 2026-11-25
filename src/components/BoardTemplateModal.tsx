import React, { useState } from 'react';
import {
  BOARD_TEMPLATES,
  TEMPLATE_CATEGORIES,
  BoardTemplate,
  TemplateCategory
} from '../data/boardTemplates';
import { Dialog, Button } from './ui';
import { cn } from '../lib/cn';
import { Kanban, ArrowRight } from '@phosphor-icons/react';

interface BoardTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: BoardTemplate) => void;
}

export const BoardTemplateModal: React.FC<BoardTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'Semua'>('Semua');

  const filtered =
    selectedCategory === 'Semua'
      ? BOARD_TEMPLATES
      : BOARD_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <Kanban className="h-4 w-4 text-project-solid" />
          <span>Buat Papan dari Template</span>
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted">
            Pilih template untuk langsung membuat kolom dan contoh kartu.
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {(['Semua', ...TEMPLATE_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                selectedCategory === cat
                  ? 'bg-project-solid text-white shadow-2xs'
                  : 'bg-bar text-muted hover:text-text hover:bg-hover'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {filtered.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                onSelectTemplate(tpl);
                onClose();
              }}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-bar/50 p-4 text-left hover:border-project-accent hover:bg-project-soft/20 transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tpl.icon}</span>
                    <span className="font-display text-sm font-bold text-text group-hover:text-project-solid transition-colors">
                      {tpl.name}
                    </span>
                  </div>
                  <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted border border-border">
                    {tpl.category}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">{tpl.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-[11px] text-muted font-mono">
                  {tpl.columns.length} kolom • {tpl.sampleCards.length} contoh kartu
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-project-solid opacity-0 group-hover:opacity-100 transition-opacity">
                  Pakai <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
};
