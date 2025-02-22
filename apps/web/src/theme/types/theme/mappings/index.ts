// Import all necessary types
import { CssVariableConfig } from '../core/variables';
import type { DeepPartial } from '../utils/utils';
import { ColorMappingAPI } from './interfaces';
import type { ThemeVariableMappings } from './interfaces/theme-variable-mappings';
import { ThemeMappingUtils } from './interfaces/utils';

// Re-export all interface types
export * from './interfaces/base-mappings';
export * from './interfaces/color-mappings';
export * from './interfaces/component-mappings';
export * from './interfaces/state-mappings';
export * from './interfaces/system-mappings';
export * from './interfaces/theme-variable-mappings';
export * from './interfaces/typography-mappings';
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
