// Import all necessary types
import { CssVariableConfig } from '../types/core/variables';
import type { DeepPartial } from '../types/utils/utils';
import { ColorMappingAPI } from '../types/mappings';
import type { ThemeVariableMappings } from '../types/mappings/theme-mappings';
import { ThemeMappingUtils } from '../types/mappings/utils';

// Re-export all interface types
export * from '../types/mappings/base-mappings';
export * from '../types/mappings/interfaces/color-mappings';
export * from '../types/mappings/component-mappings';
export * from '../types/mappings/state-mappings';
export * from '../types/mappings/interfaces/system-mappings';
export * from '../types/mappings/theme-mappings';
export * from '../types/mappings/typography-mappings';
export * from './mapping-utils';

// Define the core theme mapping type
export type ThemeMapping = ColorMappingAPI & ThemeVariableMappings;

// Define the options interface
export interface CreateThemeMappingOptions {
    defaultValues?: DeepPartial<ThemeMapping>;
    validateValues?: boolean;
    cssVariableConfig?: CssVariableConfig;
}

// Main factory function
export const createThemeMapping = (
    options: CreateThemeMappingOptions = {}
): ThemeMappingUtils => {
    return createThemeMapping(options);
};
