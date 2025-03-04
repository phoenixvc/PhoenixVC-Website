import { ComponentVariants, ThemeColors, ThemeConfig, ThemeVariables } from "../types";
import { defaultTheme } from "./defaultTheme";

// Direct design token interfaces
export interface ThemeSpacing {
  unit: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  // Add other spacing values as needed
}

export interface ThemeTypography {
  fontFamily: {
    base: string;
    heading: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface ThemeBorders {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  width: {
    none: string;
    thin: string;
    normal: string;
    thick: string;
  };
  style: {
    solid: string;
    dashed: string;
    dotted: string;
  };
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeTransitions {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ThemeZIndex {
  dropdown: number;
  modal: number;
  overlay: number;
  popover: number;
  tooltip: number;
}

// The hybrid Theme interface
export interface Theme {
  // Core configuration
  config: ThemeConfig;

  // Direct design tokens
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borders: ThemeBorders;
  shadows: ThemeShadows;
  breakpoints: ThemeBreakpoints;
  transitions: ThemeTransitions;
  zIndex: ThemeZIndex;

  // Computed variables
  variables: ThemeVariables;

  // Component-specific styling
  components: ComponentVariants;

  // Extension point
  [key: string]: unknown;
}

// Theme factory function for the hybrid approach
export function createTheme(
  config: ThemeConfig,
  colors: ThemeColors,
  overrides?: Partial<Omit<Theme, "config" | "colors" | "variables" | "typography" | "components">>
): Theme {
  // Generate variables from colors (from Implementation 2)
  const variables: ThemeVariables = generateThemeVariables(config, colors);

  // Create the theme object with both approaches
  return {
    config,
    colors,
    variables,
    ...defaultTheme,
    ...overrides,
    // Deep merge for nested objects
    typography: {
      ...defaultTheme.typography,
      ...overrides,
    },
    components: {
      ...defaultTheme.components,
      ...overrides,
    }
    // Other deep merges as needed
  };
}

// Helper function to generate theme variables from colors
function generateThemeVariables(
  config: ThemeConfig,
  colors: ThemeColors
): ThemeVariables {
  // Get the current color scheme
  const colorScheme = config.themeName || "classic";
  const mode = config.mode || "light";

  // Get the appropriate color scheme
  const schemeColors = colors.schemes[colorScheme] ||
    Object.values(colors.schemes)[0]; // Fallback to first scheme

  // Get the appropriate mode colors
  const modeColors = schemeColors[mode];

  // Base colors from the scheme
  const baseColors = schemeColors.base;

  // Generate computed values
  const computed = {
    colors: {
      primary: baseColors.primary[500].hsl,
      secondary: baseColors.secondary[500].hsl,
      background: modeColors.background.hsl,
      text: modeColors.text.hsl,
      border: modeColors.border.hsl,
    },
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      xxl: "3rem",
    },
    typography: {
      body: {
        fontSize: "1rem",
        lineHeight: "1.5",
        fontWeight: 400,
      },
      heading: {
        fontSize: "1.5rem",
        lineHeight: "1.2",
        fontWeight: 700,
      },
    },
    breakpoints: {
      xs: "0px",
      sm: "600px",
      md: "960px",
      lg: "1280px",
      xl: "1920px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    animation: {
      fast: { duration: "150ms", easing: "ease-in-out" },
      normal: { duration: "300ms", easing: "ease-in-out" },
      slow: { duration: "500ms", easing: "ease-in-out" },
    },
    zIndex: {
      dropdown: 1000,
      modal: 1300,
      overlay: 1200,
      popover: 1100,
      tooltip: 1500,
    },
  };

  // Return the complete variables object
  return {
    prefix: "theme",
    mappings: colors,
    computed,
  };
}
