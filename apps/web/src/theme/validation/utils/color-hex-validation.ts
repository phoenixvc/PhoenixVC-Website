import {
  ColorDefinition,
  ValidationResult,
  ValidationErrorDetails,
} from "@/theme/types";

export const validateHexOnly = (
  colorDef: ColorDefinition,
  path?: string,
): ValidationResult => {
  const hex = colorDef.hex;
  const hexRegex = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

  if (typeof hex !== "string" || !hexRegex.test(hex)) {
    return {
      isValid: false,
      errors: [
        {
          code: "COLOR_INVALID_HEX",
          message: `Invalid hex color format at ${path || "unknown path"}: ${hex}. Expected "#FFF" or "#FFFFFF".`,
          path: path || "",
          details: {
            error: `Color value ${hex} does not match hex pattern`,
            timestamp: new Date().toISOString(),
          } as ValidationErrorDetails,
        },
      ],
      path: path || "",
      value: colorDef,
    };
  }

  return {
    isValid: true,
    path: path || "",
    value: colorDef,
  };
};
