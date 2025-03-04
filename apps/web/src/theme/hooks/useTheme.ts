// theme/hooks/useTheme.ts
import { useContext } from "react";
import { TypographyScale } from "../mappings";
import { ThemeContext, ThemeContextType } from "../types";

export function useTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return {
    ...theme,

    // Typography helpers
    typography: {
      // Get typography for a specific element
      get: (element: string): TypographyScale | undefined => {
        return theme.typography?.getScale(element);
      },

      // Get typography for a component
      getComponentTypography: (
        component: string,
        variant?: string
      ): TypographyScale | undefined => {
        return theme.typography?.getComponentTypography(component, variant, theme.themeMode);
      },

      // Get typography CSS class
      getClass: (element: string): string => {
        return `typography-${element}`;
      },

      // Get typography style object
      getStyle: (element: string): React.CSSProperties => {
        const scale = theme.typography?.getScale(element);
        if (!scale) return {};

        return {
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          letterSpacing: scale.letterSpacing,
          fontWeight: scale.fontWeight,
          ...(scale.fontFamily ? { fontFamily: scale.fontFamily } : {}),
          ...(scale.textTransform ? { textTransform: scale.textTransform } : {})
        };
      }
    },

    // Enhanced component helpers with typography
    getComponentFullStyle: (
      component: string,
      variant?: string,
      state?: string
    ): React.CSSProperties => {
      return theme.getComponentStyle?.(component, variant, state, theme.themeMode) || {};
    }
  };
}
