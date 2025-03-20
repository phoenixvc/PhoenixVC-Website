import { ComponentVariants, Theme, ThemeBorders, ThemeBreakpoints, ThemeColors, ThemeConfig, ThemeScheme, ThemeShadows, ThemeSpacing, ThemeTransitions, ThemeTypography, ThemeVariables, ThemeZIndex } from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";
import { createColor, grayPalette, greenPalette, purplePalette, redPalette } from "./colors";
import indigoPalette from "./colors/indigo";
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
 * Lavender Theme Color Scheme
 * A soothing, elegant color scheme based on purple tones
 */
export const lavenderColorScheme: ThemeScheme = {
  base: {
    primary: purplePalette,
    secondary: indigoPalette,
    accent: ColorUtils.createColorShades("#8B5CF6"),
    neutral: grayPalette,
    gray: grayPalette,
  },
  light: {
    background: createColor("#FFFFFF"),
    text: {
      primary: createColor("#1E1B4B"),
      secondary: createColor("#6D6A94")
    },
    muted: createColor("#6D6A94"),
    border: createColor("#E2E8F0"),
    surface: createColor("#F8FAFC"),
    overlay: createColor("rgba(0, 0, 0, 0.5)"),
    hover: createColor("rgba(139, 92, 246, 0.04)"),
    active: createColor("rgba(139, 92, 246, 0.08)"),
    focus: createColor("rgba(139, 92, 246, 0.5)"),
    disabled: createColor("rgba(0, 0, 0, 0.26)")
  },
  dark: {
    background: createColor("#0F172A"),
    text: {
      primary: createColor("#F8FAFC"),
      secondary: createColor("#94A3B8")
    },
    muted: createColor("#94A3B8"),
    border: createColor("#334155"),
    surface: createColor("#1E293B"),
    overlay: createColor("rgba(0, 0, 0, 0.7)"),
    hover: createColor("rgba(255, 255, 255, 0.08)"),
    active: createColor("rgba(255, 255, 255, 0.16)"),
    focus: createColor("rgba(139, 92, 246, 0.6)"),
    disabled: createColor("rgba(255, 255, 255, 0.3)")
  }
};

/**
 * Lavender Theme Colors
 */
export const lavenderColors: ThemeColors = {
  schemes: {
    default: lavenderColorScheme
  },
  semantic: {
    success: createColor(greenPalette[500].hex),
    warning: createColor("#F59E0B"),
    error: createColor(redPalette[500].hex),
    info: createColor(indigoPalette[400].hex)
  }
};

/**
 * Lavender Theme
 * A soothing, elegant theme with a focus on purple tones,
 * creating a calm and sophisticated aesthetic.
 */
export const lavenderTheme: Theme = {
  ...typedDefaultTheme,
  colors: lavenderColors,
  typography: {
    fontFamily: {
      base: "\"Quicksand\", system-ui, sans-serif",
      heading: "\"Playfair Display\", serif",
      monospace: "\"Fira Code\", monospace"
    },
    fontSize: typedDefaultTheme.typography.fontSize,
    fontWeight: typedDefaultTheme.typography.fontWeight,
    lineHeight: typedDefaultTheme.typography.lineHeight,
    letterSpacing: typedDefaultTheme.typography.letterSpacing
  },
  borders: {
    radius: {
      none: typedDefaultTheme.borders.radius.none,
      sm: typedDefaultTheme.borders.radius.sm,
      md: "0.5rem",
      lg: "0.75rem",
      full: typedDefaultTheme.borders.radius.full
    },
    width: typedDefaultTheme.borders.width,
    style: typedDefaultTheme.borders.style
  },
  shadows: {
    none: typedDefaultTheme.shadows.none,
    sm: typedDefaultTheme.shadows.sm,
    md: "0 4px 12px rgba(139, 92, 246, 0.15)",
    lg: "0 10px 25px rgba(139, 92, 246, 0.2)",
    xl: typedDefaultTheme.shadows.xl
  }
};

export default lavenderTheme;
