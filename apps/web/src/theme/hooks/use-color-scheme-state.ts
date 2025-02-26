// // hooks/useColorSchemeState.ts
// import { useState, useCallback, useEffect } from 'react';
// import { ColorScheme, ThemeConfig } from '../types/theme.types';
// import { ThemeStorage } from '../utils/theme-storage';

// const DEFAULT_COLOR_SCHEME: ColorScheme = 'classic';
// const VALID_COLOR_SCHEMES: readonly ColorScheme[] = [
//   'classic',
//   'forest',
//   'ocean',
//   'phoenix',
//   'lavender',
//   'cloud'
// ] as const;

// export class ColorSchemeError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = 'ColorSchemeError';
//   }
// }

// /**
//  * Custom hook for managing color scheme state
//  * @param initialConfig Initial theme configuration
//  * @returns Tuple containing current color scheme and setter function
//  */
// export const useColorSchemeState = (
//   initialConfig: Partial<ThemeConfig>
// ): readonly [ColorScheme, (newScheme: ColorScheme) => void] => {
//   const getInitialColorScheme = useCallback((): ColorScheme => {
//     const configScheme = initialConfig.colorScheme;
//     const storedScheme = ThemeStorage.getColorScheme();

//     if (configScheme && isValidColorScheme(configScheme)) {
//       return configScheme;
//     }

//     if (storedScheme && isValidColorScheme(storedScheme)) {
//       return storedScheme;
//     }

//     return DEFAULT_COLOR_SCHEME;
//   }, [initialConfig]);

//   const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getInitialColorScheme);

//   useEffect(() => {
//     const storedScheme = ThemeStorage.getColorScheme();
//     if (storedScheme && isValidColorScheme(storedScheme) && storedScheme !== colorScheme) {
//       setColorSchemeState(storedScheme);
//     }
//   }, []);

//   const setColorScheme = useCallback((newScheme: ColorScheme) => {
//     try {
//       if (!isValidColorScheme(newScheme)) {
//         throw new ColorSchemeError(
//           `Invalid color scheme: "${newScheme}". Valid options are: ${VALID_COLOR_SCHEMES.join(', ')}`
//         );
//       }

//       setColorSchemeState(newScheme);
//       ThemeStorage.saveColorScheme(newScheme);
//       document.documentElement.setAttribute('data-color-scheme', newScheme);

//       console.log(`[ThemeProvider] Color scheme updated: ${newScheme}`);
//     } catch (error) {
//       console.error('[ThemeProvider] Color scheme error:', error);

//       if (colorScheme !== DEFAULT_COLOR_SCHEME) {
//         setColorSchemeState(DEFAULT_COLOR_SCHEME);
//         ThemeStorage.saveColorScheme(DEFAULT_COLOR_SCHEME);
//       }
//     }
//   }, [colorScheme]);

//   return [colorScheme, setColorScheme] as const;
// };

// /**
//  * Type guard for color scheme validation
//  */
// const isValidColorScheme = (scheme: unknown): scheme is ColorScheme => {
//   return typeof scheme === 'string' && VALID_COLOR_SCHEMES.includes(scheme as ColorScheme);
// };

// export type ColorSchemeState = ReturnType<typeof useColorSchemeState>;
// export type SetColorScheme = ColorSchemeState[1];
