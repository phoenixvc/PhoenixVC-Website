// src/theme/utils/theme-variables.ts
import { ThemeColors, ThemeColorScheme, ThemeMode, ThemeVariables } from "../types";

export const generateThemeVariables = (
  colors: ThemeColors,
  mode: ThemeMode,
  schemeName?: ThemeColorScheme
): ThemeVariables => {
  try {
    // Determine which scheme to use:
    let scheme: ThemeColors["schemes"][keyof ThemeColors["schemes"]];
    if (schemeName) {
      scheme = colors.schemes[schemeName];
      if (!scheme) {
        throw new Error(`Invalid color scheme: ${schemeName}`);
      }
    } else {
      const keys = Object.keys(colors.schemes) as ThemeColorScheme[];
      if (keys.length === 0) {
        throw new Error("No color schemes available");
      }
      scheme = colors.schemes[keys[0]];
    }

    // Get mode-specific colors (light or dark)
    const modeColors = scheme[mode as "light" | "dark"];
    if (!modeColors) {
      throw new Error(`Invalid mode: ${mode}`);
    }

    // Build computed colors using HSL values
    const computedColors = {
      primary: scheme.base.primary[500].hsl,
      secondary: scheme.base.secondary[500].hsl,
      background: modeColors.background.hsl,
      text: modeColors.text.hsl,
      border: modeColors.border.hsl,
    };

    // Build the ThemeVariables object.
    const themeVariables: ThemeVariables = {
      prefix: "--theme",
      mappings: colors,
      computed: {
        colors: computedColors,
        spacing: {
          xs: "0.25rem",
          sm: "0.5rem",
          md: "1rem",
          lg: "1.5rem",
          xl: "2rem",
        },
        typography: {
          body: {
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
            letterSpacing: "normal",
          },
          heading: {
            fontSize: "32px",
            lineHeight: "40px",
            fontWeight: 700,
            letterSpacing: "normal",
          },
        },
        breakpoints: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
        animation: {
          fadeIn: {
            duration: "300ms",
            easing: "ease-in",
          },
          fadeOut: {
            duration: "300ms",
            easing: "ease-out",
          },
        },
        shadows: {
          small: "0 1px 3px rgba(0,0,0,0.12)",
          medium: "0 4px 6px rgba(0,0,0,0.1)",
          large: "0 10px 15px rgba(0,0,0,0.1)",
        },
        zIndex: {
          dropdown: 1000,
          modal: 1100,
          tooltip: 1200,
        },
      },
    };

    return themeVariables;
  } catch (error) {
    console.error("[ThemeProvider] Failed to generate theme variables:", error);
    throw error;
  }
};
