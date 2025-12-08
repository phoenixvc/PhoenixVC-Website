// utils/index.ts
// Central export point for utility modules

// Logger - export from ILogger as the primary logger
export { logger, Logger, type ILogger, type LogLevel, type LoggerConfig } from "./ILogger";

// Performance Monitoring
export {
  performanceMonitor,
  type PerformanceMetrics,
  type PerformanceRating,
  type PerformanceThresholds,
  type SectionMetrics,
  type PerformanceRecommendation,
} from "./PerformanceMonitor";

// Feature Flags
export {
  featureFlags,
  type FeatureFlag,
  type FeatureCategory,
  type FeatureFlagsState,
  type FrameSnapshot,
} from "./FeatureFlags";

// Web Vitals
export { initWebVitals, type WebVitalsConfig, type WebVitalsMetric } from "./performance";
