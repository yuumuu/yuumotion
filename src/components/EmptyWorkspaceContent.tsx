import React from 'react';
import { Kanban, FileText, Sparkle, Plus } from '@phosphor-icons/react';
import { Button } from './ui';

interface EmptyWorkspaceContentProps {
  workspaceName: string;
  canEdit: boolean;
  onCreateBoard: () => void;
  onOpenTemplates: () => void;
  onCreatePage: () => void;
}

export const EmptyWorkspaceContent: React.FC<EmptyWorkspaceContentProps> = ({
  workspaceName,
  canEdit,
  onCreateBoard,
  onOpenTemplates,
  onCreatePage
}) => {
  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-8 text-center shadow-card-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-project-soft text-project-solid">
          <Kanban className="h-6 w-6" />
        </div>
        <h2 className="font-display text-lg font-bold text-text mb-1.5">
          {workspaceName} masih kosong
        </h2>
        <p className="text-xs text-muted leading-relaxed mb-6">
          Belum ada papan Kanban maupun dokumen di workspace ini. Mulai buat papan baru, pilih template siap pakai, atau tulis dokumen pertama kamu.
        </p>

        {canEdit ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Button
              variant="primary"
              size="sm"
              className="justify-center"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={onCreateBoard}
            >
              Buat Papan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="justify-center"
              leftIcon={<Sparkle className="h-3.5 w-3.5" />}
              onClick={onOpenTemplates}
            >
              Dari Template
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="justify-center"
              leftIcon={<FileText className="h-3.5 w-3.5" />}
              onClick={onCreatePage}
            >
              Buat Dokumen
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted italic">
            Hubungi admin workspace untuk menambahkan papan atau dokumen.
          </p>
        )}
      </div>
    </div>
  );
};
