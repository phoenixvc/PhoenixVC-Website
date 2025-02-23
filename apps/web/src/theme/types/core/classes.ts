// /theme/types/core/classes.ts

import { ColorScheme, Mode } from './base';
import { ThemeClassSuffix } from './enums';

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

// src/types/theme/theme-scheme.types.ts

export interface ColorSchemeClasses {
    primary: string;
    secondary: string;
    text: string;
    activeText: string;
    hoverBg: string;
    activeBg: string;
    mobileMenu: string;
    bgMobileMenu: string;
    border: string;
}
