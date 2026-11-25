import React, { useState } from 'react';
import { Kanban, FileText, Sparkle, SquaresFour, Plus } from '@phosphor-icons/react';
import { Dialog, Button, Input } from './ui';
import { cn } from '../lib/cn';
import { WorkspaceTemplateType } from '../types/board';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string, template: WorkspaceTemplateType) => void;
}

const WORKSPACE_ICONS = ['🚀', '✨', '📋', '💡', '🎯', '⚡', '🌿', '🎨'];

export const WORKSPACE_TEMPLATES: {
  id: WorkspaceTemplateType;
  label: string;
  badge?: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'full',
    label: 'Lengkap (Full)',
    badge: 'Rekomendasi',
    desc: 'Papan Kanban + Dokumen TipTap siap pakai.',
    icon: <Sparkle className="h-4 w-4" weight="fill" />
  },
  {
    id: 'board',
    label: 'Board Only',
    desc: 'Fokus Kanban, Kalender, Timeline, & Tabel.',
    icon: <Kanban className="h-4 w-4" />
  },
  {
    id: 'docs',
    label: 'Docs Only',
    desc: 'Fokus catatan, wiki, & dokumen tim TipTap.',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 'plain',
    label: 'Kosong (Plain)',
    desc: 'Ruang kerja kosong, atur sendiri dari awal.',
    icon: <SquaresFour className="h-4 w-4" />
  }
];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [template, setTemplate] = useState<WorkspaceTemplateType>('full');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || 'Workspace Baru';
    onCreate(trimmed, icon, template);
    setName('');
    setIcon('🚀');
    setTemplate('full');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Workspace Baru"
      description="Pilih ikon, beri nama, dan tentukan struktur awal ruang kerja Anda."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-text">Ikon Workspace</label>
          <div className="flex flex-wrap gap-2">
            {WORKSPACE_ICONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setIcon(item)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-transform cursor-pointer',
                  icon === item
                    ? 'border-project-accent bg-project-soft scale-105 shadow-2xs'
                    : 'border-border bg-bg hover:bg-hover'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text">Nama Workspace</label>
          <Input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Tim Produk, Catatan Pribadi..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-text">Struktur Awal</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {WORKSPACE_TEMPLATES.map((tpl) => {
              const active = template === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplate(tpl.id)}
                  className={cn(
                    'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors cursor-pointer',
                    active
                      ? 'border-project-accent bg-project-soft/60 text-text'
                      : 'border-border bg-bg text-text hover:bg-hover'
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg',
                          active ? 'bg-project-solid text-white' : 'bg-surface text-project-solid'
                        )}
                      >
                        {tpl.icon}
                      </span>
                      <span className="text-xs font-bold font-display">{tpl.label}</span>
                    </div>
                    {tpl.badge && (
                      <span className="rounded-md bg-project-solid px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        {tpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-snug text-muted">{tpl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Buat Workspace
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
