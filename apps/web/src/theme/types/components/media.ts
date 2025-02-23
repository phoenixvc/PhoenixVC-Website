/**
 * Theme media query configuration
 *
 * Provides default media queries for theme responsiveness.
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
