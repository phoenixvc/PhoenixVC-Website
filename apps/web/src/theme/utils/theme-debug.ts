import { ThemeSchemeInitial } from "../types";
import ColorUtils from "./color-utils";

// src/theme/utils/theme-debug.ts
export const debugThemeColors = (theme: ThemeSchemeInitial) => {
    console.group('Theme Color Validation');
    try {
      // Check base colors
      Object.entries(theme.base || {}).forEach(([key, value]) => {
        try {
          ColorUtils.normalizeColor(value as string);
          console.log(`✅ base.${key}: ${value}`);
        } catch (e) {
          console.error(`❌ Invalid color at base.${key}: ${value}`);
        }
      });

      // Check mode-specific colors
      ['light', 'dark'].forEach(mode => {
        const modeColors = theme[mode as 'light' | 'dark'] || {};
        Object.entries(modeColors).forEach(([key, value]) => {
          try {
            ColorUtils.normalizeColor(value as string);
            console.log(`✅ ${mode}.${key}: ${value}`);
          } catch (e) {
            console.error(`❌ Invalid color at ${mode}.${key}: ${value}`);
          }
        });
      });
    } finally {
      console.groupEnd();
    }
  };
