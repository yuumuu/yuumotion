import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences, DEFAULT_PREFERENCES, ProjectAccentTheme } from '../types/preferences';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  activeProjectTheme: ProjectAccentTheme;
  setActiveProjectTheme: (theme: ProjectAccentTheme) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem('yuumotion_preferences');
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [activeProjectTheme, setActiveProjectTheme] = useState<ProjectAccentTheme>('violet');

  useEffect(() => {
    try {
      localStorage.setItem('yuumotion_preferences', JSON.stringify(preferences));
    } catch {}

    const applyTheme = () => {
      let isDark = preferences.theme === 'dark';
      if (preferences.theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-color-meta')?.setAttribute('content', '#111113');
      } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-color-meta')?.setAttribute('content', '#FAF9F6');
      }
    };

    applyTheme();
    document.documentElement.setAttribute('data-density', preferences.density);

    if (preferences.reduceMotion) {
      document.documentElement.setAttribute('data-reduce-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduce-motion');
    }

    if (preferences.theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        activeProjectTheme,
        setActiveProjectTheme
      }}
    >
      <div data-project-theme={activeProjectTheme} className="contents">
        {children}
      </div>
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
