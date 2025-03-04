// src/theme/utils/theme-classes-manager.ts
import { THEME_PREFIX } from "../constants/defaults";
import { Theme } from "../core/theme";
import { ThemeName, ThemeClassSuffix } from "../types";

export class ThemeClassesManager {
  private static readonly CLASS_PREFIX = THEME_PREFIX || "theme";
  private static readonly SEPARATOR = "-";

  /**
   * Get a specific class for a color scheme and element type.
   */
  public static getSpecificClass(scheme: ThemeName, suffix: ThemeClassSuffix): string {
    return this.generateClassName(scheme, suffix);
  }

  /**
   * Generate class name with proper prefix and separator.
   */
  private static generateClassName(scheme: ThemeName, suffix: ThemeClassSuffix): string {
    return [this.CLASS_PREFIX, scheme, suffix]
      .filter(Boolean)
      .join(this.SEPARATOR);
  }

  /**
   * Check if a class belongs to a specific color scheme.
   */
  public static isThemeClass(className: string, scheme: ThemeName): boolean {
    return className.startsWith(`${this.CLASS_PREFIX}${this.SEPARATOR}${scheme}`);
  }

  /**
   * Get all available class names for all color schemes.
   */
  public static getAllThemeClasses(): Record<ThemeName, Theme> {
    const schemes: ThemeName[] = [
      "classic",
      "forest",
      "ocean",
      "phoenix",
      "lavender",
      "cloud"
    ];
    return schemes.reduce((acc, scheme) => ({
      ...acc,
      [scheme]: this.getColorSchemeClasses(scheme)
    }), {} as Record<ThemeName, Theme>);
  }

  /**
   * Replace color scheme classes in a className string.
   */
  public static replaceColorSchemeClasses(
    currentClasses: string,
    oldScheme: ThemeName,
    newScheme: ThemeName
  ): string {
    const classes = currentClasses.split(" ");
    return classes
      .map(cls => {
        if (this.isThemeClass(cls, oldScheme)) {
          const parts = cls.split(this.SEPARATOR);
          // Remove the prefix and old scheme (first two parts) and rejoin the rest as suffix.
          const suffix = parts.slice(2).join(this.SEPARATOR) as ThemeClassSuffix;
          return this.generateClassName(newScheme, suffix);
        }
        return cls;
      })
      .join(" ");
  }
}
