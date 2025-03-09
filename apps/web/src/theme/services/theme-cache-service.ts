// theme/core/theme-cache-service.ts

import {
  SemanticColors,
  ThemeColors,
  ThemeName,
  ThemeMode,
  ThemeSchemeInitial,
  ThemeScheme
} from "../types";
import { THEME_CONSTANTS } from "../constants";
import { themeValidationManager, transformTheme } from "../providers";
import { LogManager } from "../managers/log-manager";

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
  source: "local" | "remote" | "default" | "registered";
}

/**
 * ThemeCacheService handles caching of transformed theme data.
 * It ensures that only fully transformed themes are stored in the cache.
 */
export class ThemeCacheService {
  private static instance: ThemeCacheService;
  private cache: Map<ThemeName, ThemeCacheEntry>;
  private config: ThemeCacheConfig;
  private readonly SERVICE_NAME = "ThemeCacheService";

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
   * Helper method to safely get the logging state
   */
  private isLoggingEnabled(): boolean {
    return this.config.enableLogging === true;
  }

  /**
   * Update the cache configuration
   */
  updateConfig(config: Partial<ThemeCacheConfig>): void {
    this.config = { ...this.config, ...config };
    LogManager.log(this.SERVICE_NAME, "Cache configuration updated", this.isLoggingEnabled());
  }

  /**
   * Get a theme from the cache if it exists and is not expired
   */
  get(name: ThemeName): ThemeColors | null {
    const endLog = LogManager.log(this.SERVICE_NAME, `Getting theme: ${name}`, this.isLoggingEnabled(), { group: true });

    try {
      const entry = this.cache.get(name);

      if (!entry) {
        LogManager.log(this.SERVICE_NAME, `Theme "${name}" not found in cache`, this.isLoggingEnabled());
        return null;
      }

      // Check if the entry has expired
      if (Date.now() - entry.timestamp > this.config.cacheDuration) {
        LogManager.log(this.SERVICE_NAME, `Theme "${name}" has expired`, this.isLoggingEnabled());
        this.cache.delete(name);
        return null;
      }

      // Verify the theme is fully transformed
      if (!themeValidationManager.isFullyTransformed(entry.theme)) {
        LogManager.log(this.SERVICE_NAME, `Theme "${name}" is not fully transformed. Removing from cache.`, this.isLoggingEnabled(), { warn: true });
        this.cache.delete(name);
        return null;
      }

      LogManager.log(this.SERVICE_NAME, `Returning cached theme for "${name}"`, this.isLoggingEnabled());
      return entry.theme;
    } finally {
      endLog();
    }
  }

  /**
   * Helper method to transform themes with proper mode handling
   */
  private transformThemeWithMode(
    input: ThemeColors | ThemeSchemeInitial,
    semantic?: SemanticColors
  ): ThemeColors {
    const mode = this.config.defaultMode;

    if (this.isThemeSchemeInitial(input)) {
      // For ThemeSchemeInitial, just pass it directly
      return transformTheme(input, mode, semantic);
    } else {
      // For ThemeColors that need transformation
      if (!themeValidationManager.isFullyTransformed(input)) {
        // Try to extract the mode from the input if available
        // Create a type guard to check if the input has a mode property
        const hasMode = (obj: ThemeColors): obj is ThemeColors & { mode: ThemeMode } =>
          "mode" in obj && typeof obj.mode === "string";

        // Use the type guard to safely access the mode property
        const inputMode = hasMode(input) ? input.mode : mode;

        // Option 1: If transformTheme can handle ThemeColors directly
        const asTransformable = <T>(value: unknown): T => value as T;

        // Use the type assertion function with an explicit generic type
        return transformTheme(
          asTransformable<ThemeSchemeInitial>(input),
          inputMode,
          semantic
        );
      } else {
        // Already transformed, just update semantic if needed
        if (semantic && semantic !== input.semantic) {
          return {
            ...input,
            semantic: semantic
          };
        }
        return input;
      }
    }
  }

  /**
   * Set a theme in the cache, ensuring it is fully transformed first
   */
  set(
    name: ThemeName,
    themeData: ThemeColors | ThemeSchemeInitial,
    semantic?: SemanticColors,
    source: "local" | "remote" | "default" | "registered" = "registered"
  ): ThemeColors {
    const endLog = LogManager.log(this.SERVICE_NAME, `Setting theme: ${name}`, this.isLoggingEnabled(), { group: true });

    try {
      // Transform the theme using our helper method
      let transformedTheme: ThemeColors;
      try {
        transformedTheme = this.transformThemeWithMode(themeData, semantic);
      } catch (error) {
        LogManager.log(this.SERVICE_NAME, `Theme transformation failed for "${name}":`, this.isLoggingEnabled(), { warn: true });
        console.error(error);
        throw error;
      }

      // Validate the transformed theme
      try {
        LogManager.log(this.SERVICE_NAME, `Validating transformed theme for "${name}"`, this.isLoggingEnabled());
        themeValidationManager.validateProcessedTheme(transformedTheme);
      } catch (error) {
        LogManager.log(this.SERVICE_NAME, `Theme validation failed for "${name}":`, this.isLoggingEnabled(), { warn: true });
        console.error(error);
        throw error;
      }

      // Enforce cache size limit
      if (this.cache.size >= (this.config.maxCacheSize || 10) && !this.cache.has(name)) {
        // Remove the oldest entry
        const oldestEntry = Array.from(this.cache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];

        if (oldestEntry) {
          LogManager.log(this.SERVICE_NAME, `Cache full, removing oldest entry: ${oldestEntry[0]}`, this.isLoggingEnabled());
          this.cache.delete(oldestEntry[0]);
        }
      }

      // Store in cache
      this.cache.set(name, {
        theme: transformedTheme,
        timestamp: Date.now(),
        source
      });

      LogManager.log(this.SERVICE_NAME, `Theme "${name}" successfully cached`, this.isLoggingEnabled());
      return transformedTheme;
    } finally {
      endLog();
    }
  }

  /**
   * Type guard to check if input is a ThemeSchemeInitial
   * Reusing the same logic from ThemeTransformationManager
   */
  private isThemeSchemeInitial(input: unknown): input is ThemeSchemeInitial {
    return input !== null &&
          typeof input === "object" &&
          "base" in input &&
          (!("schemes" in input));
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
      LogManager.log(this.SERVICE_NAME, `Cleared theme "${name}" from cache`, this.isLoggingEnabled());
    } else {
      this.cache.clear();
      LogManager.log(this.SERVICE_NAME, "Cleared entire theme cache", this.isLoggingEnabled());
    }
  }

  /**
   * Get information about the current cache state
   */
  getCacheStatus(): {
    size: number;
    themes: ThemeName[];
    expirations: Record<string, number>;
    sources: Record<string, string>;
  } {
    // Initialize with empty objects instead of trying to create full Records
    const expirations: Record<string, number> = {};
    const sources: Record<string, string> = {};

    // Populate with actual data from the cache
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
}

// Export singleton instance
export const themeCacheService = ThemeCacheService.getInstance();
