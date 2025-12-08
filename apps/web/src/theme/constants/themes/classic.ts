import {
  ColorDefinition,
  ColorShades,
  ComponentVariants,
  ShadeLevel,
  Theme,
  ThemeBorders,
  ThemeBreakpoints,
  ThemeColors,
  ThemeConfig,
  ThemeScheme,
  ThemeShadows,
  ThemeSpacing,
  ThemeTransitions,
  ThemeTypography,
  ThemeVariables,
  ThemeZIndex,
} from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";
import {
  bluePalette,
  createColor,
  grayPalette,
  greenPalette,
  redPalette,
} from "./colors";
import yellowPalette from "./colors/yellow";
import { defaultTheme } from "./default";

// Type assertion for defaultTheme to make its properties accessible
const typedDefaultTheme = defaultTheme as Omit<Theme, "colors"> & {
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
  shadows: ThemeShadows;
  breakpoints: ThemeBreakpoints;
  transitions: ThemeTransitions;
  zIndex: ThemeZIndex;
  variables: ThemeVariables;
  components: ComponentVariants;
  config: ThemeConfig;
};

/**
 * Classic Theme Color Scheme
 * A timeless, professional color scheme based on blue tones
 */
export const classicColorScheme: ThemeScheme = {
  base: {
    primary: bluePalette,
    secondary: grayPalette,
    accent: ColorUtils.createColorShades("#2563EB"),
    neutral: grayPalette,
    gray: grayPalette,
  },
  light: {
    background: createColor("#FFFFFF"),
    text: {
      primary: createColor("#111827"),
      secondary: createColor("#4B5563"),
    },
    muted: createColor("#6B7280"),
    border: createColor("#E5E7EB"),
    surface: createColor("#F9FAFB"),
    overlay: createColor("rgba(0, 0, 0, 0.5)"),
    hover: createColor("rgba(37, 99, 235, 0.04)"),
    active: createColor("rgba(37, 99, 235, 0.08)"),
    focus: createColor("rgba(37, 99, 235, 0.5)"),
    disabled: createColor("rgba(0, 0, 0, 0.26)"),
  },
  dark: {
    background: createColor("#111827"),
    text: {
      primary: createColor("#F9FAFB"),
      secondary: createColor("#D1D5DB"),
    },
    muted: createColor("#9CA3AF"),
    border: createColor("#374151"),
    surface: createColor("#1F2937"),
    overlay: createColor("rgba(0, 0, 0, 0.7)"),
    hover: createColor("rgba(255, 255, 255, 0.08)"),
    active: createColor("rgba(255, 255, 255, 0.16)"),
    focus: createColor("rgba(37, 99, 235, 0.6)"),
    disabled: createColor("rgba(255, 255, 255, 0.3)"),
  },
};

/**
 * Classic Theme Colors
 */
export const classicColors: ThemeColors = {
  schemes: {
    default: classicColorScheme,
  },
  semantic: {
    success: createColor(greenPalette[500].hex),
    warning: createColor(yellowPalette[500].hex),
    error: createColor(redPalette[500].hex),
    info: createColor(bluePalette[400].hex),
  },
};

/**
 * Classic Theme
 * A timeless, professional theme with a focus on blue tones,
 * creating a trustworthy and familiar aesthetic.
 */
export const classicTheme: Theme = {
  ...typedDefaultTheme,
  colors: classicColors,
  typography: {
    fontFamily: {
      base: "\"Inter\", system-ui, -apple-system, sans-serif",
      heading: "\"Inter\", system-ui, -apple-system, sans-serif",
      monospace: "\"Fira Code\", monospace",
    },
    fontSize: typedDefaultTheme.typography.fontSize,
    fontWeight: typedDefaultTheme.typography.fontWeight,
    lineHeight: typedDefaultTheme.typography.lineHeight,
    letterSpacing: typedDefaultTheme.typography.letterSpacing,
  },
  borders: {
    radius: {
      none: "0",
      sm: "0.125rem",
      md: "0.25rem",
      lg: "0.5rem",
      full: "9999px",
    },
    width: typedDefaultTheme.borders.width,
    style: typedDefaultTheme.borders.style,
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  breakpoints: typedDefaultTheme.breakpoints,
  transitions: typedDefaultTheme.transitions,
  zIndex: typedDefaultTheme.zIndex,
  variables: typedDefaultTheme.variables,
  components: typedDefaultTheme.components,
  config: typedDefaultTheme.config,
};

/**
 * Helper functions for Classic theme
 */

/**
 * Get a primary color shade from the Classic theme
 */
export const getClassicPrimaryShade = (shade: ShadeLevel): ColorDefinition => {
  return classicColorScheme.base.primary[shade];
};

/**
 * Get the appropriate text color for a given background color in Classic theme
 */
export const getClassicTextColor = (
  bgColor: ColorDefinition,
  mode: "light" | "dark" = "light",
): ColorDefinition => {
  const textColors = classicColorScheme[mode];
  const primaryContrast = ColorUtils.getContrastRatio(
    bgColor,
    textColors.text.primary,
  );
  return primaryContrast >= 4.5 ? textColors.text.primary : textColors.muted;
};

/**
 * Get a theme color variant based on the current mode
 */
export const getClassicThemeColor = (
  colorType:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "success"
    | "error"
    | "warning"
    | "info",
  shade: ShadeLevel = 500,
  mode: "light" | "dark" = "light",
): ColorDefinition => {
  // Handle semantic colors
  if (
    colorType === "success" ||
    colorType === "error" ||
    colorType === "warning" ||
    colorType === "info"
  ) {
    return classicColors.semantic?.[colorType] || createColor("#000000");
  }

  // Adjust shade based on mode for better visibility
  const adjustedShade =
    mode === "dark" ? (Math.max(300, shade - 200) as ShadeLevel) : shade;

  // Check if the color type exists in the base object
  const colorPalette = classicColorScheme.base[colorType];
  if (!colorPalette) {
    console.warn(`Color type "${colorType}" not found in theme base colors`);
    return createColor("#000000"); // Fallback color
  }

  // For ColorShades objects (like accent), we need to access by property
  if ("50" in colorPalette && typeof colorPalette !== "function") {
    // It's a ColorShades object
    return (
      (colorPalette as ColorShades)[adjustedShade] ||
      (colorPalette as ColorShades)[500] || // Fallback to 500 if specific shade doesn't exist
      createColor((colorPalette as ColorShades).base || "#000000")
    );
  }

  // For regular palette arrays
  return colorPalette[adjustedShade] || createColor("#000000");
};

export default classicTheme;
