import { ComponentVariants, Theme, ThemeBorders, ThemeBreakpoints, ThemeColors, ThemeConfig, ThemeScheme, ThemeShadows, ThemeSpacing, ThemeTransitions, ThemeTypography, ThemeVariables, ThemeZIndex } from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";
import { bluePalette, createColor, grayPalette, redPalette } from "./colors";
import orangePalette from "./colors/orange";
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
 * Phoenix Theme Color Scheme
 * A vibrant, energetic color scheme based on orange and red tones
 */
export const phoenixColorScheme: ThemeScheme = {
  base: {
    primary: orangePalette,
    secondary: redPalette,
    accent: ColorUtils.createColorShades("#F97316"),
    neutral: grayPalette,
    gray: grayPalette,
  },
  light: {
    background: createColor("#FFFFFF"),
    text: {
      primary: createColor("#0F172A"),
      secondary: createColor("#64748B")
    },
    muted: createColor("#64748B"),
    border: createColor("#E2E8F0"),
    surface: createColor("#F8FAFC"),
    overlay: createColor("rgba(0, 0, 0, 0.5)"),
    hover: createColor("rgba(249, 115, 22, 0.04)"),
    active: createColor("rgba(249, 115, 22, 0.08)"),
    focus: createColor("rgba(249, 115, 22, 0.5)"),
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
    focus: createColor("rgba(249, 115, 22, 0.6)"),
    disabled: createColor("rgba(255, 255, 255, 0.3)")
  }
};

/**
 * Phoenix Theme Colors
 */
export const phoenixColors: ThemeColors = {
  schemes: {
    default: phoenixColorScheme
  },
  semantic: {
    success: createColor(yellowPalette[500].hex),
    warning: createColor(orangePalette[500].hex),
    error: createColor(redPalette[500].hex),
    info: createColor(bluePalette[400].hex)
  }
};

/**
 * Phoenix Theme
 * A vibrant, energetic theme with a focus on orange and red tones,
 * creating a warm and dynamic aesthetic.
 */
export const phoenixTheme: Theme = {
  ...typedDefaultTheme,
  colors: phoenixColors,
  typography: {
    fontFamily: {
      base: "\"Nunito\", system-ui, sans-serif",
      heading: "\"Raleway\", sans-serif",
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
      md: "0.25rem",
      lg: typedDefaultTheme.borders.radius.lg,
      full: typedDefaultTheme.borders.radius.full
    },
    width: typedDefaultTheme.borders.width,
    style: typedDefaultTheme.borders.style
  },
  shadows: {
    none: typedDefaultTheme.shadows.none,
    sm: typedDefaultTheme.shadows.sm,
    md: "0 4px 12px rgba(249, 115, 22, 0.15)",
    lg: "0 10px 25px rgba(249, 115, 22, 0.2)",
    xl: typedDefaultTheme.shadows.xl
  }
};

export default phoenixTheme;
