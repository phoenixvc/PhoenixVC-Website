// theme/registry/variant-resolver.ts

import { ComponentVariantType } from "../types/mappings/component-variants";
import { StrategyFactory } from "./variant-resolution/strategy-factory";
import { VariantResolutionStrategy } from "./variant-resolution/variant-resolution-strategy";

/**
 * Configuration for the VariantResolver
 */
export interface VariantResolverConfig {
  /**
   * Whether to log warnings when variants are not found
   * @default true
   */
  logWarnings?: boolean;

  /**
   * Custom strategies to register
   */
  customStrategies?: VariantResolutionStrategy[];
}

/**
 * Responsible for resolving component variants with support for dynamic patterns
 * and interactive states using a strategy pattern
 */
export class VariantResolver {
  private strategyFactory: StrategyFactory;
  private config: Required<VariantResolverConfig>;

  /**
   * Creates a new VariantResolver
   * @param config Optional configuration
   * @param strategyFactory Optional strategy factory (for dependency injection)
   */
  constructor(
    config?: VariantResolverConfig,
    strategyFactory?: StrategyFactory,
  ) {
    this.config = {
      logWarnings: config?.logWarnings ?? true,
      customStrategies: config?.customStrategies ?? [],
    };

    this.strategyFactory = strategyFactory || new StrategyFactory();

    // Register custom strategies if provided
    if (this.config.customStrategies.length > 0) {
      this.config.customStrategies.forEach((strategy) => {
        this.strategyFactory.registerStrategy(strategy);
      });
    }
  }

  /**
   * Gets a component variant with fallback support for dynamic variants
   * @param componentVariants The component variants to resolve from
   * @param variant The variant name or dynamic pattern (e.g. "${variant}-active")
   * @param actualVariant Optional actual variant to use when resolving dynamic patterns
   * @returns The resolved component variant or undefined if not found
   */
  resolveVariant(
    componentVariants: Record<string, ComponentVariantType>,
    variant: string = "default",
    actualVariant?: string,
  ): ComponentVariantType | undefined {
    // If the specific variant exists, return it
    if (componentVariants[variant]) {
      return componentVariants[variant] as ComponentVariantType;
    }

    // Handle dynamic variants with template strings
    if (variant.includes("${")) {
      // If actualVariant is provided, try resolving the pattern with it first
      if (actualVariant && actualVariant !== "default") {
        const resolvedVariant = variant.replace(/\${variant}/g, actualVariant);
        if (componentVariants[resolvedVariant]) {
          return componentVariants[resolvedVariant] as ComponentVariantType;
        }
      }

      // Parse the dynamic pattern
      const dynamicPattern = variant.replace(/\${variant}/g, "");
      const baseVariant = actualVariant || "default";

      // Get strategies that can handle this pattern
      const strategies =
        this.strategyFactory.getStrategiesForPattern(dynamicPattern);

      // Try each strategy
      for (const strategy of strategies) {
        const result = strategy.resolveVariant(
          componentVariants,
          baseVariant,
          dynamicPattern,
        );
        if (result) return result;
      }

      // Try default variant with the pattern suffix
      const defaultWithPattern = `default${dynamicPattern}`;
      if (componentVariants[defaultWithPattern]) {
        return componentVariants[defaultWithPattern] as ComponentVariantType;
      }
    }

    // Fall back to default variant
    if (this.config.logWarnings && variant !== "default") {
      console.warn(`Variant not found: ${variant}, falling back to default`);
    }

    return componentVariants.default as ComponentVariantType;
  }

  /**
   * Registers a custom variant resolution strategy
   * @param strategy The strategy to register
   */
  registerStrategy(strategy: VariantResolutionStrategy): void {
    this.strategyFactory.registerStrategy(strategy);
  }
}
