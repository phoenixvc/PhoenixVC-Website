// src/theme/utils/theme-classes-manager.ts
import { THEME_PREFIX } from "../constants/defaults";
import { ThemeColorScheme, ColorSchemeClasses, ThemeClassSuffix } from "../types";

export class ThemeClassesManager {
  private static readonly CLASS_PREFIX = THEME_PREFIX || "theme";
  private static readonly SEPARATOR = "-";

  /**
   * Get all classes for a specific color scheme.
   */
  public static getColorSchemeClasses(scheme: ThemeColorScheme): ColorSchemeClasses {
    return {
      primary: this.generateClassName(scheme, "primary"),
      secondary: this.generateClassName(scheme, "secondary"),
      text: this.generateClassName(scheme, "text"),
      activeText: this.generateClassName(scheme, "active-text"),
      background: this.generateClassName(scheme, "background"),
      hoverBg: this.generateClassName(scheme, "hover-bg"),
      activeBg: this.generateClassName(scheme, "active-bg"),
      mobileMenu: this.generateClassName(scheme, "mobile-menu"),
      bgMobileMenu: this.generateClassName(scheme, "bg-mobile-menu"),
      border: this.generateClassName(scheme, "border"),
    };
  }

  /**
   * Get a specific class for a color scheme and element type.
   */
  public static getSpecificClass(scheme: ThemeColorScheme, suffix: ThemeClassSuffix): string {
    return this.generateClassName(scheme, suffix);
  }

  /**
   * Generate class name with proper prefix and separator.
   */
  private static generateClassName(scheme: ThemeColorScheme, suffix: ThemeClassSuffix): string {
    return [this.CLASS_PREFIX, scheme, suffix]
      .filter(Boolean)
      .join(this.SEPARATOR);
  }

  /**
   * Check if a class belongs to a specific color scheme.
   */
  public static isColorSchemeClass(className: string, scheme: ThemeColorScheme): boolean {
    return className.startsWith(`${this.CLASS_PREFIX}${this.SEPARATOR}${scheme}`);
  }

  /**
   * Get all available class names for all color schemes.
   */
  public static getAllThemeClasses(): Record<ThemeColorScheme, ColorSchemeClasses> {
    const schemes: ThemeColorScheme[] = [
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
    }), {} as Record<ThemeColorScheme, ColorSchemeClasses>);
  }

  /**
   * Replace color scheme classes in a className string.
   */
  public static replaceColorSchemeClasses(
    currentClasses: string,
    oldScheme: ThemeColorScheme,
    newScheme: ThemeColorScheme
  ): string {
    const classes = currentClasses.split(" ");
    return classes
      .map(cls => {
        if (this.isColorSchemeClass(cls, oldScheme)) {
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
