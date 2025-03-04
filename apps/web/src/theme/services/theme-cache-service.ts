// theme/core/theme-cache-service.ts

import {
    SemanticColors,
    ThemeColors,
    ThemeName,
    ThemeMode,
    ThemeSchemeInitial
  } from "../types";
  import { THEME_CONSTANTS } from "../constants";
  import { themeValidationManager } from "./theme-validation-manager";
  import { transformTheme } from "../providers";

  export interface ThemeCacheConfig {
    /** Duration in milliseconds for how long a theme should be cached */
    cacheDuration: number;
    /** Default theme mode to use when transforming themes */
    defaultMode: ThemeMode;
    /** Maximum number of themes to keep in cache */
    maxCacheSize?: number;
    /** Whether to log cache operations */
    enableLogging?: boolean;
  }

  export interface ThemeCacheEntry {
    /** The fully transformed theme data */
    theme: ThemeColors;
    /** Timestamp when the theme was cached */
    timestamp: number;
    /** Source of the theme */
    source: 'local' | 'remote' | 'default' | 'registered';
  }

  /**
   * ThemeCacheService handles caching of transformed theme data.
   * It ensures that only fully transformed themes are stored in the cache.
   */
  export class ThemeCacheService {
    private static instance: ThemeCacheService;
    private cache: Map<ThemeName, ThemeCacheEntry>;
    private config: ThemeCacheConfig;

    /**
     * Get the singleton instance of ThemeCacheService
     */
    static getInstance(config?: Partial<ThemeCacheConfig>): ThemeCacheService {
      if (!ThemeCacheService.instance) {
        ThemeCacheService.instance = new ThemeCacheService(config);
      } else if (config) {
        ThemeCacheService.instance.updateConfig(config);
      }
      return ThemeCacheService.instance;
    }

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor(config?: Partial<ThemeCacheConfig>) {
      this.cache = new Map<ThemeName, ThemeCacheEntry>();
      this.config = {
        cacheDuration: config?.cacheDuration || 1000 * 60 * 5, // 5 minutes by default
        defaultMode: config?.defaultMode || THEME_CONSTANTS.DEFAULTS.MODE,
        maxCacheSize: config?.maxCacheSize || 10,
        enableLogging: config?.enableLogging !== undefined ? config.enableLogging : true
      };
    }

    /**
     * Update the cache configuration
     */
    updateConfig(config: Partial<ThemeCacheConfig>): void {
      this.config = { ...this.config, ...config };
      this.log(`Cache configuration updated`);
    }

    /**
     * Get a theme from the cache if it exists and is not expired
     */
    get(name: ThemeName): ThemeColors | null {
      this.log(`Getting theme: ${name}`, true);

      const entry = this.cache.get(name);

      if (!entry) {
        this.log(`Theme "${name}" not found in cache`);
        return null;
      }

      // Check if the entry has expired
      if (Date.now() - entry.timestamp > this.config.cacheDuration) {
        this.log(`Theme "${name}" has expired`);
        this.cache.delete(name);
        return null;
      }

      // Verify the theme is fully transformed
      if (!themeValidationManager.isFullyTransformed(entry.theme)) {
        this.log(`Theme "${name}" is not fully transformed. Removing from cache.`, false, true);
        this.cache.delete(name);
        return null;
      }

      this.log(`Returning cached theme for "${name}"`);
      return entry.theme;
    }

    /**
     * Set a theme in the cache, ensuring it is fully transformed first
     */
    set(
      name: ThemeName,
      theme: ThemeColors | ThemeSchemeInitial,
      semantic?: SemanticColors,
      source: 'local' | 'remote' | 'default' | 'registered' = 'registered'
    ): ThemeColors {
      this.log(`Setting theme: ${name}`, true);

      let transformedTheme: ThemeColors;

      // Check if the theme is already transformed
      if (themeValidationManager.isThemeColorsType(theme)) {
        this.log(`Theme "${name}" is already a ThemeColors object`);

        // Even if it's a ThemeColors object, verify it's fully transformed
        if (!themeValidationManager.isFullyTransformed(theme)) {
          this.log(`Theme "${name}" needs transformation`);

          // If it's a ThemeColors but not fully transformed, transform it
          transformedTheme = transformTheme(theme, this.config.defaultMode);
        } else {
          transformedTheme = theme;
        }
      } else {
        // It's a ThemeSchemeInitial, so transform it
        this.log(`Transforming ThemeSchemeInitial for "${name}"`);

        // Create a properly structured ThemeColors object with the initial scheme
        const initialThemeColors: ThemeColors = {
          schemes: {
            [name]: theme
          },
          semantic: semantic
        };

        // Transform the theme
        transformedTheme = transformTheme(initialThemeColors, this.config.defaultMode);
      }

      // Validate the transformed theme
      try {
        this.log(`Validating transformed theme for "${name}"`);
        themeValidationManager.validateProcessedTheme(transformedTheme);
      } catch (error) {
        this.log(`Theme validation failed for "${name}":`, false, true);
        console.error(error);
        throw error;
      }

      // Enforce cache size limit
      if (this.cache.size >= (this.config.maxCacheSize || 10) && !this.cache.has(name)) {
        // Remove the oldest entry
        const oldestEntry = Array.from(this.cache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];

        if (oldestEntry) {
          this.log(`Cache full, removing oldest entry: ${oldestEntry[0]}`);
          this.cache.delete(oldestEntry[0]);
        }
      }

      // Store in cache
      this.cache.set(name, {
        theme: transformedTheme,
        timestamp: Date.now(),
        source
      });

      this.log(`Theme "${name}" successfully cached`);
      return transformedTheme;
    }

    /**
     * Check if a theme exists in the cache and is not expired
     */
    has(name: ThemeName): boolean {
      const entry = this.cache.get(name);
      if (!entry) return false;

      const isValid = Date.now() - entry.timestamp <= this.config.cacheDuration &&
                      themeValidationManager.isFullyTransformed(entry.theme);

      return isValid;
    }

    /**
     * Clear the entire theme cache or a specific theme
     */
    clear(name?: ThemeName): void {
      if (name) {
        this.cache.delete(name);
        this.log(`Cleared theme "${name}" from cache`);
      } else {
        this.cache.clear();
        this.log("Cleared entire theme cache");
      }
    }

    /**
     * Get information about the current cache state
     */
    getCacheStatus(): {
      size: number;
      themes: ThemeName[];
      expirations: Record<ThemeName, number>;
      sources: Record<ThemeName, string>;
    } {
      const expirations: Record<ThemeName, number> = {};
      const sources: Record<ThemeName, string> = {};

      this.cache.forEach((entry, name) => {
        const expiresIn = this.config.cacheDuration - (Date.now() - entry.timestamp);
        expirations[name] = Math.max(0, expiresIn);
        sources[name] = entry.source;
      });

      return {
        size: this.cache.size,
        themes: Array.from(this.cache.keys()),
        expirations,
        sources
      };
    }

    /**
     * Log a message if logging is enabled
     */
    private log(message: string, group = false, warn = false): void {
      if (!this.config.enableLogging) return;

      if (group) {
        console.group(`[ThemeCacheService] ${message}`);
      } else if (warn) {
        console.warn(`[ThemeCacheService] ${message}`);
      } else {
        console.log(`[ThemeCacheService] ${message}`);
      }
    }
  }

  // Export singleton instance
  export const themeCacheService = ThemeCacheService.getInstance();
