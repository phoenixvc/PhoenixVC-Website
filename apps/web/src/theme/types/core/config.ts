// /theme/types/core/config.ts

import type { Layout, ThemeColorScheme, ThemeMode } from './base';
import type { ThemeStorage, ThemeTransition } from './storage';

// Core Configuration Interfaces
export interface ThemeConfig {
    colorScheme?: ThemeColorScheme;
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
        colorScheme: ThemeColorScheme;
        mode: ThemeMode;
    };
    timestamp: number;
}

// Initialization Options
export interface ThemeInitOptions {
    defaultScheme?: ThemeColorScheme;
    defaultMode?: ThemeMode;
    useSystem?: boolean;
    storage?: Partial<ThemeStorage>;
    transition?: Partial<ThemeTransition>;
    debug?: boolean;
    onThemeChange?: (theme: ThemeState) => void;
    disableTransitionsOnLoad?: boolean;
    forceColorScheme?: ThemeColorScheme;
}

// Event Handling
export interface ThemeChangeEvent {
    previousMode?: ThemeMode;
    currentMode: ThemeMode;
    previousColorScheme?: ThemeColorScheme;
    currentColorScheme: ThemeColorScheme;
    source: 'user' | 'system' | 'storage' | 'default';
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
    ThemeColorScheme as ColorScheme,
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
    withColorScheme: (scheme: ThemeColorScheme) => ThemeBuilder;
    withMode: (mode: ThemeMode) => ThemeBuilder;
    withPlugins: (plugins: ThemePlugin[]) => ThemeBuilder;
    build: () => ThemeConfig;
}
