// transformTheme.ts
import {
  ColorDefinition,
  ColorShades,
  ProcessedBaseColors,
  REQUIRED_MODE_COLORS,
  REQUIRED_SEMANTIC_COLORS,
  SemanticColors,
  ShadeLevel,
  ThemeColors,
  ThemeMode,
  ThemeSchemeInitial
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";
import { THEME_CONSTANTS } from "../constants";

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

const fallbackLight: LightModeOptions = {
  lightenBackground: 0,
  darkenText: 0,
  adjustSaturation: 0,
};

const fallbackDark: DarkModeOptions = {
  darkenBackground: 0,
  lightenText: 0,
  adjustSaturation: 0,
};

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

/**
 * Helper: Log transformation options based on the mode.
 * (Logged only once per theme transformation.)
 */
function logTransformationOptions(mode: ThemeMode, modeOptions: DarkModeOptions | LightModeOptions) {
  console.group("Transformation Options");
  console.log("Mode:", mode);
  if (mode === "dark") {
    const darkOptions = modeOptions as DarkModeOptions;
    console.log("Dark Mode Options:", {
      darkenBackground: darkOptions.darkenBackground,
      lightenText: darkOptions.lightenText,
      adjustSaturation: darkOptions.adjustSaturation
    });
  } else {
    const lightOptions = modeOptions as LightModeOptions;
    console.log("Light Mode Options:", {
      lightenBackground: lightOptions.lightenBackground,
      darkenText: lightOptions.darkenText,
      adjustSaturation: lightOptions.adjustSaturation
    });
  }
  console.groupEnd();
}

/**
 * Transform a single color according to the given mode and options.
 */
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

/**
 * Refactored transformTheme function
 */
export function transformTheme(
  theme: ThemeSchemeInitial,
  // NOTE: We still pass an explicit mode, but we’ll transform both blocks below.
  mode: ThemeMode,
  semantic?: SemanticColors,
  options: TransformOptions = defaultOptions
): ThemeColors {
  console.groupCollapsed("transformTheme: Start");

  // Build an initial ThemeColors object with only one scheme
  const transformed: ThemeColors = {
    schemes: {
      [THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME]: JSON.parse(JSON.stringify(theme)),
    },
    // If you have a separate semantic definition, you could add it here:
    // semantic: theme.semantic || ({} as SemanticColors),
    semantic: JSON.parse(JSON.stringify(semantic)),
  };

  console.log("Cloned theme:", transformed);

  const scheme = transformed.schemes[THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME];

  // Decide how we handle transform options for both modes:
  const lightModeOptions = options.lightMode ?? fallbackLight;
  const darkModeOptions = options.darkMode ?? fallbackDark;

  logTransformationOptions("light", lightModeOptions);
  logTransformationOptions("dark", darkModeOptions);

  try {
    /****************************************************
     * PROCESS BASE COLORS (Same for all modes)
     ****************************************************/
    if (scheme.base) {
      console.group("Processing base colors");

      // For each base color (primary, secondary, accent, etc.)
      Object.entries(scheme.base).forEach(([colorKey, baseValue]) => {
        console.group(`Processing base color: ${colorKey}`);

        const baseHex = baseValue.hex;

        // Generate a palette of 10 steps from the base hex
        const paletteArray = ColorUtils.createPalette(baseHex, 10);
        console.log("Generated palette array:", paletteArray);

        const shadeLevels: ShadeLevel[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        const colorShades: Partial<ColorShades> = {};

        paletteArray.forEach((colorDef, index) => {
          const shade = shadeLevels[index];
          // We still choose "mode" to transform each shade
          // or you could skip transforming base if you only want raw color
          const currentModeOptions = mode === "dark" ? darkModeOptions : lightModeOptions;
          const transformedDef = transformColor(colorDef, mode, currentModeOptions);

          colorShades[shade] = {
            hex: transformedDef.hex,
            rgb: transformedDef.rgb,
            hsl: transformedDef.hsl,
            alpha: transformedDef.alpha ?? 1,
          };
        });

        scheme.base[colorKey as keyof ProcessedBaseColors] = colorShades as ColorShades;
        console.groupEnd();
      });

      console.groupEnd();
    } else {
      console.warn("No base colors found in scheme.");
    }

    /****************************************************
     * PROCESS MODE-SPECIFIC COLORS FOR BOTH 'LIGHT' AND 'DARK'
     ****************************************************/
    // TODO: Revisit if we want to validate just one mode at a time
    // For now, let's transform & validate BOTH to ensure fully populated fields.

    (["light", "dark"] as ThemeMode[]).forEach((m) => {
      console.group(`Transforming mode-specific colors for: ${m}`);
      const modeColors = scheme[m];
      const currentModeOptions = m === "dark" ? darkModeOptions : lightModeOptions;

      if (modeColors) {
        REQUIRED_MODE_COLORS.forEach((colorKey) => {
          const singleColor = modeColors[colorKey];
          if (singleColor) {
            const ensuredColor = ColorUtils.ensureColorDefinition(singleColor);
            modeColors[colorKey] = transformColor(ensuredColor, m, currentModeOptions);
            console.log(`Transformed ${m} mode color ${colorKey}:`, modeColors[colorKey]);
          } else {
            console.warn(`Missing ${m} mode color for key: ${colorKey}`);
          }
        });
      } else {
        console.warn(`No ${m} mode-specific colors found.`);
      }
      console.groupEnd();
    });

    /****************************************************
     * PROCESS SEMANTIC COLORS
     ****************************************************/
    //TODO: Make optional
    console.group("Transforming semantic colors");

    if (!transformed.semantic) {
      console.warn("No semantic colors found.");
    } else {
      const semanticColors = transformed.semantic;

      // We'll transform each semantic color once for "light" mode, then again for "dark" mode.
      (["light", "dark"] as ThemeMode[]).forEach((m) => {
        console.group(`Transforming semantic colors for: ${m}`);
        const currentModeOptions =
          m === "dark" ? darkModeOptions : lightModeOptions;

          REQUIRED_SEMANTIC_COLORS.forEach((colorKey) => {
            const color = semanticColors[colorKey];
            if (color) {
              // Ensure each color has valid hex/rgb/hsl before transforming
              const ensured = ColorUtils.ensureColorDefinition(color);

              const transformedDef = transformColor(ensured, m, currentModeOptions);
              semanticColors[colorKey] = transformedDef;

              console.log(
                `Transformed semantic color "${colorKey}" for mode "${m}":`,
                semanticColors[colorKey]
              );
            } else {
              console.warn(`Missing semantic color for key: ${colorKey}`);
            }
          });

          console.groupEnd();
        });
      }

    console.groupEnd(); // End transformTheme group.
    return transformed;
  } catch (error) {
    console.error("Error transforming theme:", error);
    console.groupEnd();
    return transformed;
  }
}
