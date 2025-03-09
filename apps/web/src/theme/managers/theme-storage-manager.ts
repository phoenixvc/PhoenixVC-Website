// theme-storage.ts
import { THEME_CONSTANTS } from "../constants/theme-constants";
import { ColorScheme, ThemeMode, ThemeName, ThemeColors } from "../types";
import { themeValidationManager } from "./theme-validation-manager";

/**
 * Enhanced ThemeStorage that manages both theme preferences and theme data
 */
export class ThemeStorageManager {
  static readonly KEYS = {
    ...THEME_CONSTANTS.STORAGE.KEYS,
    THEME_DATA_PREFIX: "theme_data_"
  };

  private static readonly VALID_COLOR_SCHEMES = THEME_CONSTANTS.COLOR_SCHEMES;
  private static readonly VALID_MODES = THEME_CONSTANTS.MODES;
  private static readonly MAX_THEME_SIZE = 100 * 1024; // 100KB max theme size

  /**
   * Generic get method with type safety
   * @param key storage key
   * @returns parsed value or null
   */
  static get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

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
    if (typeof window === "undefined") return;

    try {
      if (!this.isValidValue(key, value)) {
        throw new Error(`Invalid value for ${key}: ${value}`);
      }

      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
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
    if (typeof useSystem !== "boolean") {
      throw new Error(`Invalid useSystem value: ${useSystem}`);
    }
    this.set(this.KEYS.USE_SYSTEM, useSystem);
  }

  /**
   * Clear all theme related storage
   */
  static clearStorage(): void {
    if (typeof window === "undefined") return;

    try {
      // Clear preference keys
      Object.values(this.KEYS).forEach(key => {
        if (typeof key === "string" && !key.includes("PREFIX")) {
          localStorage.removeItem(key);
        }
      });

      // Clear theme data
      this.clearAllThemeData();
    } catch (err) {
      console.error("[ThemeStorage] Failed to clear storage:", err);
    }
  }

  /**
   * Check if a value is valid for a given storage key
   * @param key storage key
   * @param value value to validate
   * @returns boolean indicating if value is valid
   */
  private static isValidValue(key: string, value: unknown): boolean {
    // For theme data keys
    if (key.startsWith(this.KEYS.THEME_DATA_PREFIX)) {
      return themeValidationManager.isThemeColorsType(value);
    }

    // For preference keys
    switch (key) {
      case this.KEYS.COLOR_SCHEME:
        return this.isValidColorScheme(value);
      case this.KEYS.MODE:
        return this.isValidMode(value);
      case this.KEYS.USE_SYSTEM:
        return typeof value === "boolean";
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
    return typeof value === "string" &&
      this.VALID_COLOR_SCHEMES.includes(value as ColorScheme);
  }

  /**
   * Check if a value is a valid mode
   * @param value value to validate
   * @returns type predicate for Mode
   */
  private static isValidMode(value: unknown): value is ThemeMode {
    return typeof value === "string" &&
      this.VALID_MODES.includes(value as ThemeMode);
  }

  // ---- Theme Data Storage Methods ----

  /**
   * Save a theme to local storage
   * @param themeName The name of the theme
   * @param theme The theme data to save
   * @returns boolean indicating success
   */
  static saveThemeData(themeName: ThemeName, theme: ThemeColors): boolean {
    if (typeof window === "undefined") return false;

    try {
      // Validate the theme
      if (!themeValidationManager.isThemeColorsType(theme)) {
        console.warn(`[ThemeStorage] Invalid theme data for ${themeName}`);
        return false;
      }

      const key = this.getThemeDataKey(themeName);
      const themeJson = JSON.stringify(theme);

      // Check size before saving
      if (themeJson.length > this.MAX_THEME_SIZE) {
        console.warn(`[ThemeStorage] Theme ${themeName} exceeds max size (${themeJson.length} bytes)`);
        return false;
      }

      localStorage.setItem(key, themeJson);
      return true;
    } catch (err) {
      console.error(`[ThemeStorage] Failed to save theme ${themeName}:`, err);
      return false;
    }
  }

  /**
   * Get a theme from local storage
   * @param themeName The name of the theme to retrieve
   * @returns The theme data or null if not found
   */
  static getThemeData(themeName: ThemeName): ThemeColors | null {
    if (typeof window === "undefined") return null;

    try {
      const key = this.getThemeDataKey(themeName);
      const themeJson = localStorage.getItem(key);

      if (!themeJson) return null;

      const theme = JSON.parse(themeJson) as ThemeColors;

      // Validate the parsed theme
      if (!themeValidationManager.isThemeColorsType(theme)) {
        console.warn(`[ThemeStorage] Invalid stored theme data for ${themeName}`);
        return null;
      }

      return theme;
    } catch (err) {
      console.error(`[ThemeStorage] Failed to get theme ${themeName}:`, err);
      return null;
    }
  }

  /**
   * Check if a theme exists in local storage
   * @param themeName The name of the theme to check
   * @returns boolean indicating if the theme exists
   */
  static hasThemeData(themeName: ThemeName): boolean {
    if (typeof window === "undefined") return false;

    const key = this.getThemeDataKey(themeName);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Remove a theme from local storage
   * @param themeName The name of the theme to remove
   */
  static removeThemeData(themeName: ThemeName): void {
    if (typeof window === "undefined") return;

    const key = this.getThemeDataKey(themeName);
    localStorage.removeItem(key);
  }

  /**
   * Clear all theme data from local storage
   */
  static clearAllThemeData(): void {
    if (typeof window === "undefined") return;

    try {
      const prefix = this.KEYS.THEME_DATA_PREFIX;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.error("[ThemeStorage] Failed to clear theme data:", err);
    }
  }

  /**
   * Get all stored theme names
   * @returns Array of theme names that are stored
   */
  static getStoredThemeNames(): ThemeName[] {
    if (typeof window === "undefined") return [];

    try {
      const prefix = this.KEYS.THEME_DATA_PREFIX;
      const themeNames: ThemeName[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const themeName = key.substring(prefix.length) as ThemeName;
          themeNames.push(themeName);
        }
      }

      return themeNames;
    } catch (err) {
      console.error("[ThemeStorage] Failed to get stored theme names:", err);
      return [];
    }
  }

  /**
   * Get storage usage information for themes
   * @returns Object with storage usage details
   */
  static getThemeStorageInfo(): {
    themeCount: number;
    themeNames: ThemeName[];
    totalBytes: number;
  } {
    if (typeof window === "undefined") {
      return { themeCount: 0, themeNames: [], totalBytes: 0 };
    }

    try {
      const prefix = this.KEYS.THEME_DATA_PREFIX;
      const themeNames: ThemeName[] = [];
      let totalBytes = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const themeName = key.substring(prefix.length) as ThemeName;
          themeNames.push(themeName);

          const item = localStorage.getItem(key);
          if (item) {
            totalBytes += item.length * 2; // Approximate size in bytes (UTF-16)
          }
        }
      }

      return {
        themeCount: themeNames.length,
        themeNames,
        totalBytes
      };
    } catch (err) {
      console.error("[ThemeStorage] Failed to get theme storage info:", err);
      return { themeCount: 0, themeNames: [], totalBytes: 0 };
    }
  }

  /**
   * Generate a storage key for a theme
   * @param themeName The theme name
   * @returns The storage key
   */
  private static getThemeDataKey(themeName: ThemeName): string {
    return `${this.KEYS.THEME_DATA_PREFIX}${themeName}`;
  }
}
