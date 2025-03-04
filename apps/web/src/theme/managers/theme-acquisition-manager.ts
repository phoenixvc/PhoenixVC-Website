// theme/core/theme-acquisition-manager.ts

import {
    ThemeColors,
    ThemeName,
    ThemeSchemeInitial,
    ThemeMode,
    SemanticColors
  } from "../types";
  import { THEME_CONSTANTS } from "../constants";
  import { themeCacheService, ThemeCacheService } from "./theme-cache-service";
  import { themeValidationManager } from "./theme-validation-manager";
  import { transformTheme } from "../providers";

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

    /** Prefix for local storage keys */
    localStoragePrefix?: string;

    /** Whether to log operations */
    enableLogging?: boolean;
  }

  /**
   * Status of a theme acquisition operation
   */
  export type AcquisitionStatus =
    | 'idle'
    | 'loading'
    | 'success'
    | 'error'
    | 'cached';

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
    source?: 'local' | 'remote' | 'cache' | 'default' | 'registered';

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

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor(config?: ThemeAcquisitionConfig) {
      // Default configuration
      this.config = {
        baseUrl: config?.baseUrl || '/themes',
        timeout: config?.timeout || 5000,
        defaultMode: config?.defaultMode || THEME_CONSTANTS.DEFAULTS.MODE,
        validateThemes: config?.validateThemes !== undefined ? config.validateThemes : true,
        transformThemes: config?.transformThemes !== undefined ? config.transformThemes : true,
        useLocalStorage: config?.useLocalStorage !== undefined ? config.useLocalStorage : true,
        localStoragePrefix: config?.localStoragePrefix || 'theme_acquisition_',
        enableLogging: config?.enableLogging !== undefined ? config.enableLogging : true
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
      this.log(`Configuration updated`);
    }

    /**
     * Acquire a theme by name
     *
     * This method attempts to get a theme from cache first, then local storage,
     * then remote sources, and finally falls back to the default theme.
     */
    async acquireTheme(themeName: ThemeName, forceRefresh = false): Promise<AcquisitionResult> {
      this.log(`Acquiring theme: ${themeName}`, true);

      try {
        // Update status to loading
        this.acquisitionStatus.set(themeName, 'loading');

        // Check cache first if not forcing refresh
        if (!forceRefresh && this.cacheService.has(themeName)) {
          const cachedTheme = this.cacheService.get(themeName);
          if (cachedTheme) {
            this.log(`Using cached theme: ${themeName}`);
            this.acquisitionStatus.set(themeName, 'cached');

            return {
              status: 'cached',
              data: cachedTheme,
              source: 'cache',
              timestamp: Date.now()
            };
          }
        }

        // Try to load from local source
        try {
          const localTheme = await this.loadLocalTheme(themeName);
          if (localTheme) {
            // Process and cache the theme
            const processedTheme = this.processTheme(localTheme, themeName);
            this.cacheService.set(themeName, processedTheme, undefined, 'local');
            this.acquisitionStatus.set(themeName, 'success');

            // Save to local storage if enabled
            if (this.config.useLocalStorage) {
              this.saveToLocalStorage(themeName, processedTheme);
            }

            return {
              status: 'success',
              data: processedTheme,
              source: 'local',
              timestamp: Date.now()
            };
          }
        } catch (error) {
          this.log(`Failed to load local theme: ${themeName}`, false, true);
          console.warn(error);
          // Continue to try remote sources
        }

        // Try to load from remote source
        try {
          const remoteTheme = await this.loadRemoteTheme(themeName);
          if (remoteTheme) {
            // Process and cache the theme
            const processedTheme = this.processTheme(remoteTheme, themeName);
            this.cacheService.set(themeName, processedTheme, undefined, 'remote');
            this.acquisitionStatus.set(themeName, 'success');

            // Save to local storage if enabled
            if (this.config.useLocalStorage) {
              this.saveToLocalStorage(themeName, processedTheme);
            }

            return {
              status: 'success',
              data: processedTheme,
              source: 'remote',
              timestamp: Date.now()
            };
          }
        } catch (error) {
          this.log(`Failed to load remote theme: ${themeName}`, false, true);
          console.warn(error);
          // Fall back to default theme
        }

        // Fall back to default theme
        this.log(`Using default theme for: ${themeName}`, false, true);
        this.acquisitionStatus.set(themeName, 'success');

        // Cache the default theme for this name
        this.cacheService.set(themeName, this.defaultTheme, undefined, 'default');

        return {
          status: 'success',
          data: this.defaultTheme,
          source: 'default',
          timestamp: Date.now()
        };
      } catch (error) {
        this.log(`Error acquiring theme: ${themeName}`, false, true);
        console.error(error);
        this.acquisitionStatus.set(themeName, 'error');

        return {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        };
      } finally {
        if (this.config.enableLogging) {
          console.groupEnd();
        }
      }
    }

    /**
     * Get the acquisition status for a theme
     */
    getAcquisitionStatus(themeName: ThemeName): AcquisitionStatus {
      return this.acquisitionStatus.get(themeName) || 'idle';
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
    }

    /**
     * Preload a theme
     */
    async preloadTheme(themeName: ThemeName): Promise<void> {
      this.log(`Preloading theme: ${themeName}`);
      await this.acquireTheme(themeName);
    }

    /**
     * Register a theme directly
     */
    registerTheme(themeName: ThemeName, theme: ThemeColors | ThemeSchemeInitial, semantic?: SemanticColors): ThemeColors {
      this.log(`Registering theme: ${themeName}`);

      // Process and cache the theme
      const processedTheme = this.processTheme(theme, themeName, semantic);
      this.cacheService.set(themeName, processedTheme, semantic, 'registered');

      // Save to local storage if enabled
      if (this.config.useLocalStorage) {
        this.saveToLocalStorage(themeName, processedTheme);
      }

      return processedTheme;
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
          // If it already has semantic colors, use them unless overridden
          const semanticColors = semantic || theme.semantic;
          processedTheme = transformTheme(theme, this.config.defaultMode!);

          // Ensure semantic colors are preserved
          if (semanticColors) {
            processedTheme.semantic = semanticColors;
          }
        } else {
          // It's a ThemeSchemeInitial, so create a ThemeColors first
          const themeColors: ThemeColors = {
            schemes: {
              [themeName]: theme
            },
            semantic: semantic
          };

          processedTheme = transformTheme(themeColors, this.config.defaultMode!);
        }
      } else if (themeValidationManager.isThemeColorsType(theme)) {
        // It's already a ThemeColors and we're not transforming
        processedTheme = theme;

        // Add semantic colors if provided
        if (semantic) {
          processedTheme.semantic = semantic;
        }
      } else {
        // It's a ThemeSchemeInitial but we're not transforming
        // This is an error state since we need a fully formed ThemeColors
        throw new Error('Cannot process theme: transformation is disabled but theme is not a ThemeColors object');
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
        this.log(`Failed to load local theme: ${themeName}`, false, true);
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
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error(`Timeout fetching theme: ${themeName}`);
        }

        this.log(`Failed to load remote theme: ${themeName}`, false, true);
        console.warn(error);
        return undefined;
      }
    }

  async loadTheme(
    themeName?: ThemeName,
    config?: Partial<ThemeAcquisitionConfig>
  ): Promise<ThemeColors> {
    if (config) {
      this.updateConfig(config);
    }

    const effectiveThemeName = themeName || THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME;
    const result = await this.acquireTheme(effectiveThemeName);

    if (result.status === 'error') {
      throw new Error(result.error || 'Failed to load theme');
    }

    return result.data!;
  }

  private createDefaultTheme(): ThemeColors {
    // Use the default theme from constants
    const defaultScheme = THEME_CONSTANTS.COLORS.schemes[THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME];
    const semanticColors = THEME_CONSTANTS.COLORS.semantic;

    if (!defaultScheme) {
      throw new Error("Default theme scheme is missing in THEME_CONSTANTS");
    }

    // Create a ThemeColors object with the default scheme
    const defaultTheme: ThemeColors = {
      schemes: {
        [THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME]: defaultScheme
      },
      semantic: semanticColors
    };

    // Transform if needed
    if (this.config.transformThemes) {
      return transformTheme(defaultTheme, this.config.defaultMode!);
    }

    return defaultTheme;
  }
}
