// // hooks/useSystemModeEffect.ts
// import { useEffect, useCallback } from 'react';
// import { ColorScheme, Mode } from '../types/theme.types';
// import { ThemeStorage } from '../utils/theme-storage';

// interface UseSystemModeEffectProps {
//   colorScheme: ColorScheme;
//   useSystemMode: boolean;
//   setMode: (mode: Mode) => void;
//   onError?: (error: Error) => void;
// }

// export class SystemModeError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = 'SystemModeError';
//   }
// }

// type MediaQueryCallback = (event: MediaQueryListEvent) => void;

// /**
//  * Custom hook to handle system color scheme changes
//  */
// export const useSystemModeEffect = ({
//   colorScheme,
//   useSystemMode,
//   setMode,
//   onError
// }: UseSystemModeEffectProps): void => {
//   const handleSystemChange = useCallback((
//     event: MediaQueryListEvent | MediaQueryList
//   ) => {
//     if (!useSystemMode) return;

//     try {
//       const newMode: Mode = event.matches ? 'dark' : 'light';

//       setMode(newMode);
//       ThemeStorage.saveMode(newMode);
//       document.documentElement.setAttribute('data-theme-mode', newMode);

//       console.log(`[ThemeProvider] System mode detected: ${newMode}`);
//     } catch (error) {
//       const err = error instanceof Error ? error : new SystemModeError('Unknown system mode error');
//       console.error('[ThemeProvider] System mode error:', err);
//       onError?.(err);
//     }
//   }, [useSystemMode, setMode, onError]);

//   useEffect(() => {
//     if (!isSystemModeSupported()) {
//       console.warn('[ThemeProvider] System color scheme detection not supported');
//       return;
//     }

//     try {
//       const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

//       // Initial check
//       handleSystemChange(mediaQuery);

//       // Create a type-safe event handler
//       const safeHandler: MediaQueryCallback = (e: MediaQueryListEvent) => handleSystemChange(e);

//       // Modern API
//       mediaQuery.addEventListener('change', safeHandler);

//       // Cleanup function
//       return () => {
//         mediaQuery.removeEventListener('change', safeHandler);
//       };

//     } catch (error) {
//       const err = error instanceof Error ? error : new SystemModeError('Failed to initialize system mode detection');
//       console.error('[ThemeProvider] System mode initialization error:', err);
//       onError?.(err);
//       return () => {};
//     }
//   }, [colorScheme, useSystemMode, handleSystemChange, onError]);
// };

// /**
//  * Check if system color scheme detection is supported
//  */
// export const isSystemModeSupported = (): boolean => {
//   try {
//     return !!(
//       typeof window !== 'undefined' &&
//       window.matchMedia &&
//       window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined
//     );
//   } catch {
//     return false;
//   }
// };
