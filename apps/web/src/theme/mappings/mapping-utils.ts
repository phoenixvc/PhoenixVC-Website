import { CssVariableConfig } from "../types/core";
import { DeepPartial } from "../types/utils/utils";
import {
  CreateThemeMappingOptions,
  ThemeMappingUtils,
} from "../types/mappings/utils";
import { ColorMapping } from "../types";

// A mapping path interface for building nested keys
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
    this.segments = Array.isArray(path) ? path : path.split(".");
  }

  toString(): string {
    return this.segments.join(".");
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

// A transformer takes a value of type T and a mapping path, and returns a new value.
export interface MappingTransformer<T> {
  (value: T, path: MappingPath): T;
}

export class MappingUtils {
  static get<T>(obj: unknown, path: string | string[], defaultValue?: T): T {
    const segments = Array.isArray(path) ? path : path.split(".");
    let current: unknown = obj;
    for (const key of segments) {
      if (
        current === null ||
        current === undefined ||
        typeof current !== "object"
      ) {
        return defaultValue as T;
      }
      current = (current as Record<string, unknown>)[key];
    }
    return (current === undefined ? defaultValue : current) as T;
  }

  static set<T>(
    obj: Record<string, unknown>,
    path: string | string[],
    value: T,
  ): void {
    const segments = Array.isArray(path) ? path : path.split(".");
    let current: Record<string, unknown> = obj;
    for (let i = 0; i < segments.length - 1; i++) {
      const key = segments[i];
      if (
        !(key in current) ||
        typeof current[key] !== "object" ||
        current[key] === null
      ) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    current[segments[segments.length - 1]] = value;
  }

  static merge<T extends Record<string, unknown>>(
    target: T,
    source: DeepPartial<T>,
  ): T {
    const result = { ...target };
    const sourceKeys = Object.keys(source) as Array<keyof DeepPartial<T>>;

    for (const key of sourceKeys) {
      const targetValue = target[key as keyof T];
      const sourceValue = (source as Record<keyof T, unknown>)[key as keyof T];

      if (sourceValue === undefined) {
        continue;
      }

      if (
        MappingUtils.isPlainObject(sourceValue) &&
        MappingUtils.isPlainObject(targetValue)
      ) {
        result[key as keyof T] = MappingUtils.merge(
          targetValue as Record<string, unknown>,
          sourceValue as DeepPartial<typeof targetValue>,
        ) as T[keyof T];
      } else if (Array.isArray(sourceValue)) {
        result[key as keyof T] = [...sourceValue] as T[keyof T];
      } else {
        result[key as keyof T] = sourceValue as T[keyof T];
      }
    }
    return result;
  }

  private static isPlainObject(
    value: unknown,
  ): value is Record<string, unknown> {
    if (!value || typeof value !== "object") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => MappingUtils.deepClone(item)) as unknown as T;
    }
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = MappingUtils.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  static transform<T extends object>(
    obj: T,
    transformer: MappingTransformer<unknown>,
  ): T {
    const transform = (value: unknown, path: MappingPath): unknown => {
      if (value === null || value === undefined) {
        return value;
      }
      if (Array.isArray(value)) {
        return value.map((item, index) =>
          transform(item, path.child(index.toString())),
        );
      }
      if (typeof value === "object") {
        const result: Record<string, unknown> = {};
        Object.entries(value).forEach(([key, val]) => {
          result[key] = transform(val, path.child(key));
        });
        return result;
      }
      return transformer(value, path);
    };

    return transform(obj, new PathBuilder([])) as T;
  }

  static flatten(
    obj: Record<string, unknown>,
    prefix: string = "",
    result: Record<string, string> = {},
  ): Record<string, string> {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}-${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        MappingUtils.flatten(value as Record<string, unknown>, newKey, result);
      } else {
        result[newKey] = String(value);
      }
    });
    return result;
  }

  static unflatten(
    obj: Record<string, string>,
    separator: string = "-",
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    Object.entries(obj).forEach(([key, value]) => {
      const parts = key.split(separator);
      let current = result;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = value;
        } else {
          current[part] = current[part] || {};
          current = current[part] as Record<string, unknown>;
        }
      });
    });
    return result;
  }

  static validate<T>(
    obj: T,
    schema: Record<string, (value: unknown) => boolean>,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validateValue = (
      value: unknown,
      path: string[],
      validators: Record<string, (value: unknown) => boolean>,
    ): void => {
      const currentPath = path.join(".");
      if (validators[currentPath]) {
        try {
          if (!validators[currentPath](value)) {
            errors.push(`Invalid value at ${currentPath}`);
          }
        } catch (e) {
          errors.push(`Validation error at ${currentPath}: ${e}`);
        }
      }
      if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, val]) => {
          validateValue(val, [...path, key], validators);
        });
      }
    };

    validateValue(obj, [], schema);

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const createThemeMapping = (
  _options: CreateThemeMappingOptions = {},
): ThemeMappingUtils => {
  return {
    get: <T>(_path: string, defaultValue?: T): T => {
      return defaultValue as T;
    },
    set: <T>(_path: string, _value: T): void => {
      // Implementation pending
    },
    merge: (_source: DeepPartial<ColorMapping>): ColorMapping => {
      return {} as ColorMapping;
    },
    transform: (
      _transformer: (value: string, path: string) => string,
    ): ColorMapping => {
      return {} as ColorMapping;
    },
    toCssVariables: (_config: CssVariableConfig): Record<string, string> => {
      return {};
    },
    fromCssVariables: (
      _variables: Record<string, string>,
      _config: CssVariableConfig,
    ): Partial<ColorMapping> => {
      return {};
    },
    validate: (): { valid: boolean; errors: string[] } => ({
      valid: true,
      errors: [],
    }),
  };
};
