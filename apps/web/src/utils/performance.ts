// utils/performance.ts
// Core Web Vitals monitoring utility

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

type ReportCallback = (metric: WebVitalsMetric) => void;

// Thresholds based on Google's Core Web Vitals guidelines
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

const getRating = (name: string, value: number): "good" | "needs-improvement" | "poor" => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
};

// Report to console in development
const defaultReporter: ReportCallback = (metric) => {
  if (import.meta.env.DEV) {
    const color = metric.rating === "good" ? "#0cce6b"
      : metric.rating === "needs-improvement" ? "#ffa400"
      : "#ff4e42";

    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
};

// Observer for Largest Contentful Paint
const observeLCP = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };

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
  } catch (e) {
    // Silently fail if not supported
  }
};

// Observer for First Input Delay
const observeFID = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & { processingStart: number; startTime: number })[];

      entries.forEach((entry) => {
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
  } catch (e) {
    // Silently fail if not supported
  }
};

// Observer for Cumulative Layout Shift
const observeCLS = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[];

      entries.forEach((entry) => {
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
  } catch (e) {
    // Silently fail if not supported
  }
};

// Observer for First Contentful Paint
const observeFCP = (callback: ReportCallback): void => {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === "first-contentful-paint") as PerformanceEntry & { startTime: number };

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
  } catch (e) {
    // Silently fail if not supported
  }
};

// Initialize all Core Web Vitals observers
export const initWebVitals = (customReporter?: ReportCallback): void => {
  const reporter = customReporter || defaultReporter;

  // Wait for page to be fully loaded
  if (document.readyState === "complete") {
    observeLCP(reporter);
    observeFID(reporter);
    observeCLS(reporter);
    observeFCP(reporter);
  } else {
    window.addEventListener("load", () => {
      observeLCP(reporter);
      observeFID(reporter);
      observeCLS(reporter);
      observeFCP(reporter);
    });
  }
};

export default initWebVitals;
