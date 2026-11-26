import React, { useRef } from 'react';
import { Card, CardAttachment } from '../../types/board';
import { AttachmentCard, Button } from '../ui';
import { Paperclip } from '@phosphor-icons/react';

interface CardAttachmentsSectionProps {
  attachments: CardAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<CardAttachment[]>>;
  syncChanges: (patch: Partial<Card>) => void;
  addActivity: (action: string, extraPatch?: Partial<Card>) => void;
}

export const CardAttachmentsSection: React.FC<CardAttachmentsSectionProps> = ({
  attachments,
  setAttachments,
  syncChanges,
  addActivity
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: CardAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          url: reader.result as string,
          createdAt: Date.now()
        };
        setAttachments((prev) => {
          const next = [...prev, newAttachment];
          addActivity(`Mengunggah lampiran "${file.name}"`, { attachments: next });
          return next;
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5" />
          Lampiran Dokumen & Gambar
        </label>
        <div className="flex gap-2 items-center">
          <Button
            size="xs"
            variant="secondary"
            leftIcon={<Paperclip className="w-3 h-3" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Unggah File / Gambar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
          {attachments.map((att) => (
            <AttachmentCard
              key={att.id}
              attachment={att}
              onRemove={() => {
                const next = attachments.filter((a) => a.id !== att.id);
                setAttachments(next);
                syncChanges({ attachments: next });
                addActivity(`Menghapus lampiran "${att.name}"`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
