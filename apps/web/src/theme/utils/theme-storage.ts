// storage.ts
import { THEME_CONSTANTS } from '../constants/theme-constants';
import { ColorScheme, ThemeMode } from '../types';

/**
 * Manages theme-related local storage operations
 */
export class ThemeStorage {
  static readonly KEYS = THEME_CONSTANTS.STORAGE.KEYS;

  private static readonly VALID_COLOR_SCHEMES = THEME_CONSTANTS.COLOR_SCHEMES;
  private static readonly VALID_MODES = THEME_CONSTANTS.MODES;

  /**
   * Generic get method with type safety
   * @param key storage key
   * @returns parsed value or null
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item) as T;

      if (!this.isValidValue(key, parsed)) {
        console.warn(`[ThemeStorage] Invalid value for ${key}:`, parsed);
        return null;
      }

      return parsed;
    } catch (err) {
      console.error(`[ThemeStorage] Failed to get ${key}:`, err);
      return null;
    }
  }

  /**
   * Generic set method with type checking
   * @param key storage key
   * @param value value to store
   * @throws Error if value is invalid or storage fails
   */
  static set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.isValidValue(key, value)) {
        throw new Error(`Invalid value for ${key}: ${value}`);
      }

      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error(`[ThemeStorage] Failed to set ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get stored color scheme
   * @returns stored color scheme or null if not found/invalid
   */
  static getColorScheme(): ColorScheme | null {
    return this.get<ColorScheme>(this.KEYS.COLOR_SCHEME);
  }

  /**
   * Save color scheme to storage
   * @param scheme ColorScheme to save
   * @throws Error if scheme is invalid
   */
  static saveColorScheme(scheme: ColorScheme): void {
    if (!this.isValidColorScheme(scheme)) {
      throw new Error(`Invalid color scheme: ${scheme}`);
    }
    this.set(this.KEYS.COLOR_SCHEME, scheme);
  }

  /**
   * Get stored theme mode
   * @returns stored mode or null if not found/invalid
   */
  static getMode(): ThemeMode | null {
    return this.get<ThemeMode>(this.KEYS.MODE);
  }

  /**
   * Save theme mode to storage
   * @param mode Mode to save
   * @throws Error if mode is invalid
   */
  static saveMode(mode: ThemeMode): void {
    if (!this.isValidMode(mode)) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    this.set(this.KEYS.MODE, mode);
  }

  /**
   * Get system preference setting
   * @returns boolean indicating if system preference is enabled
   */
  static getUseSystem(): boolean {
    return this.get<boolean>(this.KEYS.USE_SYSTEM) ?? true;
  }

  /**
   * Save system preference setting
   * @param useSystem boolean value to save
   */
  static saveUseSystem(useSystem: boolean): void {
    if (typeof useSystem !== 'boolean') {
      throw new Error(`Invalid useSystem value: ${useSystem}`);
    }
    this.set(this.KEYS.USE_SYSTEM, useSystem);
  }

  /**
   * Clear all theme related storage
   */
  static clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (err) {
      console.error('[ThemeStorage] Failed to clear storage:', err);
    }
  }

  /**
   * Check if a value is valid for a given storage key
   * @param key storage key
   * @param value value to validate
   * @returns boolean indicating if value is valid
   */
  private static isValidValue(key: string, value: unknown): boolean {
    switch (key) {
      case this.KEYS.COLOR_SCHEME:
        return this.isValidColorScheme(value);
      case this.KEYS.MODE:
        return this.isValidMode(value);
      case this.KEYS.USE_SYSTEM:
        return typeof value === 'boolean';
      default:
        return false;
    }
  }

  /**
   * Check if a value is a valid color scheme
   * @param value value to validate
   * @returns type predicate for ColorScheme
   */
  private static isValidColorScheme(value: unknown): value is ColorScheme {
    return typeof value === 'string' &&
           this.VALID_COLOR_SCHEMES.includes(value as ColorScheme);
  }

  /**
   * Check if a value is a valid mode
   * @param value value to validate
   * @returns type predicate for Mode
   */
  private static isValidMode(value: unknown): value is ThemeMode {
    return typeof value === 'string' &&
           this.VALID_MODES.includes(value as ThemeMode);
  }
}
