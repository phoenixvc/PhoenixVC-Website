// components/Layout/Starfield/utils.ts

import { distance as mathDistance, distanceSquared, fastSin, fastCos } from "./math";

// Re-export distance from math.ts for backwards compatibility
export { distanceSquared };
export const distance = mathDistance;

// Apply gravitational effect from a point to a star
export const applyGravity = (
    starX: number,
    starY: number,
    starVx: number,
    starVy: number,
    starMass: number,
    pointX: number,
    pointY: number,
    pointMass: number,
    deltaTime: number
  ): { vx: number; vy: number } => {
    const dist = distance(starX, starY, pointX, pointY);

    // Avoid division by zero and extreme forces when very close
    const minDist = 50;
    if (dist < minDist) return { vx: starVx, vy: starVy };

    // Calculate gravitational force
    const force = (pointMass * starMass) / (dist * dist);
    const angle = Math.atan2(pointY - starY, pointX - starX);

    // Apply force to velocity (with time scaling)
    const forceX = fastCos(angle) * force * 0.0001 * deltaTime;
    const forceY = fastSin(angle) * force * 0.0001 * deltaTime;

    return {
      vx: starVx + forceX,
      vy: starVy + forceY
    };
  };

// Limit a value between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Ease a value toward a target value
export const easeToward = (current: number, target: number, factor: number, deltaTime: number): number => {
  const delta = target - current;
  return current + delta * factor * (deltaTime / 16);
};

// Easing functions for animations
export const easing = {
    // Cubic ease out
    easeOutCubic: (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    },

    // Elastic ease out
    easeOutElastic: (t: number): number => {
      const p = 0.3;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },

    // Bounce ease out
    easeOutBounce: (t: number): number => {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    }
  };
// components/Layout/Starfield/utils.ts

  // Calculate the center point of the canvas, accounting for sidebar and offsets
  export const calculateCenter = (
    width: number,
    height: number,
    sidebarWidth: number = 0,
    centerOffsetX: number = 0,
    centerOffsetY: number = 0
  ): { centerX: number; centerY: number } => {
    const effectiveWidth = width - sidebarWidth;
    const centerX = sidebarWidth + (effectiveWidth / 2) + centerOffsetX;
    const centerY = height / 2 + centerOffsetY;

    return { centerX, centerY };
  };

  // Generate a random color in RGB format
  export const randomColor = (baseColor: string = "purple", opacity: number = 0.8): string => {
    let r, g, b;

    if (baseColor === "purple") {
      // Purple variations
      r = Math.floor(Math.random() * 100) + 100; // 100-200
      g = Math.floor(Math.random() * 50) + 20;   // 20-70
      b = Math.floor(Math.random() * 100) + 150; // 150-250
    } else if (baseColor === "blue") {
      // Blue variations
      r = Math.floor(Math.random() * 50) + 20;   // 20-70
      g = Math.floor(Math.random() * 100) + 100; // 100-200
      b = Math.floor(Math.random() * 55) + 200;  // 200-255
    } else {
      // White/gray variations
      const value = Math.floor(Math.random() * 55) + 200; // 200-255
      r = g = b = value;
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // components/Layout/Starfield/utils.ts



// Linear interpolation between two values
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

// ==========================================
// Optimized Color Utilities
// ==========================================

/**
 * Parsed RGB color components
 */
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

// LRU-style cache for parsed colors (limited size to prevent memory issues)
const colorCache = new Map<string, ParsedColor | null>();
const COLOR_CACHE_MAX_SIZE = 100;

/**
 * Parse an rgba color string to RGB components with caching.
 * Returns null if the color cannot be parsed.
 *
 * @param color - rgba color string (e.g., "rgba(255, 100, 50, 0.8)")
 * @returns Parsed color components or null
 */
export function parseRgbaColor(color: string): ParsedColor | null {
  // Check cache first
  if (colorCache.has(color)) {
    return colorCache.get(color) ?? null;
  }

  let result: ParsedColor | null = null;

  if (color.startsWith("rgba(")) {
    // Parse rgba(r, g, b, a)
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      result = {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: parseFloat(match[4]),
      };
    }
  } else if (color.startsWith("rgb(")) {
    // Parse rgb(r, g, b)
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      result = {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: 1,
      };
    }
  }

  // Manage cache size
  if (colorCache.size >= COLOR_CACHE_MAX_SIZE) {
    // Remove oldest entry (first key)
    const firstKey = colorCache.keys().next().value;
    if (firstKey !== undefined) {
      colorCache.delete(firstKey);
    }
  }

  colorCache.set(color, result);
  return result;
}

/**
 * Create a brighter version of a color.
 * Optimized to avoid string parsing in hot paths.
 *
 * @param parsed - Pre-parsed color components
 * @param amount - How much to brighten (0-255)
 * @returns RGBA color string
 */
export function brightenColor(parsed: ParsedColor, amount: number = 100): string {
  const r = Math.min(255, parsed.r + amount);
  const g = Math.min(255, parsed.g + amount);
  const b = Math.min(255, parsed.b + amount);
  return `rgba(${r}, ${g}, ${b}, 1.0)`;
}

/**
 * Create a color string with modified alpha.
 * Optimized to avoid regex replacement in hot paths.
 *
 * @param parsed - Pre-parsed color components
 * @param alpha - New alpha value (0-1)
 * @returns RGBA color string
 */
export function colorWithAlpha(parsed: ParsedColor, alpha: number): string {
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
}

// ==========================================
// Seeded Random Number Generator
// ==========================================

/**
 * Simple seeded pseudo-random number generator using mulberry32 algorithm.
 * Produces deterministic sequences based on the seed value.
 *
 * @param seed - The seed value (integer)
 * @returns A function that returns the next random number (0-1)
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return function(): number {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a seed based on the current date.
 * Returns the same seed for all users on the same day.
 *
 * @returns A numeric seed based on the current date (UTC)
 */
export function getDailySeed(): number {
  const now = new Date();
  // Create a date string in YYYYMMDD format for consistent daily seed
  const dateStr = now.getUTCFullYear() * 10000 +
    (now.getUTCMonth() + 1) * 100 +
    now.getUTCDate();
  return dateStr;
}

/**
 * Get a seeded random generator for the current day.
 * All users visiting on the same day will get the same sequence.
 *
 * @param offset - Optional offset to create different sequences for different uses
 * @returns A seeded random function
 */
export function getDailySeededRandom(offset: number = 0): () => number {
  return createSeededRandom(getDailySeed() + offset);
}
