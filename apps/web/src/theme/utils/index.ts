// src/theme/utils/index.ts
import { ColorScheme, Mode, ColorSchemeClasses, ThemeColors } from '../types';
import { COLOR_SCHEMES, DARK_MODE_COLORS, DEFAULT_COLOR_SCHEME, DEFAULT_MODE, STORAGE_KEYS } from '../constants';

export const getDefaultColorScheme = (): ColorScheme => {
  if (typeof window === "undefined") return DEFAULT_COLOR_SCHEME;

  const savedScheme = localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME);
  return isValidColorScheme(savedScheme) ? (savedScheme as ColorScheme) : DEFAULT_COLOR_SCHEME;
};

export const getSystemMode = (): Mode => {
  if (typeof window === 'undefined') return DEFAULT_MODE;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getColorSchemeClasses = (colorScheme: ColorScheme, mode: Mode): ColorSchemeClasses => ({
  primary: `var(--theme-${colorScheme}-primary)`,
  secondary: `var(--theme-${colorScheme}-secondary)`,
  text: `var(--theme-${colorScheme}-text)`,
  activeText: `var(--theme-${colorScheme}-primary)`,
  hoverBg: `var(--theme-${colorScheme}-hover)`, // Uses new CSS variables
  activeBg: `var(--theme-${colorScheme}-active)`, // Uses new CSS variables
  mobileMenu: mode === 'dark' ? 'var(--theme-dark-background)' : 'var(--theme-light-background)',
  bgMobileMenu: mode === 'dark' ? 'var(--theme-dark-menu)' : 'var(--theme-light-menu)',
  border: mode === 'dark' ? 'var(--theme-dark-border)' : 'var(--theme-light-border)',
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

  // Dynamically remove any previous theme classes
  root.className = root.className
    .split(" ")
    .filter((cls) => !cls.startsWith("theme-"))
    .join(" ");

  // Apply new theme
  root.classList.add(`theme-${colorScheme}-${mode}`);

  // Toggle dark mode
  root.classList.toggle("dark", mode === "dark");

  console.log(`%c[Theme] Applied theme: theme-${colorScheme}-${mode}`, "color: cyan; font-weight: bold;");
};

export const isValidColorScheme = (scheme: unknown): scheme is ColorScheme => {
  localStorage.removeItem("theme-color-scheme");
  localStorage.removeItem("theme-mode");
  localStorage.removeItem("theme-use-system");
  return typeof scheme === 'string' && Object.keys(COLOR_SCHEMES).includes(scheme);
};

export const isValidMode = (mode: unknown): mode is Mode => {
  return typeof mode === 'string' && ['light', 'dark'].includes(mode);
};

export const saveColorScheme = (scheme: ColorScheme): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, scheme);
    } catch (error) {
      console.warn("[Theme] Failed to save color scheme:", error);
    }
  }
};

export const saveMode = (mode: Mode): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
    } catch (error) {
      console.warn("[Theme] Failed to save mode:", error);
    }
  }
};
