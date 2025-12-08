// components/Layout/Starfield/PerformanceDebugPanel.tsx
// Integrated performance monitoring and feature toggle debug panel

import React, { useCallback, useEffect, useState } from 'react';
import {
  performanceMonitor,
  type PerformanceMetrics,
  type PerformanceRating,
  type SectionMetrics,
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

// Map section names to feature flags for linking metrics to features
const SECTION_TO_FLAG: Record<string, keyof FeatureFlagsState> = {
  stars: 'glowEffects',
  connections: 'starConnections',
  suns: 'sunEffects',
  particles: 'particleEffects',
};

// Colors for performance impact visualization
const IMPACT_COLORS = {
  low: '#0cce6b',      // Green - < 10% of frame
  medium: '#ffa400',   // Orange - 10-25% of frame
  high: '#ff6b35',     // Red-orange - 25-40% of frame
  critical: '#ff4e42', // Red - > 40% of frame
};

const getImpactColor = (percentOfFrame: number): string => {
  if (percentOfFrame < 10) return IMPACT_COLORS.low;
  if (percentOfFrame < 25) return IMPACT_COLORS.medium;
  if (percentOfFrame < 40) return IMPACT_COLORS.high;
  return IMPACT_COLORS.critical;
};

const getImpactLabel = (percentOfFrame: number): string => {
  if (percentOfFrame < 10) return 'Low';
  if (percentOfFrame < 25) return 'Medium';
  if (percentOfFrame < 40) return 'High';
  return 'Critical';
};

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
  const [sectionMetrics, setSectionMetrics] = useState<SectionMetrics[]>([]);
  const [flags, setFlags] = useState<FeatureFlagsState>(featureFlags.getAllFlags());
  const [autoAdjust, setAutoAdjust] = useState(featureFlags.isAutoAdjustEnabled());
  const [monitoringEnabled, setMonitoringEnabled] = useState(performanceMonitor.isEnabled());
  const [expandedCategories, setExpandedCategories] = useState<Set<FeatureCategory>>(
    new Set(['rendering', 'effects'])
  );
  const [showSectionBreakdown, setShowSectionBreakdown] = useState(true);

  // Update metrics periodically
  useEffect(() => {
    if (!isVisible || !monitoringEnabled) return;

    const updateMetrics = (): void => {
      setMetrics(performanceMonitor.getMetrics());
      setSectionMetrics(performanceMonitor.getSectionMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 500); // Update more frequently for responsiveness

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

        {/* Section Performance Breakdown */}
        {metrics && monitoringEnabled && sectionMetrics.length > 0 && (
          <div className={styles.debugInfoSection}>
            <h4
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setShowSectionBreakdown(!showSectionBreakdown)}
            >
              <span style={{ transform: showSectionBreakdown ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                ▶
              </span>
              SECTION BREAKDOWN
            </h4>
            {showSectionBreakdown && (
              <div style={{ marginTop: '8px' }}>
                {sectionMetrics
                  .filter((s) => s.name !== 'frame') // Skip total frame time
                  .map((section) => {
                    const impactColor = getImpactColor(section.percentOfFrame);
                    const impactLabel = getImpactLabel(section.percentOfFrame);
                    const linkedFlag = SECTION_TO_FLAG[section.name];
                    const isEnabled = linkedFlag ? featureFlags.isEnabled(linkedFlag) : true;

                    return (
                      <div
                        key={section.name}
                        style={{
                          marginBottom: '8px',
                          opacity: isEnabled ? 1 : 0.5,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                          <span style={{ textTransform: 'capitalize' }}>
                            {section.name}
                            {linkedFlag && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  featureFlags.toggle(linkedFlag);
                                }}
                                style={{
                                  marginLeft: '4px',
                                  padding: '1px 4px',
                                  fontSize: '8px',
                                  background: isEnabled ? '#444' : '#222',
                                  border: 'none',
                                  borderRadius: '2px',
                                  color: isEnabled ? '#fff' : '#666',
                                  cursor: 'pointer',
                                }}
                                title={isEnabled ? 'Click to disable' : 'Click to enable'}
                              >
                                {isEnabled ? 'ON' : 'OFF'}
                              </button>
                            )}
                          </span>
                          <span style={{ color: impactColor, fontWeight: 500 }}>
                            {section.avgTime.toFixed(2)}ms ({section.percentOfFrame.toFixed(1)}%)
                          </span>
                        </div>
                        {/* Impact bar */}
                        <div
                          style={{
                            height: '6px',
                            background: isDarkMode ? '#222' : '#eee',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, section.percentOfFrame)}%`,
                              background: impactColor,
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: isDarkMode ? '#555' : '#aaa', marginTop: '1px' }}>
                          <span>Impact: {impactLabel}</span>
                          <span>Min: {section.minTime.toFixed(2)}ms / Max: {section.maxTime.toFixed(2)}ms</span>
                        </div>
                      </div>
                    );
                  })}
                {/* Frame budget indicator */}
                <div style={{ marginTop: '12px', padding: '8px', background: isDarkMode ? '#1a1a1a' : '#f5f5f5', borderRadius: '4px' }}>
                  <div style={{ fontSize: '9px', color: isDarkMode ? '#888' : '#666', marginBottom: '4px' }}>
                    Frame Budget (16.67ms for 60fps)
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: isDarkMode ? '#333' : '#ddd',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {/* Budget segments */}
                    {sectionMetrics
                      .filter((s) => s.name !== 'frame')
                      .reduce<{ offset: number; sections: { name: string; width: number; color: string; offset: number }[] }>(
                        (acc, section) => {
                          const width = Math.min(section.percentOfFrame, 100 - acc.offset);
                          acc.sections.push({
                            name: section.name,
                            width,
                            color: getImpactColor(section.percentOfFrame),
                            offset: acc.offset,
                          });
                          acc.offset += width;
                          return acc;
                        },
                        { offset: 0, sections: [] }
                      )
                      .sections.map((seg) => (
                        <div
                          key={seg.name}
                          title={`${seg.name}: ${seg.width.toFixed(1)}%`}
                          style={{
                            position: 'absolute',
                            left: `${seg.offset}%`,
                            height: '100%',
                            width: `${seg.width}%`,
                            background: seg.color,
                          }}
                        />
                      ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: isDarkMode ? '#555' : '#aaa', marginTop: '2px' }}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
