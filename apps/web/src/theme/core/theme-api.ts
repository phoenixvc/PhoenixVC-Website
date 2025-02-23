// theme-api.ts
import { THEME_CONSTANTS } from '../constants/theme-constants';
const {
  DEFAULTS,
  EVENTS,
  CLASSES,
  MEDIA_QUERIES
} = THEME_CONSTANTS;

import { ThemeStorage } from '../utils/theme-storage';
import { getThemeVariables } from '../utils/theme-utils';
import type { ColorScheme, Mode } from '../types/theme.types';

/**
 * API for managing theme state and operations
 */
export class ThemeAPI {
  private static instance: ThemeAPI;
  private mediaQuery: MediaQueryList | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia(MEDIA_QUERIES.DARK_MODE);
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ThemeAPI {
    if (!ThemeAPI.instance) {
      ThemeAPI.instance = new ThemeAPI();
    }
    return ThemeAPI.instance;
  }

  /**
   * Initialize theme
   */
  initialize(): void {
    const colorScheme = this.getColorScheme();
    const mode = this.getMode();
    const useSystem = ThemeStorage.getUseSystem();

    this.applyTheme(colorScheme, mode, useSystem);
    this.dispatchEvent(EVENTS.INIT, { colorScheme, mode, useSystem });
  }

  /**
   * Get current color scheme
   */
  getColorScheme(): ColorScheme {
    return ThemeStorage.getColorScheme() ?? DEFAULTS.COLOR_SCHEME;
  }

  /**
   * Set color scheme
   */
  setColorScheme(scheme: ColorScheme): void {
    ThemeStorage.saveColorScheme(scheme);
    this.applyTheme(scheme, this.getMode(), this.getUseSystem());
    this.dispatchEvent(EVENTS.SCHEME_CHANGE, { colorScheme: scheme });
  }

  /**
   * Get current mode
   */
  getMode(): Mode {
    if (this.getUseSystem()) {
      return this.getSystemMode();
    }
    return ThemeStorage.getMode() ?? DEFAULTS.MODE;
  }

  /**
   * Set mode
   */
  setMode(mode: Mode): void {
    ThemeStorage.saveMode(mode);
    this.applyTheme(this.getColorScheme(), mode, false);
    this.dispatchEvent(EVENTS.MODE_CHANGE, { mode });
  }

  /**
   * Get system preference usage state
   */
  getUseSystem(): boolean {
    return ThemeStorage.getUseSystem();
  }

  /**
   * Set system preference usage
   */
  setUseSystem(useSystem: boolean): void {
    ThemeStorage.saveUseSystem(useSystem);
    const mode = useSystem ? this.getSystemMode() : this.getMode();
    this.applyTheme(this.getColorScheme(), mode, useSystem);
    this.dispatchEvent(EVENTS.SYSTEM_CHANGE, { useSystem });
  }

  /**
   * Reset theme to defaults
   */
  reset(): void {
    ThemeStorage.clearStorage();
    this.initialize();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(colorScheme: ColorScheme, mode: Mode, useSystem: boolean): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const variables = getThemeVariables(colorScheme, mode);

    // Remove existing theme classes
    root.classList.remove(
      ...Array.from(root.classList).filter(c =>
        c.startsWith(CLASSES.COLOR_SCHEME_PREFIX) ||
        c.startsWith(CLASSES.MODE_PREFIX)
      )
    );

    // Add new theme classes
    root.classList.add(
      `${CLASSES.COLOR_SCHEME_PREFIX}${colorScheme}`,
      `${CLASSES.MODE_PREFIX}${mode}`
    );

    // Apply CSS variables
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(`${THEME_CONSTANTS.PREFIX}${key}`, `${value}`);
    });

    // Update data attributes
    root.dataset.theme = colorScheme;
    root.dataset.mode = mode;
    root.dataset.useSystem = String(useSystem);
  }

  /**
   * Get system theme mode
   */
  private getSystemMode(): Mode {
    if (typeof window === 'undefined') return DEFAULTS.MODE;
    return window.matchMedia(MEDIA_QUERIES.DARK_MODE).matches ? 'dark' : 'light';
  }

  /**
   * Handle system theme changes
   */
  private handleSystemThemeChange = (e: MediaQueryListEvent): void => {
    if (this.getUseSystem()) {
      const mode = e.matches ? 'dark' : 'light';
      this.applyTheme(this.getColorScheme(), mode, true);
      this.dispatchEvent(EVENTS.MODE_CHANGE, { mode });
    }
  };

  /**
   * Dispatch theme event
   */
  private dispatchEvent(type: string, detail: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
  }
}

export const themeApi = ThemeAPI.getInstance();
