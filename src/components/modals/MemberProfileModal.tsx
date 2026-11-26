import React from 'react';
import { EnvelopeSimple, Clock, Briefcase, Shield, Crown, User } from '@phosphor-icons/react';
import { Dialog, Button } from '../ui';
import { cn } from '../../lib/cn';
import { UserRole } from '../../types/board';

export interface ProfileDetailTarget {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  color: string;
  role?: UserRole;
  title?: string;
  bio?: string;
  timezone?: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  presenceStatus?: 'online' | 'busy' | 'away';
}

interface MemberProfileModalProps {
  member: ProfileDetailTarget | null;
  onClose: () => void;
}

const STATUS_MAP = {
  online: { label: 'Online', dot: 'bg-emerald-500' },
  busy: { label: 'Sibuk', dot: 'bg-rose-500' },
  away: { label: 'Menjauh', dot: 'bg-amber-400' }
};

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  const statusInfo = STATUS_MAP[member.presenceStatus || 'online'];

  return (
    <Dialog
      isOpen={Boolean(member)}
      onClose={onClose}
      title="Detail Profil Anggota"
      maxWidth="md"
      footer={
        <div className="flex w-full justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-bg p-4">
          <div className="relative shrink-0">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div
                style={{ backgroundColor: member.color || '#2563EB' }}
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-sm"
              >
                {member.avatarEmoji || member.avatar || member.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className={cn(
                'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-bg',
                statusInfo.dot
              )}
              title={statusInfo.label}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold text-text truncate">{member.name}</h3>
              {member.role && (
                <span className="inline-flex items-center gap-1 rounded-full bg-project-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-project-solid">
                  {member.role === 'owner' && <Crown className="h-3 w-3" />}
                  {member.role === 'admin' && <Shield className="h-3 w-3" />}
                  {member.role === 'member' && <User className="h-3 w-3" />}
                  {member.role}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-project-solid" />
              <span className="truncate">{member.title || 'Anggota Workspace'}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
              <span className={cn('h-2 w-2 rounded-full', statusInfo.dot)} />
              <span>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg p-3.5 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Bio</div>
          <p className="text-xs leading-relaxed text-text">
            {member.bio || 'Pengguna belum menambahkan bio singkat.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-border bg-bg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
              <EnvelopeSimple className="h-3.5 w-3.5 text-project-solid" />
              <span>Email</span>
            </div>
            <div className="truncate font-mono text-[11px] text-text">
              {member.email || 'Tidak dicantumkan'}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
              <Clock className="h-3.5 w-3.5 text-project-solid" />
              <span>Zona Waktu</span>
            </div>
            <div className="truncate text-[11px] text-text">
              {member.timezone || 'Asia/Jakarta (WIB)'}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
