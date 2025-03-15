// components/Layout/Starfield/utils.ts
import { distance as calculateDistance } from "./math";

// Calculate center point based on canvas dimensions and offsets
export const calculateCenter = (
  width: number,
  height: number,
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number
) => {
  const centerX = (width + sidebarWidth) / 2 + centerOffsetX;
  const centerY = height / 2 + centerOffsetY;
  return { centerX, centerY };
};

// Generate a random color
export const getRandomColor = (opacity: number = 1): string => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

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
  const dist = calculateDistance(starX, starY, pointX, pointY);

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
