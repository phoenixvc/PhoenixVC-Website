import {
    ColorDefinition,
    ColorShades,
    BaseColors,
    SemanticColors,
    ColorSet,
    SemanticColorSet,
    ComponentColorSet,
    ColorScaleConfig,
    ColorPaletteConfig,
    GradientType,
    ColorExportFormat
} from '../../core/colors';
import { BaseMappingConfig } from '../base-mappings';
import { ColorContext } from './base-mappings';

export interface ColorTransformOptions {
    format?: ColorExportFormat;
    preserveAlpha?: boolean;
    round?: boolean;
}

export interface ColorTransforms {
    lighten: (color: ColorDefinition, amount: number, options?: ColorTransformOptions) => ColorDefinition;
    darken: (color: ColorDefinition, amount: number, options?: ColorTransformOptions) => ColorDefinition;
    alpha: (color: ColorDefinition, amount: number) => ColorDefinition;
    mix: (color1: ColorDefinition, color2: ColorDefinition, weight?: number) => ColorDefinition;
    adjust: (color: ColorDefinition, adjustments: Partial<ColorDefinition>) => ColorDefinition;
}

export interface ColorMappingConfig extends BaseMappingConfig {
    enforceContrast?: boolean;
    minimumContrast?: number;
    defaultShades?: Partial<ColorShades>;
}

export interface ColorMappingAPI {
    // Base color operations
    setColor(path: string, value: ColorDefinition): void;
    getColor(path: string, format?: ColorExportFormat): ColorDefinition | undefined;

    // Shade operations
    setShades(name: string, shades: ColorShades): void;
    getShades(name: string): ColorShades | undefined;
    generateShades(base: ColorDefinition, config?: ColorScaleConfig): ColorShades;

    // Color set generation
    generateColorSet(base: ColorDefinition): ColorSet;
    generateSemanticSet(base: ColorDefinition): SemanticColorSet;
    generateComponentSet(base: ColorDefinition): ComponentColorSet;

    // Palette operations
    generatePalette(config: ColorPaletteConfig): BaseColors;
    generateSemanticPalette(base: BaseColors): SemanticColors;

    // Context-specific operations
    getContextColors(context: ColorContext): Record<string, ColorDefinition>;

    // Export/Import
    toFormat(format: ColorExportFormat, prefix?: string): Record<string, string>;
    fromFormat(data: Record<string, string>, format: ColorExportFormat): void;
}
