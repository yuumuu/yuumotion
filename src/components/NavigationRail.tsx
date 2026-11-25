import React from 'react';
import { Workspace, AuthUser } from '../types/board';
import { MagnifyingGlass, Moon, Sun, Gear } from '@phosphor-icons/react';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';

interface NavigationRailProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenCommandPalette?: () => void;
  onOpenPreferences?: () => void;
  currentUser: AuthUser;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenCommandPalette,
  onOpenPreferences,
  currentUser
}) => {
  const { preferences, updatePreferences } = usePreferences();
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <nav
      aria-label="Primary Navigation Rail"
      className="hidden sm:flex h-full w-14 flex-col items-center justify-between border-r border-border bg-bar/80 py-3 select-none shrink-0 z-30"
    >
      {/* Top: Workspace Icon & Quick Actions */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Workspace Avatar */}
        <button
          type="button"
          onClick={() => {
            const nextIdx = (workspaces.findIndex((w) => w.id === activeWorkspaceId) + 1) % workspaces.length;
            if (workspaces[nextIdx]) onSelectWorkspace(workspaces[nextIdx].id);
          }}
          className="group relative flex h-9 w-9 items-center justify-center rounded-xl bg-project-solid text-white font-bold text-xs shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={`Workspace: ${activeWorkspace?.name || 'Workspace'}`}
        >
          <span>{activeWorkspace?.icon || 'YM'}</span>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-bar" />
        </button>

        <div className="w-8 border-t border-border" />

        {/* Global Search Shortcut */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-text hover:bg-hover active:bg-hover/80 transition-colors cursor-pointer"
          title="Pencarian Cepat (⌘K)"
        >
          <MagnifyingGlass className="h-4 w-4" />
        </button>

        {/* Project Switcher Icons */}
        <div className="flex flex-col items-center gap-2 pt-1 w-full px-2">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => onSelectWorkspace(ws.id)}
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  isActive
                    ? 'bg-project-soft text-project-solid border border-project-ring shadow-2xs'
                    : 'text-muted hover:text-text hover:bg-hover'
                )}
                title={ws.name}
              >
                {isActive && (
                  <span className="absolute -left-2 top-1.5 bottom-1.5 w-1 rounded-r-full bg-project-solid" />
                )}
                <span className="truncate">{ws.icon || '●'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Theme Toggle, Preferences & User */}
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
          onClick={onOpenPreferences}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
          title="Pengaturan Preferensi"
        >
          <Gear className="h-4 w-4" />
        </button>

        <div className="w-8 border-t border-border my-0.5" />

        {/* User Mini Avatar */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-project-solid/20 text-project-solid font-bold text-xs border border-project-ring"
          title={`Masuk sebagai ${currentUser?.name || 'User'}`}
        >
          {currentUser?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </nav>
  );
};
