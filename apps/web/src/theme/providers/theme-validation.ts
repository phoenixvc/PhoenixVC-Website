import {
  ThemeColors,
  ThemeInitOptions,
  ThemeName,
  ThemeMode,
} from "@/theme/types";
import {
  VALID_COLOR_SCHEMES,
  VALID_MODES,
} from "./validation/constants";
import { ProcessedThemeValidation } from "./validation/theme-processed-validation";
import { ThemeConfigValidation } from "./validation/theme-config-validation";

// Validate the theme configuration
export const validateThemeConfig = (
  config: ThemeInitOptions & {
    disableTransitions?: boolean;
    disableStorage?: boolean;
    storageKey?: string;
  }
): void => {
  // Delegate to the ThemeConfigValidation class
  ThemeConfigValidation.validateThemeConfig(config);
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
  ProcessedThemeValidation.validateProcessedTheme(theme.schemes);
  validateThemeConfig(config);
};

// Utility to check if a color scheme is valid
export const isValidThemeName = (
  themeName: ThemeName
): themeName is ThemeName => {
  return VALID_COLOR_SCHEMES.includes(themeName);
};

// Utility to check if a theme mode is valid
export const isValidThemeMode = (mode: ThemeMode): mode is ThemeMode => {
  return VALID_MODES.includes(mode);
};
