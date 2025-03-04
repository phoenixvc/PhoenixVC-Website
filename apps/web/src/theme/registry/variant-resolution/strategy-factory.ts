// theme/registry/variant-resolution/strategy-factory.ts

import { VariantResolutionStrategy } from "./variant-resolution-strategy";
import { InteractiveStateStrategy } from "./interactive-state-strategy";
import { NavigationStrategy } from "./navigation-strategy";
import { TabStrategy } from "./tab-strategy";

/**
 * Factory for creating variant resolution strategies
 */
export class StrategyFactory {
  private strategies: VariantResolutionStrategy[];

  constructor() {
    this.strategies = [
      new InteractiveStateStrategy(),
      new NavigationStrategy(),
      new TabStrategy()
    ];
  }

  /**
   * Gets strategies that can handle the given pattern
   */
  getStrategiesForPattern(pattern: string): VariantResolutionStrategy[] {
    return this.strategies.filter(strategy => strategy.canHandle(pattern));
  }

  /**
   * Register a custom strategy
   */
  registerStrategy(strategy: VariantResolutionStrategy): void {
    this.strategies.push(strategy);
  }
}
