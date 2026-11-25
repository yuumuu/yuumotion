export type AppTheme = 'light' | 'dark' | 'system';
export type AppDensity = 'comfortable' | 'compact';
export type CardOpenMode = 'drawer' | 'modal' | 'fullpage';
export type ProjectAccentTheme = 'violet' | 'cobalt' | 'coral' | 'emerald' | 'berry' | 'amber';

export interface UserPreferences {
  theme: AppTheme;
  density: AppDensity;
  cardOpenMode: CardOpenMode;
  reduceMotion: boolean;
  offlineSync: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  density: 'comfortable',
  cardOpenMode: 'drawer',
  reduceMotion: false,
  offlineSync: true,
};
