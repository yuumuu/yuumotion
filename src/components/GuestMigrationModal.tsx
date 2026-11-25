import React from 'react';
import { Dialog, Button } from './ui';
import { FolderOpen, Sparkle, ArrowRight } from '@phosphor-icons/react';

interface GuestMigrationModalProps {
  isOpen: boolean;
  guestWorkspaceCount: number;
  userName: string;
  onImportGuestWorkspaces: () => void;
  onStartFresh: () => void;
}

export const GuestMigrationModal: React.FC<GuestMigrationModalProps> = ({
  isOpen,
  guestWorkspaceCount,
  userName,
  onImportGuestWorkspaces,
  onStartFresh
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onStartFresh}
      maxWidth="md"
      title="Pindahkan Workspace Tamu?"
      description={`Halo ${userName}, ditemukan ${guestWorkspaceCount} workspace lokal dari sesi tamu sebelumnya.`}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-bar p-3.5 text-xs text-muted leading-relaxed">
          Agar data tamu dan akun tetap terisolasi rapi, workspace tamu tidak otomatis digabungkan. Pilih salah satu opsi transisi di bawah ini:
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={onImportGuestWorkspaces}
            className="flex items-start gap-3 rounded-xl border border-project-accent/40 bg-project-soft/50 p-3.5 text-left transition-colors hover:bg-project-soft cursor-pointer"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-project-solid text-white">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-semibold text-text">
                <span>Pindahkan {guestWorkspaceCount} Workspace ke Akun Ini</span>
                <ArrowRight className="h-3.5 w-3.5 text-project-solid" />
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Seluruh papan dan dokumen lokal dari sesi tamu akan disalin ke akunmu sekarang.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onStartFresh}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 text-left transition-colors hover:bg-hover cursor-pointer"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-bg text-muted">
              <Sparkle className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-text">Mulai Akun Baru (Bersih)</div>
              <p className="mt-1 text-[11px] text-muted">
                Buat workspace baru dari awal. Data tamu tetap aman terpisah saat kamu logout.
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="ghost" size="xs" onClick={onStartFresh}>
            Lewati
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
