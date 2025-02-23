// src/types/theme/config.ts
import type { ReactNode } from 'react';
import type { ColorScheme, Mode } from './base';
import type { ThemeStorage, ThemeTransition } from '../state/storage';
import type { Theme } from '../index';

// Core Configuration Interfaces
export interface ThemeConfig {
    colorScheme?: ColorScheme;
    mode?: Mode;
    useSystem: boolean;
    direction?: Theme.Layout.Direction | undefined;
    version?: string;
}

// State Management
export interface ThemeState extends Required<ThemeConfig> {
    systemMode: Mode;
    initialized: boolean;
    previous?: {
        colorScheme: ColorScheme;
        mode: Mode;
    };
    timestamp: number;
}

// Initialization Options
export interface ThemeInitOptions {
    defaultScheme?: ColorScheme;
    defaultMode?: Mode;
    useSystem?: boolean;
    storage?: Partial<ThemeStorage>;
    transition?: Partial<ThemeTransition>;
    debug?: boolean;
    onThemeChange?: (theme: ThemeState) => void;
    disableTransitionsOnLoad?: boolean;
    forceColorScheme?: ColorScheme;
}

// Event Handling
export interface ThemeChangeEvent {
    previousMode?: Mode;
    currentMode: Mode;
    previousColorScheme?: ColorScheme;
    currentColorScheme: ColorScheme;
    source: 'user' | 'system' | 'storage' | 'default';
}

// Error Handling
export type ThemeErrorHandler = (error: Error) => void;
export type ThemeErrorFallback = React.ComponentType<{ error: Error }>;

// Provider Props
export interface ThemeProviderProps {
    children: ReactNode;
    initialConfig?: ThemeInitOptions;
    defaultMode?: Mode;
    defaultColorScheme?: ColorScheme;
    onThemeChange?: (event: ThemeChangeEvent) => void;
    onError?: ThemeErrorHandler;
    errorFallback?: ThemeErrorFallback;
    disableTransitions?: boolean;
    disableStorage?: boolean;
    storageKey?: string;
}

// Context Value Interface
export interface ThemeContextValue {
    state: ThemeState;
    setMode: (mode: Mode) => void;
    setColorScheme: (scheme: ColorScheme) => void;
    setDirection: (direction: Theme.Layout.Direction) => void;
    toggleMode: () => void;
    isLoading: boolean;
    error: Error | null;
}

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
    ColorScheme,
    Mode,
    ThemeStorage,
    ThemeTransition
};
