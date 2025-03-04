// theme/registry/variant-resolution/variant-resolution-strategy.ts

import { ComponentVariantType } from "../../types/mappings/component-variants";

/**
 * Interface for variant resolution strategies
 */
export interface VariantResolutionStrategy {
  /**
   * Resolves a variant based on a pattern and base variant
   * @param componentVariants Available component variants
   * @param baseVariant The base variant to use for resolution
   * @param dynamicPattern The pattern to apply (e.g. "-active", "-hover")
   * @returns The resolved variant or undefined
   */
  resolveVariant(
    componentVariants: Record<string, ComponentVariantType>,
    baseVariant: string,
    dynamicPattern: string
  ): ComponentVariantType | undefined;

  /**
   * Checks if this strategy can handle the given pattern
   * @param pattern The pattern to check
   * @returns True if this strategy can handle the pattern
   */
  canHandle(pattern: string): boolean;
}

// Base implementation for pattern-specific strategies
export abstract class PatternResolutionStrategy implements VariantResolutionStrategy {
  constructor(protected patterns: string[]) {}

  canHandle(pattern: string): boolean {
    return this.patterns.includes(pattern);
  }

  abstract resolveVariant(
    componentVariants: Record<string, ComponentVariantType>,
    baseVariant: string,
    dynamicPattern: string
  ): ComponentVariantType | undefined;
}
