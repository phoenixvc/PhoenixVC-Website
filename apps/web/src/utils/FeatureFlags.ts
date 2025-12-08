// utils/FeatureFlags.ts
// Centralized feature flag management with localStorage persistence
// Supports both boolean flags and numeric values for fine-grained control

import { logger as rootLogger, type ILogger } from './ILogger';
import { performanceMonitor, type PerformanceRecommendation } from './PerformanceMonitor';

// Feature flag categories for organization
export type FeatureCategory =
  | 'rendering'
  | 'effects'
  | 'interaction'
  | 'performance'
  | 'experimental';

// Feature flag definition
export interface FeatureFlag {
  name: string;
  category: FeatureCategory;
  description: string;
  enabled: boolean;
  value?: number;          // For numeric flags (e.g., particle count, opacity)
  minValue?: number;
  maxValue?: number;
  step?: number;
  defaultEnabled: boolean;
  defaultValue?: number;
  impactsPerformance: boolean;  // If true, may be auto-adjusted based on performance
  dependencies?: string[];      // Other flags this depends on
}

// All available feature flags
export interface FeatureFlagsState {
  // Rendering features
  starConnections: FeatureFlag;
  glowEffects: FeatureFlag;
  twinkleEffects: FeatureFlag;
  sunEffects: FeatureFlag;
  sunFlares: FeatureFlag;
  sunCorona: FeatureFlag;
  planetOrbits: FeatureFlag;
  planetSatellites: FeatureFlag;

  // Effects
  particleEffects: FeatureFlag;
  explosionEffects: FeatureFlag;
  rippleEffects: FeatureFlag;
  trailEffects: FeatureFlag;
  blackHoleEffects: FeatureFlag;

  // Interaction
  mouseInteraction: FeatureFlag;
  clickRepulsion: FeatureFlag;
  hoverEffects: FeatureFlag;

  // Performance
  offscreenCanvas: FeatureFlag;
  batchRendering: FeatureFlag;
  spatialIndexing: FeatureFlag;
  frameSkipping: FeatureFlag;

  // Experimental
  cosmicNavigation: FeatureFlag;
  gameMode: FeatureFlag;
  debugOverlay: FeatureFlag;
}

// Event types
export type FeatureFlagChangeCallback = (
  flagName: string,
  flag: FeatureFlag,
  previousEnabled: boolean,
  previousValue?: number
) => void;

const STORAGE_KEY = 'phoenixvc_featureFlags';

// Default feature flags - start with most features enabled for monitoring
const DEFAULT_FLAGS: FeatureFlagsState = {
  // Rendering - mostly enabled
  starConnections: {
    name: 'starConnections',
    category: 'rendering',
    description: 'Draw connection lines between nearby stars',
    enabled: true,
    value: 150,
    minValue: 50,
    maxValue: 300,
    step: 10,
    defaultEnabled: true,
    defaultValue: 150,
    impactsPerformance: true,
  },
  glowEffects: {
    name: 'glowEffects',
    category: 'rendering',
    description: 'Add glow effects to stars and celestial objects',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
  },
  twinkleEffects: {
    name: 'twinkleEffects',
    category: 'rendering',
    description: 'Animate star brightness variation',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: false,
  },
  sunEffects: {
    name: 'sunEffects',
    category: 'rendering',
    description: 'Render sun/focus area visual effects',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
  },
  sunFlares: {
    name: 'sunFlares',
    category: 'rendering',
    description: 'Render sun lens flare effects',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
    dependencies: ['sunEffects'],
  },
  sunCorona: {
    name: 'sunCorona',
    category: 'rendering',
    description: 'Render sun corona rays',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
    dependencies: ['sunEffects'],
  },
  planetOrbits: {
    name: 'planetOrbits',
    category: 'rendering',
    description: 'Draw orbital paths for portfolio planets',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: false,
  },
  planetSatellites: {
    name: 'planetSatellites',
    category: 'rendering',
    description: 'Render satellite moons around planets',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
  },

  // Effects - mostly enabled
  particleEffects: {
    name: 'particleEffects',
    category: 'effects',
    description: 'Enable particle systems for various effects',
    enabled: true,
    value: 100,
    minValue: 20,
    maxValue: 200,
    step: 10,
    defaultEnabled: true,
    defaultValue: 100,
    impactsPerformance: true,
  },
  explosionEffects: {
    name: 'explosionEffects',
    category: 'effects',
    description: 'Star explosion animations on click',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
    dependencies: ['particleEffects'],
  },
  rippleEffects: {
    name: 'rippleEffects',
    category: 'effects',
    description: 'Mouse click ripple animations',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
  },
  trailEffects: {
    name: 'trailEffects',
    category: 'effects',
    description: 'Comet and object trail rendering',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
  },
  blackHoleEffects: {
    name: 'blackHoleEffects',
    category: 'effects',
    description: 'Black hole gravity and visual effects',
    enabled: false,  // Disabled by default - expensive
    defaultEnabled: false,
    impactsPerformance: true,
  },

  // Interaction - mostly enabled
  mouseInteraction: {
    name: 'mouseInteraction',
    category: 'interaction',
    description: 'Enable mouse tracking and effects',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: false,
  },
  clickRepulsion: {
    name: 'clickRepulsion',
    category: 'interaction',
    description: 'Stars repel from click location',
    enabled: true,
    value: 100,
    minValue: 20,
    maxValue: 300,
    step: 10,
    defaultEnabled: true,
    defaultValue: 100,
    impactsPerformance: true,
    dependencies: ['mouseInteraction'],
  },
  hoverEffects: {
    name: 'hoverEffects',
    category: 'interaction',
    description: 'Effects when hovering over objects',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: false,
    dependencies: ['mouseInteraction'],
  },

  // Performance - configure based on device
  offscreenCanvas: {
    name: 'offscreenCanvas',
    category: 'performance',
    description: 'Use OffscreenCanvas for rendering (if available)',
    enabled: false,  // Start disabled, enable after performance baseline
    defaultEnabled: false,
    impactsPerformance: true,
  },
  batchRendering: {
    name: 'batchRendering',
    category: 'performance',
    description: 'Batch similar draw calls together',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
  },
  spatialIndexing: {
    name: 'spatialIndexing',
    category: 'performance',
    description: 'Use spatial indexing for collision detection',
    enabled: true,
    defaultEnabled: true,
    impactsPerformance: true,
  },
  frameSkipping: {
    name: 'frameSkipping',
    category: 'performance',
    description: 'Skip frames when behind on rendering',
    enabled: false,
    defaultEnabled: false,
    impactsPerformance: true,
  },

  // Experimental - mostly disabled
  cosmicNavigation: {
    name: 'cosmicNavigation',
    category: 'experimental',
    description: 'Enable cosmic zoom/pan navigation',
    enabled: false,
    defaultEnabled: false,
    impactsPerformance: true,
  },
  gameMode: {
    name: 'gameMode',
    category: 'experimental',
    description: 'Enable game scoring and interactions',
    enabled: false,
    defaultEnabled: false,
    impactsPerformance: false,
  },
  debugOverlay: {
    name: 'debugOverlay',
    category: 'experimental',
    description: 'Show debug information overlay',
    enabled: false,
    defaultEnabled: false,
    impactsPerformance: false,
  },
};

class FeatureFlagsManager {
  private logger: ILogger;
  private flags: FeatureFlagsState;
  private changeCallbacks: Set<FeatureFlagChangeCallback> = new Set();
  private autoAdjustEnabled = true;
  private performanceSubscribed = false;

  constructor() {
    this.logger = rootLogger.createChild('FeatureFlags');
    this.flags = this.loadFromStorage();
    this.subscribeToPerformance();
  }

  /**
   * Load flags from localStorage, falling back to defaults
   */
  private loadFromStorage(): FeatureFlagsState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<FeatureFlagsState>;
        // Merge with defaults to ensure all flags exist
        const merged = { ...DEFAULT_FLAGS };
        Object.keys(parsed).forEach(key => {
          const flagKey = key as keyof FeatureFlagsState;
          if (merged[flagKey] && parsed[flagKey]) {
            merged[flagKey] = {
              ...merged[flagKey],
              enabled: parsed[flagKey]!.enabled,
              value: parsed[flagKey]!.value ?? merged[flagKey].value,
            };
          }
        });
        this.logger.debug('Loaded feature flags from storage');
        return merged;
      }
    } catch (error) {
      this.logger.warn('Failed to load feature flags from storage', error);
    }
    return { ...DEFAULT_FLAGS };
  }

  /**
   * Save current flags to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      this.logger.warn('Failed to save feature flags to storage', error);
    }
  }

  /**
   * Subscribe to performance recommendations
   */
  private subscribeToPerformance(): void {
    if (this.performanceSubscribed) return;

    performanceMonitor.onRecommendations((recommendations) => {
      if (!this.autoAdjustEnabled) return;
      this.applyRecommendations(recommendations);
    });

    this.performanceSubscribed = true;
  }

  /**
   * Apply performance recommendations
   */
  private applyRecommendations(recommendations: PerformanceRecommendation[]): void {
    recommendations.forEach(rec => {
      const flagName = rec.feature as keyof FeatureFlagsState;
      const flag = this.flags[flagName];

      if (!flag || !flag.impactsPerformance) return;

      if (rec.action === 'disable' && flag.enabled) {
        this.logger.info(`Auto-disabling ${flagName}: ${rec.reason}`);
        this.setEnabled(flagName, false);
      } else if (rec.action === 'enable' && !flag.enabled) {
        this.logger.info(`Auto-enabling ${flagName}: ${rec.reason}`);
        this.setEnabled(flagName, true);
      } else if (rec.action === 'reduce' && flag.value !== undefined) {
        const newValue = flag.value * 0.75;
        const minValue = flag.minValue ?? 0;
        if (newValue >= minValue) {
          this.logger.info(`Auto-reducing ${flagName} to ${newValue.toFixed(0)}: ${rec.reason}`);
          this.setValue(flagName, newValue);
        }
      }
    });
  }

  /**
   * Get a specific flag
   */
  getFlag(name: keyof FeatureFlagsState): FeatureFlag {
    return { ...this.flags[name] };
  }

  /**
   * Get all flags
   */
  getAllFlags(): FeatureFlagsState {
    return JSON.parse(JSON.stringify(this.flags));
  }

  /**
   * Get flags by category
   */
  getFlagsByCategory(category: FeatureCategory): FeatureFlag[] {
    return Object.values(this.flags).filter(flag => flag.category === category);
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(name: keyof FeatureFlagsState): boolean {
    const flag = this.flags[name];
    if (!flag) return false;

    // Check dependencies
    if (flag.dependencies) {
      for (const dep of flag.dependencies) {
        if (!this.isEnabled(dep as keyof FeatureFlagsState)) {
          return false;
        }
      }
    }

    return flag.enabled;
  }

  /**
   * Get the value of a numeric flag
   */
  getValue(name: keyof FeatureFlagsState): number | undefined {
    return this.flags[name]?.value;
  }

  /**
   * Enable or disable a flag
   */
  setEnabled(name: keyof FeatureFlagsState, enabled: boolean): void {
    const flag = this.flags[name];
    if (!flag) {
      this.logger.warn(`Unknown feature flag: ${name}`);
      return;
    }

    const previousEnabled = flag.enabled;
    if (previousEnabled === enabled) return;

    flag.enabled = enabled;
    this.saveToStorage();
    this.notifyChange(name, flag, previousEnabled);
    this.logger.info(`Feature ${name} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set the value of a numeric flag
   */
  setValue(name: keyof FeatureFlagsState, value: number): void {
    const flag = this.flags[name];
    if (!flag || flag.value === undefined) {
      this.logger.warn(`Cannot set value for flag: ${name}`);
      return;
    }

    const previousValue = flag.value;
    const clampedValue = Math.max(
      flag.minValue ?? -Infinity,
      Math.min(flag.maxValue ?? Infinity, value)
    );

    if (previousValue === clampedValue) return;

    flag.value = clampedValue;
    this.saveToStorage();
    this.notifyChange(name, flag, flag.enabled, previousValue);
    this.logger.debug(`Feature ${name} value changed to ${clampedValue}`);
  }

  /**
   * Toggle a flag
   */
  toggle(name: keyof FeatureFlagsState): void {
    const flag = this.flags[name];
    if (flag) {
      this.setEnabled(name, !flag.enabled);
    }
  }

  /**
   * Reset a flag to its default value
   */
  resetFlag(name: keyof FeatureFlagsState): void {
    const defaultFlag = DEFAULT_FLAGS[name];
    if (!defaultFlag) return;

    const flag = this.flags[name];
    const previousEnabled = flag.enabled;
    const previousValue = flag.value;

    flag.enabled = defaultFlag.defaultEnabled;
    flag.value = defaultFlag.defaultValue;

    this.saveToStorage();
    this.notifyChange(name, flag, previousEnabled, previousValue);
    this.logger.info(`Feature ${name} reset to defaults`);
  }

  /**
   * Reset all flags to defaults
   */
  resetAll(): void {
    this.flags = JSON.parse(JSON.stringify(DEFAULT_FLAGS));
    this.saveToStorage();
    this.logger.info('All feature flags reset to defaults');

    // Notify all changes
    Object.keys(this.flags).forEach(key => {
      const flagKey = key as keyof FeatureFlagsState;
      this.notifyChange(flagKey, this.flags[flagKey], !this.flags[flagKey].enabled);
    });
  }

  /**
   * Enable/disable auto-adjustment based on performance
   */
  setAutoAdjustEnabled(enabled: boolean): void {
    this.autoAdjustEnabled = enabled;
    this.logger.info(`Auto-adjust ${enabled ? 'enabled' : 'disabled'}`);
  }

  isAutoAdjustEnabled(): boolean {
    return this.autoAdjustEnabled;
  }

  /**
   * Register a callback for flag changes
   */
  onChange(callback: FeatureFlagChangeCallback): () => void {
    this.changeCallbacks.add(callback);
    return () => this.changeCallbacks.delete(callback);
  }

  /**
   * Notify all registered callbacks of a change
   */
  private notifyChange(
    name: string,
    flag: FeatureFlag,
    previousEnabled: boolean,
    previousValue?: number
  ): void {
    this.changeCallbacks.forEach(callback => {
      try {
        callback(name, flag, previousEnabled, previousValue);
      } catch (error) {
        this.logger.error('Error in feature flag change callback', error);
      }
    });
  }

  /**
   * Get a summary of enabled/disabled flags for debugging
   */
  getSummary(): string {
    const enabled = Object.values(this.flags).filter(f => f.enabled).length;
    const total = Object.keys(this.flags).length;
    return `Features: ${enabled}/${total} enabled`;
  }

  /**
   * Export current configuration as JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.flags, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(json: string): void {
    try {
      const imported = JSON.parse(json) as Partial<FeatureFlagsState>;
      Object.keys(imported).forEach(key => {
        const flagKey = key as keyof FeatureFlagsState;
        if (this.flags[flagKey] && imported[flagKey]) {
          this.setEnabled(flagKey, imported[flagKey]!.enabled);
          if (imported[flagKey]!.value !== undefined) {
            this.setValue(flagKey, imported[flagKey]!.value!);
          }
        }
      });
      this.logger.info('Feature flags imported successfully');
    } catch (error) {
      this.logger.error('Failed to import feature flags', error);
    }
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagsManager();

// Export types and class for testing
export { FeatureFlagsManager };
export default featureFlags;
