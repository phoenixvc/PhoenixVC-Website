// src/types/theme/testing.ts
import type { ThemeConfig } from '../core/config';
import type { DeepPartial } from './utils';
import { isThemeMode, isColorScheme } from './guards';
import { createTheme } from '@/theme';

export const createTestTheme = (overrides?: DeepPartial<ThemeConfig>): ThemeConfig => {
    // Ensure that the base theme includes a default value for useSystem
    const baseTheme: ThemeConfig = {
      ...createTheme(),
      useSystem: true, // Provide a default value (or choose the appropriate default)
    };

    return {
      ...baseTheme,
      ...overrides,
      useSystem: overrides && 'useSystem' in overrides ? overrides.useSystem! : baseTheme.useSystem,
    };
  };

  export const validateThemeConfig = (config: unknown): config is ThemeConfig => {
    if (typeof config !== 'object' || config === null) return false;
    const { mode, colorScheme, direction } = config as ThemeConfig;
    return (
      isThemeMode(mode) &&
      isColorScheme(colorScheme) &&
      (direction === undefined || ['ltr', 'rtl'].includes(direction))
    );
  };
