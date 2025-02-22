import { ComponentMappings } from './component-mappings';
import { ColorMappingAPI } from './color-mappings';
import { StateMappings } from './state-mappings';
import { SystemMappings } from './system-mappings';
import { TypographyMappings } from './typography-mappings';

export interface ThemeVariableMappings {
    colors: ColorMappingAPI;
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
