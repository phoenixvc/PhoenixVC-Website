// Move to media.ts
export interface ThemeMediaQueries {
    dark: string;
    light: string;
    reducedMotion: string;
}


//this is jsut a temp location and not
// probably in the correct place


/**
 * Theme media query configuration
 */
export interface ThemeMediaQueries {
    /**
     * Dark mode media query
     * @default '(prefers-color-scheme: dark)'
     */
    dark: string;

    /**
     * Light mode media query
     * @default '(prefers-color-scheme: light)'
     */
    light: string;

    /**
     * Reduced motion media query
     * @default '(prefers-reduced-motion: reduce)'
     */
    reducedMotion: string;
}
