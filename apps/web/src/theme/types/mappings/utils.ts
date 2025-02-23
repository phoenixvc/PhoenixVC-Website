import { ThemeMapping } from "../../mappings";
import { CssVariableConfig } from "../core";
import { ColorMappingAPI } from "./color-mappings";

export interface ThemeMappingUtils {
    get: <T>(path: string, defaultValue?: T) => T;
    set: <T>(path: string, value: T) => void;
    merge: (source: DeepPartial<ColorMappingAPI>) => ColorMappingAPI;
    transform: (transformer: (value: string, path: string) => string) => ColorMappingAPI;
    toCssVariables: (config: CssVariableConfig) => Record<string, string>;
    fromCssVariables: (variables: Record<string, string>, config: CssVariableConfig) => Partial<ColorMappingAPI>;
    validate: () => { valid: boolean; errors: string[] };
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface CreateThemeMappingOptions {
    defaultValues?: DeepPartial<ThemeMapping>;
    validateValues?: boolean;
    cssVariableConfig?: CssVariableConfig;
}

