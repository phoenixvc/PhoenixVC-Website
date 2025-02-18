// src/theme/constants/index.ts
import { ColorScheme, Mode, ThemeColors } from '../types';

export const DEFAULT_COLOR_SCHEME: ColorScheme = 'blue';
export const DEFAULT_MODE: Mode = 'light';

// Color palette following a consistent pattern
export const COLOR_SCHEMES: Record<ColorScheme, ThemeColors> = {
  blue: {
    primary: '#3b82f6',    // Blue-500
    secondary: '#60a5fa',  // Blue-400
    accent: '#1d4ed8',     // Blue-700
    background: '#ffffff', // White
    text: '#1f2937',      // Gray-800
    muted: '#6b7280',     // Gray-500
    border: '#e5e7eb',    // Gray-200
  },
  purple: {
    primary: '#8b5cf6',    // Purple-500
    secondary: '#a78bfa',  // Purple-400
    accent: '#6d28d9',     // Purple-700
    background: '#ffffff', // White
    text: '#1f2937',      // Gray-800
    muted: '#6b7280',     // Gray-500
    border: '#e5e7eb',    // Gray-200
  },
  green: {
    primary: '#10b981',    // Green-500
    secondary: '#34d399',  // Green-400
    accent: '#059669',     // Green-700
    background: '#ffffff', // White
    text: '#1f2937',      // Gray-800
    muted: '#6b7280',     // Gray-500
    border: '#e5e7eb',    // Gray-200
  },
};

export const DARK_MODE_COLORS: Partial<ThemeColors> = {
  background: '#1f2937', // Gray-800
  text: '#f9fafb',      // Gray-50
  muted: '#9ca3af',     // Gray-400
  border: '#374151',    // Gray-700
};

// Theme transition configurations
export const THEME_TRANSITION_DURATION = '200ms';
export const THEME_TRANSITION_TIMING = 'ease-in-out';

// Local storage keys
export const STORAGE_KEYS = {
  COLOR_SCHEME: 'theme-color-scheme',
  MODE: 'theme-mode',
  USE_SYSTEM: 'theme-use-system',
} as const;
