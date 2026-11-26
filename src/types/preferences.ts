export type AppTheme = 'light' | 'dark' | 'system';
export type AppDensity = 'comfortable' | 'compact';
export type CardOpenMode = 'drawer' | 'modal' | 'fullpage';
export type ProjectAccentTheme = 'violet' | 'cobalt' | 'coral' | 'emerald' | 'berry' | 'amber';
export type DocFontFamily = 'sans' | 'serif' | 'mono';
export type DocFontSize = 'sm' | 'md' | 'lg';
export type DocPageWidth = 'standard' | 'wide';

export interface UserPreferences {
  theme: AppTheme;
  density: AppDensity;
  cardOpenMode: CardOpenMode;
  reduceMotion: boolean;
  offlineSync: boolean;
  docFont: DocFontFamily;
  docFontSize: DocFontSize;
  docPageWidth: DocPageWidth;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  density: 'comfortable',
  cardOpenMode: 'drawer',
  reduceMotion: false,
  offlineSync: true,
  docFont: 'sans',
  docFontSize: 'md',
  docPageWidth: 'standard',
};
