// theme/managers/theme-manager.ts

import React from "react";
import { ColorMapping } from "../mappings";
import { ColorDefinition, ThemeName, ThemeMode } from "../types";
import { ThemeComponentManager } from "./component-theme-manager";
import { ComponentRegistryManager } from "./component-registry-manager";
import { TypographyManager } from "./typography-manager";
import { Theme } from "./theme";

export class ThemeStyleManager {
  private componentManager: ThemeComponentManager;
  private componentRegistry: ComponentRegistryManager;
  private colorMapping: ColorMapping;
  private typographyManager: TypographyManager;
  private themes: Map<string, Theme> = new Map();

  constructor(
    componentManager: ThemeComponentManager,
    componentRegistry: ComponentRegistryManager,
    colorMapping: ColorMapping,
    typographyManager: TypographyManager
  ) {
    this.componentManager = componentManager;
    this.componentRegistry = componentRegistry;
    this.colorMapping = colorMapping;
    this.typographyManager = typographyManager;
  }

  /**
   * Register a theme
   */
  registerTheme(theme: Theme): void {
    // Store the theme
    this.themes.set(theme.config.name, theme);

    // Register component variants
    this.componentRegistry.registerTheme(theme);
  }

  /**
   * Get a component variant
   */
  getComponentVariant(
    component: string,
    variant: string = "default"
    //TODO: colorScheme: ThemeColorScheme = "classic"
  ) {
    // Note: colorScheme parameter is not used - consider removing it or implementing it
    return this.componentRegistry.getVariant(component, variant);
  }

  // Generate all theme variables
  generateThemeVariables(
    mode: ThemeMode = "light",
    colorScheme: ThemeName = "classic"
  ): Record<string, string | ColorDefinition> {
    return {
      // Component variables
      ...this.componentManager.generateAllVariables(this.componentRegistry.getRegistry()),

      // Color variables
      ...this.colorMapping.toCSS(),

      // Typography variables
      ...this.typographyManager.generateTypographyVariables(mode)
    };
  }

  // Generate all theme classes
  generateThemeClasses(
    mode: ThemeMode = "light",
    scheme: ThemeName = "classic"
  ): Record<string, string> {
    return {
      // Component classes
      ...this.componentManager.generateAllClasses(scheme, this.componentRegistry.getRegistry()),

      // Typography classes
      ...this.typographyManager.generateTypographyClasses(mode)
    };
  }

  // Get component style with typography
  getComponentStyle(
    component: string,
    variant: string = "default",
    state: string = "default",
    mode: ThemeMode = "light"
  ): React.CSSProperties {
    const componentVariant = this.componentRegistry.getVariant(component, variant);

    if (!componentVariant) {
      console.warn(`Component variant not found: ${component}.${variant}`);
      return {};
    }

    // Get component colors
    const colorStyle = this.componentManager.getComponentStyleFromVariant(
      componentVariant,
      state
    );

    // Get component typography
    const typography = this.typographyManager.getComponentTypography(component, variant, mode);

    if (!typography) return colorStyle;

    // Combine color and typography styles
    return {
      ...colorStyle,
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      fontWeight: typography.fontWeight,
      ...(typography.fontFamily ? { fontFamily: typography.fontFamily } : {}),
      ...(typography.textTransform ? { textTransform: typography.textTransform } : {})
    };
  }
}
