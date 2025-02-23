import { CssVariableConfig } from "../core";
import { DeepPartial } from "../utils/utils";
import { ColorMappingAPI } from "./interfaces";
import { CreateThemeMappingOptions, ThemeMappingUtils } from "./interfaces/utils";

export interface MappingPath {
    toString(): string;
    toArray(): string[];
    parent(): MappingPath;
    child(segment: string): MappingPath;
    isRoot(): boolean;
}

export class PathBuilder implements MappingPath {
    private segments: string[];

    constructor(path: string | string[]) {
        this.segments = Array.isArray(path) ? path : path.split('.');
    }

    toString(): string {
        return this.segments.join('.');
    }

    toArray(): string[] {
        return [...this.segments];
    }

    parent(): MappingPath {
        return new PathBuilder(this.segments.slice(0, -1));
    }

    child(segment: string): MappingPath {
        return new PathBuilder([...this.segments, segment]);
    }

    isRoot(): boolean {
        return this.segments.length === 0;
    }
}

export interface MappingTransformer<T> {
    (value: T, path: MappingPath): T;
}

export class MappingUtils {
    static get<T>(obj: any, path: string | string[], defaultValue?: T): T {
        const segments = Array.isArray(path) ? path : path.split('.');
        let current = obj;

        for (const key of segments) {
            if (current === null || current === undefined) {
                return defaultValue as T;
            }
            current = current[key];
        }

        return (current === undefined ? defaultValue : current) as T;
    }

    static set<T>(obj: any, path: string | string[], value: T): void {
        const segments = Array.isArray(path) ? path : path.split('.');
        let current = obj;

        for (let i = 0; i < segments.length - 1; i++) {
            const key = segments[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }

        current[segments[segments.length - 1]] = value;
    }

     /**
     * Deeply merges a partial source object into a target object
     * @template T - The type of the target object
     * @param target - The target object to merge into
     * @param source - The source object containing partial updates
     * @returns A new merged object of type T
     */
     static merge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T {
        // Create a new object to avoid mutating the target
        const result = { ...target };

        // Get typed keys from source
        const sourceKeys = Object.keys(source) as Array<keyof DeepPartial<T>>;

        for (const key of sourceKeys) {
            const targetValue = target[key as keyof T];
            // Fix: Explicitly type the source value access
            const sourceValue = (source as Record<keyof T, unknown>)[key as keyof T];

            // Skip undefined values
            if (sourceValue === undefined) {
                continue;
            }

            // Handle nested objects
            if (this.isPlainObject(sourceValue) && this.isPlainObject(targetValue)) {
                result[key as keyof T] = this.merge(
                    targetValue,
                    sourceValue as DeepPartial<typeof targetValue>
                );
            }
            // Handle arrays - replace instead of merge
            else if (Array.isArray(sourceValue)) {
                result[key as keyof T] = [...sourceValue] as T[keyof T];
            }
            // Handle primitive values and functions
            else {
                result[key as keyof T] = sourceValue as T[keyof T];
            }
        }

        return result;
    }

    /**
     * Type guard to check if a value is a plain object
     * @param value - Value to check
     * @returns boolean indicating if the value is a plain object
     */
    private static isPlainObject(value: unknown): value is Record<string, any> {
        if (!value || typeof value !== 'object') return false;

        const prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
    }

    /**
     * Creates a deep clone of an object
     * @template T - The type of object to clone
     * @param obj - The object to clone
     * @returns A deep clone of the input object
     */
    static deepClone<T>(obj: T): T {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item)) as unknown as T;
        }

        const cloned = {} as T;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }

        return cloned;
    }

    static transform<T extends object>(
        obj: T,
        transformer: MappingTransformer<any>
    ): T {
        const transform = (value: any, path: MappingPath): any => {
            if (value === null || value === undefined) {
                return value;
            }

            if (Array.isArray(value)) {
                return value.map((item, index) =>
                    transform(item, path.child(index.toString()))
                );
            }

            if (typeof value === 'object') {
                const result: any = {};
                Object.entries(value).forEach(([key, val]) => {
                    result[key] = transform(val, path.child(key));
                });
                return result;
            }

            return transformer(value, path);
        };

        return transform(obj, new PathBuilder([]));
    }

    static flatten(
        obj: any,
        prefix: string = '',
        result: Record<string, string> = {}
    ): Record<string, string> {
        Object.entries(obj).forEach(([key, value]) => {
            const newKey = prefix ? `${prefix}-${key}` : key;

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                MappingUtils.flatten(value, newKey, result);
            } else {
                result[newKey] = String(value);
            }
        });

        return result;
    }

    static unflatten(
        obj: Record<string, string>,
        separator: string = '-'
    ): any {
        const result: any = {};

        Object.entries(obj).forEach(([key, value]) => {
            const parts = key.split(separator);
            let current = result;

            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    current[part] = value;
                } else {
                    current[part] = current[part] || {};
                    current = current[part];
                }
            });
        });

        return result;
    }

    static validate<T>(
        obj: T,
        schema: Record<string, (value: any) => boolean>
    ): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        const validateValue = (
            value: any,
            path: string[],
            validators: Record<string, (value: any) => boolean>
        ) => {
            const currentPath = path.join('.');

            if (validators[currentPath]) {
                try {
                    if (!validators[currentPath](value)) {
                        errors.push(`Invalid value at ${currentPath}`);
                    }
                } catch (e) {
                    errors.push(`Validation error at ${currentPath}: ${e}`);
                }
            }

            if (value && typeof value === 'object') {
                Object.entries(value).forEach(([key, val]) => {
                    validateValue(val, [...path, key], validators);
                });
            }
        };

        validateValue(obj, [], schema);

        return {
            valid: errors.length === 0,
            errors
        };
    }
}


export const createThemeMapping = (
    _options: CreateThemeMappingOptions = {}
): ThemeMappingUtils => {
    return {
        get: <T>(_path: string, defaultValue?: T): T => {
            return defaultValue as T;
        },

        set: <T>(_path: string, _value: T): void => {
            // Implementation pending
        },

        merge: (_source: DeepPartial<ColorMappingAPI>): ColorMappingAPI => {
            return {} as ColorMappingAPI;
        },

        transform: (_transformer: (value: string, path: string) => string): ColorMappingAPI => {
            return {} as ColorMappingAPI;
        },

        toCssVariables: (_config: CssVariableConfig): Record<string, string> => {
            return {};
        },

        fromCssVariables: (
            _variables: Record<string, string>,
            _config: CssVariableConfig
        ): Partial<ColorMappingAPI> => {
            return {};
        },

        validate: () => ({
            valid: true,
            errors: []
        })
    };
};
