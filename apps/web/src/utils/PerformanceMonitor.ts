// utils/PerformanceMonitor.ts
// Comprehensive performance monitoring for canvas animations and rendering
// Used to decide whether features should be enabled/disabled based on device capability

import { logger as rootLogger, type ILogger } from './ILogger';

// Performance thresholds
export interface PerformanceThresholds {
  targetFps: number;           // Target FPS (default: 60)
  minAcceptableFps: number;    // Below this, consider disabling features (default: 30)
  criticalFps: number;         // Below this, aggressively disable features (default: 20)
  maxFrameTime: number;        // Maximum acceptable frame time in ms (default: 16.67)
  criticalFrameTime: number;   // Critical frame time threshold (default: 33.33)
  jankThreshold: number;       // Frame time variance threshold for jank detection (default: 10ms)
}

// Performance rating based on current metrics
export type PerformanceRating = 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';

// Metrics snapshot
export interface PerformanceMetrics {
  currentFps: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  averageFrameTime: number;
  maxFrameTime: number;
  jankCount: number;           // Number of frames that exceeded jank threshold
  droppedFrames: number;       // Estimated dropped frames
  sampleCount: number;
  rating: PerformanceRating;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timestamp: number;
}

// Section timing for detailed profiling
export interface SectionMetrics {
  name: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  percentOfFrame: number;
  samples: number;
}

// Performance recommendation
export interface PerformanceRecommendation {
  feature: string;
  action: 'enable' | 'disable' | 'reduce';
  reason: string;
  priority: number;  // 1-10, higher = more important
}

// Event callbacks
export type PerformanceEventCallback = (metrics: PerformanceMetrics) => void;
export type RecommendationCallback = (recommendations: PerformanceRecommendation[]) => void;

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  targetFps: 60,
  minAcceptableFps: 30,
  criticalFps: 20,
  maxFrameTime: 16.67,        // 60fps budget
  criticalFrameTime: 33.33,   // 30fps budget
  jankThreshold: 10,          // 10ms variance = jank
};

const SAMPLE_SIZE = 300;      // ~5 seconds at 60fps
const REPORT_INTERVAL = 5000; // Report every 5 seconds
const MAX_SECTIONS = 20;      // Memory protection: limit tracked sections

class PerformanceMonitorImpl {
  private logger: ILogger;
  private enabled = false;
  private thresholds: PerformanceThresholds;

  // Frame tracking
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private startTime = 0;
  private lastReportTime = 0;

  // Section profiling
  private sectionTimings: Map<string, number[]> = new Map();
  private currentSectionStarts: Map<string, number> = new Map();

  // Performance tracking
  private jankCount = 0;
  private droppedFrames = 0;

  // Callbacks - using Sets for multiple subscribers (consistent with FeatureFlags pattern)
  private metricsCallbacks: Set<PerformanceEventCallback> = new Set();
  private recommendationCallbacks: Set<RecommendationCallback> = new Set();

  // Auto-adjustment tracking
  private consecutivePoorFrames = 0;
  private consecutiveGoodFrames = 0;
  private autoAdjustEnabled = true;

  constructor() {
    this.logger = rootLogger.createChild('PerfMon');
    this.thresholds = { ...DEFAULT_THRESHOLDS };
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.reset();
      this.logger.info('Performance monitoring enabled');
    } else {
      this.logger.info('Performance monitoring disabled');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set custom performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    this.logger.debug('Thresholds updated', this.thresholds);
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  /**
   * Enable/disable auto-adjustment recommendations
   */
  setAutoAdjustEnabled(enabled: boolean): void {
    this.autoAdjustEnabled = enabled;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.startTime = performance.now();
    this.lastReportTime = performance.now();
    this.sectionTimings.clear();
    this.currentSectionStarts.clear();
    this.jankCount = 0;
    this.droppedFrames = 0;
    this.consecutivePoorFrames = 0;
    this.consecutiveGoodFrames = 0;
  }

  /**
   * Mark the start of a frame
   */
  startFrame(): void {
    if (!this.enabled) return;

    const now = performance.now();
    if (this.lastFrameTime > 0) {
      const frameTime = now - this.lastFrameTime;
      this.recordFrameTime(frameTime);
    }
    this.lastFrameTime = now;
  }

  /**
   * Mark the end of a frame
   */
  endFrame(): void {
    if (!this.enabled) return;

    this.frameCount++;
    this.currentSectionStarts.clear();

    // Check if we should output a report
    const now = performance.now();
    if (now - this.lastReportTime >= REPORT_INTERVAL) {
      this.generateReport();
      this.lastReportTime = now;
    }
  }

  /**
   * Start timing a specific section
   */
  startSection(name: string): void {
    if (!this.enabled) return;
    this.currentSectionStarts.set(name, performance.now());
  }

  /**
   * End timing a specific section
   */
  endSection(name: string): void {
    if (!this.enabled) return;

    const start = this.currentSectionStarts.get(name);
    if (start === undefined) return;

    const duration = performance.now() - start;

    let samples = this.sectionTimings.get(name);
    if (!samples) {
      // Memory protection: limit number of tracked sections
      if (this.sectionTimings.size >= MAX_SECTIONS) {
        // Find and remove the section with the oldest/fewest samples
        let minSamples = Infinity;
        let oldestSection = '';
        this.sectionTimings.forEach((s, n) => {
          if (s.length < minSamples) {
            minSamples = s.length;
            oldestSection = n;
          }
        });
        if (oldestSection) {
          this.sectionTimings.delete(oldestSection);
          this.logger.debug(`Removed stale section '${oldestSection}' to make room for '${name}'`);
        }
      }
      samples = [];
      this.sectionTimings.set(name, samples);
    }

    samples.push(duration);
    if (samples.length > SAMPLE_SIZE) {
      samples.shift();
    }
  }

  /**
   * Convenience method to time a function
   */
  timeSection<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn();

    this.startSection(name);
    const result = fn();
    this.endSection(name);
    return result;
  }

  /**
   * Async version of timeSection
   */
  async timeSectionAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();

    this.startSection(name);
    const result = await fn();
    this.endSection(name);
    return result;
  }

  /**
   * Record a frame time manually (useful if not using start/endFrame)
   */
  recordFrameTime(frameTime: number): void {
    if (!this.enabled) return;

    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > SAMPLE_SIZE) {
      this.frameTimes.shift();
    }

    // Track jank
    if (frameTime > this.thresholds.maxFrameTime + this.thresholds.jankThreshold) {
      this.jankCount++;
    }

    // Estimate dropped frames
    if (frameTime > this.thresholds.maxFrameTime) {
      this.droppedFrames += Math.floor(frameTime / this.thresholds.maxFrameTime) - 1;
    }

    // Track consecutive poor/good frames for auto-adjustment
    const fps = 1000 / frameTime;
    if (fps < this.thresholds.minAcceptableFps) {
      this.consecutivePoorFrames++;
      this.consecutiveGoodFrames = 0;
    } else if (fps >= this.thresholds.targetFps * 0.9) {
      this.consecutiveGoodFrames++;
      this.consecutivePoorFrames = 0;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const frameTimes = this.frameTimes;

    if (frameTimes.length === 0) {
      return {
        currentFps: 0,
        averageFps: 0,
        minFps: 0,
        maxFps: 0,
        averageFrameTime: 0,
        maxFrameTime: 0,
        jankCount: 0,
        droppedFrames: 0,
        sampleCount: 0,
        rating: 'excellent',
        timestamp: Date.now(),
      };
    }

    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const maxFrameTime = Math.max(...frameTimes);
    const minFrameTime = Math.min(...frameTimes);

    const avgFps = 1000 / avgFrameTime;
    const minFps = 1000 / maxFrameTime;
    const maxFps = 1000 / minFrameTime;
    const currentFps = frameTimes.length > 0 ? 1000 / frameTimes[frameTimes.length - 1] : 0;

    const rating = this.calculateRating(avgFps, this.jankCount, frameTimes.length);

    const metrics: PerformanceMetrics = {
      currentFps,
      averageFps: avgFps,
      minFps,
      maxFps,
      averageFrameTime: avgFrameTime,
      maxFrameTime,
      jankCount: this.jankCount,
      droppedFrames: this.droppedFrames,
      sampleCount: frameTimes.length,
      rating,
      timestamp: Date.now(),
    };

    // Add memory info if available
    if ('memory' in performance) {
      const memInfo = (performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        }
      }).memory;
      if (memInfo) {
        metrics.memoryUsage = {
          usedJSHeapSize: memInfo.usedJSHeapSize,
          totalJSHeapSize: memInfo.totalJSHeapSize,
          jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
        };
      }
    }

    return metrics;
  }

  /**
   * Get section-specific metrics
   */
  getSectionMetrics(): SectionMetrics[] {
    const frameMetrics = this.getMetrics();
    const totalFrameTime = frameMetrics.averageFrameTime || 1;

    const sections: SectionMetrics[] = [];

    this.sectionTimings.forEach((samples, name) => {
      if (samples.length === 0) return;

      const avgTime = samples.reduce((a, b) => a + b, 0) / samples.length;
      const minTime = Math.min(...samples);
      const maxTime = Math.max(...samples);

      sections.push({
        name,
        avgTime,
        minTime,
        maxTime,
        percentOfFrame: (avgTime / totalFrameTime) * 100,
        samples: samples.length,
      });
    });

    // Sort by average time descending
    sections.sort((a, b) => b.avgTime - a.avgTime);

    return sections;
  }

  /**
   * Calculate performance rating
   */
  private calculateRating(avgFps: number, jankCount: number, sampleCount: number): PerformanceRating {
    const jankRate = sampleCount > 0 ? jankCount / sampleCount : 0;

    if (avgFps >= this.thresholds.targetFps * 0.95 && jankRate < 0.01) {
      return 'excellent';
    }
    if (avgFps >= this.thresholds.targetFps * 0.85 && jankRate < 0.05) {
      return 'good';
    }
    if (avgFps >= this.thresholds.minAcceptableFps && jankRate < 0.15) {
      return 'acceptable';
    }
    if (avgFps >= this.thresholds.criticalFps) {
      return 'poor';
    }
    return 'critical';
  }

  /**
   * Get recommendations for improving performance
   */
  getRecommendations(): PerformanceRecommendation[] {
    const metrics = this.getMetrics();
    const sections = this.getSectionMetrics();
    const recommendations: PerformanceRecommendation[] = [];

    // Critical performance - aggressive recommendations
    if (metrics.rating === 'critical') {
      recommendations.push({
        feature: 'starConnections',
        action: 'disable',
        reason: 'Critical FPS - disable expensive line drawing',
        priority: 10,
      });
      recommendations.push({
        feature: 'particleEffects',
        action: 'disable',
        reason: 'Critical FPS - disable particle effects',
        priority: 9,
      });
      recommendations.push({
        feature: 'starCount',
        action: 'reduce',
        reason: 'Critical FPS - reduce star count by 50%',
        priority: 8,
      });
    }

    // Poor performance - moderate recommendations
    if (metrics.rating === 'poor' || metrics.rating === 'critical') {
      recommendations.push({
        feature: 'sunEffects',
        action: 'reduce',
        reason: 'Low FPS - simplify sun rendering',
        priority: 7,
      });
      recommendations.push({
        feature: 'glowEffects',
        action: 'disable',
        reason: 'Low FPS - disable glow effects',
        priority: 6,
      });
    }

    // Check specific expensive sections
    sections.forEach(section => {
      if (section.percentOfFrame > 40) {
        recommendations.push({
          feature: section.name,
          action: 'reduce',
          reason: `${section.name} using ${section.percentOfFrame.toFixed(1)}% of frame budget`,
          priority: 5,
        });
      }
    });

    // Note: We intentionally do NOT recommend enabling offscreenCanvas here.
    // Offscreen canvas only benefits static or slowly-updating content.
    // In this starfield, all content moves every frame, so offscreen canvas
    // would add overhead without benefit. See useOffscreenCanvas.ts for details.

    // Sort by priority
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations;
  }

  /**
   * Check if offscreen canvas would be beneficial
   *
   * IMPORTANT: Offscreen canvas only helps for STATIC or SLOWLY-UPDATING content.
   * For content that changes every frame (like moving stars), it adds overhead.
   *
   * Good use cases:
   * - Static backgrounds (gradients, nebula images)
   * - UI layers that update infrequently
   * - Pre-rendered complex shapes
   *
   * Bad use cases:
   * - Moving particles/stars (changes every frame)
   * - Any content that needs full redraw each frame
   *
   * @returns false - Currently no static content in starfield that would benefit
   */
  shouldUseOffscreenCanvas(): boolean {
    // Currently returns false because all starfield content moves every frame.
    // If static backgrounds or UI layers are added, this could be reconsidered.
    // The check for OffscreenCanvas support is kept for when this is revisited.
    if (typeof OffscreenCanvas === 'undefined') return false;

    // TODO: Return true when static content layers are identified
    return false;
  }

  /**
   * Generate and output a performance report
   */
  generateReport(): void {
    const metrics = this.getMetrics();
    const sections = this.getSectionMetrics();

    this.logger.group('Performance Report');
    this.logger.info(`Rating: ${metrics.rating.toUpperCase()}`);
    this.logger.info(`Average FPS: ${metrics.averageFps.toFixed(1)} (min: ${metrics.minFps.toFixed(1)}, max: ${metrics.maxFps.toFixed(1)})`);
    this.logger.info(`Average Frame Time: ${metrics.averageFrameTime.toFixed(2)}ms (max: ${metrics.maxFrameTime.toFixed(2)}ms)`);
    this.logger.info(`Jank Count: ${metrics.jankCount} (${((metrics.jankCount / metrics.sampleCount) * 100).toFixed(1)}%)`);
    this.logger.info(`Dropped Frames: ${metrics.droppedFrames}`);

    if (sections.length > 0) {
      this.logger.group('Section Breakdown');
      sections.forEach(section => {
        this.logger.info(
          `${section.name}: ${section.avgTime.toFixed(2)}ms avg (${section.percentOfFrame.toFixed(1)}% of frame)`
        );
      });
      this.logger.groupEnd();
    }

    if (metrics.memoryUsage) {
      const usedMB = metrics.memoryUsage.usedJSHeapSize / 1024 / 1024;
      const totalMB = metrics.memoryUsage.totalJSHeapSize / 1024 / 1024;
      this.logger.info(`Memory: ${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB`);
    }

    const recommendations = this.getRecommendations();
    if (recommendations.length > 0) {
      this.logger.group('Recommendations');
      recommendations.forEach(rec => {
        this.logger.info(`[${rec.priority}] ${rec.action.toUpperCase()} ${rec.feature}: ${rec.reason}`);
      });
      this.logger.groupEnd();
    }

    this.logger.groupEnd();

    // Trigger callbacks (using Sets for multiple subscribers)
    this.metricsCallbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        this.logger.error('Error in metrics callback', error);
      }
    });

    // Trigger recommendation callbacks
    if (recommendations.length > 0) {
      this.recommendationCallbacks.forEach(callback => {
        try {
          callback(recommendations);
        } catch (error) {
          this.logger.error('Error in recommendations callback', error);
        }
      });
    }
  }

  /**
   * Register callback for metrics updates
   * @returns Unsubscribe function
   */
  onMetrics(callback: PerformanceEventCallback): () => void {
    this.metricsCallbacks.add(callback);
    return () => this.metricsCallbacks.delete(callback);
  }

  /**
   * Register callback for recommendations
   * @returns Unsubscribe function
   */
  onRecommendations(callback: RecommendationCallback): () => void {
    this.recommendationCallbacks.add(callback);
    return () => this.recommendationCallbacks.delete(callback);
  }

  /**
   * Get a summary string for debug display
   */
  getSummary(): string {
    const metrics = this.getMetrics();
    return `FPS: ${metrics.averageFps.toFixed(0)} | Frame: ${metrics.averageFrameTime.toFixed(1)}ms | Rating: ${metrics.rating}`;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitorImpl();

// Export types and class for testing
export { PerformanceMonitorImpl };
export default performanceMonitor;
