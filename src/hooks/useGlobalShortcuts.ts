import { useEffect } from 'react';
import { WorkspaceView } from '../types/board';
import { SettingsTab } from '../components/settings/SettingsHubModal';

interface UseGlobalShortcutsParams {
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
  isDbModalOpen: boolean;
  setIsDbModalOpen: (open: boolean) => void;
  isMembersModalOpen: boolean;
  setIsMembersModalOpen: (open: boolean) => void;
  isFabOpen: boolean;
  setIsFabOpen: (open: boolean) => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveView: (v: WorkspaceView) => void;
  openSettingsTab: (tab: SettingsTab) => void;
}

export function useGlobalShortcuts({
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  selectedCardId,
  setSelectedCardId,
  isDbModalOpen,
  setIsDbModalOpen,
  isMembersModalOpen,
  setIsMembersModalOpen,
  isFabOpen,
  setIsFabOpen,
  setIsSidebarOpen,
  setActiveView,
  openSettingsTab
}: UseGlobalShortcutsParams) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (selectedCardId) {
          setSelectedCardId(null);
          return;
        }
        if (isDbModalOpen) {
          setIsDbModalOpen(false);
          return;
        }
        if (isMembersModalOpen) {
          setIsMembersModalOpen(false);
          return;
        }
        if (isFabOpen) {
          setIsFabOpen(false);
          return;
        }
      }

      if (isInputActive) return;

      if (e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        openSettingsTab('shortcuts');
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        setActiveView('board');
      } else if (e.key === 'c' || e.key === 'C') {
        setActiveView('calendar');
      } else if (e.key === 't' || e.key === 'T') {
        setActiveView('timeline');
      } else if (e.key === 's' || e.key === 'S') {
        setActiveView('table');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isCommandPaletteOpen,
    isSettingsOpen,
    selectedCardId,
    isDbModalOpen,
    isMembersModalOpen,
    isFabOpen,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    setSelectedCardId,
    setIsDbModalOpen,
    setIsMembersModalOpen,
    setIsFabOpen,
    setIsSidebarOpen,
    setActiveView,
    openSettingsTab
  ]);
}
