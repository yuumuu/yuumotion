import React, { useState } from 'react';
import { Workspace, AuthUser } from '../types/board';
import { Moon, Sun, Gear, Plus } from '@phosphor-icons/react';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';
import { ConfirmDialog } from './ui';
import { SettingsTab } from './SettingsHubModal';

interface NavigationRailProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace?: (name: string, icon: string) => void;
  onOpenSettings?: (tab: SettingsTab) => void;
  currentUser: AuthUser;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onOpenSettings,
  currentUser
}) => {
  const { preferences, updatePreferences } = usePreferences();
  const [isAddWsOpen, setIsAddWsOpen] = useState(false);

  const safeWorkspaces = workspaces || [];
  const activeWorkspace = safeWorkspaces.find((w) => w.id === activeWorkspaceId) || safeWorkspaces[0];

  return (
    <>
      <nav
        aria-label="Primary Navigation Rail"
        className="hidden sm:flex h-full w-14 flex-col items-center justify-between border-r border-border bg-bar/90 py-3 select-none shrink-0 z-30"
      >
        {/* Top: Active Workspace & Switcher */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              if (safeWorkspaces.length === 0) return;
              const nextIdx = (safeWorkspaces.findIndex((w) => w.id === activeWorkspaceId) + 1) % safeWorkspaces.length;
              if (safeWorkspaces[nextIdx]) onSelectWorkspace(safeWorkspaces[nextIdx].id);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-project-solid text-white font-display font-bold text-xs shadow-2xs hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer"
            title={`Workspace: ${activeWorkspace?.name || 'Workspace'}`}
          >
            <span>{activeWorkspace?.icon || 'Y'}</span>
          </button>

          <div className="w-8 border-t border-border" />

          {/* Workspace Switcher List */}
          <div className="flex flex-col items-center gap-2 pt-1 w-full px-2">
            {safeWorkspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => onSelectWorkspace(ws.id)}
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.95] cursor-pointer',
                    isActive
                      ? 'bg-project-soft text-project-solid border border-project-ring shadow-2xs'
                      : 'text-muted hover:text-text hover:bg-hover'
                  )}
                  title={ws.name}
                >
                  {isActive && (
                    <span className="absolute -left-2 top-1.5 bottom-1.5 w-1 rounded-r-full bg-project-solid" />
                  )}
                  <span className="truncate">{ws.icon || 'W'}</span>
                </button>
              );
            })}

            {onCreateWorkspace && (
              <button
                type="button"
                onClick={() => setIsAddWsOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-dashed border-border text-muted hover:text-text hover:border-project-ring hover:bg-hover active:scale-[0.95] transition-[background-color,border-color,color,transform] duration-150 cursor-pointer"
                title="Buat Workspace Baru"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Theme Toggle, Settings & Profile */}
        <div className="flex flex-col items-center gap-2 w-full">
          <button
            type="button"
            onClick={() =>
              updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })
            }
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
            title="Ganti Tema (Gelap / Terang)"
          >
            {preferences.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => onOpenSettings?.('appearance')}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
            title="Pengaturan Tampilan & Preferensi"
          >
            <Gear className="h-4 w-4" />
          </button>

          <div className="w-8 border-t border-border my-0.5" />

          <button
            type="button"
            onClick={() => onOpenSettings?.('profile')}
            style={{ backgroundColor: currentUser?.color || '#6366F1' }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-xs shadow-2xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={`Profil: ${currentUser?.name || 'User'}`}
          >
            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </nav>

      <ConfirmDialog
        isOpen={isAddWsOpen}
        onClose={() => setIsAddWsOpen(false)}
        title="Buat Workspace Baru"
        mode="prompt"
        placeholder="Misal: Tim Desain Produk..."
        confirmLabel="Buat Workspace"
        onConfirm={(name) => {
          if (name && onCreateWorkspace) {
            onCreateWorkspace(name, name.charAt(0).toUpperCase());
          }
        }}
      />
    </>
  );
};
