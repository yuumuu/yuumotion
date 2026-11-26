import React, { useState } from 'react';
import { Dialog, Button, Switch, toast } from '../ui';
import { Globe, Copy, Check, Link as LinkIcon } from '@phosphor-icons/react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareToken?: string;
  onToggleShare: (enable: boolean) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  shareToken,
  onToggleShare
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = shareToken
    ? `${window.location.origin}/#share/${shareToken}`
    : '';

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Tautan publik disalin ke clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin tautan.');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-project-solid" />
          <span>Bagikan: {title}</span>
        </div>
      }
      footer={
        <div className="flex w-full justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Selesai
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-bar p-3.5">
          <div>
            <div className="text-xs font-semibold text-text">Akses Link Publik (Read-Only)</div>
            <div className="text-[11px] text-muted mt-0.5">
              Siapa saja yang memiliki tautan ini dapat melihat konten tanpa login.
            </div>
          </div>
          <Switch
            checked={Boolean(shareToken)}
            onChange={(e) => onToggleShare(e.target.checked)}
          />
        </div>

        {shareToken ? (
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
              Tautan Tamu
            </label>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono text-text truncate">
                <LinkIcon className="h-3.5 w-3.5 text-muted shrink-0" />
                <span className="truncate">{shareUrl}</span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              >
                {copied ? 'Tersalin' : 'Salin'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted">
            Aktifkan akses link publik untuk membuat tautan berbagi tamu.
          </div>
        )}
      </div>
    </Dialog>
  );
};
