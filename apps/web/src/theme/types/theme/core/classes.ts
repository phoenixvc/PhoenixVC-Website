// src/types/theme/classes.ts

import { ColorScheme, Mode } from './base';

/**
 * Theme Class Core Types
 */
export type ThemeClassSuffix =
    | 'root'
    | 'base'
    | 'variable'
    | 'scheme'
    | 'mode'
    | 'transition';

export interface ThemeClassParts {
    prefix: string;
    scheme?: ColorScheme;
    mode?: Mode;
    suffix: ThemeClassSuffix;
}

/**
 * Configuration Options
 */
export interface ThemeClassGenerationOptions {
    prefix?: string;
    separator?: string;
    includeColorScheme?: boolean;
    includeMode?: boolean;
}

/**
 * Class Utilities
 */
export interface ThemeClassUtils {
    generateThemeClass: (
        suffix: ThemeClassSuffix,
        options?: ThemeClassGenerationOptions
    ) => string;

    parseThemeClass: (className: string) => {
        scheme?: ColorScheme;
        mode?: Mode;
        suffix?: ThemeClassSuffix;
    };

    combineThemeClasses: (...classes: string[]) => string;
}



/**
 * Theme class generation options
 */
export interface ThemeClassOptions {
    /**
     * Color scheme
     */
    colorScheme?: ColorScheme;

    /**
     * Theme mode
     */
    mode?: Mode;

    /**
     * Additional class names
     */
    className?: string;

    /**
     * Disable transitions
     */
    disableTransitions?: boolean;
}
