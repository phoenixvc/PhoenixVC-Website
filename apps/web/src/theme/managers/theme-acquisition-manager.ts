// theme/core/theme-acquisition-manager.ts

import {
  ThemeColors,
  ThemeName,
  ThemeSchemeInitial,
  ThemeMode,
  SemanticColors
} from "../types";
import { THEME_CONSTANTS } from "../constants";
import { themeValidationManager } from "./theme-validation-manager";
import { ThemeStorageManager } from "./theme-storage-manager";
import { transformTheme } from "../providers";
import { themeCacheService, ThemeCacheService } from "../services/theme-cache-service";
import { ThemeTransformationManager } from "./theme-transformation-manager";
import { LogManager } from "./log-manager";

/**
 * Configuration options for theme acquisition
 */
export interface ThemeAcquisitionConfig {
  /** Base URL for remote theme acquisition */
  baseUrl?: string;

  /** Default timeout for remote requests in milliseconds */
  timeout?: number;

  /** Default theme mode to use when transforming themes */
  defaultMode?: ThemeMode;

  /** Whether to validate themes after acquisition */
  validateThemes?: boolean;

  /** Whether to transform themes after acquisition */
  transformThemes?: boolean;

  /** Whether to use local storage for persisting themes */
  useLocalStorage?: boolean;

  /** Whether to log operations */
  enableLogging?: boolean;

  /** Whether to allow external theme loading */
  allowExternalLoading?: boolean;
}

/**
 * Status of a theme acquisition operation
 */
export type AcquisitionStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "cached";

/**
 * Result of a theme acquisition operation
 */
export interface AcquisitionResult {
  /** Status of the acquisition operation */
  status: AcquisitionStatus;

  /** The acquired theme data, if successful */
  data?: ThemeColors;

  /** Error message, if acquisition failed */
  error?: string;

  /** Source of the theme (local, remote, cache) */
  source?: "local" | "remote" | "cache" | "default" | "registered";

  /** Timestamp of when the theme was acquired */
  timestamp: number;
}

/**
 * ThemeAcquisitionManager
 *
 * Responsible for acquiring themes from various sources (local, remote, default),
 * validating them, transforming them if needed, and managing them through the cache service.
 */
export class ThemeAcquisitionManager {
  private static instance: ThemeAcquisitionManager;

  private config: ThemeAcquisitionConfig;
  private acquisitionStatus: Map<ThemeName, AcquisitionStatus>;
  private defaultTheme: ThemeColors;
  private cacheService: ThemeCacheService;
  private themeTransformationManager: ThemeTransformationManager;
  private readonly SERVICE_NAME = "ThemeAcquisitionManager";

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(config?: ThemeAcquisitionConfig) {
    // Default configuration
    this.config = {
      baseUrl: config?.baseUrl || "/themes",
      timeout: config?.timeout || 5000,
      defaultMode: config?.defaultMode || THEME_CONSTANTS.DEFAULTS.MODE,
      validateThemes: config?.validateThemes !== undefined ? config.validateThemes : true,
      transformThemes: config?.transformThemes !== undefined ? config.transformThemes : true,
      useLocalStorage: config?.useLocalStorage !== undefined ? config.useLocalStorage : true,
      enableLogging: config?.enableLogging !== undefined ? config.enableLogging : true,
      allowExternalLoading: config?.allowExternalLoading !== undefined ? config.allowExternalLoading : false
    };

    this.acquisitionStatus = new Map();

    // Initialize cache service
    this.cacheService = themeCacheService;

    // Initialize with a minimal default theme
    this.defaultTheme = this.createDefaultTheme();

    // Load themes from local storage if enabled
    if (this.config.useLocalStorage) {
      this.loadThemesFromStorage();
    }

    this.themeTransformationManager = new ThemeTransformationManager();
  }

  /**
   * Helper method to safely get the logging state
   */
  private isLoggingEnabled(): boolean {
    return this.config.enableLogging === true;
  }

  /**
   * Get the singleton instance of ThemeAcquisitionManager
   */
  static getInstance(config?: ThemeAcquisitionConfig): ThemeAcquisitionManager {
    if (!ThemeAcquisitionManager.instance) {
      ThemeAcquisitionManager.instance = new ThemeAcquisitionManager(config);
    } else if (config) {
      ThemeAcquisitionManager.instance.updateConfig(config);
    }
    return ThemeAcquisitionManager.instance;
  }

  /**
   * Update the configuration
   */
  updateConfig(config: Partial<ThemeAcquisitionConfig>): void {
    this.config = { ...this.config, ...config };
    LogManager.log(this.SERVICE_NAME, "Configuration updated", this.isLoggingEnabled());
  }

  /**
   * Acquire a theme by name
   *
   * This method attempts to get a theme from cache first, then local storage,
   * then local sources (if allowed), then remote sources (if allowed),
   * and finally falls back to the default theme.
   */
  async acquireTheme(themeName: ThemeName, options?: {
    forceRefresh?: boolean;
    allowExternalLoading?: boolean;
  }): Promise<AcquisitionResult> {
    const forceRefresh = options?.forceRefresh || false;
    const allowExternalLoading = options?.allowExternalLoading !== undefined
      ? options.allowExternalLoading
      : this.config.allowExternalLoading;

    const endLog = LogManager.log(
      this.SERVICE_NAME,
      `Acquiring theme: ${themeName} (forceRefresh: ${forceRefresh}, allowExternalLoading: ${allowExternalLoading})`,
      this.isLoggingEnabled(),
      { group: true }
    );

    try {
      // Update status to loading
      this.acquisitionStatus.set(themeName, "loading");

      // Check cache first if not forcing refresh
      if (!forceRefresh && this.cacheService.has(themeName)) {
        const cachedTheme = this.cacheService.get(themeName);
        if (cachedTheme) {
          LogManager.log(this.SERVICE_NAME, `Using cached theme: ${themeName}`, this.isLoggingEnabled());
          this.acquisitionStatus.set(themeName, "cached");

          return {
            status: "cached",
            data: cachedTheme,
            source: "cache",
            timestamp: Date.now()
          };
        }
      }

      // Try to load from storage if enabled
      if (this.config.useLocalStorage && !forceRefresh) {
        const storedTheme = ThemeStorageManager.getThemeData(themeName);
        if (storedTheme) {
          LogManager.log(this.SERVICE_NAME, `Using stored theme: ${themeName}`, this.isLoggingEnabled());

          // Process and cache the theme
          const processedTheme = this.processTheme(storedTheme, themeName);
          this.cacheService.set(themeName, processedTheme, undefined, "local");
          this.acquisitionStatus.set(themeName, "success");

          return {
            status: "success",
            data: processedTheme,
            source: "local",
            timestamp: Date.now()
          };
        }
      }

      // Only proceed with external loading if explicitly allowed
      if (allowExternalLoading) {
        // Try to load from local source
        try {
          const localTheme = await this.loadLocalTheme(themeName);
          if (localTheme) {
            LogManager.log(this.SERVICE_NAME, `Loaded local theme: ${themeName}`, this.isLoggingEnabled());

            // Process and cache the theme
            const processedTheme = this.processTheme(localTheme, themeName);
            this.cacheService.set(themeName, processedTheme, undefined, "local");
            this.acquisitionStatus.set(themeName, "success");

            // Save to local storage if enabled
            if (this.config.useLocalStorage) {
              this.saveToLocalStorage(themeName, processedTheme);
            }

            return {
              status: "success",
              data: processedTheme,
              source: "local",
              timestamp: Date.now()
            };
          }
        } catch (error) {
          LogManager.log(this.SERVICE_NAME, `Failed to load local theme: ${themeName}`, this.isLoggingEnabled(), { warn: true });
          console.warn(error);
          // Continue to try remote sources
        }

        // Try to load from remote source
        try {
          const remoteTheme = await this.loadRemoteTheme(themeName);
          if (remoteTheme) {
            LogManager.log(this.SERVICE_NAME, `Loaded remote theme: ${themeName}`, this.isLoggingEnabled());

            // Process and cache the theme
            const processedTheme = this.processTheme(remoteTheme, themeName);
            this.cacheService.set(themeName, processedTheme, undefined, "remote");
            this.acquisitionStatus.set(themeName, "success");

            // Save to local storage if enabled
            if (this.config.useLocalStorage) {
              this.saveToLocalStorage(themeName, processedTheme);
            }

            return {
              status: "success",
              data: processedTheme,
              source: "remote",
              timestamp: Date.now()
            };
          }
        } catch (error) {
          LogManager.log(this.SERVICE_NAME, `Failed to load remote theme: ${themeName}`, this.isLoggingEnabled(), { warn: true });
          console.warn(error);
          // Fall back to default theme
        }
      } else {
        LogManager.log(
          this.SERVICE_NAME,
          `External loading is disabled. Skipping local and remote theme loading for: ${themeName}`,
          this.isLoggingEnabled()
        );
      }

      // Fall back to default theme
      LogManager.log(this.SERVICE_NAME, `Using default theme for: ${themeName}`, this.isLoggingEnabled(), { warn: true });
      this.acquisitionStatus.set(themeName, "success");

      // Cache the default theme for this name
      this.cacheService.set(themeName, this.defaultTheme, undefined, "default");

      return {
        status: "success",
        data: this.defaultTheme,
        source: "default",
        timestamp: Date.now()
      };
    } catch (error) {
      LogManager.log(this.SERVICE_NAME, `Error acquiring theme: ${themeName}`, this.isLoggingEnabled(), { warn: true });
      console.error(error);
      this.acquisitionStatus.set(themeName, "error");

      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      };
    } finally {
      // Always end the group that was started at the beginning of this method
      endLog();
    }
  }

  /**
   * Get the acquisition status for a theme
   */
  getAcquisitionStatus(themeName: ThemeName): AcquisitionStatus {
    return this.acquisitionStatus.get(themeName) || "idle";
  }

  /**
   * Check if a theme is cached
   */
  isThemeCached(themeName: ThemeName): boolean {
    return this.cacheService.has(themeName);
  }

  /**
   * Get cache status information
   */
  getCacheStatus() {
    return this.cacheService.getCacheStatus();
  }

  /**
   * Clear the theme cache
   */
  clearCache(themeName?: ThemeName): void {
    this.cacheService.clear(themeName);

    // Also clear from local storage if enabled
    if (this.config.useLocalStorage && themeName) {
      this.removeFromLocalStorage(themeName);
    } else if (this.config.useLocalStorage) {
      this.clearLocalStorage();
    }

    LogManager.log(
      this.SERVICE_NAME,
      themeName ? `Cleared theme "${themeName}" from cache` : "Cleared entire theme cache",
      this.isLoggingEnabled()
    );
  }

  /**
   * Preload a theme
   */
  async preloadTheme(themeName: ThemeName, allowExternalLoading?: boolean): Promise<void> {
    const endLog = LogManager.log(
      this.SERVICE_NAME,
      `Preloading theme: ${themeName}`,
      this.isLoggingEnabled(),
      { group: true }
    );

    try {
      await this.acquireTheme(themeName, { allowExternalLoading });
    } finally {
      endLog();
    }
  }

  /**
   * Register a theme directly
   */
  registerTheme(themeName: ThemeName, theme: ThemeColors | ThemeSchemeInitial, semantic?: SemanticColors): ThemeColors {
    const endLog = LogManager.log(
      this.SERVICE_NAME,
      `Registering theme: ${themeName}`,
      this.isLoggingEnabled(),
      { group: true }
    );

    try {
      // Process and cache the theme
      const processedTheme = this.processTheme(theme, themeName, semantic);
      this.cacheService.set(themeName, processedTheme, semantic, "registered");

      // Save to local storage if enabled
      if (this.config.useLocalStorage) {
        this.saveToLocalStorage(themeName, processedTheme);
      }

      return processedTheme;
    } finally {
      endLog();
    }
  }

  /**
   * Process a theme (validate and transform if needed)
   */
  private processTheme(
    theme: ThemeColors | ThemeSchemeInitial,
    themeName: ThemeName,
    semantic?: SemanticColors
  ): ThemeColors {
    // Transform the theme if needed
    let processedTheme: ThemeColors;

    if (this.config.transformThemes) {
      if (themeValidationManager.isThemeColorsType(theme)) {
        // If it"s a ThemeColors object, we need to extract the scheme for transformation
        // Get the first scheme from the ThemeColors object
        const schemeKey = Object.keys(theme.schemes)[0] || themeName;
        const scheme = theme.schemes[schemeKey];

        // If it already has semantic colors, use them unless overridden
        const semanticColors = semantic || theme.semantic;

        // Now transform it
        processedTheme = {
          schemes: {
            [schemeKey]: this.themeTransformationManager.ensureFullyProcessed(scheme)
          },
          semantic: semanticColors
        };
      } else {
        // It"s a ThemeSchemeInitial, transform it directly
        const transformedScheme = this.themeTransformationManager.transformScheme(theme);

        // Create a ThemeColors object with the transformed scheme
        processedTheme = {
          schemes: {
            [themeName]: transformedScheme
          },
          semantic: semantic
        };
      }
    } else if (themeValidationManager.isThemeColorsType(theme)) {
      // It"s already a ThemeColors and we"re not transforming
      processedTheme = theme;

      // Add semantic colors if provided
      if (semantic) {
        processedTheme.semantic = semantic;
      }
    } else {
      // It"s a ThemeSchemeInitial but we"re not transforming
      // This is an error state since we need a fully formed ThemeColors
      throw new Error("Cannot process theme: transformation is disabled but theme is not a ThemeColors object");
    }

    // Validate the theme if needed
    if (this.config.validateThemes) {
      themeValidationManager.validateProcessedTheme(processedTheme);
    }

    return processedTheme;
  }

  /**
   * Load a theme from local sources
   */
  private async loadLocalTheme(themeName: ThemeName): Promise<ThemeColors | ThemeSchemeInitial | undefined> {
    // Implementation depends on your local theme sources
    // This could be imported from local modules, loaded from JSON files, etc.

    // Example implementation for dynamic import from local modules
    try {
      // This is just a placeholder - replace with your actual local theme loading logic
      const module = await import(`../themes/${themeName}`).catch(() => undefined);
      return module?.default;
    } catch (error) {
      LogManager.log(this.SERVICE_NAME, `Failed to load local theme: ${themeName}`, this.isLoggingEnabled(), { warn: true });
      console.warn(error);
      return undefined;
    }
  }

  /**
   * Load a theme from remote sources
   */
  private async loadRemoteTheme(themeName: ThemeName): Promise<ThemeColors | ThemeSchemeInitial | undefined> {
    // Implementation depends on your remote theme sources
    // This could be fetched from an API, CDN, etc.

    // Example implementation for fetch from API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}/${themeName}.json`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch theme: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`Timeout fetching theme: ${themeName}`);
      }

      LogManager.log(this.SERVICE_NAME, `Failed to load remote theme: ${themeName}`, this.isLoggingEnabled(), { warn: true });
      console.warn(error);
      return undefined;
    }
  }

  /**
   * Load theme with backward compatibility for theme-loader
   */
  async loadTheme(
    themeName?: ThemeName,
    config?: Partial<ThemeAcquisitionConfig>
  ): Promise<ThemeColors> {
    if (config) {
      this.updateConfig(config);
    }

    const effectiveThemeName = themeName || THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME;
    const result = await this.acquireTheme(effectiveThemeName, {
      allowExternalLoading: config?.allowExternalLoading
    });

    if (result.status === "error") {
      throw new Error(result.error || "Failed to load theme");
    }

    return result.data!;
  }

  /**
   * Create the default theme from constants
   */
  private createDefaultTheme(): ThemeColors {
    // Use the default theme from constants
    const defaultScheme = THEME_CONSTANTS.COLORS.schemes[THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME];
    const semanticColors = THEME_CONSTANTS.COLORS.semantic;

    if (!defaultScheme) {
      throw new Error("Default theme scheme is missing in THEME_CONSTANTS");
    }

    // If transformation is enabled, use transformTheme to convert ThemeSchemeInitial to ThemeColors
    if (this.config.transformThemes) {
      return transformTheme(defaultScheme, this.config.defaultMode!, semanticColors);
    } else {
      // If no transformation is needed, we need to manually create a ThemeColors object
      // This might require a utility function to convert ThemeSchemeInitial to ThemeScheme
      const themeManager = new ThemeTransformationManager(this.config);
      const convertedScheme = themeManager.transformScheme(defaultScheme);

      return {
        schemes: {
          [THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME]: convertedScheme
        },
        semantic: semanticColors
      };
    }
  }

  /**
   * Save a theme to local storage
   */
  private saveToLocalStorage(themeName: ThemeName, theme: ThemeColors): void {
    if (!this.config.useLocalStorage) return;

    try {
      ThemeStorageManager.saveThemeData(themeName, theme);
      LogManager.log(this.SERVICE_NAME, `Saved theme to local storage: ${themeName}`, this.isLoggingEnabled());
    } catch (error) {
      LogManager.log(this.SERVICE_NAME, `Failed to save theme to local storage: ${themeName}`, this.isLoggingEnabled(), { warn: true });
      console.warn(error);
    }
  }

  /**
   * Remove a theme from local storage
   */
  private removeFromLocalStorage(themeName: ThemeName): void {
    if (!this.config.useLocalStorage) return;

    try {
      ThemeStorageManager.removeThemeData(themeName);
      LogManager.log(this.SERVICE_NAME, `Removed theme from local storage: ${themeName}`, this.isLoggingEnabled());
    } catch (error) {
      LogManager.log(this.SERVICE_NAME, `Failed to remove theme from local storage: ${themeName}`, this.isLoggingEnabled(), { warn: true });
      console.warn(error);
    }
  }

  /**
   * Clear all themes from local storage
   */
  private clearLocalStorage(): void {
    if (!this.config.useLocalStorage) return;

    try {
      ThemeStorageManager.clearAllThemeData();
      LogManager.log(this.SERVICE_NAME, "Cleared all themes from local storage", this.isLoggingEnabled());
    } catch (error) {
      LogManager.log(this.SERVICE_NAME, "Failed to clear themes from local storage", this.isLoggingEnabled(), { warn: true });
      console.warn(error);
    }
  }

  /**
   * Load themes from local storage into cache
   */
  private loadThemesFromStorage(): void {
    if (!this.config.useLocalStorage) return;

    try {
      const themeNames = ThemeStorageManager.getStoredThemeNames();
      LogManager.log(this.SERVICE_NAME, `Found ${themeNames.length} themes in storage`, this.isLoggingEnabled());

      themeNames.forEach(themeName => {
        const theme = ThemeStorageManager.getThemeData(themeName);
        if (theme) {
          this.cacheService.set(themeName, theme, undefined, "local");
          LogManager.log(this.SERVICE_NAME, `Loaded theme from storage: ${themeName}`, this.isLoggingEnabled());
        }
      });
    } catch (error) {
      LogManager.log(this.SERVICE_NAME, "Failed to load themes from storage", this.isLoggingEnabled(), { warn: true });
      console.warn(error);
    }
  }
}

// Export singleton instance
export const themeAcquisitionManager = ThemeAcquisitionManager.getInstance();
