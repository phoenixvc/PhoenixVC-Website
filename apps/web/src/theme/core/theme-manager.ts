// src/theme/core/theme-manager.ts

import { ThemeStorage } from "../utils/theme-storage";
import { THEME_CONSTANTS } from "../constants/theme-constants";
import { Mode, ThemeColorScheme, ThemeMode } from "../types";
import { isValidColorScheme, isValidThemeMode } from "../providers/validation";

/**
 * Manages the global theme state using the Singleton pattern.
 * Responsible for initializing, updating, and notifying about theme state changes.
 * @class ThemeManager
 */
export class ThemeManager {
  private static instance: ThemeManager;

  // State properties
  private currentColorScheme!: ThemeColorScheme;
  private currentMode!: ThemeMode;
  private systemMode!: ThemeMode;
  private useSystem!: boolean;
  private _initialized: boolean = false;

  // DOM-related properties
  private listeners: Set<() => void>;
  private mediaQuery: MediaQueryList | null = null;

  private constructor() {
    this.initializeState();

    if (typeof window !== "undefined") {
      this.initializeSystemListener();
      this.applyTheme();
      this._initialized = true;
    }

    this.listeners = new Set();
  }

  // Expose the initialized flag via a getter
  get initialized(): boolean {
    return this._initialized;
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

  private getStoredOrDefaultColorScheme(): ThemeColorScheme {
    const storedScheme = ThemeStorage.getColorScheme();
    return storedScheme && isValidColorScheme(storedScheme)
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
  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
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
      console.error("[ThemeManager] Error initializing system mode listener:", error);
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
      console.error("[ThemeManager] Error applying theme:", error);
    }
  }

  private updateRootClasses(root: HTMLElement, mode: Mode): void {
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    root.setAttribute("data-theme", this.currentColorScheme);
  }

  private dispatchThemeChangeEvent(mode: Mode): void {
    window.dispatchEvent(
      new CustomEvent(THEME_CONSTANTS.EVENTS.CHANGE, {
        detail: {
          mode,
          colorScheme: this.currentColorScheme,
        },
      })
    );
  }

  /**
   * State management methods.
   */
  setColorScheme(scheme: ThemeColorScheme): void {
    if (!isValidColorScheme(scheme)) {
      console.warn("[ThemeManager] Invalid color scheme provided");
      return;
    }
    try {
      this.currentColorScheme = scheme;
      ThemeStorage.saveColorScheme(scheme);
      this.applyTheme();
      this.notify();
    } catch (error) {
      console.error("[ThemeManager] Error setting color scheme:", error);
    }
  }

  setMode(mode: ThemeMode): void {
    if (!isValidThemeMode(mode)) {
      console.warn("[ThemeManager] Invalid mode provided");
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
      console.error("[ThemeManager] Error setting mode:", error);
    }
  }

  setUseSystem(useSystem: boolean): void {
    try {
      this.useSystem = useSystem;
      ThemeStorage.saveUseSystem(useSystem);
      this.applyTheme();
      this.notify();
    } catch (error) {
      console.error("[ThemeManager] Error setting system mode:", error);
    }
  }

  /**
   * Observer pattern implementation.
   */
  subscribe(listener: () => void): () => void {
    if (!listener || typeof listener !== "function") {
      throw new Error("[ThemeManager] Invalid listener provided");
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    try {
      this.listeners.forEach((listener) => listener());
    } catch (error) {
      console.error("[ThemeManager] Error notifying listeners:", error);
    }
  }

  private getInitialSystemMode(): ThemeMode {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  
  /**
   * Public getter returning the current theme state.
   */
  getState(): {
    colorScheme: ThemeColorScheme;
    mode: ThemeMode;
    systemMode: ThemeMode;
    useSystem: boolean;
    initialized: boolean;
    timestamp: number;
    previous: {
      colorScheme: ThemeColorScheme;
      mode: ThemeMode;
    };
  } {
    return {
      colorScheme: this.currentColorScheme,
      mode: this.useSystem ? this.systemMode : this.currentMode,
      systemMode: this.systemMode,
      useSystem: this.useSystem,
      initialized: this.initialized,
      timestamp: Date.now(), // Or use a stored timestamp if needed
      previous: {
        colorScheme: this.currentColorScheme,
        mode: this.currentMode,
      },
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
  }
}

// Export singleton instance if needed:
// export const themeManager = ThemeManager.getInstance();
