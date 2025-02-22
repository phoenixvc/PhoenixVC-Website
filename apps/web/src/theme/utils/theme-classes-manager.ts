// utils/theme-classes-manager.ts
import { THEME_PREFIX } from '../constants/defaults';
import { 
  ColorScheme, 
  ColorSchemeClasses, 
  ThemeClassSuffix 
} from '../types/theme.types';

THEME_PREFIX

export class ThemeClassesManager {
  private static readonly CLASS_PREFIX = 'theme';
  private static readonly SEPARATOR = '-';

  /**
   * Get all classes for a specific color scheme
   */
  public static getColorSchemeClasses(scheme: ColorScheme): ColorSchemeClasses {
    return {
      primary: this.generateClassName(scheme, 'primary'),
      secondary: this.generateClassName(scheme, 'secondary'),
      text: this.generateClassName(scheme, 'text'),
      activeText: this.generateClassName(scheme, 'active-text'),
      background: this.generateClassName(scheme, 'background'),
      hoverBg: this.generateClassName(scheme, 'hover-bg'),
      activeBg: this.generateClassName(scheme, 'active-bg'),
      mobileMenu: this.generateClassName(scheme, 'mobile-menu'),
      bgMobileMenu: this.generateClassName(scheme, 'bg-mobile-menu'),
      border: this.generateClassName(scheme, 'border'),
    };
  }

  /**
   * Get a specific class for a color scheme and element type
   */
  public static getSpecificClass(scheme: ColorScheme, suffix: ThemeClassSuffix): string {
    return this.generateClassName(scheme, suffix);
  }

  /**
   * Generate class name with proper prefix and separator
   */
  private static generateClassName(scheme: ColorScheme, suffix: string): string {
    return [this.CLASS_PREFIX, scheme, suffix]
      .filter(Boolean)
      .join(this.SEPARATOR);
  }

  /**
   * Check if a class belongs to a specific color scheme
   */
  public static isColorSchemeClass(className: string, scheme: ColorScheme): boolean {
    return className.startsWith(`${this.CLASS_PREFIX}${this.SEPARATOR}${scheme}`);
  }

  /**
   * Get all available class names for all color schemes
   */
  public static getAllThemeClasses(): Record<ColorScheme, ColorSchemeClasses> {
    const schemes: ColorScheme[] = ['classic', 'forest', 'ocean', 'classic', 'phoenix', 'lavender', 'cloud']; // suggested: clssic, modern, dark
    return schemes.reduce((acc, scheme) => ({
      ...acc,
      [scheme]: this.getColorSchemeClasses(scheme)
    }), {} as Record<ColorScheme, ColorSchemeClasses>);
  }

  /**
   * Replace color scheme classes in a className string
   */
  public static replaceColorSchemeClasses(
    currentClasses: string, 
    oldScheme: ColorScheme, 
    newScheme: ColorScheme
  ): string {
    const classes = currentClasses.split(' ');
    return classes
      .map(cls => {
        if (this.isColorSchemeClass(cls, oldScheme)) {
          const suffix = cls.split(this.SEPARATOR).slice(2).join(this.SEPARATOR);
          return this.generateClassName(newScheme, suffix);
        }
        return cls;
      })
      .join(' ');
  }
}
