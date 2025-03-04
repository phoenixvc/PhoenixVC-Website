import { SemanticColors, ThemeColors, ThemeName, ThemeMode, ThemeSchemeInitial } from "@/theme/types";
import { THEME_CONSTANTS } from "../constants";
import { ProcessedThemeValidation, SemanticColorValidation } from "../validation";
import { transformTheme } from "../providers";

export interface ThemeCacheConfig {
  /** Duration in milliseconds for how long a theme should be cached */
  cacheDuration: number;
  /** Default theme mode to use when transforming themes */
  defaultMode: ThemeMode;
}

export interface ThemeCacheEntry {
  /** The fully transformed theme data */
  theme: ThemeColors;
  /** Timestamp when the theme was cached */
  timestamp: number;
}

/**
 * ThemeCacheManager handles caching of transformed theme data.
 * It ensures that only fully transformed themes are stored in the cache.
 */
export class ThemeCacheManager {
  private cache: Map<ThemeName, ThemeCacheEntry>;
  private config: ThemeCacheConfig;

  constructor(config?: Partial<ThemeCacheConfig>) {
    this.cache = new Map<ThemeName, ThemeCacheEntry>();
    this.config = {
      cacheDuration: 1000 * 60 * 5, // 5 minutes by default
      defaultMode: THEME_CONSTANTS.DEFAULTS.MODE,
      ...config
    };
  }

  /**
   * Get a theme from the cache if it exists and is not expired
   */
  get(name: ThemeName): ThemeColors | null {
    console.group(`[ThemeCacheManager] Getting theme: ${name}`);

    const entry = this.cache.get(name);

    if (!entry) {
      console.log(`[ThemeCacheManager] Theme "${name}" not found in cache`);
      console.groupEnd();
      return null;
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > this.config.cacheDuration) {
      console.log(`[ThemeCacheManager] Theme "${name}" has expired`);
      this.cache.delete(name);
      console.groupEnd();
      return null;
    }

    // Verify the theme is fully transformed
    if (!this.isFullyTransformed(entry.theme)) {
      console.warn(`[ThemeCacheManager] Theme "${name}" is not fully transformed. Removing from cache.`);
      this.cache.delete(name);
      console.groupEnd();
      return null;
    }

    console.log(`[ThemeCacheManager] Returning cached theme for "${name}"`);
    console.groupEnd();
    return entry.theme;
  }

  /**
  * Set a theme in the cache, ensuring it is fully transformed first
  */
  set(name: ThemeName, theme: ThemeColors | ThemeSchemeInitial, semantic?: SemanticColors): ThemeColors {
    console.group(`[ThemeCacheManager] Setting theme: ${name}`);

    let transformedTheme: ThemeColors;

    // Check if the theme is already transformed
    if (this.isThemeColorsType(theme)) {
      console.log(`[ThemeCacheManager] Theme "${name}" is already a ThemeColors object`);

      // Even if it's a ThemeColors object, verify it's fully transformed
      if (!this.isFullyTransformed(theme)) {
        console.log(`[ThemeCacheManager] Theme "${name}" needs transformation`);

        // If it's a ThemeColors but not fully transformed, we should use it as is
        // and let the transformer handle it properly
        transformedTheme = {
          schemes: {
            [name]: theme.schemes[Object.keys(theme.schemes)[0] as ThemeName]
          },
          semantic: semantic || theme.semantic
        };

        // Apply full transformation
        transformedTheme = transformTheme(transformedTheme, this.config.defaultMode);
      } else {
        transformedTheme = theme;
      }
    } else {
      // It's a ThemeSchemeInitial, so transform it
      console.log(`[ThemeCacheManager] Transforming ThemeSchemeInitial for "${name}"`);

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
      console.log(`[ThemeCacheManager] Validating transformed theme for "${name}"`);
      ProcessedThemeValidation.validateProcessedTheme(transformedTheme.schemes);

      if (transformedTheme.semantic) {
        SemanticColorValidation.validateSemanticColors(transformedTheme.semantic);
      }
    } catch (error) {
      console.error(`[ThemeCacheManager] Theme validation failed for "${name}":`, error);
      console.groupEnd();
      throw error;
    }

    // Store in cache
    this.cache.set(name, {
      theme: transformedTheme,
      timestamp: Date.now()
    });

    console.log(`[ThemeCacheManager] Theme "${name}" successfully cached`);
    console.groupEnd();
    return transformedTheme;
  }

  /**
   * Check if a theme exists in the cache and is not expired
   */
  has(name: ThemeName): boolean {
    const entry = this.cache.get(name);
    if (!entry) return false;

    const isValid = Date.now() - entry.timestamp <= this.config.cacheDuration &&
      this.isFullyTransformed(entry.theme);

    return isValid;
  }

  /**
   * Clear the entire theme cache or a specific theme
   */
  clear(name?: ThemeName): void {
    if (name) {
      this.cache.delete(name);
      console.log(`[ThemeCacheManager] Cleared theme "${name}" from cache`);
    } else {
      this.cache.clear();
      console.log("[ThemeCacheManager] Cleared entire theme cache");
    }
  }

  /**
   * Get information about the current cache state
   */
  getCacheStatus(): {
    size: number;
    schemes: ThemeName[];
    expirations: Record<ThemeName, number>;
  } {
    const expirations: Record<ThemeName, number> = {};

    this.cache.forEach((entry, name) => {
      const expiresIn = this.config.cacheDuration - (Date.now() - entry.timestamp);
      expirations[name] = Math.max(0, expiresIn);
    });

    return {
      size: this.cache.size,
      schemes: Array.from(this.cache.keys()),
      expirations
    };
  }

  /**
   * Check if a theme is fully transformed with all required shade levels
   */
  private isFullyTransformed(theme: ThemeColors): boolean {
    try {
      // Check if at least one scheme exists
      const schemeNames = Object.keys(theme.schemes);
      if (schemeNames.length === 0) return false;

      // Get the first scheme
      const scheme = theme.schemes[schemeNames[0]];
      if (!scheme?.base) return false;

      // Check if primary and secondary have shade levels
      const baseColors = scheme.base;

      // Check primary
      if (!baseColors.primary ||
        typeof baseColors.primary !== "object" ||
        !this.hasRequiredShades(baseColors.primary)) {
        return false;
      }

      // Check secondary
      if (!baseColors.secondary ||
        typeof baseColors.secondary !== "object" ||
        !this.hasRequiredShades(baseColors.secondary)) {
        return false;
      }

      // Check accent if it exists
      if (baseColors.accent &&
        (typeof baseColors.accent !== "object" ||
          !this.hasRequiredShades(baseColors.accent))) {
        return false;
      }

      // Check for both light and dark mode colors
      if (!scheme.light || !scheme.dark) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("[ThemeCacheManager] Error checking if theme is fully transformed:", error);
      return false;
    }
  }

  /**
   * Check if a color object has all required shade levels
   */
  private hasRequiredShades(colorObj: any): boolean {
    // Check for key shade levels (at minimum 500 should exist)
    return colorObj[500] !== undefined &&
      typeof colorObj[500] === "object" &&
      colorObj[500].hex !== undefined;
  }

  /**
   * Type guard to check if an object is a ThemeColors
   */
  private isThemeColorsType(theme: any): theme is ThemeColors {
    return theme &&
      typeof theme === "object" &&
      theme.schemes !== undefined &&
      typeof theme.schemes === "object";
  }

  /**
   * Transform a theme scheme into a fully processed ThemeColors object
   */
  private transformThemeData(
    themeData: ThemeSchemeInitial,
    semantic?: SemanticColors
  ): ThemeColors {
    console.log("[ThemeCacheManager] Transforming theme data");

    // Create a ThemeSchemeInitial object from the input
    const initialTheme: ThemeSchemeInitial = {
      base: themeData.base,
      light: themeData.light,
      dark: themeData.dark
    };

    // Transform the theme
    const transformed = transformTheme(
      initialTheme,
      this.config.defaultMode,
      semantic
    );

    console.log("[ThemeCacheManager] Theme transformation complete");
    return transformed;
  }
}

// Create and export a singleton instance with default configuration
export const themeCacheManager = new ThemeCacheManager();
