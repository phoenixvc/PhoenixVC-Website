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
  purplePalette,
  redPalette,
} from "./colors";
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
 * Ocean Theme Color Scheme
 * A cool, calming color scheme based on blue tones
 */
export const oceanColorScheme: ThemeScheme = {
  base: {
    primary: bluePalette,
    secondary: purplePalette,
    accent: ColorUtils.createColorShades("#3B82F6"), // Use the new method
    neutral: grayPalette,
    gray: grayPalette,
    // Add any other required base colors
  },
  light: {
    background: createColor("#FFFFFF"),
    text: {
      primary: createColor("#111827"),
      secondary: createColor("#9CA3AF"),
    },
    muted: createColor("#9CA3AF"),
    border: createColor("#E5E7EB"),
    surface: createColor("#F9FAFB"),
    overlay: createColor("rgba(0, 0, 0, 0.5)"),
    hover: createColor("rgba(0, 0, 0, 0.04)"),
    active: createColor("rgba(0, 0, 0, 0.08)"),
    focus: createColor("rgba(59, 130, 246, 0.5)"),
    disabled: createColor("rgba(0, 0, 0, 0.26)"),
  },
  dark: {
    background: createColor("#0F172A"),
    text: {
      primary: createColor("#F9FAFB"),
      secondary: createColor("#9CA3AF"),
    },
    muted: createColor("#9CA3AF"),
    border: createColor("#475569"),
    surface: createColor("#1E293B"),
    overlay: createColor("rgba(0, 0, 0, 0.7)"),
    hover: createColor("rgba(255, 255, 255, 0.08)"),
    active: createColor("rgba(255, 255, 255, 0.16)"),
    focus: createColor("rgba(59, 130, 246, 0.6)"),
    disabled: createColor("rgba(255, 255, 255, 0.3)"),
  },
};

/**
 * Ocean Theme Colors
 */
export const oceanColors: ThemeColors = {
  schemes: {
    default: oceanColorScheme,
  },
  semantic: {
    success: createColor(greenPalette.base),
    warning: createColor("#F59E0B"),
    error: createColor(redPalette.base),
    info: createColor(bluePalette[400].hex),
  },
};

/**
 * Ocean Theme
 * A modern, professional theme with a focus on blue tones,
 * creating a calm and trustworthy aesthetic.
 */
export const oceanTheme: Theme = {
  // Use the typed version of defaultTheme
  ...typedDefaultTheme,

  // Override specific properties
  colors: oceanColors,

  // Typography customizations
  typography: {
    fontFamily: {
      base: "\"Inter\", system-ui, -apple-system, sans-serif",
      heading: "\"Montserrat\", sans-serif",
      monospace: "\"Fira Code\", monospace",
    },
    fontSize: typedDefaultTheme.typography.fontSize,
    fontWeight: typedDefaultTheme.typography.fontWeight,
    lineHeight: typedDefaultTheme.typography.lineHeight,
    letterSpacing: typedDefaultTheme.typography.letterSpacing,
  },

  // Spacing customizations
  spacing: typedDefaultTheme.spacing,

  // Border customizations
  borders: {
    radius: {
      none: typedDefaultTheme.borders.radius.none,
      sm: typedDefaultTheme.borders.radius.sm,
      md: "0.5rem", // Slightly larger medium radius for Ocean theme
      lg: typedDefaultTheme.borders.radius.lg,
      full: typedDefaultTheme.borders.radius.full,
    },
    width: typedDefaultTheme.borders.width,
    style: typedDefaultTheme.borders.style,
  },

  // Shadow customizations
  shadows: {
    none: typedDefaultTheme.shadows.none,
    sm: typedDefaultTheme.shadows.sm,
    md: "0 4px 12px rgba(59, 130, 246, 0.15)", // Blue-tinted shadows for Ocean theme
    lg: "0 10px 25px rgba(59, 130, 246, 0.2)",
    xl: typedDefaultTheme.shadows.xl,
  },

  // Other required properties
  breakpoints: typedDefaultTheme.breakpoints,
  transitions: typedDefaultTheme.transitions,
  zIndex: typedDefaultTheme.zIndex,
  variables: typedDefaultTheme.variables,
  components: typedDefaultTheme.components,
  config: typedDefaultTheme.config,
};

/**
 * Helper functions for Ocean theme
 */

/**
 * Get a primary color shade from the Ocean theme
 */
export const getOceanPrimaryShade = (shade: ShadeLevel): ColorDefinition => {
  return oceanColorScheme.base.primary[shade];
};

/**
 * Get the appropriate text color for a given background color in Ocean theme
 */
export const getOceanTextColor = (
  bgColor: ColorDefinition,
  mode: "light" | "dark" = "light",
): ColorDefinition => {
  const textColors = oceanColorScheme[mode];

  // Calculate contrast with both primary and secondary text
  const primaryContrast = ColorUtils.getContrastRatio(
    bgColor,
    textColors.text.primary,
  );
  const secondaryContrast = ColorUtils.getContrastRatio(
    bgColor,
    textColors.text.secondary,
  );

  // Return the text with better contrast
  return primaryContrast >= 4.5
    ? textColors.text.primary
    : secondaryContrast >= 4.5
      ? textColors.text.secondary
      : textColors.muted;
};

/**
 * Get a theme color variant based on the current mode
 */
export const getOceanThemeColor = (
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
    return oceanColors.semantic?.[colorType] || createColor("#000000");
  }

  // Adjust shade based on mode for better visibility
  const adjustedShade =
    mode === "dark" ? (Math.max(300, shade - 200) as ShadeLevel) : shade;

  // Check if the color type exists in the base object
  const colorPalette = oceanColorScheme.base[colorType];
  if (!colorPalette) {
    console.warn(`Color type "${colorType}" not found in theme base colors`);
    return createColor("#000000"); // Fallback color
  }

  // For ColorShades objects (like accent), we need to access by property
  if ("50" in colorPalette && typeof colorPalette !== "function") {
    // It"s a ColorShades object
    return (
      (colorPalette as ColorShades)[adjustedShade] ||
      (colorPalette as ColorShades)[500] || // Fallback to 500 if specific shade doesn"t exist
      createColor((colorPalette as ColorShades).base || "#000000")
    );
  }

  // For regular palette arrays
  return colorPalette[adjustedShade] || createColor("#000000");
};

export default oceanTheme;
