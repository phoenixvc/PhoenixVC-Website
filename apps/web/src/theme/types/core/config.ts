// /theme/types/core/config.ts

import type { Layout, ThemeName, ThemeMode } from "./base";
import type { ThemeStorage, ThemeTransition } from "./storage";

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

// Export all types
export type {
    ThemeName as ColorScheme,
    ThemeMode as Mode,
    ThemeStorage,
    ThemeTransition
};

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
