import { ColorDefinition, ShadeLevel, Theme, ThemeColors, ThemeScheme, ThemeTypography, ThemeSpacing, ThemeBorders, ThemeShadows, ThemeBreakpoints, ThemeTransitions, ThemeZIndex, ThemeVariables, ComponentVariants, ThemeConfig, ColorShades } from "@/theme/types";
import ColorUtils from "@/theme/utils/color-utils";
import { defaultTheme } from "./defaultTheme";
import { createColor, grayPalette, greenPalette, redPalette } from "./colors";
import tealPalette from "./colors/teal";
import yellowPalette from "./colors/yellow";

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
 * Forest Theme Color Scheme
 * A natural, earthy color scheme based on green tones
 */
export const forestColorScheme: ThemeScheme = {
  base: {
    primary: greenPalette,
    secondary: tealPalette,
    accent: ColorUtils.createColorShades("#059669"),
    neutral: grayPalette,
    gray: grayPalette,
  },
  light: {
    background: createColor("#FFFFFF"),
    text: {
      primary: createColor("#1E293B"),
      secondary: createColor("#64748B")
    },
    muted: createColor("#64748B"),
    border: createColor("#E2E8F0"),
    surface: createColor("#F8FAFC"),
    overlay: createColor("rgba(0, 0, 0, 0.5)"),
    hover: createColor("rgba(20, 83, 45, 0.04)"),
    active: createColor("rgba(20, 83, 45, 0.08)"),
    focus: createColor("rgba(5, 150, 105, 0.5)"),
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
    focus: createColor("rgba(5, 150, 105, 0.6)"),
    disabled: createColor("rgba(255, 255, 255, 0.3)")
  }
};

/**
 * Forest Theme Colors
 */
export const forestColors: ThemeColors = {
  schemes: {
    default: forestColorScheme
  },
  semantic: {
    success: createColor(greenPalette[600].hex),
    warning: createColor(yellowPalette[500].hex),
    error: createColor(redPalette[500].hex),
    info: createColor(tealPalette[400].hex)
  }
};

/**
 * Forest Theme
 * A natural, earthy theme with a focus on green tones,
 * creating a calm and organic aesthetic.
 */
export const forestTheme: Theme = {
  ...typedDefaultTheme,
  colors: forestColors,
  typography: {
    fontFamily: {
      base: "\"Noto Sans\", system-ui, sans-serif",
      heading: "\"Bitter\", serif",
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
      md: "0.375rem",
      lg: typedDefaultTheme.borders.radius.lg,
      full: typedDefaultTheme.borders.radius.full
    },
    width: typedDefaultTheme.borders.width,
    style: typedDefaultTheme.borders.style
  },
  shadows: {
    none: typedDefaultTheme.shadows.none,
    sm: typedDefaultTheme.shadows.sm,
    md: "0 4px 12px rgba(5, 150, 105, 0.15)",
    lg: "0 10px 25px rgba(5, 150, 105, 0.2)",
    xl: typedDefaultTheme.shadows.xl
  }
};

export default forestTheme;
