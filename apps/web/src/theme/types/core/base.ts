// src/types/theme/core/base.ts

/**
 * Core Theme Identity
 */
export type ColorScheme = "classic" | "forest" | "ocean" | "phoenix" | "lavender" | "cloud";
export type Mode = 'light' | 'dark';

/**
 * Theme Scale System
 */
export namespace ThemeScale {
    export type Spacing = 'spacing';
    export type FontSize = 'fontSize';
    export type LineHeight = 'lineHeight';
    export type BorderRadius = 'borderRadius';
    export type BorderWidth = 'borderWidth';
    export type Opacity = 'opacity';
    export type ZIndex = 'zIndex';

    export type All = Spacing | FontSize | LineHeight | BorderRadius | BorderWidth | Opacity | ZIndex;
}

/**
 * Layout System
 */
export namespace Layout {
    export type CSSUnit = 'px' | 'rem' | 'em' | 'vh' | 'vw' | '%';
    export type Direction = 'ltr' | 'rtl';
}

export const THEME_CONSTANTS = {
    animation: {
        defaultTransitionDuration: 200,
        defaultAnimationDuration: 300,
    },
    system: {
        storagePrefix: 'theme',
        classPrefix: 'theme',
        cssVarPrefix: '--theme',
    },
    breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
} as const;

export type ThemeBreakpoints = keyof typeof THEME_CONSTANTS.breakpoints;
