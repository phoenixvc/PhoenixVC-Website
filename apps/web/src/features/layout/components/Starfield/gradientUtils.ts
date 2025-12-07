// gradientUtils.ts - Consolidated gradient creation utilities
// Eliminates repeated gradient patterns across animate.ts, stars.ts, Planets.ts, etc.

import { rgba, rgbToString } from "./colorUtils";

/**
 * Color stop definition for gradients
 */
export interface ColorStop {
  offset: number; // 0-1
  color: string; // CSS color string
}

/**
 * Create a radial gradient with color stops
 * Centralizes the common pattern found 50+ times across the codebase
 */
export function createRadialGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  colorStops: ColorStop[]
): CanvasGradient {
  const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
  for (const stop of colorStops) {
    gradient.addColorStop(stop.offset, stop.color);
  }
  return gradient;
}

/**
 * Create a linear gradient with color stops
 */
export function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  colorStops: ColorStop[]
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  for (const stop of colorStops) {
    gradient.addColorStop(stop.offset, stop.color);
  }
  return gradient;
}

/**
 * Create a glow gradient (common pattern for stars, suns, planets)
 * Center is brightest, fades to transparent
 */
export function createGlowGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rgbStr: string,
  centerOpacity: number = 1,
  midOpacity: number = 0.5,
  edgeOpacity: number = 0
): CanvasGradient {
  return createRadialGradient(ctx, x, y, 0, radius, [
    { offset: 0, color: rgba(rgbStr, centerOpacity) },
    { offset: 0.5, color: rgba(rgbStr, midOpacity) },
    { offset: 1, color: rgba(rgbStr, edgeOpacity) },
  ]);
}

/**
 * Create a halo gradient (soft outer glow)
 * Used for sun halos, planet glows, etc.
 */
export function createHaloGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  rgbStr: string,
  opacities: { inner: number; mid1: number; mid2: number; outer: number }
): CanvasGradient {
  return createRadialGradient(ctx, x, y, innerRadius, outerRadius, [
    { offset: 0, color: rgba(rgbStr, opacities.inner) },
    { offset: 0.3, color: rgba(rgbStr, opacities.mid1) },
    { offset: 0.6, color: rgba(rgbStr, opacities.mid2) },
    { offset: 1, color: rgba(rgbStr, opacities.outer) },
  ]);
}

/**
 * Create a 3D sphere gradient (creates illusion of depth)
 * Used for sun bodies, planet surfaces
 */
export function createSphereGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  baseColor: string,
  lightenedColors: string[],
  highlightOffset: { x: number; y: number } = { x: -0.25, y: -0.25 }
): CanvasGradient {
  // Gradient originates from highlight point, not center
  const highlightX = x + radius * highlightOffset.x;
  const highlightY = y + radius * highlightOffset.y;

  const gradient = ctx.createRadialGradient(
    highlightX,
    highlightY,
    0,
    x + radius * 0.1,
    y + radius * 0.1,
    radius
  );

  // Default color stops for 3D sphere effect
  gradient.addColorStop(0, "#ffffff");
  if (lightenedColors.length >= 2) {
    gradient.addColorStop(0.1, lightenedColors[0]);
    gradient.addColorStop(0.3, lightenedColors[1]);
  }
  gradient.addColorStop(0.55, baseColor);
  gradient.addColorStop(0.8, rgba(baseColor, 0.95));
  gradient.addColorStop(1, rgba(baseColor, 0.85));

  return gradient;
}

/**
 * Create a ring gradient (for chromosphere, hover rings, etc.)
 * Gradient that's transparent at edges, visible in middle
 */
export function createRingGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  color: string,
  peakOpacity: number = 0.8
): CanvasGradient {
  return createRadialGradient(ctx, x, y, innerRadius, outerRadius, [
    { offset: 0, color: rgba(color, 0) },
    { offset: 0.5, color: rgba(color, peakOpacity) },
    { offset: 1, color: rgba(color, 0) },
  ]);
}

/**
 * Create a trail/comet gradient
 * Used for planet trails, shooting stars
 */
export function createTrailGradient(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  rgbStr: string,
  startOpacity: number = 0.8,
  endOpacity: number = 0
): CanvasGradient {
  return createLinearGradient(ctx, startX, startY, endX, endY, [
    { offset: 0, color: rgba(rgbStr, startOpacity) },
    { offset: 0.3, color: rgba(rgbStr, startOpacity * 0.6) },
    { offset: 0.7, color: rgba(rgbStr, startOpacity * 0.2) },
    { offset: 1, color: rgba(rgbStr, endOpacity) },
  ]);
}

/**
 * Draw a filled circle with a radial gradient
 * Common pattern used dozens of times in the codebase
 */
export function drawGradientCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  gradient: CanvasGradient,
  globalAlpha: number = 1
): void {
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = globalAlpha;
  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = prevAlpha;
}

/**
 * Draw a stroked circle with a gradient
 */
export function drawGradientRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  gradient: CanvasGradient,
  lineWidth: number,
  globalAlpha: number = 1
): void {
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = globalAlpha;
  ctx.beginPath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = lineWidth;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = prevAlpha;
}

/**
 * Create color stops array from RGB and opacity array
 * Helper for common patterns
 */
export function createColorStops(
  rgbStr: string,
  opacities: Array<{ offset: number; opacity: number }>
): ColorStop[] {
  return opacities.map(({ offset, opacity }) => ({
    offset,
    color: rgba(rgbStr, opacity),
  }));
}

/**
 * Create a multi-layer glow effect
 * Used for stars and other glowing objects
 */
export function drawMultiLayerGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseRadius: number,
  rgbStr: string,
  layers: Array<{ radiusMultiplier: number; opacity: number }>
): void {
  for (const layer of layers) {
    const radius = baseRadius * layer.radiusMultiplier;
    const gradient = createGlowGradient(ctx, x, y, radius, rgbStr, layer.opacity, layer.opacity * 0.3, 0);
    drawGradientCircle(ctx, x, y, radius, gradient);
  }
}

/**
 * Pre-defined gradient presets for common use cases
 */
export const GradientPresets = {
  /**
   * Standard star glow
   */
  starGlow: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rgbStr: string) =>
    createGlowGradient(ctx, x, y, radius, rgbStr, 1, 0.3, 0),

  /**
   * Soft halo effect
   */
  softHalo: (ctx: CanvasRenderingContext2D, x: number, y: number, innerR: number, outerR: number, rgbStr: string) =>
    createHaloGradient(ctx, x, y, innerR, outerR, rgbStr, {
      inner: 0.15,
      mid1: 0.08,
      mid2: 0.03,
      outer: 0,
    }),

  /**
   * Bright halo (for highlighted elements)
   */
  brightHalo: (ctx: CanvasRenderingContext2D, x: number, y: number, innerR: number, outerR: number, rgbStr: string) =>
    createHaloGradient(ctx, x, y, innerR, outerR, rgbStr, {
      inner: 0.3,
      mid1: 0.15,
      mid2: 0.05,
      outer: 0,
    }),
} as const;
