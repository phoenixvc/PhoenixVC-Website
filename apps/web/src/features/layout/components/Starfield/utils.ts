// components/Layout/Starfield/utils.ts
import { distance as calculateDistance } from "./math";

// Calculate distance between two points
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

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
  ) => {
    const dist = distance(starX, starY, pointX, pointY);

    // Avoid division by zero and extreme forces when very close
    const minDist = 50;
    if (dist < minDist) return { vx: starVx, vy: starVy };

    // Calculate gravitational force
    const force = (pointMass * starMass) / (dist * dist);
    const angle = Math.atan2(pointY - starY, pointX - starX);

    // Apply force to velocity (with time scaling)
    const forceX = Math.cos(angle) * force * 0.0001 * deltaTime;
    const forceY = Math.sin(angle) * force * 0.0001 * deltaTime;

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
