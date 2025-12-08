// performanceProfiler.ts - Rendering performance measurement
// Provides timing data to identify bottlenecks in the animation loop

interface ProfilerState {
  enabled: boolean;
  timings: Map<string, number[]>;
  currentFrame: Map<string, number>;
  frameCount: number;
  lastReportTime: number;
  reportInterval: number; // ms between reports
}

const state: ProfilerState = {
  enabled: false,
  timings: new Map(),
  currentFrame: new Map(),
  frameCount: 0,
  lastReportTime: 0,
  reportInterval: 5000, // Report every 5 seconds
};

// Rolling window size for averaging
const SAMPLE_SIZE = 300; // ~5 seconds at 60fps

/**
 * Enable or disable the profiler
 */
export function setProfilerEnabled(enabled: boolean): void {
  state.enabled = enabled;
  if (enabled) {
    state.timings.clear();
    state.frameCount = 0;
    state.lastReportTime = performance.now();
    console.log("[Profiler] Enabled - collecting rendering metrics");
  } else {
    console.log("[Profiler] Disabled");
  }
}

/**
 * Check if profiler is enabled
 */
export function isProfilerEnabled(): boolean {
  return state.enabled;
}

/**
 * Start timing a section
 */
export function startTiming(name: string): void {
  if (!state.enabled) return;
  state.currentFrame.set(name, performance.now());
}

/**
 * End timing a section and record the duration
 */
export function endTiming(name: string): void {
  if (!state.enabled) return;

  const start = state.currentFrame.get(name);
  if (start === undefined) return;

  const duration = performance.now() - start;

  let samples = state.timings.get(name);
  if (!samples) {
    samples = [];
    state.timings.set(name, samples);
  }

  samples.push(duration);

  // Keep rolling window
  if (samples.length > SAMPLE_SIZE) {
    samples.shift();
  }
}

/**
 * Mark the end of a frame and potentially output a report
 */
export function endFrame(): void {
  if (!state.enabled) return;

  state.frameCount++;
  state.currentFrame.clear();

  const now = performance.now();
  if (now - state.lastReportTime >= state.reportInterval) {
    outputReport();
    state.lastReportTime = now;
  }
}

/**
 * Get current metrics without outputting
 */
export function getMetrics(): Record<string, { avg: number; min: number; max: number; samples: number }> {
  const metrics: Record<string, { avg: number; min: number; max: number; samples: number }> = {};

  state.timings.forEach((samples, name) => {
    if (samples.length === 0) return;

    const sum = samples.reduce((a, b) => a + b, 0);
    const avg = sum / samples.length;
    const min = Math.min(...samples);
    const max = Math.max(...samples);

    metrics[name] = { avg, min, max, samples: samples.length };
  });

  return metrics;
}

/**
 * Output a formatted report to console
 */
export function outputReport(): void {
  const metrics = getMetrics();
  const entries = Object.entries(metrics);

  if (entries.length === 0) {
    console.log("[Profiler] No timing data collected");
    return;
  }

  // Sort by average time descending
  entries.sort((a, b) => b[1].avg - a[1].avg);

  // Calculate total frame time
  const totalEntry = entries.find(([name]) => name === "frame");
  const totalAvg = totalEntry ? totalEntry[1].avg : 0;

  console.log("\n[Profiler] Rendering Performance Report");
  console.log("═".repeat(60));
  console.log(`Frames: ${state.frameCount} | Sample size: ${SAMPLE_SIZE}`);
  console.log("─".repeat(60));
  console.log(`${"Section".padEnd(25)} ${"Avg (ms)".padStart(10)} ${"Min".padStart(8)} ${"Max".padStart(8)} ${"%".padStart(6)}`);
  console.log("─".repeat(60));

  entries.forEach(([name, data]) => {
    const pct = totalAvg > 0 ? ((data.avg / totalAvg) * 100).toFixed(1) : "-";
    console.log(
      `${name.padEnd(25)} ${data.avg.toFixed(3).padStart(10)} ${data.min.toFixed(3).padStart(8)} ${data.max.toFixed(3).padStart(8)} ${String(pct).padStart(6)}`
    );
  });

  console.log("─".repeat(60));

  // Performance assessment
  if (totalAvg > 16.67) {
    console.log("⚠️  Frame time exceeds 16.67ms (60fps budget)");
  } else if (totalAvg > 8) {
    console.log("⚡ Frame time okay but limited headroom");
  } else {
    console.log("✅ Frame time well within budget");
  }

  console.log("═".repeat(60) + "\n");
}

/**
 * Convenience wrapper to time a function
 */
export function timeFunction<T>(name: string, fn: () => T): T {
  if (!state.enabled) return fn();

  startTiming(name);
  const result = fn();
  endTiming(name);
  return result;
}
