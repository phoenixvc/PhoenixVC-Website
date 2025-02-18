// src/theme/utils/index.ts
import { ColorScheme, Mode, ColorSchemeClasses, ThemeColors } from '../types';
import { COLOR_SCHEMES, DARK_MODE_COLORS } from '../constants';

export const getDefaultColorScheme = (): ColorScheme => {
  if (typeof window === 'undefined') return 'blue';

  const savedScheme = localStorage.getItem('color-scheme') as ColorScheme;
  return isValidColorScheme(savedScheme) ? savedScheme : 'blue';
};

export const getSystemMode = (): Mode => {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getColorSchemeClasses = (
  colorScheme: ColorScheme,
  mode: Mode
): ColorSchemeClasses => ({
    primary: `text-${colorScheme}-600 dark:text-${colorScheme}-400`,
    secondary: `text-${colorScheme}-500 dark:text-${colorScheme}-300`,
    text: mode === 'dark' ? 'text-gray-100' : 'text-gray-900',
    activeText: mode === 'dark'
        ? `text-${colorScheme}-400`
        : `text-${colorScheme}-600`,
    hoverBg: mode === 'dark'
        ? `hover:bg-${colorScheme}-600/10`
        : `hover:bg-${colorScheme}-50`,
    activeBg: mode === 'dark'
        ? `bg-${colorScheme}-600/20`
        : `bg-${colorScheme}-100`,
    mobileMenu: mode === 'dark' ? 'bg-gray-900/95' : 'bg-white/95',
    border: mode === 'dark' ? 'border-gray-700' : 'border-gray-200',
    bgMobileMenu: ''
});

export const getThemeColors = (scheme: ColorScheme, mode: Mode): ThemeColors => {
  const baseColors = COLOR_SCHEMES[scheme];
  const modeColors = mode === 'dark' ? DARK_MODE_COLORS : {};

  return {
    ...baseColors,
    ...modeColors,
  };
};

export const setTheme = (colorScheme: ColorScheme, mode: Mode): void => {
  if (typeof window === 'undefined') return;

  const root = window.document.documentElement;

  // Remove existing theme classes
  root.classList.remove(
    'theme-blue-light', 'theme-purple-light', 'theme-green-light',
    'theme-blue-dark', 'theme-purple-dark', 'theme-green-dark'
  );

  // Add new theme class
  root.classList.add(`theme-${colorScheme}-${mode}`);

  // Handle dark mode
  root.classList.toggle('dark', mode === 'dark');
};

// Type guards
export const isValidColorScheme = (scheme: unknown): scheme is ColorScheme => {
  return typeof scheme === 'string' && ['blue', 'purple', 'green'].includes(scheme);
};

export const isValidMode = (mode: unknown): mode is Mode => {
  return typeof mode === 'string' && ['light', 'dark'].includes(mode);
};

// Storage helpers
export const saveColorScheme = (scheme: ColorScheme): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('color-scheme', scheme);
  }
};

export const saveMode = (mode: Mode): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-mode', mode);
  }
};
