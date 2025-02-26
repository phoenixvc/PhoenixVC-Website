// /theme/types/core/classes.ts

import { ThemeColorScheme, ThemeMode } from "./base";
import { ThemeClassSuffix } from "./enums";

export interface ThemeClassParts {
    prefix: string;
    scheme?: ThemeColorScheme;
    mode?: ThemeMode;
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
        scheme?: ThemeColorScheme;
        mode?: ThemeMode;
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
    colorScheme?: ThemeColorScheme;

    /**
     * Theme mode
     */
    mode?: ThemeMode;

    /**
     * Additional class names
     */
    className?: string;

    /**
     * Disable transitions
     */
    disableTransitions?: boolean;
}

// src/types/theme/theme-scheme.types.ts

export interface ColorSchemeClasses {
    primary: string;
    secondary: string;
    text: string;
    activeText: string;
    background: string;
    hoverBg: string;
    activeBg: string;
    mobileMenu: string;
    bgMobileMenu: string;
    border: string;
}
