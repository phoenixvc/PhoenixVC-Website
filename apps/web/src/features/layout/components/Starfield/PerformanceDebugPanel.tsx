// components/Layout/Starfield/PerformanceDebugPanel.tsx
// Integrated performance monitoring and feature toggle debug panel

import React, { useCallback, useEffect, useState } from 'react';
import {
  performanceMonitor,
  type PerformanceMetrics,
  type PerformanceRating,
} from '../../../../utils/PerformanceMonitor';
import {
  featureFlags,
  type FeatureCategory,
  type FeatureFlag,
  type FeatureFlagsState,
} from '../../../../utils/FeatureFlags';
import styles from './debugControls.module.css';

interface PerformanceDebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
  sidebarWidth?: number;
  isDarkMode?: boolean;
}

const RATING_COLORS: Record<PerformanceRating, string> = {
  excellent: '#0cce6b',
  good: '#4CAF50',
  acceptable: '#ffa400',
  poor: '#ff6b35',
  critical: '#ff4e42',
};

const CATEGORY_ORDER: FeatureCategory[] = [
  'rendering',
  'effects',
  'interaction',
  'performance',
  'experimental',
];

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  rendering: 'Rendering',
  effects: 'Effects',
  interaction: 'Interaction',
  performance: 'Performance',
  experimental: 'Experimental',
};

const PerformanceDebugPanel: React.FC<PerformanceDebugPanelProps> = ({
  isVisible,
  onClose,
  sidebarWidth = 0,
  isDarkMode = true,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [flags, setFlags] = useState<FeatureFlagsState>(featureFlags.getAllFlags());
  const [autoAdjust, setAutoAdjust] = useState(featureFlags.isAutoAdjustEnabled());
  const [monitoringEnabled, setMonitoringEnabled] = useState(performanceMonitor.isEnabled());
  const [expandedCategories, setExpandedCategories] = useState<Set<FeatureCategory>>(
    new Set(['rendering', 'effects'])
  );

  // Update metrics periodically
  useEffect(() => {
    if (!isVisible || !monitoringEnabled) return;

    const updateMetrics = (): void => {
      setMetrics(performanceMonitor.getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [isVisible, monitoringEnabled]);

  // Subscribe to feature flag changes
  useEffect(() => {
    const unsubscribe = featureFlags.onChange(() => {
      setFlags(featureFlags.getAllFlags());
    });

    return unsubscribe;
  }, []);

  const handleToggleMonitoring = useCallback(() => {
    const newState = !monitoringEnabled;
    performanceMonitor.setEnabled(newState);
    setMonitoringEnabled(newState);
  }, [monitoringEnabled]);

  const handleToggleAutoAdjust = useCallback(() => {
    const newState = !autoAdjust;
    featureFlags.setAutoAdjustEnabled(newState);
    setAutoAdjust(newState);
  }, [autoAdjust]);

  const handleToggleFlag = useCallback((flagName: keyof FeatureFlagsState) => {
    featureFlags.toggle(flagName);
  }, []);

  const handleValueChange = useCallback(
    (flagName: keyof FeatureFlagsState, value: number) => {
      featureFlags.setValue(flagName, value);
    },
    []
  );

  const handleResetAll = useCallback(() => {
    featureFlags.resetAll();
  }, []);

  const handleExportConfig = useCallback(() => {
    const config = featureFlags.exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature-flags.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const toggleCategory = useCallback((category: FeatureCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  if (!isVisible) return null;

  const debugControlsClass = `${styles.debugControls} ${!isDarkMode ? styles.debugControlsLight : ''}`;

  const renderFeatureToggle = (flag: FeatureFlag): React.ReactNode => {
    const flagName = flag.name as keyof FeatureFlagsState;
    const isDisabledByDependency =
      flag.dependencies?.some(
        (dep) => !featureFlags.isEnabled(dep as keyof FeatureFlagsState)
      ) ?? false;

    return (
      <div key={flag.name} style={{ marginBottom: '8px', opacity: isDisabledByDependency ? 0.5 : 1 }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isDisabledByDependency ? 'not-allowed' : 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={flag.enabled && !isDisabledByDependency}
            disabled={isDisabledByDependency}
            onChange={() => handleToggleFlag(flagName)}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: isDisabledByDependency ? 'not-allowed' : 'pointer' }}
          />
          <span style={{ fontSize: '11px', flex: 1 }}>
            {flag.description}
            {flag.impactsPerformance && (
              <span style={{ color: '#ffa400', marginLeft: '4px' }} title="Impacts performance">
                *
              </span>
            )}
          </span>
        </label>
        {flag.value !== undefined && flag.enabled && !isDisabledByDependency && (
          <div style={{ marginTop: '4px', paddingLeft: '20px' }}>
            <input
              type="range"
              min={flag.minValue}
              max={flag.maxValue}
              step={flag.step}
              value={flag.value}
              onChange={(e) => handleValueChange(flagName, Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: '10px', color: isDarkMode ? '#aaa' : '#666' }}>
              {flag.value.toFixed(flag.step && flag.step < 1 ? 2 : 0)}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={styles.debugOverlayContainer}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={styles.debugIndicator}
        style={{ left: `${sidebarWidth + 10}px`, top: '80px' }}
        onClick={(e) => e.stopPropagation()}
      >
        Performance Debug
      </div>

      <div
        className={debugControlsClass}
        style={{
          left: `${sidebarWidth + 10}px`,
          top: '110px',
          maxHeight: '85vh',
          width: '280px',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3>Performance Monitor</h3>

        {/* Performance Metrics Section */}
        <div className={styles.debugInfoSection}>
          <h4>METRICS</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
              <input
                type="checkbox"
                checked={monitoringEnabled}
                onChange={handleToggleMonitoring}
                onClick={(e) => e.stopPropagation()}
              />
              Enable Monitoring
            </label>
          </div>

          {metrics && monitoringEnabled ? (
            <>
              <div className={styles.debugInfoGrid}>
                <div>
                  FPS:{' '}
                  <span style={{ color: RATING_COLORS[metrics.rating] }}>
                    {metrics.averageFps.toFixed(0)}
                  </span>
                </div>
                <div>
                  Rating:{' '}
                  <span style={{ color: RATING_COLORS[metrics.rating] }}>
                    {metrics.rating}
                  </span>
                </div>
                <div>Frame: {metrics.averageFrameTime.toFixed(1)}ms</div>
                <div>Max: {metrics.maxFrameTime.toFixed(1)}ms</div>
                <div>Jank: {metrics.jankCount}</div>
                <div>Dropped: {metrics.droppedFrames}</div>
              </div>

              {/* Performance bar */}
              <div style={{ marginTop: '8px' }}>
                <div
                  style={{
                    height: '4px',
                    background: isDarkMode ? '#333' : '#ddd',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (metrics.averageFps / 60) * 100)}%`,
                      background: RATING_COLORS[metrics.rating],
                      transition: 'width 0.3s, background 0.3s',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '9px',
                    color: isDarkMode ? '#666' : '#999',
                    marginTop: '2px',
                  }}
                >
                  <span>0</span>
                  <span>30</span>
                  <span>60 fps</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '11px', color: isDarkMode ? '#666' : '#999' }}>
              Monitoring disabled
            </div>
          )}
        </div>

        {/* Auto-Adjust Section */}
        <div className={styles.debugInfoSection}>
          <h4>AUTO-ADJUST</h4>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={autoAdjust}
              onChange={handleToggleAutoAdjust}
              onClick={(e) => e.stopPropagation()}
            />
            Auto-adjust features based on performance
          </label>
          <p style={{ fontSize: '10px', color: isDarkMode ? '#666' : '#999', margin: '4px 0 0 0' }}>
            Features marked with * will be automatically adjusted when performance degrades.
          </p>
        </div>

        {/* Feature Toggles Section */}
        <div className={styles.controlsSection}>
          <h4>FEATURE TOGGLES</h4>
          {CATEGORY_ORDER.map((category) => {
            const categoryFlags = Object.values(flags).filter((f) => f.category === category);
            const isExpanded = expandedCategories.has(category);
            const enabledCount = categoryFlags.filter((f) => f.enabled).length;

            return (
              <div key={category} style={{ marginBottom: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isDarkMode ? '#8a2be2' : '#6200ea',
                    cursor: 'pointer',
                    padding: '4px 0',
                    fontSize: '11px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▶
                  </span>
                  {CATEGORY_LABELS[category]}
                  <span style={{ color: isDarkMode ? '#666' : '#999', marginLeft: 'auto' }}>
                    {enabledCount}/{categoryFlags.length}
                  </span>
                </button>
                {isExpanded && (
                  <div style={{ paddingLeft: '12px', marginTop: '4px' }}>
                    {categoryFlags.map(renderFeatureToggle)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className={styles.debugButtons}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetAll();
            }}
          >
            Reset All
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExportConfig();
            }}
          >
            Export
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={styles.closeButton}
          >
            Close
          </button>
        </div>

        {/* Memory info if available */}
        {metrics?.memoryUsage && (
          <div style={{ marginTop: '8px', fontSize: '10px', color: isDarkMode ? '#666' : '#999' }}>
            Memory: {(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB /{' '}
            {(metrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDebugPanel;
