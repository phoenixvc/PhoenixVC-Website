import {
  ComponentVariants,
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
import skyPalette from "./colors/sky";
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
 * Cloud Theme Color Scheme
 * A light, airy color scheme based on soft blue and gray tones
 */
export const cloudColorScheme: ThemeScheme = {
  base: {
    primary: skyPalette,
    secondary: grayPalette,
    accent: ColorUtils.createColorShades("#0EA5E9"),
    neutral: grayPalette,
    gray: grayPalette,
  },
  light: {
    background: createColor("#FFFFFF"),
    text: {
      primary: createColor("#334155"),
      secondary: createColor("#64748B"),
    },
    muted: createColor("#64748B"),
    border: createColor("#E2E8F0"),
    surface: createColor("#F8FAFC"),
    overlay: createColor("rgba(0, 0, 0, 0.5)"),
    hover: createColor("rgba(14, 165, 233, 0.04)"),
    active: createColor("rgba(14, 165, 233, 0.08)"),
    focus: createColor("rgba(14, 165, 233, 0.5)"),
    disabled: createColor("rgba(0, 0, 0, 0.26)"),
  },
  dark: {
    background: createColor("#0F172A"),
    text: {
      primary: createColor("#F8FAFC"),
      secondary: createColor("#94A3B8"),
    },
    muted: createColor("#94A3B8"),
    border: createColor("#334155"),
    surface: createColor("#1E293B"),
    overlay: createColor("rgba(0, 0, 0, 0.7)"),
    hover: createColor("rgba(255, 255, 255, 0.08)"),
    active: createColor("rgba(255, 255, 255, 0.16)"),
    focus: createColor("rgba(14, 165, 233, 0.6)"),
    disabled: createColor("rgba(255, 255, 255, 0.3)"),
  },
};

/**
 * Cloud Theme Colors
 */
export const cloudColors: ThemeColors = {
  schemes: {
    default: cloudColorScheme,
  },
  semantic: {
    success: createColor(greenPalette[500].hex),
    warning: createColor("#F59E0B"),
    error: createColor(redPalette[500].hex),
    info: createColor(bluePalette[400].hex),
  },
};

/**
 * Cloud Theme
 * A light, airy theme with a focus on soft blue and gray tones,
 * creating a clean and modern aesthetic.
 */
export const cloudTheme: Theme = {
  ...typedDefaultTheme,
  colors: cloudColors,
  typography: {
    fontFamily: {
      base: "\"Work Sans\", system-ui, sans-serif",
      heading: "\"Montserrat\", sans-serif",
      monospace: "\"Fira Code\", monospace",
    },
    fontSize: typedDefaultTheme.typography.fontSize,
    fontWeight: typedDefaultTheme.typography.fontWeight,
    lineHeight: typedDefaultTheme.typography.lineHeight,
    letterSpacing: typedDefaultTheme.typography.letterSpacing,
  },
  borders: {
    radius: {
      none: typedDefaultTheme.borders.radius.none,
      sm: "0.125rem",
      md: "0.25rem",
      lg: "0.5rem",
      full: typedDefaultTheme.borders.radius.full,
    },
    width: typedDefaultTheme.borders.width,
    style: typedDefaultTheme.borders.style,
  },
  shadows: {
    none: typedDefaultTheme.shadows.none,
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(14, 165, 233, 0.1)",
    lg: "0 10px 15px rgba(14, 165, 233, 0.1)",
    xl: "0 20px 25px rgba(14, 165, 233, 0.1)",
  },
};

export default cloudTheme;
