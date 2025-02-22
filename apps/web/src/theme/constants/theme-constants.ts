// constants/theme-constants.ts

import { ColorScheme, Mode } from '../types/theme.types';

export const THEME_CONSTANTS = {
  /**
   * CSS variable prefix for theme-related styles
   */
  PREFIX: '--theme-',

  /**
   * Default theme configuration values
   */
  DEFAULTS: {
    COLOR_SCHEME: 'classic' as ColorScheme,
    MODE: 'light' as Mode,
    TRANSITION: {
      DURATION: 200,
      TIMING: 'ease-in-out',
      PROPERTIES: [
        'background-color',
        'color',
        'border-color',
        'fill',
        'stroke',
        'opacity',
        'box-shadow'
      ]
    }
  },

  /**
   * Available color schemes
   */
  COLOR_SCHEMES: [
    'classic',  // Default business theme
    'forest',   // Nature-inspired green theme
    'ocean',    // Blue-based calm theme
    'phoenix',  // Warm orange/red theme
    'lavender', // Purple-based soft theme
    'cloud'     // Neutral gray theme
  ] as const,
  
  /**
   * Theme color definitions
   */
  COLORS: {
    classic: {
      primary: 'hsl(222, 47%, 31%)',
      secondary: 'hsl(217, 32%, 44%)',
      accent: 'hsl(349, 75%, 51%)',
      light: {
        background: 'hsl(0, 0%, 100%)',
        text: 'hsl(222, 47%, 11%)',
        muted: 'hsl(217, 32%, 84%)',
        border: 'hsl(220, 13%, 91%)'
      },
      dark: {
        background: 'hsl(222, 47%, 11%)',
        text: 'hsl(0, 0%, 100%)',
        muted: 'hsl(217, 32%, 24%)',
        border: 'hsl(217, 32%, 14%)'
      }
    },
    // Add other color schemes following the same pattern...
    semantic: {
      success: 'hsl(142, 76%, 36%)', // #22c55e
      warning: 'hsl(38, 92%, 50%)',  // #f59e0b
      error: 'hsl(0, 84%, 60%)',     // #ef4444
      info: 'hsl(217, 91%, 60%)'     // #3b82f6
    }
  } as const,

  /**
   * Available display modes
   */
  MODES: ['light', 'dark'] as const,

  /**
   * Theme-related DOM event names
   */
  EVENTS: {
    CHANGE: 'theme:change',
    INIT: 'theme:init',
    MODE_CHANGE: 'theme:mode-change',
    SCHEME_CHANGE: 'theme:scheme-change',
    SYSTEM_CHANGE: 'theme:system-change'
  } as const,

  /**
   * Local storage keys for theme persistence
   */
  STORAGE: {
    PREFIX: 'theme:',
    KEYS: {
      COLOR_SCHEME: 'theme:color-scheme',
      MODE: 'theme:mode',
      USE_SYSTEM: 'theme:use-system-mode'
    }
  } as const,

  /**
   * CSS class names for theme application
   */
  CLASSES: {
    ROOT: 'theme-root',
    TRANSITION: 'theme-transition',
    COLOR_SCHEME_PREFIX: 'theme-',
    MODE_PREFIX: 'theme-mode-'
  } as const,

  /**
   * Media query strings
   */
  MEDIA_QUERIES: {
    DARK_MODE: '(prefers-color-scheme: dark)',
    LIGHT_MODE: '(prefers-color-scheme: light)',
    REDUCED_MOTION: '(prefers-reduced-motion: reduce)'
  } as const
} as const;

// Remove ColorScheme and Mode types since they're derived from constants
export type ThemeColorScheme = typeof THEME_CONSTANTS.COLOR_SCHEMES[number];
export type ThemeMode = typeof THEME_CONSTANTS.MODES[number];
export type ThemeEvent = typeof THEME_CONSTANTS.EVENTS[keyof typeof THEME_CONSTANTS.EVENTS];
export type ThemeStorageKey = typeof THEME_CONSTANTS.STORAGE.KEYS[keyof typeof THEME_CONSTANTS.STORAGE.KEYS];

// Convenience exports
export const {
  PREFIX,
  DEFAULTS,
  COLOR_SCHEMES,
  MODES,
  EVENTS,
  STORAGE,
  CLASSES,
  MEDIA_QUERIES
} = THEME_CONSTANTS;

export default THEME_CONSTANTS;
