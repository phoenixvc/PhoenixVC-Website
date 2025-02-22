// src/types/theme/context.ts

import React from 'react';
import { ThemeConfig } from '../core/config';
import { ColorScheme, Mode } from '../core/base';
import { ColorSchemeClasses, CssVariableConfig, ThemeClassSuffix, ThemeClassUtils } from '../core';

/**
 * Theme provider configuration options
 */
export interface ThemeProviderConfig extends Partial<ThemeConfig> {
    /**
     * Storage key prefix
     * @default 'theme'
     */
    storagePrefix?: string;

    /**
     * Disable transitions on initial load
     * @default true
     */
    disableInitialTransitions?: boolean;

    /**
     * Enable debug mode
     * @default false
     */
    debug?: boolean;
}

/**
 * Theme provider props interface
 */
export interface ThemeProviderProps {
    /**
     * Child components
     */
    children: React.ReactNode;

    /**
     * Initial theme configuration
     */
    initialConfig?: Partial<ThemeProviderConfig>;

    /**
     * Theme change callback
     */
    onThemeChange?: (theme: ThemeState) => void;

    /**
     * Error handling callback
     */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;

    /**
     * Fallback UI for error states
     */
    errorFallback?: React.ReactNode;

    /**
     * Custom class name for the provider wrapper
     */
    className?: string;

    /**
     * Force color scheme
     */
    forceColorScheme?: ColorScheme;

    /**
     * Disable system color scheme detection
     */
    disableSystemScheme?: boolean;
}

/**
 * Theme context error interface
 */
export interface ThemeContextError extends Error {
    code: string;
    context?: any;
}

/**
 * Theme context state interface
 */
export interface ThemeContextState {
    /**
     * Current theme state
     */
    theme: ThemeState;

    /**
     * Error state
     */
    error: ThemeContextError | null;

    /**
     * Loading state
     */
    isLoading: boolean;

    /**
     * Initialization state
     */
    isInitialized: boolean;
}

/**
 * Theme context value interface
 */
export interface ThemeContextValue extends ThemeContextType {
    /**
     * Current context state
     */
    state: ThemeContextState;

    /**
     * Reset context to initial state
     */
    reset: () => void;

    /**
     * Update partial configuration
     */
    updateConfig: (config: Partial<ThemeConfig>) => void;

    /**
     * Force theme refresh
     */
    refresh: () => void;
}

/**
 * Create theme context options
 */
export interface CreateThemeContextOptions {
    /**
     * Initial state
     */
    initialState?: Partial<ThemeContextState>;

    /**
     * Error handler
     */
    onError?: (error: ThemeContextError) => void;

    /**
     * Debug mode
     */
    debug?: boolean;
}

/**
 * Theme context hook return type
 */
export interface UseThemeContextReturn extends ThemeContextValue {
    /**
     * Current color scheme
     */
    colorScheme: ColorScheme;

    /**
     * Current mode
     */
    mode: Mode;

    /**
     * System color scheme
     */
    systemColorScheme: ColorScheme;

    /**
     * Is using system color scheme
     */
    isUsingSystemColorScheme: boolean;
}

/**
 * Theme context provider props
 */
export interface ThemeContextProviderProps {
    children: React.ReactNode;
    initialState?: Partial<ThemeState>;
    utils?: Partial<ThemeClassUtils>;
    onChange?: (state: ThemeState) => void;
}

/**
 * Theme context factory
 */
export const createThemeContext = (
    options?: CreateThemeContextOptions
): React.Context<ThemeContextValue> => {
    return React.createContext<ThemeContextValue>({} as ThemeContextValue);
};

/**
 * Theme provider factory
 */
export const createThemeProvider = (
    Context: React.Context<ThemeContextValue>
): React.FC<ThemeProviderProps> => {
    return ({ children, ...props }) => {
        // Implementation would go here
        return null;
    };
};

/**
 * Theme context hook factory
 */
export const createUseThemeContext = (
    Context: React.Context<ThemeContextValue>
): (() => UseThemeContextReturn) => {
    return () => {
        const context = React.useContext(Context);
        if (!context) {
            throw new Error('useThemeContext must be used within a ThemeProvider');
        }
        return context as UseThemeContextReturn;
    };
};


/**
 * Theme context type
 * @description Core theme context interface
**/
export interface ThemeContextType {
    // Required core properties
    colorScheme: ColorScheme;
    mode: Mode;
    systemMode: Mode;
    useSystemMode: boolean;
    colorSchemeClasses: ColorSchemeClasses;
    getColorSchemeClasses: (scheme: ColorScheme) => ColorSchemeClasses;
    getSpecificClass: (suffix: ThemeClassSuffix) => string;
    replaceColorSchemeClasses: (currentClasses: string, newScheme: ColorScheme) => string;
    setColorScheme: (scheme: ColorScheme) => void;
    setMode: (mode: Mode) => void;
    toggleMode: () => void;
    setUseSystemMode: (useSystem: boolean) => void;
    getCssVariable: (name: string, config?: Partial<CssVariableConfig>) => string;
    getAllThemeClasses: () => Record<ColorScheme, ColorSchemeClasses>;
    isColorSchemeClass: (className: string) => boolean;

    // Optional properties
    getComputedThemeStyles?: () => CSSStyleDeclaration;
    isColorSchemeSupported?: (scheme: ColorScheme) => boolean;
    getThemeState?: () => ThemeState;
    resetTheme?: () => void;
    subscribeToThemeChanges?: (callback: (state: ThemeState) => void) => () => void;
}

/**
 * Theme state interface
 * @description Current theme state including system preferences
 */
export interface ThemeState extends Required<ThemeConfig> {
    /**
     * System preferred mode
     */
    systemMode: Mode;

    /**
     * Theme initialization status
     */
    initialized: boolean;

    /**
     * Previous theme state
     */
    previous?: {
        colorScheme: ColorScheme;
        mode: Mode;
    };

    /**
     * Theme load timestamp
     */
    timestamp: number;
}

/**
 * Theme context interface
 * @description Theme context provided to components
 */
export interface ThemeContext {
    /**
     * Current theme state
     */
    state: ThemeState;

    /**
     * Set color scheme
     */
    setColorScheme: (scheme: ColorScheme) => void;

    /**
     * Set theme mode
     */
    setMode: (mode: Mode) => void;

    /**
     * Toggle between light and dark mode
     */
    toggleMode: () => void;

    /**
     * Toggle system preference usage
     */
    toggleUseSystem: () => void;

    /**
     * Reset theme to defaults
     */
    reset: () => void;
}
