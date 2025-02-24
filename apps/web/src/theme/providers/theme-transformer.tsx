// src/theme/providers/theme-transformer.ts
import {
  ColorDefinition,
  ProcessedBaseColors,
  REQUIRED_MODE_COLORS,
  REQUIRED_SEMANTIC_COLORS,
  ShadeLevel,
  ThemeColors,
  ThemeMode
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";

interface DarkModeOptions {
  darkenBackground?: number;
  lightenText?: number;
  adjustSaturation?: number;
}

interface LightModeOptions {
  lightenBackground?: number;
  darkenText?: number;
  adjustSaturation?: number;
}

interface TransformOptions {
  darkMode?: DarkModeOptions;
  lightMode?: LightModeOptions;
}

const defaultOptions: Required<TransformOptions> = {
  darkMode: {
    darkenBackground: 15,
    lightenText: 15,
    adjustSaturation: -10,
  },
  lightMode: {
    lightenBackground: 15,
    darkenText: 15,
    adjustSaturation: 10,
  },
};

// Type guard for ShadeLevel
function isValidShadeLevel(value: number): value is ShadeLevel {
  const validShadeLevels: ShadeLevel[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  return validShadeLevels.includes(value as ShadeLevel);
}

/**
 * Helper that creates a uniform palette (a ColorShades object) from a single ColorDefinition.
 * In a production system, you’d generate a proper palette.
 */
function createUniformShades(color: ColorDefinition): Record<ShadeLevel, ColorDefinition> {
  return {
    50: color,
    100: color,
    200: color,
    300: color,
    400: color,
    500: color,
    600: color,
    700: color,
    800: color,
    900: color,
  };
}

/**
 * Ensure the base color is processed.
 * If it's not already a palette (i.e. an object with a "500" key), generate one.
 */
function ensureProcessedBase(
  color: ColorDefinition | Record<ShadeLevel, ColorDefinition>
): Record<ShadeLevel, ColorDefinition> {
  if (typeof color === "object" && "500" in color) {
    return color as Record<ShadeLevel, ColorDefinition>;
  }
  return createUniformShades(color as ColorDefinition);
}

const transformColor = (
  color: ColorDefinition,
  mode: ThemeMode,
  options: DarkModeOptions | LightModeOptions
): ColorDefinition => {
  if (mode === "dark") {
    const darkOptions = options as DarkModeOptions;
    const { darkenBackground = 0, lightenText = 0, adjustSaturation = 0 } = darkOptions;
    return ColorUtils.adjustColor(color, {
      lightness: -darkenBackground + lightenText,
      saturation: adjustSaturation,
    });
  } else {
    const lightOptions = options as LightModeOptions;
    const { lightenBackground = 0, darkenText = 0, adjustSaturation = 0 } = lightOptions;
    return ColorUtils.adjustColor(color, {
      lightness: lightenBackground - darkenText,
      saturation: adjustSaturation,
    });
  }
};

export function transformTheme(
  theme: ThemeColors,
  mode: ThemeMode,
  options: TransformOptions = defaultOptions
): ThemeColors {
  // Deep clone the theme to avoid mutating the original.
  const transformed = JSON.parse(JSON.stringify(theme)) as ThemeColors;
  const modeOptions = mode === "dark" ? options.darkMode : options.lightMode;
  if (!modeOptions) return transformed;

  try {
    // Transform each scheme.
    Object.entries(transformed.schemes).forEach(([schemeName, scheme]) => {
      if (!scheme.base || !schemeName) return;

      // Process each base color (e.g., primary, secondary, accent)
      Object.entries(scheme.base).forEach(([colorKey, baseValue]) => {
        // Ensure the base color is a processed palette.
        const processedShades = ensureProcessedBase(baseValue);
        // Replace the initial base with the processed palette.
        scheme.base[colorKey as keyof ProcessedBaseColors] = processedShades;
        // Transform each shade.
        Object.entries(processedShades).forEach(([shadeKey, shadeColor]) => {
          const shadeNum = Number(shadeKey);
          if (isValidShadeLevel(shadeNum) && shadeColor) {
            processedShades[shadeNum] = transformColor(shadeColor, mode, modeOptions);
          }
        });
      });

      // Transform mode-specific colors (light/dark)
      const modeColors = scheme[mode as "light" | "dark"];
      if (modeColors) {
        REQUIRED_MODE_COLORS.forEach((colorKey) => {
          const color = modeColors[colorKey];
          if (color) {
            modeColors[colorKey] = transformColor(color, mode, modeOptions);
          }
        });
      }
    });

    // Transform semantic colors
    if (transformed.semantic) {
      REQUIRED_SEMANTIC_COLORS.forEach((colorKey) => {
        const color = transformed.semantic[colorKey];
        if (color) {
          transformed.semantic[colorKey] = transformColor(color, mode, modeOptions);
        }
      });
    }

    return transformed;
  } catch (error) {
    console.error("Error transforming theme:", error);
    return transformed;
  }
}
