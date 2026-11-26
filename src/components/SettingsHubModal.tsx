import React, { useState, useEffect } from 'react';
import {
  User,
  Palette,
  Cloud,
  Keyboard as KeyboardIcon
} from '@phosphor-icons/react';
import { Dialog } from './ui';
import { cn } from '../lib/cn';
import { AuthUser, CloudSyncConfig, SyncConnectionStatus } from '../types/board';
import { ProfileSettingsTab } from './settings/ProfileSettingsTab';
import { AppearanceSettingsTab } from './settings/AppearanceSettingsTab';
import { SyncSettingsTab } from './settings/SyncSettingsTab';
import { ShortcutsSettingsTab } from './settings/ShortcutsSettingsTab';

export type SettingsTab = 'profile' | 'appearance' | 'sync' | 'shortcuts';

interface SettingsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  currentUser: AuthUser;
  onUserChange: (user: AuthUser) => void;
  cloudConfig: CloudSyncConfig;
  syncStatus: SyncConnectionStatus;
  onSaveCloudConfig: (cfg: CloudSyncConfig) => void;
  onOpenDbBridge: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogout?: () => void;
}

export const SettingsHubModal: React.FC<SettingsHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  currentUser,
  onUserChange,
  cloudConfig,
  syncStatus,
  onSaveCloudConfig,
  onOpenDbBridge,
  onExportBackup,
  onImportBackup,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profil Akun', icon: <User className="w-4 h-4" /> },
    { id: 'appearance', label: 'Tampilan', icon: <Palette className="w-4 h-4" /> },
    { id: 'sync', label: 'Sinkron & Data', icon: <Cloud className="w-4 h-4" /> },
    { id: 'shortcuts', label: 'Pintasan', icon: <KeyboardIcon className="w-4 h-4" /> }
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan & Profil"
      description="Kelola identitas akun, tampilan antarmuka, sinkronisasi cloud, dan pintasan kerja."
      maxWidth="3xl"
    >
      <div className="flex flex-col sm:flex-row gap-5 min-h-[380px] -mx-1">
        <nav
          aria-label="Menu Pengaturan"
          className="flex overflow-x-auto gap-1 pb-3 border-b sm:flex-col sm:w-44 shrink-0 sm:border-b-0 sm:border-r border-border sm:pb-0 sm:pr-4"
        >
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer text-left',
                  active
                    ? 'bg-project-soft text-project-solid font-semibold'
                    : 'text-muted hover:text-text hover:bg-hover'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex-1 min-w-0 overflow-y-auto max-h-[60vh] pr-1">
          {activeTab === 'profile' && (
            <ProfileSettingsTab
              isOpen={isOpen}
              currentUser={currentUser}
              onUserChange={onUserChange}
              onLogout={onLogout}
            />
          )}
          {activeTab === 'appearance' && <AppearanceSettingsTab />}
          {activeTab === 'sync' && (
            <SyncSettingsTab
              cloudConfig={cloudConfig}
              syncStatus={syncStatus}
              onSaveCloudConfig={onSaveCloudConfig}
              onOpenDbBridge={onOpenDbBridge}
              onExportBackup={onExportBackup}
              onImportBackup={onImportBackup}
              onCloseModal={onClose}
            />
          )}
          {activeTab === 'shortcuts' && <ShortcutsSettingsTab />}
        </div>
      </div>
    </Dialog>
  );
};
