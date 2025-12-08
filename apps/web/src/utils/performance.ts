// utils/performance.ts
// Core Web Vitals monitoring utility
import { logger } from "./logger";

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType?: string;
}

interface WebVitalsConfig {
  endpoint?: string;
  debug?: boolean;
  sampleRate?: number; // 0-1, percentage of sessions to report
}

type ReportCallback = (metric: WebVitalsMetric) => void;

// Thresholds based on Google's Core Web Vitals guidelines (2024)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (replaces FID)
  FID: { good: 100, poor: 300 }, // First Input Delay (deprecated, kept for fallback)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

const getRating = (
  name: string,
  value: number,
): "good" | "needs-improvement" | "poor" => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
};

// Report to console in development
const defaultReporter: ReportCallback = (metric): void => {
  if (import.meta.env.DEV) {
    const color =
      metric.rating === "good"
        ? "#0cce6b"
        : metric.rating === "needs-improvement"
          ? "#ffa400"
          : "#ff4e42";

    logger.debug(
      `[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}${metric.name === "CLS" ? "" : "ms"} (${metric.rating})`,
    );

    // Also log to console with color for better visibility in dev
    if (typeof console !== "undefined" && console.log) {
      console.log(
        `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}${metric.name === "CLS" ? "" : "ms"} (${metric.rating})`,
        `color: ${color}; font-weight: bold;`,
      );
    }
  }
};

// Send metrics to an analytics endpoint
// Default sample rate of 10% to reduce noise in production
const createEndpointReporter = (
  endpoint: string,
  sampleRate = 0.1,
): ReportCallback => {
  // Determine if this session should be sampled
  const shouldSample = Math.random() < sampleRate;

  return (metric): void => {
    if (!shouldSample) return;

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    });

    // Use sendBeacon for reliability during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      // Fallback to fetch
      fetch(endpoint, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch((err) => {
        logger.error("[Web Vitals] Failed to send metrics:", err);
      });
    }
  };
};

// Observer for Largest Contentful Paint
const observeLCP = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list): void => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number;
      };

      const metric: WebVitalsMetric = {
        name: "LCP",
        value: lastEntry.startTime,
        rating: getRating("LCP", lastEntry.startTime),
        delta: lastEntry.startTime,
        id: `lcp-${Date.now()}`,
      };
      callback(metric);
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (_e) {
    // Silently fail if not supported
  }
};

// Observer for First Input Delay
const observeFID = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list): void => {
      const entries = list.getEntries() as (PerformanceEntry & {
        processingStart: number;
        startTime: number;
      })[];

      entries.forEach((entry): void => {
        const fid = entry.processingStart - entry.startTime;
        const metric: WebVitalsMetric = {
          name: "FID",
          value: fid,
          rating: getRating("FID", fid),
          delta: fid,
          id: `fid-${Date.now()}`,
        };
        callback(metric);
      });
    });

    observer.observe({ type: "first-input", buffered: true });
  } catch (_e) {
    // Silently fail if not supported
  }
};

// Observer for Cumulative Layout Shift
const observeCLS = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list): void => {
      const entries = list.getEntries() as (PerformanceEntry & {
        hadRecentInput: boolean;
        value: number;
      })[];

      entries.forEach((entry): void => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      const metric: WebVitalsMetric = {
        name: "CLS",
        value: clsValue,
        rating: getRating("CLS", clsValue),
        delta: clsValue,
        id: `cls-${Date.now()}`,
      };
      callback(metric);
    });

    observer.observe({ type: "layout-shift", buffered: true });
  } catch (_e) {
    // Silently fail if not supported
  }
};

// Observer for First Contentful Paint
const observeFCP = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list): void => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === "first-contentful-paint",
      ) as PerformanceEntry & { startTime: number };

      if (fcpEntry) {
        const metric: WebVitalsMetric = {
          name: "FCP",
          value: fcpEntry.startTime,
          rating: getRating("FCP", fcpEntry.startTime),
          delta: fcpEntry.startTime,
          id: `fcp-${Date.now()}`,
        };
        callback(metric);
      }
    });

    observer.observe({ type: "paint", buffered: true });
  } catch (_e) {
    // Silently fail if not supported
  }
};

// Observer for Interaction to Next Paint (INP) - replaces FID as Core Web Vital
const observeINP = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    // Track all interactions and report the worst one
    let maxINP = 0;
    let reported = false;

    const observer = new PerformanceObserver((list): void => {
      const entries = list.getEntries() as (PerformanceEntry & {
        duration: number;
        interactionId?: number;
        processingStart: number;
        processingEnd: number;
        startTime: number;
      })[];

      entries.forEach((entry): void => {
        // Only consider entries with an interaction ID (real user interactions)
        if (entry.interactionId && entry.duration > maxINP) {
          maxINP = entry.duration;
        }
      });
      // Don't report here - only report final value on visibility change
    });

    // Observe event timing entries
    observer.observe({
      type: "event",
      buffered: true,
      durationThreshold: 16,
    } as PerformanceObserverInit);

    // Report final INP value when page is hidden
    document.addEventListener("visibilitychange", (): void => {
      if (document.visibilityState === "hidden" && !reported && maxINP > 0) {
        reported = true;
        const metric: WebVitalsMetric = {
          name: "INP",
          value: maxINP,
          rating: getRating("INP", maxINP),
          delta: maxINP,
          id: `inp-final-${Date.now()}`,
        };
        callback(metric);
      }
    });
  } catch (_e) {
    // INP observation not supported, fall back to FID
    logger.debug("[Web Vitals] INP not supported, using FID fallback");
  }
};

// Initialize all Core Web Vitals observers
export const initWebVitals = (
  config?: WebVitalsConfig | ReportCallback,
): void => {
  let reporter: ReportCallback;

  // Handle both old signature (callback) and new signature (config)
  if (typeof config === "function") {
    reporter = config;
  } else if (config?.endpoint) {
    // Create endpoint reporter if endpoint is provided
    const endpointReporter = createEndpointReporter(
      config.endpoint,
      config.sampleRate,
    );
    reporter = (metric): void => {
      // Always log in dev mode
      if (config.debug || import.meta.env.DEV) {
        defaultReporter(metric);
      }
      // Send to endpoint
      endpointReporter(metric);
    };
  } else {
    reporter = defaultReporter;
  }

  const initObservers = (): void => {
    observeLCP(reporter);
    observeINP(reporter); // INP replaces FID as primary interaction metric
    observeFID(reporter); // Keep FID for browsers that don't support INP
    observeCLS(reporter);
    observeFCP(reporter);
  };

  // Wait for page to be fully loaded
  if (document.readyState === "complete") {
    initObservers();
  } else {
    window.addEventListener("load", initObservers);
  }
};

// Export for use in creating custom reporters
export { createEndpointReporter };
export type { WebVitalsMetric, WebVitalsConfig };
export default initWebVitals;
