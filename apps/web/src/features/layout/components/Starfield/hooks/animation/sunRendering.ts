// sunRendering.ts - Sun rendering and state management
// Single Responsibility: Draw focus area suns with all visual effects

import { Planet } from "../../types";
import { TWO_PI } from "../../math";
import { lightenColor } from "../../colorUtils";
import { SUNS } from "../../cosmos/cosmicHierarchy";
import {
  getSunStates,
  initializeSunStates,
  updateSunPhysics,
  updateSunSizesFromPlanets
} from "../../sunSystem";
import {
  SUN_RENDERING_CONFIG,
  SUN_ICON_CONFIG,
  OPACITY_CONFIG
} from "../../renderingConfig";
import { drawSunIcon } from "./focusAreaIcons";

// Track if sun system is initialized
let sunSystemInitialized = false;
let sunSizesCalculated = false;

/**
 * Reset animation module state - call this when unmounting the starfield component
 * to prevent memory leaks and stale state on remount
 */
export function resetAnimationModuleState(): void {
  sunSystemInitialized = false;
  sunSizesCalculated = false;
}

/**
 * Get the focus area suns for external use
 */
export function getFocusAreaSuns(): typeof SUNS {
  return SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");
}

/**
 * Check if mouse is hovering over a sun - returns only the CLOSEST sun
 * Uses dynamic sun positions from the sun system
 */
export function checkSunHover(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number
): { sun: typeof SUNS[0]; index: number; x: number; y: number } | null {
  const sunStates = getSunStates();

  // Initialize if needed
  if (sunStates.length === 0) {
    initializeSunStates();
    return null;
  }

  let closestSun: { sun: typeof SUNS[0]; index: number; x: number; y: number; distance: number } | null = null;
  const focusAreaSuns = SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");

  for (let i = 0; i < sunStates.length; i++) {
    const sunState = sunStates[i];
    const x = sunState.x * width;
    const y = sunState.y * height;
    const baseSize = Math.max(20, Math.min(width, height) * sunState.size * 0.6);
    // Increase hit area for better clickability
    const hitRadius = baseSize * 3;

    const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
    if (distance <= hitRadius) {
      // Find matching sun from SUNS array
      const matchingSun = focusAreaSuns.find(s => s.id === sunState.id);
      if (matchingSun) {
        // Only keep the closest sun
        if (!closestSun || distance < closestSun.distance) {
          closestSun = { sun: matchingSun, index: i, x, y, distance };
        }
      }
    }
  }

  // Return without the distance property
  if (closestSun) {
    return { sun: closestSun.sun, index: closestSun.index, x: closestSun.x, y: closestSun.y };
  }
  return null;
}

/**
 * Get current sun positions for external use (e.g., orbit centers)
 */
export function getCurrentSunPositions(width: number, height: number): Map<string, { x: number; y: number }> {
  const sunStates = getSunStates();
  const positions = new Map<string, { x: number; y: number }>();

  for (const sun of sunStates) {
    positions.set(sun.id, { x: sun.x * width, y: sun.y * height });
  }

  return positions;
}

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
  planets?: Planet[]
): void {
  const { sizeMultiplier, minSize, particles, ejectParticles, pulse, layers, flares, rays, propelRings, granulation, hoverRing } = SUN_RENDERING_CONFIG;

  // Initialize sun system if needed
  if (!sunSystemInitialized) {
    initializeSunStates();
    sunSystemInitialized = true;
  }

  // Calculate sun sizes based on planet masses (only once)
  if (!sunSizesCalculated && planets && planets.length > 0) {
    updateSunSizesFromPlanets(planets);
    sunSizesCalculated = true;
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
    const baseSize = Math.max(minSize, Math.min(width, height) * sunState.size * sizeMultiplier);

    // Check if this sun is hovered or focused
    const isHovered = hoveredSunId === sunState.id;
    const isFocused = focusedSunId === sunState.id;
    const isHighlighted = isHovered || isFocused;

    // Check if sun is in propel mode (avoiding collision)
    const isPropelling = sunState.isPropelling;

    // Smoother multi-layered pulsating effect
    const pulseSpeed1 = isHighlighted ? pulse.speed1.highlighted : pulse.speed1.normal;
    const pulseSpeed2 = isHighlighted ? pulse.speed2.highlighted : pulse.speed2.normal;
    const pulseSpeed3 = isHighlighted ? pulse.speed3.highlighted : pulse.speed3.normal;
    const pulseAmount = isHighlighted ? pulse.amount.highlighted : (isPropelling ? pulse.amount.propelling : pulse.amount.normal);
    const pulse1 = 1 + pulseAmount * Math.sin(time * pulseSpeed1);
    const pulse2 = 1 + (pulseAmount * 0.6) * Math.sin(time * pulseSpeed2 + Math.PI / 3);
    const pulse3 = 1 + (pulseAmount * 0.4) * Math.sin(time * pulseSpeed3 + Math.PI / 1.5);
    const pulseValue = (pulse1 + pulse2 + pulse3) / 3;
    const size = baseSize * pulseValue * (isHighlighted ? pulse.highlightScale : 1);

    // Use pre-computed RGB values from SunState to avoid parsing hex every frame
    const rgbStr = sunState.colorRgbStr;
    const rgb = sunState.colorRgb;
    const secondaryRgbStr = `${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 20)}, ${rgb.b}`;

    // Draw all sun layers
    drawSunHalo(ctx, x, y, size, rgbStr, isHighlighted, isDarkMode, layers);
    drawSunAtmosphere(ctx, x, y, size, rgbStr, secondaryRgbStr, isHighlighted, isDarkMode, layers);
    drawSolarFlares(ctx, x, y, size, time, sunState, rgbStr, secondaryRgbStr, isHighlighted, isDarkMode, flares);
    drawCoronaRays(ctx, x, y, size, time, sunState, rgbStr, secondaryRgbStr, isHighlighted, isDarkMode, rays);
    drawChromosphere(ctx, x, y, size, rgbStr, secondaryRgbStr, isDarkMode, layers);

    if (isPropelling) {
      drawPropelRings(ctx, x, y, size, time, sunState, rgbStr, propelRings);
    }

    drawSolarParticles(ctx, x, y, size, time, sunState, rgbStr, secondaryRgbStr, isHighlighted, isDarkMode, particles);
    drawEjectedParticles(ctx, x, y, size, time, sunState, rgbStr, isHighlighted, isDarkMode, ejectParticles);

    if (isHighlighted) {
      drawHoverRing(ctx, x, y, size, time, sunState, rgbStr, layers, hoverRing);
    }

    drawPhotosphere(ctx, x, y, size, sunState, rgbStr, isDarkMode, layers);
    drawSunBody(ctx, x, y, size, sunState, rgbStr);
    drawGranulation(ctx, x, y, size, time, rgbStr, granulation);
    drawHotspot(ctx, x, y, size, isHighlighted, layers);
    drawHighlights(ctx, x, y, size, secondaryRgbStr, layers);

    // Draw focus area icon
    ctx.globalAlpha = isDarkMode ? OPACITY_CONFIG.sun.icon.dark : OPACITY_CONFIG.sun.icon.light;
    const iconSize = size * SUN_ICON_CONFIG.sizeMultiplier;
    drawSunIcon(ctx, x, y, iconSize, sunState.id);
  });

  ctx.globalAlpha = 1;
  ctx.restore();
}

// Helper functions for drawing individual sun layers

function drawSunHalo(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  rgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  layers: typeof SUN_RENDERING_CONFIG.layers
): void {
  const haloSize = size * (isHighlighted ? layers.haloSize.highlighted : layers.haloSize.normal);
  const haloGradient = ctx.createRadialGradient(x, y, size * 0.3, x, y, haloSize);
  haloGradient.addColorStop(0, `rgba(${rgbStr}, ${isHighlighted ? 0.15 : 0.08})`);
  haloGradient.addColorStop(0.3, `rgba(${rgbStr}, ${isHighlighted ? 0.08 : 0.04})`);
  haloGradient.addColorStop(0.6, `rgba(${rgbStr}, ${isHighlighted ? 0.03 : 0.015})`);
  haloGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

  ctx.beginPath();
  ctx.fillStyle = haloGradient;
  ctx.globalAlpha = isDarkMode ? 1 : 0.8;
  ctx.arc(x, y, haloSize, 0, TWO_PI);
  ctx.fill();
}

function drawSunAtmosphere(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  rgbStr: string, secondaryRgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  layers: typeof SUN_RENDERING_CONFIG.layers
): void {
  const atmosphereSize = size * (isHighlighted ? layers.atmosphereSize.highlighted : layers.atmosphereSize.normal);
  const atmosphereGradient = ctx.createRadialGradient(x, y, size * 0.4, x, y, atmosphereSize);
  atmosphereGradient.addColorStop(0, `rgba(${rgbStr}, ${isHighlighted ? 0.5 : 0.35})`);
  atmosphereGradient.addColorStop(0.2, `rgba(${rgbStr}, ${isHighlighted ? 0.3 : 0.2})`);
  atmosphereGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, ${isHighlighted ? 0.12 : 0.08})`);
  atmosphereGradient.addColorStop(0.8, `rgba(${rgbStr}, ${isHighlighted ? 0.05 : 0.03})`);
  atmosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

  ctx.beginPath();
  ctx.fillStyle = atmosphereGradient;
  ctx.globalAlpha = isDarkMode ? 1 : 0.75;
  ctx.arc(x, y, atmosphereSize, 0, TWO_PI);
  ctx.fill();
}

function drawSolarFlares(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: { rotationAngle: number; color: string },
  rgbStr: string, secondaryRgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  flares: typeof SUN_RENDERING_CONFIG.flares
): void {
  const flareCount = isHighlighted ? flares.count.highlighted : flares.count.normal;
  ctx.globalAlpha = isDarkMode
    ? (isHighlighted ? OPACITY_CONFIG.sun.flares.dark.highlighted : OPACITY_CONFIG.sun.flares.dark.normal)
    : (isHighlighted ? OPACITY_CONFIG.sun.flares.light.highlighted : OPACITY_CONFIG.sun.flares.light.normal);

  for (let i = 0; i < flareCount; i++) {
    const baseAngle = (i * TWO_PI / flareCount) + sunState.rotationAngle * 0.5;
    const waveOffset = Math.sin(time * flares.waveSpeed + i * 0.7) * 0.15;
    const angle = baseAngle + waveOffset;

    const flarePhase = Math.sin(time * flares.phaseSpeed + i * 1.5);
    const flareLength = size * (isHighlighted ? flares.lengthMultiplier.highlighted : flares.lengthMultiplier.normal) * (0.7 + 0.3 * flarePhase);

    const startDist = size * 0.85;
    const startX = x + Math.cos(angle) * startDist;
    const startY = y + Math.sin(angle) * startDist;
    const endX = x + Math.cos(angle) * flareLength;
    const endY = y + Math.sin(angle) * flareLength;

    const curveFactor = Math.sin(time * flares.curveFactor + i) * size * 0.5;
    const perpAngle = angle + Math.PI / 2;
    const cpX = (startX + endX) / 2 + Math.cos(perpAngle) * curveFactor;
    const cpY = (startY + endY) / 2 + Math.sin(perpAngle) * curveFactor;

    const flareGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    flareGradient.addColorStop(0, lightenColor(sunState.color, 0.6));
    flareGradient.addColorStop(0.3, `rgba(${rgbStr}, 0.6)`);
    flareGradient.addColorStop(0.6, `rgba(${secondaryRgbStr}, 0.3)`);
    flareGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.strokeStyle = flareGradient;
    ctx.lineWidth = size * (isHighlighted ? flares.lineWidthMultiplier.highlighted : flares.lineWidthMultiplier.normal) * (1 + 0.3 * flarePhase);
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

function drawCoronaRays(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: { rotationAngle: number },
  rgbStr: string, secondaryRgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  rays: typeof SUN_RENDERING_CONFIG.rays
): void {
  const rayCount = isHighlighted ? rays.count.highlighted : rays.count.normal;
  ctx.globalAlpha = isDarkMode
    ? (isHighlighted ? OPACITY_CONFIG.sun.rays.dark.highlighted : OPACITY_CONFIG.sun.rays.dark.normal)
    : (isHighlighted ? OPACITY_CONFIG.sun.rays.light.highlighted : OPACITY_CONFIG.sun.rays.light.normal);

  for (let i = 0; i < rayCount; i++) {
    const baseAngle = (i * TWO_PI / rayCount) + sunState.rotationAngle;
    const waveOffset = Math.sin(time * rays.waveSpeed + i * 0.4) * 0.08;
    const angle = baseAngle + waveOffset;

    const rayLengthVariation = 0.75 + 0.25 * Math.sin(time * 0.00018 + i * 1.1);
    const rayLength = size * (isHighlighted ? rays.lengthMultiplier.highlighted : rays.lengthMultiplier.normal) * rayLengthVariation;

    const endX = x + Math.cos(angle) * rayLength;
    const endY = y + Math.sin(angle) * rayLength;

    ctx.beginPath();
    const rayWidth = size * (isHighlighted ? rays.widthMultiplier.highlighted : rays.widthMultiplier.normal);
    const perpAngle = angle + Math.PI / 2;

    const startDist = size * 0.75;
    const startX = x + Math.cos(angle) * startDist;
    const startY = y + Math.sin(angle) * startDist;

    ctx.moveTo(
      startX + Math.cos(perpAngle) * rayWidth,
      startY + Math.sin(perpAngle) * rayWidth
    );
    ctx.lineTo(endX, endY);
    ctx.lineTo(
      startX - Math.cos(perpAngle) * rayWidth,
      startY - Math.sin(perpAngle) * rayWidth
    );
    ctx.closePath();

    const rayGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    rayGradient.addColorStop(0, `rgba(${rgbStr}, 0.9)`);
    rayGradient.addColorStop(0.4, `rgba(${rgbStr}, 0.4)`);
    rayGradient.addColorStop(0.7, `rgba(${secondaryRgbStr}, 0.15)`);
    rayGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

    ctx.fillStyle = rayGradient;
    ctx.fill();
  }
}

function drawChromosphere(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  rgbStr: string, secondaryRgbStr: string, isDarkMode: boolean,
  layers: typeof SUN_RENDERING_CONFIG.layers
): void {
  ctx.globalAlpha = isDarkMode ? OPACITY_CONFIG.sun.chromosphere.dark : OPACITY_CONFIG.sun.chromosphere.light;
  const chromosphereGradient = ctx.createRadialGradient(x, y, size * 0.95, x, y, size * layers.chromosphereRadius);
  chromosphereGradient.addColorStop(0, `rgba(${rgbStr}, 0.8)`);
  chromosphereGradient.addColorStop(0.3, `rgba(${secondaryRgbStr}, 0.5)`);
  chromosphereGradient.addColorStop(0.6, `rgba(${rgbStr}, 0.3)`);
  chromosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

  ctx.beginPath();
  ctx.fillStyle = chromosphereGradient;
  ctx.arc(x, y, size * layers.chromosphereRadius, 0, TWO_PI);
  ctx.fill();
}

function drawPropelRings(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: { color: string },
  rgbStr: string,
  propelRings: typeof SUN_RENDERING_CONFIG.propelRings
): void {
  for (let r = 0; r < propelRings.count; r++) {
    const ringRadius = size * (propelRings.baseRadius + r * propelRings.radiusStep);
    const ringAlpha = 0.5 - r * 0.09;
    const ringPhase = Math.sin(time * propelRings.animationSpeed + r * Math.PI / 2.5);

    ctx.beginPath();
    const ringGradient = ctx.createRadialGradient(x, y, ringRadius - 2, x, y, ringRadius + 2);
    ringGradient.addColorStop(0, `rgba(${rgbStr}, 0)`);
    ringGradient.addColorStop(0.5, sunState.color);
    ringGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = propelRings.lineWidthBase - r * propelRings.lineWidthDecrement;
    ctx.globalAlpha = ringAlpha * (0.5 + 0.5 * ringPhase);
    ctx.arc(x, y, ringRadius, 0, TWO_PI);
    ctx.stroke();
  }
}

function drawSolarParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: { rotationAngle: number; color: string },
  rgbStr: string, secondaryRgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  particles: typeof SUN_RENDERING_CONFIG.particles
): void {
  const particleCount = isHighlighted ? particles.count.highlighted : particles.count.normal;
  ctx.globalAlpha = isDarkMode
    ? (isHighlighted ? OPACITY_CONFIG.sun.particles.dark.highlighted : OPACITY_CONFIG.sun.particles.dark.normal)
    : (isHighlighted ? OPACITY_CONFIG.sun.particles.light.highlighted : OPACITY_CONFIG.sun.particles.light.normal);

  for (let i = 0; i < particleCount; i++) {
    const orbitRadius = size * (particles.orbitBaseRadius + (i % 4) * particles.orbitRadiusStep);
    const orbitSpeed = particles.orbitSpeedBase + (i % 3) * particles.orbitSpeedVariation;
    const particleAngle = (i * TWO_PI / particleCount) + time * orbitSpeed + sunState.rotationAngle * 0.3;

    const wobble = Math.sin(time * particles.wobbleSpeed + i * 1.7) * size * particles.wobbleAmount;
    const particleX = x + Math.cos(particleAngle) * (orbitRadius + wobble);
    const particleY = y + Math.sin(particleAngle) * (orbitRadius + wobble);

    const particlePulse = 0.7 + 0.3 * Math.sin(time * particles.pulseSpeed + i * 2.1);
    const particleSize = (size * 0.04 + (i % 3) * size * 0.015) * particlePulse;

    const particleGradient = ctx.createRadialGradient(
      particleX, particleY, 0,
      particleX, particleY, particleSize * 2.5
    );

    if (i % 3 === 0) {
      particleGradient.addColorStop(0, "#ffffff");
      particleGradient.addColorStop(0.3, lightenColor(sunState.color, 0.7));
      particleGradient.addColorStop(0.6, `rgba(${rgbStr}, 0.5)`);
      particleGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    } else if (i % 3 === 1) {
      particleGradient.addColorStop(0, lightenColor(sunState.color, 0.8));
      particleGradient.addColorStop(0.4, `rgba(${rgbStr}, 0.7)`);
      particleGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    } else {
      particleGradient.addColorStop(0, `rgba(${secondaryRgbStr}, 0.9)`);
      particleGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, 0.4)`);
      particleGradient.addColorStop(1, `rgba(${secondaryRgbStr}, 0)`);
    }

    ctx.beginPath();
    ctx.fillStyle = particleGradient;
    ctx.arc(particleX, particleY, particleSize * 2.5, 0, TWO_PI);
    ctx.fill();

    if (i % 4 === 0) {
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = (isDarkMode ? 0.9 : 0.7) * particlePulse;
      ctx.arc(particleX, particleY, particleSize * 0.5, 0, TWO_PI);
      ctx.fill();
      ctx.globalAlpha = isDarkMode
        ? (isHighlighted ? OPACITY_CONFIG.sun.particles.dark.highlighted : OPACITY_CONFIG.sun.particles.dark.normal)
        : (isHighlighted ? OPACITY_CONFIG.sun.particles.light.highlighted : OPACITY_CONFIG.sun.particles.light.normal);
    }
  }
}

function drawEjectedParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: { rotationAngle: number; color: string },
  rgbStr: string, isHighlighted: boolean, isDarkMode: boolean,
  ejectParticles: typeof SUN_RENDERING_CONFIG.ejectParticles
): void {
  const ejectCount = isHighlighted ? ejectParticles.count.highlighted : ejectParticles.count.normal;
  for (let i = 0; i < ejectCount; i++) {
    const ejectAngle = (i * TWO_PI / ejectCount) + time * ejectParticles.speed + sunState.rotationAngle;
    const ejectPhase = (time * 0.0002 + i * 1.5) % 1;
    const ejectDist = size * (ejectParticles.distanceRange.min + ejectPhase * (ejectParticles.distanceRange.max - ejectParticles.distanceRange.min));
    const ejectX = x + Math.cos(ejectAngle) * ejectDist;
    const ejectY = y + Math.sin(ejectAngle) * ejectDist;

    const ejectAlpha = Math.max(0, 1 - ejectPhase) * (isDarkMode ? 0.6 : 0.4);
    const ejectSize = size * 0.06 * (1 - ejectPhase * 0.5);

    if (ejectAlpha > 0.05) {
      const ejectGradient = ctx.createRadialGradient(
        ejectX, ejectY, 0,
        ejectX, ejectY, ejectSize * 3
      );
      ejectGradient.addColorStop(0, lightenColor(sunState.color, 0.6));
      ejectGradient.addColorStop(0.4, `rgba(${rgbStr}, ${ejectAlpha})`);
      ejectGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = ejectGradient;
      ctx.globalAlpha = ejectAlpha;
      ctx.arc(ejectX, ejectY, ejectSize * 3, 0, TWO_PI);
      ctx.fill();
    }
  }
}

function drawHoverRing(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  sunState: { color: string },
  rgbStr: string,
  layers: typeof SUN_RENDERING_CONFIG.layers,
  hoverRing: typeof SUN_RENDERING_CONFIG.hoverRing
): void {
  const dashOffset = time * hoverRing.dashSpeed;
  ctx.setLineDash(hoverRing.dashPattern as unknown as number[]);
  ctx.lineDashOffset = dashOffset;
  ctx.beginPath();
  ctx.strokeStyle = lightenColor(sunState.color, 0.4);
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.6 + 0.25 * Math.sin(time * hoverRing.pulseSpeed);
  ctx.arc(x, y, size * layers.hoverRingRadius, 0, TWO_PI);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  const innerRingGradient = ctx.createRadialGradient(x, y, size * 1.9, x, y, size * 2.1);
  innerRingGradient.addColorStop(0, `rgba(${rgbStr}, 0)`);
  innerRingGradient.addColorStop(0.5, lightenColor(sunState.color, 0.5));
  innerRingGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
  ctx.strokeStyle = innerRingGradient;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.75 + 0.2 * Math.sin(time * hoverRing.innerPulseSpeed);
  ctx.arc(x, y, size * layers.innerRingRadius, 0, TWO_PI);
  ctx.stroke();
}

function drawPhotosphere(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  sunState: { color: string },
  rgbStr: string, isDarkMode: boolean,
  layers: typeof SUN_RENDERING_CONFIG.layers
): void {
  const photosphereGradient = ctx.createRadialGradient(x, y, size * 0.25, x, y, size * layers.photosphereRadius);
  photosphereGradient.addColorStop(0, lightenColor(sunState.color, 0.85));
  photosphereGradient.addColorStop(0.3, lightenColor(sunState.color, 0.5));
  photosphereGradient.addColorStop(0.5, sunState.color);
  photosphereGradient.addColorStop(0.75, `rgba(${rgbStr}, 0.85)`);
  photosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0.4)`);

  ctx.beginPath();
  ctx.fillStyle = photosphereGradient;
  ctx.globalAlpha = isDarkMode ? 1 : 0.9;
  ctx.arc(x, y, size * layers.photosphereRadius, 0, TWO_PI);
  ctx.fill();
}

function drawSunBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  sunState: { color: string },
  rgbStr: string
): void {
  const bodyGradient = ctx.createRadialGradient(
    x - size * 0.25, y - size * 0.25, 0,
    x + size * 0.1, y + size * 0.1, size
  );
  bodyGradient.addColorStop(0, "#ffffff");
  bodyGradient.addColorStop(0.1, lightenColor(sunState.color, 0.8));
  bodyGradient.addColorStop(0.3, lightenColor(sunState.color, 0.5));
  bodyGradient.addColorStop(0.55, sunState.color);
  bodyGradient.addColorStop(0.8, `rgba(${rgbStr}, 0.95)`);
  bodyGradient.addColorStop(1, `rgba(${rgbStr}, 0.85)`);

  ctx.beginPath();
  ctx.fillStyle = bodyGradient;
  ctx.globalAlpha = 1;
  ctx.arc(x, y, size, 0, TWO_PI);
  ctx.fill();
}

function drawGranulation(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number,
  rgbStr: string,
  granulation: typeof SUN_RENDERING_CONFIG.granulation
): void {
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < granulation.spotCount; i++) {
    const spotAngle = (time * granulation.rotationSpeed + i * TWO_PI / granulation.spotCount) % (TWO_PI);
    const spotDist = size * (0.25 + 0.45 * Math.sin(i * 2.3 + time * granulation.variationSpeed));
    const spotX = x + Math.cos(spotAngle) * spotDist;
    const spotY = y + Math.sin(spotAngle) * spotDist;
    const spotSize = size * (0.12 + 0.08 * Math.sin(i * 1.9));

    const spotGradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotSize);
    const isLightSpot = i % 2 === 0;
    const spotColor = isLightSpot ? "rgba(255, 255, 255, 0.4)" : `rgba(${rgbStr}, 0.6)`;
    spotGradient.addColorStop(0, spotColor);
    spotGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);

    ctx.beginPath();
    ctx.fillStyle = spotGradient;
    ctx.arc(spotX, spotY, spotSize, 0, TWO_PI);
    ctx.fill();
  }
}

function drawHotspot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, isHighlighted: boolean,
  layers: typeof SUN_RENDERING_CONFIG.layers
): void {
  const hotspotGradient = ctx.createRadialGradient(
    x - size * 0.12, y - size * 0.12, 0,
    x, y, size * layers.hotspotRadius
  );
  hotspotGradient.addColorStop(0, "#ffffff");
  hotspotGradient.addColorStop(0.2, "rgba(255, 255, 255, 0.95)");
  hotspotGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
  hotspotGradient.addColorStop(0.8, "rgba(255, 255, 255, 0.15)");
  hotspotGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.fillStyle = hotspotGradient;
  ctx.globalAlpha = isHighlighted ? 1 : 0.92;
  ctx.arc(x, y, size * layers.hotspotRadius, 0, TWO_PI);
  ctx.fill();
}

function drawHighlights(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  secondaryRgbStr: string,
  layers: typeof SUN_RENDERING_CONFIG.layers
): void {
  // Specular highlight
  const highlightGradient = ctx.createRadialGradient(
    x - size * layers.highlightRadius, y - size * layers.highlightRadius, 0,
    x - size * 0.25, y - size * 0.25, size * layers.highlightRadius
  );
  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  highlightGradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
  highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.fillStyle = highlightGradient;
  ctx.globalAlpha = 0.8;
  ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, TWO_PI);
  ctx.fill();

  // Rim light
  const rimGradient = ctx.createRadialGradient(
    x + size * 0.4, y + size * 0.4, 0,
    x + size * 0.3, y + size * 0.3, size * layers.rimRadius
  );
  rimGradient.addColorStop(0, `rgba(${secondaryRgbStr}, 0.4)`);
  rimGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, 0.15)`);
  rimGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.fillStyle = rimGradient;
  ctx.globalAlpha = 0.5;
  ctx.arc(x + size * layers.highlightRadius, y + size * layers.highlightRadius, size * 0.2, 0, TWO_PI);
  ctx.fill();
}
