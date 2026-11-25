import React, { useState } from 'react';
import { Workspace, AuthUser } from '../types/board';
import { Moon, Sun, Gear, Plus, SidebarSimple, Trash } from '@phosphor-icons/react';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';
import { ConfirmDialog } from './ui';
import { ContextMenu } from './ui/ContextMenu';
import { SettingsTab } from './SettingsHubModal';

interface NavigationRailProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace?: (name: string, icon: string) => void;
  onDeleteWorkspace?: (workspaceId: string) => void;
  onOpenWorkspaceSettings?: (workspaceId: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenSettings?: (tab: SettingsTab) => void;
  currentUser: AuthUser;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  onOpenWorkspaceSettings,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenSettings,
  currentUser
}) => {
  const { preferences, updatePreferences } = usePreferences();
  const [isAddWsOpen, setIsAddWsOpen] = useState(false);
  const [wsToDelete, setWsToDelete] = useState<Workspace | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ open: boolean; x: number; y: number; ws: Workspace | null }>({
    open: false,
    x: 0,
    y: 0,
    ws: null
  });

  const safeWorkspaces = workspaces || [];

  return (
    <>
      <nav
        aria-label="Primary Navigation Rail"
        className="hidden sm:flex h-full w-14 flex-col items-center justify-between border-r border-white/15 bg-gradient-to-b from-[#1D4ED8] via-[#2563EB] to-[#1E40AF] text-white py-3 select-none shrink-0 z-30"
      >
        {/* Top: Brand App Logo & Workspace Switcher */}
        <div className="flex flex-col gap-3 items-center w-full">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 p-0.5 shadow-2xs ring-1 ring-white/30"
            title="Yuumotion Workspace"
          >
            <img src="/icon.svg" alt="Yuumotion" className="w-8 h-8 rounded-xl" />
          </div>

          <div className="w-8 border-t border-white/20" />

          {/* Workspace Switcher List */}
          <div className="flex flex-col gap-2 items-center px-2 pt-1 w-full">
            {safeWorkspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    if (isActive && onToggleSidebar) {
                      onToggleSidebar();
                    } else {
                      onSelectWorkspace(ws.id);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setCtxMenu({ open: true, x: e.clientX, y: e.clientY, ws });
                  }}
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.95] cursor-pointer',
                    isActive
                      ? 'bg-white/25 text-white ring-1 ring-white/40 shadow-2xs'
                      : 'text-white/75 hover:text-white hover:bg-white/15'
                  )}
                  title={
                    isActive
                      ? `${ws.name} (Klik untuk ${isSidebarOpen ? 'tutup' : 'buka'} sidebar)`
                      : `${ws.name} (Klik kanan untuk opsi)`
                  }
                >
                  {isActive && (
                    <span className="absolute -left-2 top-1.5 bottom-1.5 w-1 rounded-r-full bg-white" />
                  )}
                  {isActive && onToggleSidebar ? (
                    <SidebarSimple
                      className="w-4 h-4"
                      weight={isSidebarOpen ? 'fill' : 'regular'}
                    />
                  ) : (
                    <span className="truncate">{ws.icon || 'W'}</span>
                  )}
                </button>
              );
            })}

            {onCreateWorkspace && (
              <button
                type="button"
                onClick={() => setIsAddWsOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-dashed border-white/35 text-white/80 hover:text-white hover:border-white/70 hover:bg-white/15 active:scale-[0.95] transition-[background-color,border-color,color,transform] duration-150 cursor-pointer"
                title="Buat Workspace Baru"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Theme Toggle, Settings & Profile */}
        <div className="flex flex-col gap-2 items-center w-full">
          <button
            type="button"
            onClick={() =>
              updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })
            }
            className="flex justify-center items-center w-8 h-8 rounded-xl transition-colors cursor-pointer text-white/80 hover:text-white hover:bg-white/15"
            title="Ganti Tema (Gelap / Terang)"
          >
            {preferences.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onOpenSettings?.('appearance')}
            className="flex justify-center items-center w-8 h-8 rounded-xl transition-colors cursor-pointer text-white/80 hover:text-white hover:bg-white/15"
            title="Pengaturan Tampilan & Preferensi"
          >
            <Gear className="w-4 h-4" />
          </button>

          <div className="w-8 border-t border-white/20 my-0.5" />

          <button
            type="button"
            onClick={() => onOpenSettings?.('profile')}
            style={{ backgroundColor: currentUser?.color || '#6366F1' }}
            className="flex justify-center items-center w-8 h-8 text-xs font-bold text-white rounded-full ring-2 transition-transform cursor-pointer shadow-2xs ring-white/30 hover:scale-105 active:scale-95"
            title={`Profil: ${currentUser?.name || 'User'}`}
          >
            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </nav>

      <ContextMenu
        isOpen={ctxMenu.open}
        x={ctxMenu.x}
        y={ctxMenu.y}
        onClose={() => setCtxMenu((prev) => ({ ...prev, open: false }))}
        items={
          ctxMenu.ws
            ? [
                {
                  id: 'ws-settings',
                  label: 'Pengaturan Workspace',
                  icon: <Gear className="h-3.5 w-3.5" />,
                  onClick: () => {
                    if (ctxMenu.ws) {
                      onSelectWorkspace(ctxMenu.ws.id);
                      onOpenWorkspaceSettings?.(ctxMenu.ws.id);
                    }
                  }
                },
                ...(onDeleteWorkspace
                  ? [
                      {
                        id: 'ws-delete',
                        label: 'Hapus Workspace',
                        variant: 'danger' as const,
                        icon: <Trash className="h-3.5 w-3.5" />,
                        onClick: () => setWsToDelete(ctxMenu.ws)
                      }
                    ]
                  : [])
              ]
            : []
        }
      />

      <ConfirmDialog
        isOpen={Boolean(wsToDelete)}
        onClose={() => setWsToDelete(null)}
        title="Hapus Workspace"
        description={`Yakin ingin menghapus workspace "${wsToDelete?.name || ''}" beserta seluruh papan dan dokumen di dalamnya?`}
        variant="danger"
        confirmLabel="Hapus Workspace"
        onConfirm={() => {
          if (wsToDelete && onDeleteWorkspace) {
            onDeleteWorkspace(wsToDelete.id);
          }
        }}
      />

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
