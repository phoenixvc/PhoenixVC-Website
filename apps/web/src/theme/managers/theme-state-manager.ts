// src/theme/core/theme-manager.ts

import { ThemeStorage } from "../utils/theme-storage";
import { THEME_CONSTANTS } from "../constants/theme-constants";
import { Mode, ThemeName, ThemeConfig, ThemeMode, ThemeState } from "../types";
import { isValidThemeName, isValidThemeMode } from "./theme-validation-manager";
import {
  loadTheme,
  isThemeCached,
  preloadTheme,
  clearThemeCache,
  getCacheStatus,
  ThemeLoaderConfig
} from "../providers/theme-loader";

/**
 * Manages the global theme state using the Singleton pattern.
 * Responsible for initializing, updating, and notifying about theme state changes.
 * @class ThemeStateManager
 */
export class ThemeStateManager {
  private static instance: ThemeStateManager;

  // State properties
  private currentColorScheme!: ThemeName;
  private currentMode!: ThemeMode;
  private systemMode!: ThemeMode;
  private useSystem!: boolean;
  private _initialized: boolean = false;
  private config: ThemeConfig;

  // Theme loading state
  private _isLoadingTheme: boolean = false;
  private _loadingThemePromise: Promise<void> | null = null;
  private _loadingError: Error | null = null;

  // DOM-related properties
  private listeners: Set<() => void>;
  private mediaQuery: MediaQueryList | null = null;

  private constructor(config: ThemeConfig = { name: "default", useSystem: true }) {
    // Initialize all properties first to avoid undefined errors
    this.listeners = new Set();
    this._initialized = false;
    this._isLoadingTheme = false;
    this._loadingThemePromise = null;
    this._loadingError = null;
    this.mediaQuery = null;

    // Then configure and initialize the state
    this.config = {
      ...config,
      themeName: config.themeName || "classic",
      mode: config.mode || "light",
      direction: config.direction || "ltr",
      version: config.version || "1.0.0"
    };

    this.initializeState();

    // Finally, set up browser-specific functionality
    if (typeof window !== "undefined") {
      this.initializeSystemListener();
      this._initialized = true;

      // Load the initial theme
      this.loadAndApplyTheme(this.currentColorScheme).catch(error => {
        console.error("[ThemeStateManager] Failed to load initial theme:", error);
        this._loadingError = error instanceof Error ? error : new Error("Failed to load initial theme");
      });
    }
  }

  // Expose the initialized flag via a getter
  get initialized(): boolean {
    return this._initialized;
  }

  // Expose theme loading state
  get isLoadingTheme(): boolean {
    return this._isLoadingTheme;
  }

  // Expose loading error
  get loadingError(): Error | null {
    return this._loadingError;
  }

  /**
   * Initialize the state with stored values or defaults.
   */
  private initializeState(): void {
    this.currentColorScheme = this.getStoredOrDefaultColorScheme();
    this.currentMode = this.getStoredOrDefaultMode();
    this.systemMode = this.getInitialSystemMode();
    this.useSystem = Boolean(ThemeStorage.getUseSystem());
  }

  private getStoredOrDefaultColorScheme(): ThemeName {
    const storedScheme = ThemeStorage.getColorScheme();
    return storedScheme && isValidThemeName(storedScheme)
      ? storedScheme
      : "classic";
  }

  private getStoredOrDefaultMode(): Mode {
    const storedMode = ThemeStorage.getMode();
    return storedMode && isValidThemeMode(storedMode)
      ? storedMode
      : "light";
  }

  /**
   * Get singleton instance.
   */
  static getInstance(config?: ThemeConfig): ThemeStateManager {
    if (!ThemeStateManager.instance) {
      ThemeStateManager.instance = new ThemeStateManager(config);
    } else if (config) {
      // Optionally update config if provided and instance exists
      ThemeStateManager.instance.updateConfig(config);
    }
    return ThemeStateManager.instance;
  }

  /**
   * Update config if needed after initialization
   */
  updateConfig(config: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...config };
    this.notify();
  }

  /**
   * Initialize system mode listener.
   */
  private initializeSystemListener(): void {
    if (typeof window === "undefined") return;

    try {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = this.handleSystemModeChange.bind(this);

      // Initial check
      handleChange(this.mediaQuery);

      // Add listener with fallback
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener("change", handleChange);
      } else {
        this.mediaQuery.addListener(handleChange);
      }
    } catch (error) {
      console.error("[ThemeStateManager] Error initializing system mode listener:", error);
      this.handleSystemModeError();
    }
  }

  private handleSystemModeChange(e: MediaQueryListEvent | MediaQueryList): void {
    this.systemMode = e.matches ? "dark" : "light";
    if (this.useSystem) {
      this.applyTheme();
    }
    this.notify();
  }

  private handleSystemModeError(): void {
    this.systemMode = "light";
    this.useSystem = false;
  }

  /**
   * Load and apply a theme by color scheme
   */
  private async loadAndApplyTheme(colorScheme: ThemeName): Promise<void> {
    if (this._isLoadingTheme && this._loadingThemePromise) {
      return this._loadingThemePromise;
    }

    this._isLoadingTheme = true;
    this._loadingError = null;
    this.notify();

    this._loadingThemePromise = (async () => {
      try {
        // Load the theme
        await loadTheme(colorScheme);

        // Apply the theme
        this.applyTheme();
      } catch (error) {
        console.error(`[ThemeStateManager] Failed to load theme "${colorScheme}":`, error);
        this._loadingError = error instanceof Error ? error : new Error(`Failed to load theme "${colorScheme}"`);

        // If this isn"t the default theme, try to fall back
        if (colorScheme !== THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME) {
          console.warn(`[ThemeStateManager] Falling back to default theme: ${THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME}`);

          // Reset color scheme to default
          this.currentColorScheme = THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME;
          ThemeStorage.saveColorScheme(this.currentColorScheme);

          // Try to load default theme
          await loadTheme(THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME);
          this.applyTheme();
        } else {
          // This is already the default theme and it failed to load
          throw error;
        }
      } finally {
        this._isLoadingTheme = false;
        this._loadingThemePromise = null;
        this.notify();
      }
    })();

    return this._loadingThemePromise;
  }

  /**
   * Apply theme and update DOM.
   */
  private applyTheme(): void {
    if (typeof window === "undefined") return;

    try {
      const mode = this.useSystem ? this.systemMode : this.currentMode;
      const root = document.documentElement;

      this.updateRootClasses(root, mode);
      this.dispatchThemeChangeEvent(mode);
    } catch (error) {
      console.error("[ThemeStateManager] Error applying theme:", error);
    }
  }

  private updateRootClasses(root: HTMLElement, mode: Mode): void {
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    root.setAttribute("data-theme", this.currentColorScheme);
    root.setAttribute("data-loading", this._isLoadingTheme ? "true" : "false");
  }

  private dispatchThemeChangeEvent(mode: Mode): void {
    window.dispatchEvent(
      new CustomEvent(THEME_CONSTANTS.EVENTS.CHANGE, {
        detail: {
          mode,
          colorScheme: this.currentColorScheme,
          isLoading: this._isLoadingTheme
        },
      })
    );
  }

  /**
   * State management methods.
   */
  async setThemeClasses(scheme: ThemeName): Promise<void> {
    if (!isValidThemeName(scheme)) {
      console.warn("[ThemeStateManager] Invalid color scheme provided");
      return;
    }

    try {
      // Only load if the scheme has changed
      if (this.currentColorScheme !== scheme) {
        this.currentColorScheme = scheme;
        ThemeStorage.saveColorScheme(scheme);

        // Load and apply the new theme
        await this.loadAndApplyTheme(scheme);
      }
    } catch (error) {
      console.error("[ThemeStateManager] Error setting color scheme:", error);
      throw error;
    }
  }

  setMode(mode: ThemeMode): void {
    if (!isValidThemeMode(mode)) {
      console.warn("[ThemeStateManager] Invalid mode provided");
      return;
    }
    try {
      this.currentMode = mode;
      this.useSystem = false;
      ThemeStorage.saveMode(mode);
      ThemeStorage.saveUseSystem(false);
      this.applyTheme();
      this.notify();
    } catch (error) {
      console.error("[ThemeStateManager] Error setting mode:", error);
    }
  }

  setUseSystem(useSystem: boolean): void {
    try {
      this.useSystem = useSystem;
      ThemeStorage.saveUseSystem(useSystem);
      this.applyTheme();
      this.notify();
    } catch (error) {
      console.error("[ThemeStateManager] Error setting system mode:", error);
    }
  }

  /**
   * Theme cache and loading management
   */
  isThemeCached(scheme: ThemeName): boolean {
    return isThemeCached(scheme);
  }

  async preloadTheme(scheme: ThemeName, config?: Partial<ThemeLoaderConfig>): Promise<void> {
    if (!isValidThemeName(scheme)) {
      console.warn("[ThemeStateManager] Invalid color scheme for preloading");
      return;
    }

    try {
      await preloadTheme(scheme, config);
      this.notify();
    } catch (error) {
      console.error(`[ThemeStateManager] Error preloading theme "${scheme}":`, error);
    }
  }

  clearThemeCache(): void {
    clearThemeCache();
    this.notify();
  }

  getCacheStatus(): { size: number; schemes: ThemeName[] } {
    return getCacheStatus();
  }

  /**
   * Observer pattern implementation.
   */
  subscribe(listener: () => void): () => void {
    if (!listener || typeof listener !== "function") {
      throw new Error("[ThemeStateManager] Invalid listener provided");
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    try {
      if (this.listeners) {
        this.listeners.forEach((listener) => {
          if (typeof listener === "function") {
            listener();
          }
        });
      }
    } catch (error) {
      console.error("[ThemeStateManager] Error notifying listeners:", error);
    }
  }

  private getInitialSystemMode(): ThemeMode {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  /**
   * Public getter returning the current theme state.
   */
  getState(): ThemeState & { isLoadingTheme: boolean; loadingError: Error | null } {
    return {
      themeName: this.currentColorScheme,
      mode: this.useSystem ? this.systemMode : this.currentMode,
      systemMode: this.systemMode,
      useSystem: this.useSystem,
      initialized: this.initialized,
      timestamp: Date.now(),
      previous: {
        themeName: this.currentColorScheme,
        mode: this.currentMode,
      },

      // Theme loading state
      isLoadingTheme: this._isLoadingTheme,
      loadingError: this._loadingError,

      // Use config properties
      name: this.config.name,
      direction: this.config.direction || "ltr",
      version: this.config.version || "1.0.0"
    };
  }

  /**
   * Cleanup method (primarily for testing).
   */
  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery = null;
    }
    this.listeners.clear();
    this._initialized = false;
    this._isLoadingTheme = false;
    this._loadingThemePromise = null;
    this._loadingError = null;
  }
}

export const themeStateManager = ThemeStateManager.getInstance();
