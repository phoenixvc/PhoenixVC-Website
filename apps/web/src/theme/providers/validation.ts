// src/theme/provider/validation.ts

import {
  ColorDefinition,
  REQUIRED_SEMANTIC_COLORS,
  ShadeLevel,
  ThemeColors,
  ThemeInitOptions,
  ThemeMode,
  ThemeColorScheme,
  ThemeStorage,
  ThemeSchemeInitial,
  SemanticColors,
  ValidationResult,
  ValidationErrorDetails
} from "@/theme/types";
import ColorUtils from "../utils/color-utils";

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
const validateColorDef = (color: ColorDefinition, path: string): ValidationResult => {
  try {
    const result = ColorUtils.validateColorDefinition(color, path);

    // Print validation results with context
    printValidationResults(result, `Color Definition - ${path}`);

    return result;

  } catch (error) {
    const errorResult: ValidationResult = {
      isValid: false,
      errors: [{
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        path,
        details: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        } as ValidationErrorDetails
      }],
      path,
      value: color
    };

    // Print error result with context
    printValidationResults(errorResult, `Error in Color Definition - ${path}`);

    return errorResult;
  }
};

const printValidationResults = (results: ValidationResult | ValidationResult[], context?: string): void => {
  const resultArray = Array.isArray(results) ? results : [results];

  console.group(context ? `Validation Results: ${context}` : 'Validation Results');

  resultArray.forEach(result => {
    const icon = result.isValid ? '✅' : '❌';
    const status = result.isValid ? 'Valid' : 'Invalid';

    console.group(`${icon} ${result.path} - ${status}`);

    if (!result.isValid && result.errors && result.errors.length > 0) {
      console.group(`Errors (${result.errors.length}):`);

      result.errors.forEach((error, index) => {
        console.group(`Error ${index + 1} of ${result.errors!.length}`);

        const errorInfo = {
          Code: error.code,
          Message: error.message,
          Path: error.path
        };

        if (error.details) {
          console.log('Details:', error.details);
        }

        console.table(errorInfo);
        console.groupEnd();
      });

      console.groupEnd();
    }

    if (result.value) {
      console.group('Validated Value:');
      console.dir(result.value, { depth: null });
      console.groupEnd();
    }

    console.groupEnd();
  });

  const summary = resultArray.reduce(
    (acc, curr) => ({
      total: acc.total + 1,
      valid: acc.valid + (curr.isValid ? 1 : 0),
      invalid: acc.invalid + (curr.isValid ? 0 : 1),
      totalErrors: acc.totalErrors + (curr.errors?.length || 0)
    }),
    { total: 0, valid: 0, invalid: 0, totalErrors: 0 }
  );

  console.log('Summary:', {
    'Total Validations': summary.total,
    'Valid': summary.valid,
    'Invalid': summary.invalid,
    'Total Errors': summary.totalErrors
  });

  console.groupEnd();
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
    validateColorDef(shades[shade], `${path}.${shade}`);
  }
};

export const validateHexOnly = (colorDef: ColorDefinition, path?: string): ValidationResult => {
  // Assume that the ColorDefinition has a 'hex' property that is a string.
  const hex = colorDef.hex;
  // Regular expression: Optional '#' followed by exactly 3 or 6 hexadecimal digits.
  const hexRegex = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

  if (typeof hex !== 'string' || !hexRegex.test(hex)) {
    return {
      isValid: false,
      errors: [{
        code: 'COLOR_INVALID_HEX',
        message: `Invalid hex color format at ${path || 'unknown path'}: ${hex}. Expected "#FFF" or "#FFFFFF".`,
        path: path || '',
        details: {
          error: `Color value ${hex} does not match hex pattern`,
          timestamp: new Date().toISOString()
        } as ValidationErrorDetails
      }],
      path: path || '',
      value: colorDef
    };
  }

  return {
    isValid: true,
    path: path || '',
    value: colorDef
  };
};

export const validateInitialTheme = (theme: ThemeSchemeInitial & { semantic?: SemanticColors }): void => {
  // Validate base colors
  if (!theme.base) {
    throw new ThemeValidationError('Theme must include base colors');
  }

  REQUIRED_BASE_COLORS.forEach(color => {
    if (!theme.base[color]) {
      throw new ThemeValidationError(`Missing base color ${color}`);
    }
    // Just validate the color definition itself, not shades
    validateHexOnly(theme.base[color], `base.${color}`);
  });

  // Validate mode colors
  ['light', 'dark'].forEach(mode => {
    const modeColors = theme[mode as 'light' | 'dark'];
    if (!modeColors) {
      throw new ThemeValidationError(`Missing ${mode} mode colors`);
    }
    const modePath = mode;
    REQUIRED_MODE_COLORS.forEach(color => {
      if (!modeColors[color]) {
        throw new ThemeValidationError(`Missing ${mode} mode color ${color} in ${modePath}`);
      }
      validateHexOnly(modeColors[color], `${modePath}.${color}`);
    });
  });

  // Validate semantic colors if present
  if (theme.semantic) {
    REQUIRED_SEMANTIC_COLORS.forEach(color => {
      if (!theme.semantic?.[color]) {
        throw new ThemeValidationError(`Missing semantic color ${color}`);
      }
      validateHexOnly(theme.semantic[color], `semantic.${color}`);
    });
  }
};

// Validation for processed theme (post-transform)
export const validateProcessedTheme = (theme: ThemeColors): void => {
  console.groupCollapsed("validateProcessedTheme");
  console.log("Starting processed theme validation...");

  if (!theme.schemes || typeof theme.schemes !== "object") {
    console.error("[Validation Error] Processed theme must include color schemes");
    console.groupEnd();
    throw new ThemeValidationError("Processed theme must include color schemes");
  }

  // Iterate over each scheme
  Object.entries(theme.schemes).forEach(([schemeName, scheme]) => {
    console.group(`Scheme: "${schemeName}"`);

    const basePath = `schemes.${schemeName}`;

    // Validate base colors
    if (!scheme.base) {
      console.error(`[Validation Error] Missing base colors in ${basePath}`);
      console.groupEnd();
      throw new ThemeValidationError(`Missing base colors in ${basePath}`);
    }

    REQUIRED_BASE_COLORS.forEach((color) => {
      if (!scheme.base[color]) {
        console.error(
          `[Validation Error] Missing base color "${color}" in ${basePath}`
        );
        console.groupEnd();
        throw new ThemeValidationError(
          `Missing base color ${color} in ${basePath}`
        );
      }
      console.group(`Validating base color: "${color}"`);
      validateColorShades(scheme.base[color], `${basePath}.base.${color}`);
      console.groupEnd();
    });

    // Validate mode colors
    ["light", "dark"].forEach((mode) => {
      console.group(`Validating "${mode}" mode colors`);
      const modeColors = scheme[mode as "light" | "dark"];
      if (!modeColors) {
        console.error(
          `[Validation Error] Missing ${mode} mode colors in ${basePath}`
        );
        console.groupEnd();
        console.groupEnd();
        throw new ThemeValidationError(
          `Missing ${mode} mode colors in ${basePath}`
        );
      }

      const modePath = `${basePath}.${mode}`;
      REQUIRED_MODE_COLORS.forEach((color) => {
        if (!modeColors[color]) {
          console.error(
            `[Validation Error] Missing ${mode} mode color "${color}" in ${modePath}`
          );
          console.groupEnd();
          console.groupEnd();
          throw new ThemeValidationError(
            `Missing ${mode} mode color ${color} in ${modePath}`
          );
        }
        console.group(`Validating ${mode} mode color: "${color}"`);
        validateColorDef(modeColors[color], `${modePath}.${color}`);
        console.groupEnd();
      });

      console.groupEnd(); // End validating "<mode>" mode colors
    });

    console.groupEnd(); // End Scheme: "schemeName"
  });

  // Validate semantic colors if present
  console.group("Validating semantic colors");
  if (theme.semantic) {
    REQUIRED_SEMANTIC_COLORS.forEach((color) => {
      if (!theme.semantic?.[color]) {
        console.error(`[Validation Error] Missing semantic color "${color}"`);
        console.groupEnd();
        throw new ThemeValidationError(`Missing semantic color ${color}`);
      }
      console.group(`Validating semantic color: "${color}"`);
      validateColorDef(theme.semantic[color], `semantic.${color}`);
      console.groupEnd();
    });
  } else {
    console.warn("No semantic colors found.");
  }
  console.groupEnd(); // End "Validating semantic colors"

  console.log("Processed theme validation completed successfully.");
  console.groupEnd(); // End "validateProcessedTheme"
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
  validateProcessedTheme(theme);
  validateThemeConfig(config);
};

export const isValidColorScheme = (scheme: any): scheme is ThemeColorScheme => {
  return VALID_COLOR_SCHEMES.includes(scheme);
};

export const isValidThemeMode = (mode: any): mode is ThemeMode => {
  return VALID_MODES.includes(mode);
};
