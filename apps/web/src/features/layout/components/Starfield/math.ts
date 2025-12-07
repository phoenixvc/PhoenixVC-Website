// components/Layout/Starfield/math.ts

/** Two times PI - full circle in radians (also known as TAU) */
export const TWO_PI = Math.PI * 2;

/** Half of PI - quarter circle */
export const HALF_PI = Math.PI / 2;

/** Degrees to radians conversion factor */
export const DEG_TO_RAD = Math.PI / 180;

/** Radians to degrees conversion factor */
export const RAD_TO_DEG = 180 / Math.PI;

// ==========================================
// Trigonometric Lookup Tables
// ==========================================

/** Number of entries in the lookup table (1024 gives ~0.35 degree precision) */
const TRIG_TABLE_SIZE = 1024;

/** Pre-computed multiplier for converting radians to table index */
const TRIG_TABLE_FACTOR = TRIG_TABLE_SIZE / TWO_PI;

/** Pre-computed sine lookup table */
const SIN_TABLE = new Float32Array(TRIG_TABLE_SIZE);

/** Pre-computed cosine lookup table */
const COS_TABLE = new Float32Array(TRIG_TABLE_SIZE);

// Initialize lookup tables
for (let i = 0; i < TRIG_TABLE_SIZE; i++) {
  const angle = (i / TRIG_TABLE_SIZE) * TWO_PI;
  SIN_TABLE[i] = Math.sin(angle);
  COS_TABLE[i] = Math.cos(angle);
}

/**
 * Fast sine approximation using lookup table.
 * Accuracy: ~0.35 degrees, suitable for visual effects.
 * @param radians Angle in radians
 * @returns Approximate sine value
 */
export function fastSin(radians: number): number {
  // Normalize angle to 0-2PI range
  const normalized = ((radians % TWO_PI) + TWO_PI) % TWO_PI;
  const index = (normalized * TRIG_TABLE_FACTOR) | 0; // Bitwise OR for fast floor
  return SIN_TABLE[index];
}

/**
 * Fast cosine approximation using lookup table.
 * Accuracy: ~0.35 degrees, suitable for visual effects.
 * @param radians Angle in radians
 * @returns Approximate cosine value
 */
export function fastCos(radians: number): number {
  // Normalize angle to 0-2PI range
  const normalized = ((radians % TWO_PI) + TWO_PI) % TWO_PI;
  const index = (normalized * TRIG_TABLE_FACTOR) | 0;
  return COS_TABLE[index];
}

/**
 * Fast sine and cosine together (slightly more efficient than calling both separately).
 * @param radians Angle in radians
 * @returns Object with sin and cos values
 */
export function fastSinCos(radians: number): { sin: number; cos: number } {
  const normalized = ((radians % TWO_PI) + TWO_PI) % TWO_PI;
  const index = (normalized * TRIG_TABLE_FACTOR) | 0;
  return { sin: SIN_TABLE[index], cos: COS_TABLE[index] };
}

// Calculate distance between two points
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

// Calculate squared distance (faster - avoids sqrt, use for comparisons)
export const distanceSquared = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  };

  // Linear interpolation between two values
  export const lerp = (start: number, end: number, t: number): number => {
    return start * (1 - t) + end * t;
  };

  // Map a value from one range to another
  export const map = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  // Calculate angle between two points
  export const angle = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.atan2(y2 - y1, x2 - x1);
  };

  // Convert degrees to radians
  export const degToRad = (degrees: number): number => {
    return degrees * DEG_TO_RAD;
  };

  // Convert radians to degrees
  export const radToDeg = (radians: number): number => {
    return radians * RAD_TO_DEG;
  };

  // Random number between min and max
  export const random = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };

  // Random integer between min and max (inclusive)
  export const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
