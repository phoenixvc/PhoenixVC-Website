// /theme/types/mappings/color-mappings.ts

/**
 * Color Mapping API
 * Provides functions for retrieving and manipulating theme colors.
 *
 * @example
 * const themeColors: ColorMappingAPI = {
 *   setColor: (path, value) => console.log(`Setting ${path} to`, value),
 *   getColor: (path) => ({ hex: '#FF5733', rgb: '255,87,51', hsl: '11,100%,60%' }),
 *   setShades: (name, shades) => console.log(`Setting shades for ${name}`, shades),
 *   getShades: (name) => ({
 *     50: { hex: '#FFE5E0', rgb: '255,229,224', hsl: '11,100%,95%' },
 *     500: { hex: '#FF5733', rgb: '255,87,51', hsl: '11,100%,60%' }
 *   })
 * };
 */

import { SemanticColorSet } from '@/theme/mappings/base-mappings';
import { ComponentColorSet, BorderColorSet, ButtonColorSet, ChartColorSet, InputColorSet, NavigationColorSet, TableColorSet, TextColorSet } from '../components/base-colors';
import {
    ColorDefinition,
    ColorShades,
    BaseColors,
    SemanticColors,
    ColorSet,
    ColorScaleConfig,
    ColorPaletteConfig,
    ColorExportFormat,
    ShadowSet
} from '../core/colors';
import { BaseMappingConfig, ColorContext } from './base-mappings';

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

// ============================================
// Color Mappings & Variables
// ============================================

/**
* Complete color mappings
* @description Comprehensive color definitions for the entire theme
*/
export interface ColorMappings {
  base: Record<keyof BaseColors, ColorSet>;
  semantic: Record<keyof SemanticColors, SemanticColorSet>;
  text: TextColorSet;
  border: BorderColorSet;
  shadow: ShadowSet;

  interactive: {
      focusRing: string;
      overlay: string;
      selection: string;
      highlight: string;
  };

  components: {
      // Form Elements
      input: InputColorSet;
      select: InputColorSet;
      checkbox: InputColorSet;
      radio: InputColorSet;
      switch: InputColorSet;

      // Buttons
      button: Record<'primary' | 'secondary' | 'ghost' | 'link' | 'danger', ButtonColorSet>;

      // Navigation
      navigation :
      {
        navbar: NavigationColorSet;
        sidebar: NavigationColorSet;
        tab: NavigationColorSet;
        breadcrumb: NavigationColorSet;
      };

      containers: {
          card: ComponentColorSet;
          modal: ComponentColorSet & {
              overlay: string;
          };
          drawer: ComponentColorSet;
          popover: ComponentColorSet;
          tooltip: ComponentColorSet;
      }

      feedback: {
        alert: Record<keyof SemanticColors, ComponentColorSet>;
        toast: Record<keyof SemanticColors, ComponentColorSet>;
      }


      dataDisplay: {
        table: TableColorSet;
        badge: ComponentColorSet;
        tag: ComponentColorSet;
        avatar: ComponentColorSet;
        progress: ComponentColorSet;
        spinner: ComponentColorSet;
      }

      // Code and Syntax
      code: ComponentColorSet & {
          syntax: {
              comment: string;
              string: string;
              keyword: string;
              variable: string;
              function: string;
              operator: string;
              class: string;
          };
      };

      // Charts and Visualization
      chart: ChartColorSet;

      // Skeleton Loading
      skeleton: {
          base: string;
          highlight: string;
          animation: string;
      };

      // Scrollbar
      scrollbar: {
          track: string;
          thumb: string;
          thumbHover: string;
      };
  };

  // States
  states: {
      disabled: ComponentColorSet;
      loading: ComponentColorSet;
      readonly: ComponentColorSet;
  };
}
