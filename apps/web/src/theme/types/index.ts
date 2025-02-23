// src/types/theme/index.ts
import type * as Base from './core/base';
import { ReactNode } from 'react';

// 1. Core Theme Namespace
export namespace Theme {
    export type ColorScheme = Base.ColorScheme;
    export type Mode = Base.Mode;

    export namespace Layout {
        export type Unit = Base.Layout.CSSUnit;
        export type Direction = Base.Layout.Direction;
    }
}

// 2. Constants
export { THEME_CONSTANTS } from './core/base';

// 3. Direct type exports
export type {
    ColorScheme,
    Mode,
    ThemeScale,
} from './core/base';

// 4. Utility Types
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type ThemeValue<T> = T | ((theme: Theme.Mode) => T);

// 5. Type Guards
export const isThemeMode = (value: unknown): value is Theme.Mode => {
    return ['light', 'dark'].includes(String(value));
};

// 6. Configuration Types
export interface ThemeConfig {
    mode: Theme.Mode;
    colorScheme: Theme.ColorScheme;
}

// 7. Context Types
export interface ThemeContextValue {
    mode: Theme.Mode;
    colorScheme: Theme.ColorScheme;
    setMode: (mode: Theme.Mode) => void;
    setColorScheme: (scheme: Theme.ColorScheme) => void;
}

// 8. Provider Props
export interface ThemeProviderProps {
    /** React children components */
    children: ReactNode;

    /** Initial theme configuration */
    config?: {
        /** Default color mode (light/dark) */
        mode?: Theme.Mode;

        /** Default color scheme */
        colorScheme?: Theme.ColorScheme;

        /** Whether to enable system color scheme detection */
        useSystemColorScheme?: boolean;

        /** Storage configuration */
        storage?: {
            /** Storage type to use */
            type?: 'localStorage' | 'sessionStorage' | 'memory';

            /** Storage key prefix */
            prefix?: string;

            /** Disable storage completely */
            disabled?: boolean;
        };

        /** Transition configuration */
        transition?: {
            /** Duration in milliseconds */
            duration?: number;

            /** Disable transitions */
            disabled?: boolean;
        };
    };

    /** Optional class name for the provider wrapper */
    className?: string;

    /** Callback when theme changes */
    onThemeChange?: (theme: { mode: Theme.Mode; colorScheme: Theme.ColorScheme }) => void;
}

// 10. Storage Interface
export interface ThemeStorage {
    mode?: Theme.Mode;
    colorScheme?: Theme.ColorScheme;
}

// 12. Theme Creation Utilities
export const createTheme = (config: Partial<ThemeConfig> = {}): ThemeConfig => ({
    mode: config.mode ?? 'light',
    colorScheme: config.colorScheme ?? 'classic',
});

// 15. Plugin System
export interface ThemePlugin {
    readonly name: string;
    readonly version: string;
    install: (config: ThemeConfig) => void | Promise<void>;
    uninstall?: (config: ThemeConfig) => void | Promise<void>;
}

// 16. Testing Utilities
export const createTestTheme = (overrides?: DeepPartial<ThemeConfig>): ThemeConfig => ({
    ...createTheme(),
    ...overrides,
});

// Version
export const VERSION = '1.0.0' as const;
