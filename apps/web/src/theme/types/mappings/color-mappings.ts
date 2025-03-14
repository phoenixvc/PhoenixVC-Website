// src/mappings/color-mappings.ts

import { createBaseMappingContext } from "@/theme/mappings";
import { BaseMappingContext, BaseVariableMapping, ComputedColorSet, ComputedComponentSet, ComputedSemanticSet } from "./base-mappings";
import { ColorDefinition, ColorShades } from "../core";
import { ColorMappingConfig } from "./config";
import ColorUtils from "@/theme/utils/color-utils";

  export class ColorMapping {
    private context: BaseMappingContext;
    private config: ColorMappingConfig;

    constructor(config?: Partial<ColorMappingConfig>) {
      this.config = {
        prefix: config?.prefix ?? "color",
        scope: config?.scope ?? ":root",
        format: config?.format ?? "rgb",
        separator: config?.separator ?? "-",
        enforceContrast: config?.enforceContrast ?? true,
        minimumContrast: config?.minimumContrast ?? 4.5,
      };

      this.context = createBaseMappingContext({
        prefix: this.config.prefix,
        scope: this.config.scope,
        format: this.config.format,
        separator: this.config.separator,
      });
    }

    // Color Definition Management
    setColor(path: string, color: ColorDefinition): void {
      const formatted = this.formatColorDefinition(color);
      const mapping: BaseVariableMapping = {
        name: path,
        value: formatted,
        format: this.config.format,
      };

      this.context.registry.variables.set(path, mapping);
      this.context.registry.colors.set(path, formatted);
    }

    getColor(path: string): ColorDefinition | undefined {
      const value = this.context.registry.colors.get(path);
      return value ? this.parseColorDefinition(value) : undefined;
    }

    /**
     * Sets multiple color shades for a base color name
     * @param name The base color name
     * @param shades Object containing shade numbers and color values
     */
    setShades(name: string, shades: ColorShades): void {
      Object.entries(shades).forEach(([shade, color]) => {
          if (color !== undefined) {
              const path = `${name}-${shade}`;

              try {
                  // Convert the color to a proper ColorDefinition using ColorUtils
                  let colorDef: ColorDefinition;

                  if (typeof color === "string") {
                      // Use ColorUtils to create a proper color definition from string
                      colorDef = ColorUtils.createColorDefinition(color);
                  } else if (Array.isArray(color)) {
                      // Handle array format (assuming it"s RGB values like [r, g, b])
                      const rgbString = `rgb(${color.join(", ")})`;
                      colorDef = ColorUtils.createColorDefinition(
                          ColorUtils.rgbToHex(rgbString)
                      );
                  } else {
                      // It"s already a ColorDefinition object, but ensure it"s complete
                      colorDef = ColorUtils.ensureColorDefinition(color as Partial<ColorDefinition>);
                  }

                  // Now we have a valid ColorDefinition to pass to setColor
                  this.setColor(path, colorDef);
              } catch (error) {
                  console.warn(`Invalid color value for ${path}, skipping: ${error instanceof Error ? error.message : String(error)}`);
              }
          }
      });
    }

    getShades(name: string): ColorShades | undefined {
      const shades: Partial<ColorShades> = {};
      const shadeKeys = [
        "50",
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
      ] as const;
      type ShadeKey = typeof shadeKeys[number];

      for (const shade of shadeKeys) {
        const color = this.getColor(`${name}-${shade}`);
        if (color) {
          shades[shade as ShadeKey] = color;
        }
      }

      return Object.keys(shades).length === 10 ? (shades as ColorShades) : undefined;
    }

    // Color Set Generation

    generateColorSet(base: ColorDefinition): ComputedColorSet {
      const set: ComputedColorSet = {
        background: this.formatColorDefinition(base),
        foreground: this.calculateContrast(base),
        border: this.adjustAlpha(base, 0.2),
        outline: this.adjustAlpha(base, 0.5),
      };

      return set;
    }

    generateSemanticSet(base: ColorDefinition): ComputedSemanticSet {
      const baseSet = this.generateColorSet(base);
      return {
        ...baseSet,
        light: this.lighten(base, 0.2),
        dark: this.darken(base, 0.2),
        muted: this.adjustAlpha(base, 0.6),
        emphasis: this.darken(base, 0.3),
      };
    }

    generateComponentSet(base: ColorDefinition): ComputedComponentSet {
      const baseSet = this.generateColorSet(base);
      return {
        ...baseSet,
        hover: this.lighten(base, 0.1),
        active: this.darken(base, 0.1),
        disabled: this.adjustAlpha(base, 0.5),
        focus: this.adjustAlpha(this.lighten(base, 0.2), 0.8),
      };
    }

    // Export/Import
    toCSS(): Record<string, ColorDefinition> {
      const css: Record<string, ColorDefinition> = {};
      this.context.registry.variables.forEach((mapping, path) => {
        const varName = this.context.operations.resolve(path);
        css[varName] = mapping.value;
      });
      return css;
    }

    fromCSS(variables: Record<string, ColorDefinition>): void {
      Object.entries(variables).forEach(([key, value]) => {
        if (key.startsWith(`--${this.config.prefix}`)) {
          const path = key.replace(`--${this.config.prefix}${this.config.separator}`, "");
          this.context.registry.variables.set(path, {
            name: path,
            value,
            format: this.config.format,
          });
        }
      });
    }

    private formatColorDefinition(color: ColorDefinition): ColorDefinition {
      // Ensure all color formats are properly calculated and stored
      return {
        hex: color.hex || this.convertToHex(color),
        rgb: color.rgb || this.convertToRGB(color),
        hsl: color.hsl || this.convertToHSL(color),
        alpha: color.alpha ?? 1,
      };
    }

    private convertToHex(color: ColorDefinition): string {
      if (color.hex) return color.hex;
      if (color.rgb) {
        const match = color.rgb.match(/\d+/g);
        if (match) {
          const [r, g, b] = match.map(Number);
          return `#${((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)}`;
        }
      }
      if (color.hsl) {
        // Convert HSL to RGB first, then to HEX
        // Implementation needed
      }
      throw new Error("Unable to convert color to HEX");
    }

    private convertToRGB(color: ColorDefinition): string {
      if (color.rgb) return color.rgb;
      if (color.hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.hex);
        if (result) {
          const [, r, g, b] = result;
          return `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`;
        }
      }
      if (color.hsl) {
        // Convert HSL to RGB
        // Implementation needed
      }
      throw new Error("Unable to convert color to RGB");
    }

    private convertToHSL(color: ColorDefinition): string {
      if (color.hsl) return color.hsl;
      if (color.rgb) {
        const match = color.rgb.match(/\d+/g);
        if (match) {
          const [r, g, b] = match.map(n => parseInt(n, 10) / 255);
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
        }
      }
      throw new Error("Unable to convert color to HSL");
    }

    private parseColorDefinition(value: ColorDefinition): ColorDefinition {
      // In a real implementation, this would parse a CSS string back to a ColorDefinition.
      // For now, we"ll assume the stored value is already a valid ColorDefinition.
      return value;
    }

    private calculateContrast(color: ColorDefinition): ColorDefinition {
      // Calculate the contrast color.
      const contrastRatio = this.getContrastRatio(color);
      const lightContrast: ColorDefinition = {
        hex: "#FFFFFF",
        rgb: "rgb(255, 255, 255)",
        hsl: "hsl(0, 0%, 100%)",
        alpha: 1,
      };
      const darkContrast: ColorDefinition = {
        hex: "#000000",
        rgb: "rgb(0, 0, 0)",
        hsl: "hsl(0, 0%, 0%)",
        alpha: 1,
      };
      return contrastRatio > 0.5 ? darkContrast : lightContrast;
    }

    private getContrastRatio(color: ColorDefinition): number {
      const luminance = this.calculateLuminance(color);
      const whiteRatio = (1 + 0.05) / (luminance + 0.05);
      const blackRatio = (luminance + 0.05) / (0 + 0.05);
      return Math.max(whiteRatio, blackRatio);
    }

    private calculateLuminance(color: ColorDefinition): number {
      const rgb = this.getRGBComponents(color);
      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    private getRGBComponents(color: ColorDefinition): number[] {
      const match = color.rgb.match(/\d+/g);
      return match ? match.map(Number) : [0, 0, 0];
    }

    private lighten(color: ColorDefinition, amount: number): ColorDefinition {
      const hsl = this.convertToHSL(color);
      const match = hsl.match(/\d+/g);
      if (match) {
        const [h, s, l] = match.map(Number);
        const newL = Math.min(100, l + amount * 100);
        const newHSL = `hsl(${h}, ${s}%, ${newL}%)`;
        return {
          hsl: newHSL,
          rgb: this.convertToRGB({ hsl: newHSL } as ColorDefinition),
          hex: this.convertToHex({ hsl: newHSL } as ColorDefinition),
          alpha: color.alpha,
        };
      }
      throw new Error("Invalid color format");
    }

    private darken(color: ColorDefinition, amount: number): ColorDefinition {
      return this.lighten(color, -amount);
    }

    private adjustAlpha(color: ColorDefinition, amount: number): ColorDefinition {
      const newAlpha = Math.max(0, Math.min(1, amount));
      return {
        ...color,
        alpha: newAlpha,
        rgb: color.rgb.replace("rgb", "rgba").replace(")", `, ${newAlpha})`),
        hex: color.hex + Math.round(newAlpha * 255).toString(16).padStart(2, "0"),
        hsl: color.hsl.replace("hsl", "hsla").replace(")", `, ${newAlpha})`),
      };
    }
  }
