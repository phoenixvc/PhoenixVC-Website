// src/mappings/color-mappings.ts

import {
    ColorDefinition,
    ColorShades,
    ColorSet,
    SemanticColors} from '../types/core/colors';
import { createBaseMappingContext, BaseVariableMapping } from './base-mappings';
import { BaseMappingContext } from '../types/mappings/base-mappings';
import { ColorMappingConfig } from '../types/mappings/config';
import { ComponentColorSet } from '../types';

export class ColorMapping {
    private context: BaseMappingContext;
    private config: ColorMappingConfig;

    constructor(config?: Partial<ColorMappingConfig>) {
        this.config = {
            prefix: config?.prefix ?? 'color',
            scope: config?.scope ?? ':root',
            format: config?.format ?? 'rgb',
            separator: config?.separator ?? '-',
            enforceContrast: config?.enforceContrast ?? true,
            minimumContrast: config?.minimumContrast ?? 4.5
        };

        this.context = createBaseMappingContext({
            prefix: this.config.prefix,
            scope: this.config.scope,
            format: this.config.format,
            separator: this.config.separator
        });
    }

    // Color Definition Management
    setColor(path: string, color: ColorDefinition): void {
        const formatted = this.formatColorDefinition(color);
        const mapping: BaseVariableMapping = {
            name: path,
            value: formatted,
            format: this.config.format
        };

        this.context.registry.variables.set(path, mapping);
        this.context.registry.colors.set(path, formatted);
    }

    getColor(path: string): ColorDefinition | undefined {
        const value = this.context.registry.colors.get(path);
        return value ? this.parseColorDefinition(value) : undefined;
    }

    // Color Shades Management
    setShades(name: string, shades: ColorShades): void {
        Object.entries(shades).forEach(([shade, color]) => {
            const path = `${name}-${shade}`;
            this.setColor(path, color);
        });
    }

    getShades(name: string): ColorShades | undefined {
        const shades: Partial<ColorShades> = {};
        const shadeKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
        type ShadeKey = typeof shadeKeys[number];

        for (const shade of shadeKeys) {
            const color = this.getColor(`${name}-${shade}`);
            if (color) {
                shades[shade as ShadeKey] = color;
            }
        }

        return Object.keys(shades).length === 10 ? shades as ColorShades : undefined;
    }

    // Color Set Generation
    generateColorSet(base: ColorDefinition): ColorSet {
        // Since ColorSet is an alias for ColorDefinition,
        // we just need to return a single ColorDefinition
        return {
            hex: base.hex,
            rgb: base.rgb,
            hsl: base.hsl,
            alpha: base.alpha || 1
        };
    }

    generateSemanticSet(base: ColorDefinition): SemanticColors {
        return {
            // Required semantic colors
            success: this.adjustHue(base, 120), // Green hue
            warning: this.adjustHue(base, 45),  // Orange/Yellow hue
            error: this.adjustHue(base, 0),     // Red hue
            info: this.adjustHue(base, 200),    // Blue hue
            // Optional semantic colors
            neutral: this.adjustSaturation(base, 0.2),
            hint: this.adjustAlpha(base, 0.7)
        };
    }

    generateComponentSet(base: ColorDefinition): ComponentColorSet {
        // const _hoverColor = this.lighten(base, 0.1);

        return {
            background: base,
            text: this.getContrastColor(base),
            border: this.adjustAlpha(this.darken(base, 0.1), 0.5),
            shadow: {
                color: this.adjustAlpha(base, 0.2),
                offsetX: '0px',
                offsetY: '2px',
                blur: '4px',
                spread: '0px',
                inset: false
            }
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
                const path = key.replace(`--${this.config.prefix}${this.config.separator}`, '');
                this.context.registry.variables.set(path, {
                    name: path,
                    value,
                    format: this.config.format
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
            alpha: color.alpha ?? 1
        };
    }

    private convertToHex(color: ColorDefinition): string {
        if (color.hex) return color.hex;
        if (color.rgb) {
            const match = color.rgb.match(/\d+/g);
            if (match) {
                const [r, g, b] = match.map(Number);
                return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            }
        }
        if (color.hsl) {
            // Convert HSL to RGB first, then to HEX
            // Implementation needed
        }
        throw new Error('Unable to convert color to HEX');
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
        throw new Error('Unable to convert color to RGB');
    }

    private convertToHSL(color: ColorDefinition): string {
        if (color.hsl) return color.hsl;
        if (color.rgb) {
            const match = color.rgb.match(/\d+/g);
            if (match) {
                // Fix: Convert string to number first, then divide by 255
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
        throw new Error('Unable to convert color to HSL');
    }

    // When you need the string format for CSS variables
    // private getColorString(color: ColorDefinition): string {
    //     return color[this.config.format as keyof ColorDefinition] as string;
    // }

    private parseColorDefinition(_value: ColorDefinition): ColorDefinition {
        // Implementation to parse string back to ColorDefinition
        return {
            hex: '',
            rgb: '',
            hsl: '',
            alpha: 1
        };
    }

    // private calculateContrast(color: ColorDefinition): ColorDefinition {
    //     // Calculate the contrast color
    //     const contrastRatio = this.getContrastRatio(color);

    //     // Default contrast colors
    //     const lightContrast: ColorDefinition = {
    //         hex: '#FFFFFF',
    //         rgb: 'rgb(255, 255, 255)',
    //         hsl: 'hsl(0, 0%, 100%)',
    //         alpha: 1
    //     };

    //     const darkContrast: ColorDefinition = {
    //         hex: '#000000',
    //         rgb: 'rgb(0, 0, 0)',
    //         hsl: 'hsl(0, 0%, 0%)',
    //         alpha: 1
    //     };

    //     // Return white or black based on contrast ratio
    //     return contrastRatio > 0.5 ? darkContrast : lightContrast;
    // }

    // Helper method to calculate contrast ratio
    // private getContrastRatio(color: ColorDefinition): number {
    //     // Convert color to relative luminance
    //     const luminance = this.calculateLuminance(color);

    //     // Calculate ratio against both white and black
    //     const whiteRatio = (1 + 0.05) / (luminance + 0.05);
    //     const blackRatio = (luminance + 0.05) / (0 + 0.05);

    //     return Math.max(whiteRatio, blackRatio);
    // }

    // private calculateLuminance(color: ColorDefinition): number {
    //     // Convert color to RGB components
    //     const rgb = this.getRGBComponents(color);

    //     // Calculate relative luminance
    //     const [r, g, b] = rgb.map(c => {
    //         c = c / 255;
    //         return c <= 0.03928
    //             ? c / 12.92
    //             : Math.pow((c + 0.055) / 1.055, 2.4);
    //     });

    //     return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // }

    // private getRGBComponents(color: ColorDefinition): number[] {
    //     // Extract RGB values from the color definition
    //     // This is a simplified example - you'll need to implement proper color parsing
    //     const match = color.rgb.match(/\d+/g);
    //     if (match) {
    //         return match.map(Number);
    //     }
    //     return [0, 0, 0];
    // }

    private lighten(color: ColorDefinition, amount: number): ColorDefinition {
        const hsl = this.convertToHSL(color);
        const match = hsl.match(/\d+/g);
        if (match) {
            const [h, s, l] = match.map(Number);
            const newL = Math.min(100, l + (amount * 100));
            return {
                hsl: `hsl(${h}, ${s}%, ${newL}%)`,
                rgb: this.convertToRGB({ hsl: `hsl(${h}, ${s}%, ${newL}%)` } as ColorDefinition),
                hex: this.convertToHex({ hsl: `hsl(${h}, ${s}%, ${newL}%)` } as ColorDefinition),
                alpha: color.alpha
            };
        }
        throw new Error('Invalid color format');
    }

    private darken(color: ColorDefinition, amount: number): ColorDefinition {
        return this.lighten(color, -amount);
    }

    private adjustAlpha(color: ColorDefinition, amount: number): ColorDefinition {
        const newAlpha = Math.max(0, Math.min(1, amount));
        return {
            ...color,
            alpha: newAlpha,
            rgb: color.rgb.replace('rgb', 'rgba').replace(')', `, ${newAlpha})`),
            hex: color.hex + Math.round(newAlpha * 255).toString(16).padStart(2, '0'),
            hsl: color.hsl.replace('hsl', 'hsla').replace(')', `, ${newAlpha})`)
        };
    }

    adjustHue(color: ColorDefinition, degrees: number): ColorDefinition {
        // Parse the HSL values from the color's hsl string
        const hslMatch = color.hsl.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
        if (!hslMatch) {
            throw new Error('Invalid HSL color format');
        }

        // Extract HSL values
        let [_, h, s, l, a] = hslMatch.map(Number);

        // Adjust hue
        h = (h + degrees) % 360;
        if (h < 0) h += 360; // Ensure positive hue value

        // Create new HSL string
        const hslString = a
            ? `hsla(${h}, ${s}%, ${l}%, ${a})`
            : `hsl(${h}, ${s}%, ${l}%)`;

        // Convert to RGB
        const rgb = this.hslToRgb(h, s / 100, l / 100);
        const rgbString = a
            ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
            : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Convert to HEX
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);

        return {
            hex,
            rgb: rgbString,
            hsl: hslString,
            alpha: a || 1
        };
    }

    getContrastColor(color: ColorDefinition): ColorDefinition {
        // Convert color to RGB values
        let rgb: { r: number, g: number, b: number };

        if (color.rgb.startsWith('rgb')) {
            const rgbMatch = color.rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (!rgbMatch) {
                throw new Error('Invalid RGB color format');
            }
            rgb = {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        } else {
            rgb = this.hexToRgb(color.hex);
        }

        // Calculate relative luminance
        const luminance = this.calculateRelativeLuminance(rgb);

        // Determine if we should use black or white text
        const contrastColor = luminance > 0.5 ?
            {
                hex: '#000000',
                rgb: 'rgb(0, 0, 0)',
                hsl: 'hsl(0, 0%, 0%)',
                alpha: 1
            } :
            {
                hex: '#FFFFFF',
                rgb: 'rgb(255, 255, 255)',
                hsl: 'hsl(0, 0%, 100%)',
                alpha: 1
            };

        return contrastColor;
    }

    private calculateRelativeLuminance(rgb: { r: number, g: number, b: number }): number {
        const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

        const [r, g, b] = [rs, gs, bs].map(c =>
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        );

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    private hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h / 360 + 1/3);
            g = hue2rgb(p, q, h / 360);
            b = hue2rgb(p, q, h / 360 - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    private rgbToHex(r: number, g: number, b: number): string {
        const toHex = (n: number) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    private hexToRgb(hex: string): { r: number, g: number, b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            throw new Error('Invalid hex color format');
        }

        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }

    adjustSaturation(color: ColorDefinition, amount: number): ColorDefinition {
        // Parse the HSL values from the color's hsl string
        const hslMatch = color.hsl.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
        if (!hslMatch) {
            throw new Error('Invalid HSL color format');
        }

        // Extract HSL values
        let [_, h, s, l, a] = hslMatch.map(Number);

        // Adjust saturation (keeping it within 0-100 range)
        s = Math.max(0, Math.min(100, s * (1 + amount)));

        // Create new HSL string
        const hslString = a
            ? `hsla(${h}, ${s}%, ${l}%, ${a})`
            : `hsl(${h}, ${s}%, ${l}%)`;

        // Convert to RGB
        const rgb = this.hslToRgb(h, s / 100, l / 100);
        const rgbString = a
            ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
            : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Convert to HEX
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);

        return {
            hex,
            rgb: rgbString,
            hsl: hslString,
            alpha: a || 1
        };
    }

    // Alternative version that uses absolute saturation value instead of relative adjustment
    adjustSaturationAbsolute(color: ColorDefinition, saturation: number): ColorDefinition {
        // Parse the HSL values from the color's hsl string
        const hslMatch = color.hsl.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
        if (!hslMatch) {
            throw new Error('Invalid HSL color format');
        }

        // Extract HSL values
        let [_, h, _s, l, a] = hslMatch.map(Number);

        // Set new saturation (keeping it within 0-100 range)
        const s = Math.max(0, Math.min(100, saturation * 100));

        // Create new HSL string
        const hslString = a
            ? `hsla(${h}, ${s}%, ${l}%, ${a})`
            : `hsl(${h}, ${s}%, ${l}%)`;

        // Convert to RGB
        const rgb = this.hslToRgb(h, s / 100, l / 100);
        const rgbString = a
            ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`
            : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Convert to HEX
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);

        return {
            hex,
            rgb: rgbString,
            hsl: hslString,
            alpha: a || 1
        };
    }

    // Helper method to validate and normalize saturation value
    // private normalizeSaturation(saturation: number): number {
    //     if (saturation < 0) return 0;
    //     if (saturation > 1) return 1;
    //     return saturation;
    // }
}
