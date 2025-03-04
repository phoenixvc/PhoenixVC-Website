// theme/core/theme-core.ts

import { ColorMapping, TypographyScale } from "../mappings";
import { ColorDefinition, ThemeName, ThemeMode, ThemeState } from "../types";
import { ComponentRegistryManager } from "../registry/component-registry-manager";
import { ComponentManager } from "../managers/component-manager";
import { ThemeStateManager } from "../managers/theme-state-manager";
import { ThemeStyleManager } from "../managers/theme-style-manager";
import { TypographyManager } from "../managers/typography-manager";
import { ComponentVariantType } from "../types/mappings/component-variants";
import { Theme } from "../core/theme";
import { ThemeLoaderConfig } from "../providers/theme-loader";
import { ComponentThemeRegistry } from "../registry/component-theme-registry";
import { ThemeTransformationManager } from "../managers/theme-transformation-manager";

export class ThemeCore {
  private static instance: ThemeCore;

  private stateManager: ThemeStateManager;
  private styleManager: ThemeStyleManager;
  private typographyManager: TypographyManager;
  private componentManager: ComponentManager;
  private componentRegistryManager: ComponentRegistryManager;
  private transformationManager: ThemeTransformationManager;

  private constructor() {
    // Initialize managers
    this.componentRegistryManager = new ComponentRegistryManager();
    const componentRegistry = this.componentRegistryManager.getRegistry();
    this.componentManager = new ComponentManager(componentRegistry);
    const colorMapping = new ColorMapping();
    this.typographyManager = new TypographyManager();

    // Create style manager
    this.styleManager = new ThemeStyleManager(
      this.componentManager,
      this.componentRegistryManager,
      colorMapping,
      this.typographyManager
    );

    // Create transformation manager
    this.transformationManager = new ThemeTransformationManager({
      defaultMode: "light",
      shadeCount: 9,
      shadeIntensity: 0.1,
      contrastThreshold: 0.5
    });

    // Create state manager
    this.stateManager = ThemeStateManager.getInstance();

    // Subscribe to state changes
    this.stateManager.subscribe(() => this.handleThemeStateChange());

    // Initial theme application
    this.handleThemeStateChange();
  }

  static getInstance(): ThemeCore {
    if (!ThemeCore.instance) {
      ThemeCore.instance = new ThemeCore();
    }
    return ThemeCore.instance;
  }

  private handleThemeStateChange(): void {
    const state = this.stateManager.getState();

    // Generate and apply CSS variables based on current state
    const variables = this.styleManager.generateThemeVariables(
      state.mode
    );

    // Apply variables to CSS custom properties
    this.applyVariablesToDOM(variables);
  }

  private applyVariablesToDOM(variables: Record<string, string | ColorDefinition>): void {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--${key}`, value);
      }
    });
  }

  // Public API
  generateThemeVariables(
    mode: ThemeMode,
    colorScheme?: ThemeName
  ): Record<string, string | ColorDefinition> {
    return this.styleManager.generateThemeVariables(
      mode,
      colorScheme || this.stateManager.getState().themeName
    );
  }

  getComponentStyle(
    component: string,
    variant: string = "default",
    state: string = "default"
  ): React.CSSProperties {
    const themeState = this.stateManager.getState();
    return this.styleManager.getComponentStyle(
      component,
      variant,
      state,
      themeState.mode
    );
  }

  getComponentTypography(component: string, variant: string = "default"): TypographyScale {
    const themeState = this.stateManager.getState();
    const typography = this.typographyManager.getComponentTypography(
      component,
      variant,
      themeState.mode
    );

    // Return with default values if typography is undefined
    return typography || {
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "normal",
      fontWeight: 400
      // Optional properties are not required
    };
  }

  getTypographyForElement(element: string): TypographyScale {
    const themeState = this.stateManager.getState();
    const typography = this.typographyManager.getComponentTypography(
      element,
      "default",
      themeState.mode
    );

    // Return with default values if typography is undefined
    return typography || {
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "normal",
      fontWeight: 400
    };
  }

  // Expose state manager methods with Promise handling
  setColorScheme(themeName: ThemeName): Promise<void> {
    return this.stateManager.setThemeClasses(themeName);
  }

  setMode(mode: ThemeMode): Promise<void> {
    // Convert void return to Promise
    this.stateManager.setMode(mode);
    return Promise.resolve();
  }

  setUseSystem(useSystem: boolean): Promise<void> {
    // Convert void return to Promise
    this.stateManager.setUseSystem(useSystem);
    return Promise.resolve();
  }

  getState(): ThemeState {
    return this.stateManager.getState();
  }

  subscribe(listener: () => void): () => void {
    return this.stateManager.subscribe(listener);
  }

  // ComponentRegistryManager methods
  getComponentRegistry(): ComponentThemeRegistry {
    return this.componentRegistryManager.getRegistry();
  }

  // ComponentRegistryManager methods
  getStyleManager(): ThemeStyleManager {
    return this.styleManager;
  }

  registerTheme(theme: Theme): void {
    this.componentRegistryManager.registerTheme(theme);
    this.styleManager.registerTheme(theme);
  }

  getComponentVariant(component: string, variant: string = "default"): ComponentVariantType | undefined {
    return this.componentRegistryManager.getVariant(component, variant);
  }

  // ThemeStateManager methods
  isThemeCached(scheme: ThemeName): boolean {
    return this.stateManager.isThemeCached(scheme);
  }

  preloadTheme(scheme: ThemeName, config?: Partial<ThemeLoaderConfig>): Promise<void> {
    return this.stateManager.preloadTheme(scheme, config);
  }

  clearThemeCache(): void {
    this.stateManager.clearThemeCache();
  }

  getCacheStatus(): { size: number; schemes: ThemeName[] } {
    return this.stateManager.getCacheStatus();
  }

  // ThemeComponentManager methods
  getThemeClasses(themeName: ThemeName): Record<string, string> {
    return this.styleManager.generateThemeClasses(
      this.stateManager.getState().mode,
      themeName
    );
  }

  getAllComponentVariants(): ComponentThemeRegistry {
    return this.componentManager.getAllComponentVariants();
  }

  // TypographyManager methods
  getTypographyScale(element: string): TypographyScale {
    const typography = this.typographyManager.getComponentTypography(element);

    // Return with default values if typography is undefined
    return typography || {
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "normal",
      fontWeight: 400
    };
  }

  setComponentTypography(component: string, variant: string, typography: TypographyScale): void {
    this.typographyManager.setComponentTypography(component, variant, typography);
  }
}

// Export singleton instance
export const themeCore = ThemeCore.getInstance();
