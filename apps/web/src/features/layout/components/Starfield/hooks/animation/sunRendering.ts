// sunRendering.ts - Sun rendering orchestration
// Single Responsibility: Orchestrate sun drawing by combining all visual layers

import { Planet } from "../../types";
import { fastSin } from "../../math";
import {
  getSunStates,
  initializeSunStates,
  updateSunPhysics,
  updateSunSizesFromPlanets,
} from "../../sunSystem";
import {
  SUN_RENDERING_CONFIG,
  SUN_ICON_CONFIG,
  OPACITY_CONFIG,
} from "../../renderingConfig";
import { drawSunIcon } from "./focusAreaIcons";

// Import state management from sunState module
import {
  resetAnimationModuleState,
  getFocusAreaSuns,
  checkSunHover,
  getCurrentSunPositions,
  isSunSystemInitialized,
  areSunSizesCalculated,
  markSunSystemInitialized,
  markSunSizesCalculated,
} from "./sunState";

// Import layer drawing functions from sunLayers module
import {
  drawSunHalo,
  drawSunAtmosphere,
  drawSolarFlares,
  drawCoronaRays,
  drawChromosphere,
  drawPropelRings,
  drawSolarParticles,
  drawEjectedParticles,
  drawHoverRing,
  drawPhotosphere,
  drawSunBody,
  drawGranulation,
  drawHotspot,
  drawHighlights,
} from "./sunLayers";

// Re-export state management functions for backward compatibility
export {
  resetAnimationModuleState,
  getFocusAreaSuns,
  checkSunHover,
  getCurrentSunPositions,
};

/**
 * Draw suns (focus area orbital centers) on the canvas
 * Enhanced graphics with multiple layers, corona effects, and realistic appearance
 */
export function drawSuns(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isDarkMode: boolean,
  hoveredSunId?: string | null,
  deltaTime: number = 16,
  focusedSunId?: string | null,
  planets?: Planet[],
): void {
  const {
    sizeMultiplier,
    minSize,
    particles,
    ejectParticles,
    pulse,
    layers,
    flares,
    rays,
    propelRings,
    granulation,
    hoverRing,
  } = SUN_RENDERING_CONFIG;

  // Initialize sun system if needed
  if (!isSunSystemInitialized()) {
    initializeSunStates();
    markSunSystemInitialized();
  }

  // Calculate sun sizes based on planet masses (only once)
  if (!areSunSizesCalculated() && planets && planets.length > 0) {
    updateSunSizesFromPlanets(planets);
    markSunSizesCalculated();
  }

  // Update sun physics
  updateSunPhysics(deltaTime);

  const sunStates = getSunStates();

  ctx.save();

  // Enable smooth rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  sunStates.forEach((sunState) => {
    // If a sun is focused, only render that sun (hide others for cleaner zoom view)
    if (focusedSunId && focusedSunId !== sunState.id) {
      return;
    }

    // Use dynamic position from sun system
    const x = sunState.x * width;
    const y = sunState.y * height;
    const baseSize = Math.max(
      minSize,
      Math.min(width, height) * sunState.size * sizeMultiplier,
    );

    // Check if this sun is hovered or focused
    const isHovered = hoveredSunId === sunState.id;
    const isFocused = focusedSunId === sunState.id;
    const isHighlighted = isHovered || isFocused;

    // Check if sun is in propel mode (avoiding collision)
    const isPropelling = sunState.isPropelling;

    // Smoother multi-layered pulsating effect
    const pulseSpeed1 = isHighlighted
      ? pulse.speed1.highlighted
      : pulse.speed1.normal;
    const pulseSpeed2 = isHighlighted
      ? pulse.speed2.highlighted
      : pulse.speed2.normal;
    const pulseSpeed3 = isHighlighted
      ? pulse.speed3.highlighted
      : pulse.speed3.normal;
    const pulseAmount = isHighlighted
      ? pulse.amount.highlighted
      : isPropelling
        ? pulse.amount.propelling
        : pulse.amount.normal;
    const pulse1 = 1 + pulseAmount * fastSin(time * pulseSpeed1);
    const pulse2 =
      1 + pulseAmount * 0.6 * fastSin(time * pulseSpeed2 + Math.PI / 3);
    const pulse3 =
      1 + pulseAmount * 0.4 * fastSin(time * pulseSpeed3 + Math.PI / 1.5);
    const pulseValue = (pulse1 + pulse2 + pulse3) / 3;
    const size =
      baseSize * pulseValue * (isHighlighted ? pulse.highlightScale : 1);

    // Use pre-computed RGB values from SunState to avoid parsing hex every frame
    const rgbStr = sunState.colorRgbStr;
    const secondaryRgbStr = sunState.secondaryRgbStr;

    // Draw all sun layers in order (back to front)
    drawSunHalo(ctx, x, y, size, rgbStr, isHighlighted, isDarkMode, layers);
    drawSunAtmosphere(
      ctx,
      x,
      y,
      size,
      rgbStr,
      secondaryRgbStr,
      isHighlighted,
      isDarkMode,
      layers,
    );
    drawSolarFlares(
      ctx,
      x,
      y,
      size,
      time,
      sunState,
      rgbStr,
      secondaryRgbStr,
      isHighlighted,
      isDarkMode,
      flares,
    );
    drawCoronaRays(
      ctx,
      x,
      y,
      size,
      time,
      sunState,
      rgbStr,
      secondaryRgbStr,
      isHighlighted,
      isDarkMode,
      rays,
    );
    drawChromosphere(
      ctx,
      x,
      y,
      size,
      rgbStr,
      secondaryRgbStr,
      isDarkMode,
      layers,
    );

    if (isPropelling) {
      drawPropelRings(ctx, x, y, size, time, sunState, rgbStr, propelRings);
    }

    drawSolarParticles(
      ctx,
      x,
      y,
      size,
      time,
      sunState,
      rgbStr,
      secondaryRgbStr,
      isHighlighted,
      isDarkMode,
      particles,
    );
    drawEjectedParticles(
      ctx,
      x,
      y,
      size,
      time,
      sunState,
      rgbStr,
      isHighlighted,
      isDarkMode,
      ejectParticles,
    );

    if (isHighlighted) {
      drawHoverRing(ctx, x, y, size, time, sunState, rgbStr, layers, hoverRing);
    }

    drawPhotosphere(ctx, x, y, size, sunState, rgbStr, isDarkMode, layers);
    drawSunBody(ctx, x, y, size, sunState, rgbStr);
    drawGranulation(ctx, x, y, size, time, rgbStr, granulation);
    drawHotspot(ctx, x, y, size, isHighlighted, layers);
    drawHighlights(ctx, x, y, size, secondaryRgbStr, layers);

    // Draw focus area icon
    ctx.globalAlpha = isDarkMode
      ? OPACITY_CONFIG.sun.icon.dark
      : OPACITY_CONFIG.sun.icon.light;
    const iconSize = size * SUN_ICON_CONFIG.sizeMultiplier;
    drawSunIcon(ctx, x, y, iconSize, sunState.id);
  });

  ctx.globalAlpha = 1;
  ctx.restore();
}
