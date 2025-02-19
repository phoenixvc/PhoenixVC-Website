// src/theme/types/index.ts

/**
 * Available color schemes for the theme
 */
export type ColorScheme = "classic" | "forest" | "ocean" | "phoenix" | "lavender" | "cloud";

/**
 * Theme modes (light/dark)
 */
export type Mode = 'light' | 'dark';

/**
 * Base theme colors configuration
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
}

/**
 * CSS classes for different theme elements
 */
export interface ColorSchemeClasses {
  primary: string;
  secondary: string;
  text: string;
  activeText: string;
  hoverBg: string;
  activeBg: string;
  mobileMenu: string;
  border: string;
  bgMobileMenu: string;
}

/**
 * Basic theme configuration
 */
export interface ThemeConfig {
  colorScheme: ColorScheme;
  mode: Mode;
}

/**
 * Theme context type definition
 */
export interface ThemeContextType {
  /** Current color scheme */
  colorScheme: ColorScheme;

  /** Current theme mode */
  mode: Mode;

  /** System preferred mode */
  systemMode: Mode;

  /** Whether to use system color scheme */
  useSystemMode: boolean;

  /** CSS classes for current theme */
  colorSchemeClasses: ColorSchemeClasses;

  /** Set color scheme */
  setColorScheme: (scheme: ColorScheme) => void;

  /** Set theme mode */
  setMode: (mode: Mode) => void;

  /** Toggle between light and dark mode */
  toggleMode: () => void;

  /** Set whether to use system color scheme */
  setUseSystemMode: (use: boolean) => void;
}

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<ThemeConfig>;
}

export interface ThemeContextValue {
    colorScheme: ColorScheme;
    getColorSchemeClasses: (colorScheme: ColorScheme) => ColorSchemeClasses;
    // ... other properties
}

