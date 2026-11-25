import React from 'react';
import { DownloadSimple, Trash, FileText } from '@phosphor-icons/react';
import { CardAttachment } from '../../types/board';

export interface AttachmentCardProps {
  attachment: CardAttachment;
  onRemove?: () => void;
  readOnly?: boolean;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  onRemove,
  readOnly = false
}) => {
  const isImage = attachment.mimeType.startsWith('image/');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="group flex items-center justify-between rounded-xl border border-appflowy-border/80 bg-appflowy-bg/70 p-2.5 text-xs transition-colors hover:border-neutral-300 dark:border-appflowy-darkBorder/80 dark:bg-appflowy-darkBg/70 dark:hover:border-neutral-700">
      <div className="flex items-center gap-2.5 min-w-0">
        {isImage ? (
          <img
            src={attachment.url}
            alt={attachment.name}
            className="h-9 w-9 rounded-lg object-cover border border-border shrink-0"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-project-soft text-project-solid shrink-0">
            <FileText className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-text truncate">
            {attachment.name}
          </p>
          <p className="text-[10px] text-muted">
            {formatFileSize(attachment.size)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <a
          href={attachment.url}
          download={attachment.name}
          className="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-hover hover:text-project-solid cursor-pointer"
          title="Unduh file"
        >
          <DownloadSimple className="h-3.5 w-3.5" />
        </a>
        {!readOnly && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded text-appflowy-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer"
            title="Hapus file"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};