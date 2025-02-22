// src/types/theme/testing.ts
import type { ThemeConfig } from '../core/config';
import type { DeepPartial } from './utils';
import { createTheme } from '../core/config';
import { isThemeMode, isColorScheme } from './guards';

export const createTestTheme = (overrides?: DeepPartial<ThemeConfig>): ThemeConfig => ({
    ...createTheme(),
    ...overrides,
});

export const validateThemeConfig = (config: unknown): config is ThemeConfig => {
    if (typeof config !== 'object' || config === null) return false;
    const { mode, colorScheme, direction } = config as ThemeConfig;
    return (
        isThemeMode(mode) &&
        isColorScheme(colorScheme) &&
        ['ltr', 'rtl'].includes(direction)
    );
};
