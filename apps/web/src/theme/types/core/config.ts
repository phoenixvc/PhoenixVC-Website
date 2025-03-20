// /theme/types/core/config.ts

import type { Layout, ThemeName, ThemeMode } from "./base";
import { ThemeColors, ThemeSchemeInitial } from "./colors";
import type { ThemeStorage } from "./storage";
import { ThemeTransition } from "./transition";

// Core Configuration Interfaces
export interface ThemeConfig {
    name: string;
    themeName?: ThemeName;
    mode?: ThemeMode;
    useSystem: boolean;
    direction?: Layout.Direction | undefined;
    version?: string;
}

// State Management
export interface ThemeState extends Required<ThemeConfig> {
    systemMode: ThemeMode;
    initialized: boolean;
    previous?: {
        themeName: ThemeName;
        mode: ThemeMode;
    };
    timestamp: number;
}

// Initialization Options
export interface ThemeInitOptions {
    defaultThemeName?: ThemeName;
    defaultMode?: ThemeMode;
    useSystem?: boolean;
    storage?: Partial<ThemeStorage>;
    transition?: Partial<ThemeTransition>;
    debug?: boolean;
    onThemeChange?: (theme: ThemeState) => void;
    disableTransitionsOnLoad?: boolean;
    forceSpecificTheme?: ThemeName;
}

// Event Handling
export interface ThemeChangeEvent {
    previousMode?: ThemeMode;
    currentMode: ThemeMode;
    previousThemeName?: ThemeName;
    currentThemeName: ThemeName;
    source: "user" | "system" | "storage" | "default";
}

// Error Handling
export type ThemeErrorHandler = (error: Error) => void;
export type ThemeErrorFallback = React.ComponentType<{ error: Error }>;

// Plugin System
export interface ThemePlugin {
    readonly name: string;
    readonly version: string;
    install: (config: ThemeConfig) => void | Promise<void>;
    uninstall?: (config: ThemeConfig) => void | Promise<void>;
}

// Validation Options
export interface ThemeValidationOptions {
    strict?: boolean;
    allowUnknownProperties?: boolean;
}

// Theme Creation Options
export interface CreateThemeOptions extends ThemeInitOptions {
    plugins?: ThemePlugin[];
    validation?: ThemeValidationOptions;
}

// Storage Interface (extended)
export interface ThemeStorageConfig extends ThemeStorage {
    timestamp?: number;
}

export interface ThemeConfigValidator {
    validate: (config: ThemeConfig) => boolean;
    validateStrict: (config: ThemeConfig) => void; // throws on invalid
    migrateFromVersion: (oldConfig: ThemeConfig, targetVersion: string) => ThemeConfig;
}

export interface ThemeBuilder {
    withTheme: (themeName: ThemeName) => ThemeBuilder;
    withMode: (mode: ThemeMode) => ThemeBuilder;
    withPlugins: (plugins: ThemePlugin[]) => ThemeBuilder;
    build: () => ThemeConfig;
}

/**
 * Theme Registry Entry
 * Combines theme data with metadata for registry storage
 */
export interface ThemeRegistryEntry {
    // The theme data
    theme: ThemeColors;

    // Metadata for UI display and management
    metadata: {
      displayName: string;
      description?: string;
      author?: string;
      version?: string;
      tags?: string[];
      preview?: string; // URL or base64 image
      created?: number; // timestamp
      modified?: number; // timestamp
    };

    // Configuration used to generate this theme
    sourceConfig?: {
      initialScheme?: ThemeSchemeInitial;
      transformConfig?: TransformationConfig;
    };
  }

/**
 * Options for dark mode transformations
 */
export interface DarkModeOptions {
    darkenBackground?: number;
    lightenText?: number;
    adjustSaturation?: number;
  }

  /**
   * Options for light mode transformations
   */
  export interface LightModeOptions {
    lightenBackground?: number;
    darkenText?: number;
    adjustSaturation?: number;
  }

  /**
   * Combined transformation options
   */
  export interface TransformOptions {
    darkMode?: DarkModeOptions;
    lightMode?: LightModeOptions;
  }

  /**
   * Configuration for the theme transformation process
   */
  export interface TransformationConfig {
    defaultMode: ThemeMode;
    shadeCount: number;
    shadeIntensity: number;
    contrastThreshold: number;
    algorithm?: "linear" | "exponential" | "perceptual";
    preserveMetadata?: boolean;
    transformOptions?: TransformOptions;
  }
