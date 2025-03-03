import { ComponentConfig, DesignTokens, Mode, ThemeConfig, TokenValue } from "./unifiedDesign.types";

export class UnifiedDesignSystem {
    private themes: Map<string, ThemeConfig>; // Store all themes
    private components: Map<string, ComponentConfig>; // Store all components
    private activeTheme: string; // Current active theme
    private activeMode: Mode; // Current active mode

    constructor() {
      this.themes = new Map();
      this.components = new Map();
      this.activeTheme = "default";
      this.activeMode = "light";
    }

    // Add a new theme
    public addTheme(theme: ThemeConfig): void {
      this.themes.set(theme.name, theme);
    }

    // Set the active theme
    public setTheme(themeName: string): void {
      if (!this.themes.has(themeName)) {
        throw new Error(`Theme "${themeName}" not found`);
      }
      this.activeTheme = themeName;
    }

    // Set the active mode (light/dark)
    public setMode(mode: Mode): void {
      this.activeMode = mode;
    }

    // Add a new component
    public defineComponent(name: string, config: ComponentConfig): void {
      this.components.set(name, config);
    }

    // Get resolved tokens for the current theme and mode
    private getResolvedTokens(): DesignTokens {
      const theme = this.themes.get(this.activeTheme);
      if (!theme) throw new Error(`Active theme "${this.activeTheme}" not found`);

      const baseTokens = theme.tokens;
      const modeTokens = theme.modes[this.activeMode] || {};

      // Merge base tokens with mode-specific overrides
      return {
        colors: { ...baseTokens.colors, ...modeTokens.colors },
        typography: { ...baseTokens.typography, ...modeTokens.typography },
        spacing: { ...baseTokens.spacing, ...modeTokens.spacing },
        shadows: { ...baseTokens.shadows, ...modeTokens.shadows },
      };
    }

    // Generate styles for a component
    public generateStyles(
      componentName: string,
      variant?: string,
      state?: string
    ): Record<string, unknown> {
      const component = this.components.get(componentName);
      if (!component) throw new Error(`Component "${componentName}" not found`);

      const tokens = this.getResolvedTokens();

      // Merge base styles, variant styles, and state styles
      const baseStyles = this.resolveTokens(component.base, tokens);
      const variantStyles = variant
        ? this.resolveTokens(component.variants?.[variant] || {}, tokens)
        : {};
      const stateStyles = state
        ? this.resolveTokens(component.states?.[state] || {}, tokens)
        : {};

      return { ...baseStyles, ...variantStyles, ...stateStyles };
    }

    // Resolve token references (e.g., "{colors.primary}")
    private resolveTokens(
        styles: Record<string, TokenValue>,
        tokens: DesignTokens
      ): Record<string, unknown> {
        const resolved: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(styles)) {
          if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
            const tokenPath = value.slice(1, -1).split(".");
            resolved[key] = this.resolveTokenPath(tokenPath, tokens);
          } else {
            resolved[key] = value;
          }
        }

        return resolved;
      }

      private resolveTokenPath(path: string[], tokens: DesignTokens): unknown {
        return path.reduce<unknown>((acc, part) => {
          if (acc && typeof acc === "object" && part in acc) {
            return (acc as Record<string, unknown>)[part];
          }
          console.warn(`Token path "${path.join(".")}" could not be resolved.`);
          return undefined;
        }, tokens as unknown);
      }
  }
