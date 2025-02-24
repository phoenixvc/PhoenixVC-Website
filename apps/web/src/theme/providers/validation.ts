// src/theme/provider/validation.ts

import {
  ColorDefinition,
  REQUIRED_SEMANTIC_COLORS,
  ShadeLevel,
  ThemeColors,
  ThemeInitOptions,
  ThemeMode,
  ThemeColorScheme,
  ThemeStorage
} from "@/theme/types";

// Constants
const REQUIRED_BASE_COLORS = ['primary', 'secondary', 'accent'] as const;
const REQUIRED_MODE_COLORS = ['background', 'text', 'border'] as const;
const VALID_COLOR_SCHEMES: ThemeColorScheme[] = ['classic'];
const VALID_MODES: ThemeMode[] = ['light', 'dark'];

export class ThemeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeValidationError';
  }
}

// Color validation functions
const validateColorDefinition = (color: ColorDefinition, path: string) => {
  if (!color.hex || typeof color.hex !== 'string') {
    throw new ThemeValidationError(`Invalid hex value at ${path}`);
  }
  if (!color.rgb || typeof color.rgb !== 'string') {
    throw new ThemeValidationError(`Invalid rgb value at ${path}`);
  }
  if (!color.hsl || typeof color.hsl !== 'string') {
    throw new ThemeValidationError(`Invalid hsl value at ${path}`);
  }
};

const validateStorage = (storage: Partial<ThemeStorage>) => {
  if (storage.type && !['localStorage', 'sessionStorage', 'memory'].includes(storage.type)) {
      throw new ThemeValidationError(`Invalid storage type: ${storage.type}`);
  }
  if (storage.prefix && typeof storage.prefix !== 'string') {
      throw new ThemeValidationError('Storage prefix must be a string');
  }
  if (storage.version && typeof storage.version !== 'string') {
      throw new ThemeValidationError('Storage version must be a string');
  }
  if (storage.expiration !== undefined && typeof storage.expiration !== 'number') {
      throw new ThemeValidationError('Storage expiration must be a number');
  }
  if (storage.keys && typeof storage.keys !== 'object') {
      throw new ThemeValidationError('Storage keys must be an object');
  }
  if (storage.defaults && typeof storage.defaults !== 'object') {
      throw new ThemeValidationError('Storage defaults must be an object');
  }
};

const validateColorShades = (shades: Record<ShadeLevel, ColorDefinition>, path: string) => {
  const requiredShades: ShadeLevel[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  for (const shade of requiredShades) {
    if (!shades[shade]) {
      throw new ThemeValidationError(`Missing shade ${shade} at ${path}`);
    }
    validateColorDefinition(shades[shade], `${path}.${shade}`);
  }
};

// Theme colors validation
export const validateTheme = (theme: ThemeColors): void => {
  if (!theme.schemes || typeof theme.schemes !== 'object') {
    throw new ThemeValidationError('Theme must include color schemes');
  }
  Object.entries(theme.schemes).forEach(([schemeName, scheme]) => {
    const basePath = `schemes.${schemeName}`;
    if (!scheme.base) {
      throw new ThemeValidationError(`Missing base colors in ${basePath}`);
    }
    REQUIRED_BASE_COLORS.forEach(color => {
      if (!scheme.base[color]) {
        throw new ThemeValidationError(`Missing base color ${color} in ${basePath}`);
      }
      validateColorShades(scheme.base[color], `${basePath}.base.${color}`);
    });
    ['light', 'dark'].forEach(mode => {
      const modeColors = scheme[mode as 'light' | 'dark'];
      if (!modeColors) {
        throw new ThemeValidationError(`Missing ${mode} mode colors in ${basePath}`);
      }
      const modePath = `${basePath}.${mode}`;
      REQUIRED_MODE_COLORS.forEach(color => {
        if (!modeColors[color]) {
          throw new ThemeValidationError(`Missing ${mode} mode color ${color} in ${modePath}`);
        }
        validateColorDefinition(modeColors[color], `${modePath}.${color}`);
      });
    });
  });
  if (!theme.semantic) {
    throw new ThemeValidationError('Theme must include semantic colors');
  }
  REQUIRED_SEMANTIC_COLORS.forEach(color => {
    if (!theme.semantic[color]) {
      throw new ThemeValidationError(`Missing semantic color ${color}`);
    }
    validateColorDefinition(theme.semantic[color], `semantic.${color}`);
  });
};

// Config validation
export const validateThemeConfig = (config: ThemeInitOptions & {
  disableTransitions?: boolean;
  disableStorage?: boolean;
  storageKey?: string;
}): void => {
  const { defaultScheme, defaultMode, storage, transition, forceColorScheme, disableStorage, storageKey } = config;
  if (defaultScheme && !VALID_COLOR_SCHEMES.includes(defaultScheme)) {
      throw new ThemeValidationError(`Invalid default color scheme: ${defaultScheme}`);
  }
  if (forceColorScheme && !VALID_COLOR_SCHEMES.includes(forceColorScheme)) {
      throw new ThemeValidationError(`Invalid forced color scheme: ${forceColorScheme}`);
  }
  if (defaultMode && !VALID_MODES.includes(defaultMode)) {
      throw new ThemeValidationError(`Invalid default mode: ${defaultMode}`);
  }
  ['useSystem', 'debug', 'disableTransitionsOnLoad', 'disableTransitions', 'disableStorage'].forEach(
      (flag) => {
          const value = config[flag as keyof typeof config];
          if (value !== undefined && typeof value !== 'boolean') {
              throw new ThemeValidationError(`${flag} must be a boolean`);
          }
      }
  );
  if (!disableStorage) {
      if (storage && typeof storage !== 'object') {
          throw new ThemeValidationError('Storage configuration must be an object');
      }
      if (storageKey && typeof storageKey !== 'string') {
          throw new ThemeValidationError('Storage key must be a string');
      }
      if (storage) {
          validateStorage(storage);
      }
  }
  if (transition) {
      if (typeof transition !== 'object') {
          throw new ThemeValidationError('Transition configuration must be an object');
      }
      if (transition.duration && typeof transition.duration !== 'number') {
          throw new ThemeValidationError('Transition duration must be a number');
      }
      if (transition.timing && typeof transition.timing !== 'string') {
          throw new ThemeValidationError('Transition timing function must be a string');
      }
      if (transition.properties && !Array.isArray(transition.properties)) {
          throw new ThemeValidationError('Transition properties must be an array');
      }
  }
};

// Combined validation for ThemeProvider
export const validateThemeProvider = (
  theme: ThemeColors,
  config: ThemeInitOptions & {
    disableTransitions?: boolean;
    disableStorage?: boolean;
    storageKey?: string;
  }
): void => {
  validateTheme(theme);
  validateThemeConfig(config);
};

export const isValidColorScheme = (scheme: any): scheme is ThemeColorScheme => {
  return VALID_COLOR_SCHEMES.includes(scheme);
};

export const isValidThemeMode = (mode: any): mode is ThemeMode => {
  return VALID_MODES.includes(mode);
};
