import { CssVariableConfig } from "../core";
import { ColorMapping } from "./color-mappings";
import { ThemeMappings } from "./theme-mappings";

export interface ThemeMappingUtils {
    get: <T>(path: string, defaultValue?: T) => T;
    set: <T>(path: string, value: T) => void;
    merge: (source: DeepPartial<ColorMapping>) => ColorMapping;
    transform: (transformer: (value: string, path: string) => string) => ColorMapping;
    toCssVariables: (config: CssVariableConfig) => Record<string, string>;
    fromCssVariables: (variables: Record<string, string>, config: CssVariableConfig) => Partial<ColorMapping>;
    validate: () => { valid: boolean; errors: string[] };
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface CreateThemeMappingOptions {
    defaultValues?: DeepPartial<ThemeMappings>;
    validateValues?: boolean;
    cssVariableConfig?: CssVariableConfig;
}

