// /src/theme/types/mappings/variable-mappings.ts

/**
 * Theme Variable Mappings
 * Provides mappings for typography, colors, components, and more.
 *
 * @example
 * const themeMappings: ThemeVariableMappings = {
 *   colors: themeColors,
 *   typography: typographySettings,
 *   components: componentMappings,
 *   states: {
 *     disabled: { background: { hex: '#cccccc', rgb: '204,204,204', hsl: '0,0%,80%' }, foreground: { hex: '#666666', rgb: '102,102,102', hsl: '0,0%,40%' } }
 *   },
 *   system: {
 *     focus: { ring: '2px solid #007BFF', outline: 'none' }
 *   },
 *   spacing: {
 *     unit: 4,
 *     scale: [0, 4, 8, 16, 32, 64, 128]
 *   },
 *   borderRadius: {
 *     none: '0px',
 *     sm: '2px',
 *     md: '4px',
 *     lg: '8px',
 *     full: '9999px'
 *   }
 * };
 */

import { ColorMapping } from './color-mappings';
import { ComponentMappings } from './component-mappings';
import { StateMappings } from './state-mappings';
import { SystemMappings } from './system-mappings';
import { TypographyMappings } from './typography-mappings';

export interface ThemeMappings {
    colors: ColorMapping;
    typography: TypographyMappings;
    components: ComponentMappings;
    states: StateMappings;
    system: SystemMappings;

    // Additional theme-wide settings
    spacing: {
        unit: number;
        scale: number[];
    };
    breakpoints: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
    borderRadius: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        full: string;
    };
    shadows: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    zIndices: {
        base: number;
        dropdown: number;
        sticky: number;
        fixed: number;
        modal: number;
        popover: number;
        tooltip: number;
    };
}
