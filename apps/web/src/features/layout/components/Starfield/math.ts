// components/Layout/Starfield/math.ts

/** Two times PI - full circle in radians (also known as TAU) */
export const TWO_PI = Math.PI * 2;

/** Half of PI - quarter circle */
export const HALF_PI = Math.PI / 2;

/** Degrees to radians conversion factor */
export const DEG_TO_RAD = Math.PI / 180;

/** Radians to degrees conversion factor */
export const RAD_TO_DEG = 180 / Math.PI;

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
