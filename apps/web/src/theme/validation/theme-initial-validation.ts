import {
    ThemeSchemeInitial,
    SemanticColors,
    ValidationResult,
    ValidationError,
  } from "@/theme/types";
  import { validateHexOnly } from "./utils/color-hex-validation";
  import {
    REQUIRED_BASE_COLORS,
    REQUIRED_MODE_COLORS,
  } from "./constants";
  import { SemanticColorValidation } from "./semantic-color-validation";

  export const validateInitialTheme = (
    theme: ThemeSchemeInitial & { semantic?: SemanticColors }
  ): ValidationResult => {
    const errors: ValidationError[] = [];

    // Validate base colors
    if (!theme.base) {
      errors.push({
        code: "MISSING_BASE_COLORS",
        message: "Theme must include base colors",
        path: "base",
      });
    } else {
      REQUIRED_BASE_COLORS.forEach((color) => {
        if (!theme.base[color]) {
          errors.push({
            code: "MISSING_BASE_COLORS",
            message: `Missing base color ${color}`,
            path: `base.${color}`,
          });
        } else {
          const result = validateHexOnly(theme.base[color], `base.${color}`);
          if (!result.isValid) {
            errors.push(...result.errors!);
          }
        }
      });
    }

    // Validate mode colors
    ["light", "dark"].forEach((mode) => {
      const modeColors = theme[mode as "light" | "dark"];
      if (!modeColors) {
        errors.push({
          code: "MISSING_MODE_COLORS",
          message: `Missing ${mode} mode colors`,
          path: mode,
        });
      } else {
        REQUIRED_MODE_COLORS.forEach((color) => {
          if (!modeColors[color]) {
            errors.push({
              code: "MISSING_MODE_COLORS",
              message: `Missing ${mode} mode color ${color}`,
              path: `${mode}.${color}`,
            });
          } else {
            const result = validateHexOnly(modeColors[color], `${mode}.${color}`);
            if (!result.isValid) {
              errors.push(...result.errors!);
            }
          }
        });
      }
    });

    // Validate semantic colors if present
    if (theme.semantic) {
      const semanticResult = SemanticColorValidation.validateSemanticColors(theme.semantic);
      if (!semanticResult.isValid) {
        errors.push(...semanticResult.errors!);
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        path: "theme",
        value: theme,
        errors,
      };
    }

    return {
      isValid: true,
      path: "theme",
      value: theme,
    };
  };
