import React, { useState } from 'react';
import {
  FileText,
  FolderSimple,
  Plus,
  BookOpen,
  Stack,
  Compass,
  PencilSimple,
  FilePlus,
  Trash
} from '@phosphor-icons/react';
import { NotionPage } from '../../types/board';
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu';

const QUICK_DOC_TEMPLATES = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    desc: 'Notulensi rapat tim, poin keputusan, dan daftar tindak lanjut.',
    docTitle: 'Notulensi Rapat Tim',
    icon: <BookOpen className="h-4 w-4" />,
    docIcon: 'book',
    contentHtml:
      '<h1>Agenda Rapat</h1><p>Ringkasan topik pembahasan tim.</p><h2>Poin Keputusan</h2><ul><li>Prioritas sprint minggu ini.</li></ul>'
  },
  {
    id: 'prd-spec',
    title: 'Product Specs (PRD)',
    desc: 'Dokumen kebutuhan fitur, sasaran pengguna, dan kriteria rilis.',
    docTitle: 'Product Requirement Document',
    icon: <Stack className="h-4 w-4" />,
    docIcon: 'layers',
    contentHtml:
      '<h1>1. Latar Belakang</h1><p>Ringkasan masalah dan tujuan fitur.</p><h2>2. Sasaran Pengguna</h2><p>Pengguna utama dan skenario pemakaian.</p>'
  },
  {
    id: 'sprint-roadmap',
    title: 'Sprint Roadmap',
    desc: 'Target sprint, tonggak rilis, dan dependensi lintas tim.',
    docTitle: 'Sprint Planning Roadmap',
    icon: <Compass className="h-4 w-4" />,
    docIcon: 'compass',
    contentHtml:
      '<h1>Sprint Goal</h1><p>Target utama yang ingin dicapai pada siklus ini.</p><ul><li>Deliverable utama</li></ul>'
  }
];

interface WorkspaceDocsSectionProps {
  allPages: NotionPage[];
  filteredPages: NotionPage[];
  rootPages: NotionPage[];
  childCountByPageId: Record<string, number>;
  canEdit: boolean;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onAddPageFromTemplate?: (template: { title: string; contentHtml: string; icon?: string }) => void;
  onRenamePage?: (pageId: string, newTitle: string) => void;
  onDeletePage?: (pageId: string) => void;
  onAddSubPage?: (parentId: string) => void;
}

export const WorkspaceDocsSection: React.FC<WorkspaceDocsSectionProps> = ({
  allPages,
  filteredPages,
  rootPages,
  childCountByPageId,
  canEdit,
  onSelectPage,
  onAddPage,
  onAddPageFromTemplate,
  onRenamePage,
  onDeletePage,
  onAddSubPage
}) => {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; page: NotionPage } | null>(null);

  const commitRename = (pageId: string) => {
    const trimmed = editingTitle.trim();
    setEditingPageId(null);
    if (trimmed && onRenamePage) {
      onRenamePage(pageId, trimmed);
    }
  };

  const buildPageMenu = (page: NotionPage): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [
      {
        id: 'open',
        label: 'Buka Dokumen',
        icon: <FileText className="h-3.5 w-3.5" />,
        onClick: () => onSelectPage(page.id)
      }
    ];
    if (canEdit) {
      if (onRenamePage) {
        items.push({
          id: 'rename',
          label: 'Ubah Nama',
          icon: <PencilSimple className="h-3.5 w-3.5" />,
          onClick: () => {
            setEditingPageId(page.id);
            setEditingTitle(page.title || 'Untitled Document');
          }
        });
      }
      if (onAddSubPage) {
        items.push({
          id: 'add-sub',
          label: 'Tambah Sub-halaman',
          icon: <FilePlus className="h-3.5 w-3.5" />,
          onClick: () => onAddSubPage(page.id)
        });
      }
      if (onDeletePage) {
        items.push({
          id: 'delete',
          label: 'Hapus Dokumen',
          icon: <Trash className="h-3.5 w-3.5" />,
          variant: 'danger',
          onClick: () => onDeletePage(page.id)
        });
      }
    }
    return items;
  };

  return (
    <section className="space-y-4">
      <div className="space-y-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
          Folder & Dokumen ({filteredPages.length})
        </h2>

        <div className="grid grid-cols-2 gap-[var(--space-card-gap)] sm:grid-cols-3 xl:grid-cols-4">
          {rootPages.map((page) => {
            const subCount = childCountByPageId[page.id] || 0;
            return (
              <div
                key={page.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (editingPageId !== page.id) onSelectPage(page.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, page });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editingPageId !== page.id) onSelectPage(page.id);
                }}
                className="group flex flex-col items-start justify-between rounded-2xl border border-border bg-surface p-[var(--space-card-p)] text-left transition-[border-color,background-color,transform] duration-150 ease-out hover:border-project-ring hover:bg-hover/30 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer h-full"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bar text-text border border-border/70">
                    {subCount > 0 ? (
                      <FolderSimple className="h-4 w-4 text-project-solid" weight="duotone" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted group-hover:text-project-solid" />
                    )}
                  </div>
                  {subCount > 0 && (
                    <span className="rounded-full bg-hover px-2 py-0.5 font-mono text-[10px] font-semibold text-muted">
                      {subCount} sub
                    </span>
                  )}
                </div>
                <div className="mt-3 w-full">
                  {editingPageId === page.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingTitle}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => commitRename(page.id)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') commitRename(page.id);
                        if (e.key === 'Escape') setEditingPageId(null);
                      }}
                      className="w-full rounded-lg border border-project-accent bg-bg px-1.5 py-0.5 text-xs font-bold text-text focus:outline-none"
                    />
                  ) : (
                    <div className="truncate font-display text-xs font-bold text-text group-hover:text-project-solid">
                      {page.title || 'Untitled Document'}
                    </div>
                  )}
                  <div className="mt-0.5 font-mono text-[10px] text-muted">
                    {new Date(page.updatedAt || Date.now()).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            );
          })}

          {canEdit && (
            <button
              type="button"
              onClick={onAddPage}
              className="flex min-h-[108px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-surface/40 p-[var(--space-card-p)] text-xs font-semibold text-muted transition-[border-color,color,background-color,transform] duration-150 ease-out hover:border-project-accent hover:bg-project-soft/20 hover:text-project-solid active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Dokumen</span>
            </button>
          )}
        </div>
      </div>

      {canEdit && onAddPageFromTemplate && (
        <div className="space-y-2.5">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Template Dokumen Cepat
          </h3>
          <div className="grid grid-cols-1 gap-[var(--space-card-gap)] sm:grid-cols-3">
            {QUICK_DOC_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-[var(--space-card-p)]"
              >
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bar text-text border border-border/70">
                    {tpl.icon}
                  </div>
                  <div className="mt-2.5 font-display text-xs font-bold text-text">{tpl.title}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{tpl.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onAddPageFromTemplate({
                      title: tpl.docTitle,
                      contentHtml: tpl.contentHtml,
                      icon: tpl.docIcon
                    })
                  }
                  className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-bar px-2.5 py-1 text-[11px] font-medium text-text transition-colors hover:border-project-accent hover:text-project-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Gunakan</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredPages.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Daftar Dokumen
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_96px] gap-2 border-b border-border bg-bar/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted">
              <span>Nama Dokumen</span>
              <span>Induk</span>
              <span className="text-right">Diperbarui</span>
            </div>
            <div className="divide-y divide-border/60">
              {filteredPages.map((page) => {
                const parent = page.parentId ? allPages.find((p) => p.id === page.parentId) : null;
                return (
                  <div
                    key={page.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (editingPageId !== page.id) onSelectPage(page.id);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, page });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editingPageId !== page.id) onSelectPage(page.id);
                    }}
                    className="grid w-full grid-cols-[minmax(0,1fr)_120px_96px] items-center gap-2 px-4 h-[var(--space-row-h)] text-left text-xs transition-colors hover:bg-hover/50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-project-accent cursor-pointer"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-project-solid shrink-0" />
                      {editingPageId === page.id ? (
                        <input
                          type="text"
                          autoFocus
                          value={editingTitle}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => commitRename(page.id)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') commitRename(page.id);
                            if (e.key === 'Escape') setEditingPageId(null);
                          }}
                          className="w-full rounded border border-project-accent bg-bg px-1.5 py-0.5 text-xs font-medium text-text focus:outline-none"
                        />
                      ) : (
                        <span className="truncate font-medium text-text">
                          {page.title || 'Untitled Document'}
                        </span>
                      )}
                    </span>
                    <span className="truncate text-[11px] text-muted">
                      {parent ? parent.title : 'Root'}
                    </span>
                    <span className="text-right font-mono text-[10px] text-muted">
                      {new Date(page.updatedAt || Date.now()).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ContextMenu
        isOpen={Boolean(contextMenu)}
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        items={contextMenu ? buildPageMenu(contextMenu.page) : []}
        onClose={() => setContextMenu(null)}
      />
    </section>
  );
};
