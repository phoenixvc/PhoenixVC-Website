// hooks/usePerformanceMonitoring.ts
// Hook to integrate performance monitoring with the animation loop

import { useCallback, useEffect, useRef } from 'react';
import { performanceMonitor, type PerformanceMetrics } from '../../../../../utils/PerformanceMonitor';
import { featureFlags, type FeatureFlagsState } from '../../../../../utils/FeatureFlags';
import { logger } from '../../../../../utils/ILogger';

interface UsePerformanceMonitoringProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  onFeatureFlagChange?: (flagName: string, enabled: boolean, value?: number) => void;
}

interface UsePerformanceMonitoringReturn {
  startFrame: () => void;
  endFrame: () => void;
  startSection: (name: string) => void;
  endSection: (name: string) => void;
  timeSection: <T>(name: string, fn: () => T) => T;
  getMetrics: () => PerformanceMetrics;
  isFeatureEnabled: (name: keyof FeatureFlagsState) => boolean;
  getFeatureValue: (name: keyof FeatureFlagsState) => number | undefined;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
}

export const usePerformanceMonitoring = ({
  enabled = true,
  onMetricsUpdate,
  onFeatureFlagChange,
}: UsePerformanceMonitoringProps = {}): UsePerformanceMonitoringReturn => {
  const perfLogger = useRef(logger.createChild('PerfHook'));

  // Enable monitoring on mount if requested
  useEffect(() => {
    if (enabled) {
      performanceMonitor.setEnabled(true);
      perfLogger.current.debug('Performance monitoring enabled');
    }

    return () => {
      // Don't disable on unmount as other components may still need it
    };
  }, [enabled]);

  // Subscribe to metrics updates
  useEffect(() => {
    if (onMetricsUpdate) {
      performanceMonitor.onMetrics(onMetricsUpdate);
    }
  }, [onMetricsUpdate]);

  // Subscribe to feature flag changes
  useEffect(() => {
    if (onFeatureFlagChange) {
      const unsubscribe = featureFlags.onChange((flagName, flag, _previousEnabled, _previousValue) => {
        onFeatureFlagChange(flagName, flag.enabled, flag.value);
      });

      return unsubscribe;
    }
  }, [onFeatureFlagChange]);

  const startFrame = useCallback(() => {
    performanceMonitor.startFrame();
  }, []);

  const endFrame = useCallback(() => {
    performanceMonitor.endFrame();
  }, []);

  const startSection = useCallback((name: string) => {
    performanceMonitor.startSection(name);
  }, []);

  const endSection = useCallback((name: string) => {
    performanceMonitor.endSection(name);
  }, []);

  const timeSection = useCallback(<T,>(name: string, fn: () => T): T => {
    return performanceMonitor.timeSection(name, fn);
  }, []);

  const getMetrics = useCallback(() => {
    return performanceMonitor.getMetrics();
  }, []);

  const isFeatureEnabled = useCallback((name: keyof FeatureFlagsState) => {
    return featureFlags.isEnabled(name);
  }, []);

  const getFeatureValue = useCallback((name: keyof FeatureFlagsState) => {
    return featureFlags.getValue(name);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    performanceMonitor.setEnabled(enabled);
  }, []);

  const isEnabled = useCallback(() => {
    return performanceMonitor.isEnabled();
  }, []);

  return {
    startFrame,
    endFrame,
    startSection,
    endSection,
    timeSection,
    getMetrics,
    isFeatureEnabled,
    getFeatureValue,
    setEnabled,
    isEnabled,
  };
};

export default usePerformanceMonitoring;
