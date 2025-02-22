// hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContextType } from '../types/theme.types';
import { ThemeContext } from '../providers/theme-provider';

/**
 * Hook to access theme context and controls
 * @throws {Error} If used outside of ThemeProvider
 * @returns {ThemeContextType} Theme context value and control functions
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Wrap your app with <ThemeProvider> to fix this error.'
    );
  }
  
  return context;
};

export type { ThemeContextType };
