// components/Layout/Starfield/starRendering.ts
// Rendering functions for portfolio comets/planets in the starfield

import {
  drawConnections,
  drawHoverEffects,
  drawNebulaEffects,
  drawSatellites,
  drawStarFlares,
  drawStarGlow,
  drawStarTrail,
} from "./starEffects";
import {
  calculatePulsation,
  createSoftenedColor,
  hexToRgb,
  updateStarPosition,
} from "./starUtils";
import { Planet } from "./types";
import { SUNS } from "./cosmos/cosmicHierarchy";
import { TWO_PI, fastSin, fastCos } from "./math";
import { SIZE_CONFIG, CAMERA_CONFIG } from "./physicsConfig";
import { logger } from "@/utils/logger";
import { featureFlags } from "@/utils";

// Image cache to avoid creating new Image objects every frame
const imageCache = new Map<string, HTMLImageElement>();

// Track images that failed to load
const failedImages = new Set<string>();

// Preload and cache an image
function getCachedImage(src: string): HTMLImageElement | null {
  if (!src) return null;

  // Don't retry failed images
  if (failedImages.has(src)) return null;

  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    // Add crossOrigin for CORS support
    img.crossOrigin = "anonymous";

    // Track load failures
    img.onerror = (): void => {
      failedImages.add(src);
      logger.warn(`Failed to load image: ${src}`);
    };

    img.src = src;
    imageCache.set(src, img);
  }

  // Check both complete AND naturalWidth to ensure image actually loaded successfully
  // (complete is true even for failed loads, but naturalWidth would be 0)
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/**
 * Preload all project images to ensure they're ready for rendering
 * Call this early during initialization
 */
export function preloadProjectImages(
  projects: Array<{ image?: string }>,
): void {
  projects.forEach((project) => {
    if (project.image) {
      getCachedImage(project.image);
    }
  });
}

// Get the color a planet should use based on its focus area (matching its sun)
// Uses caching to avoid expensive SUNS.find() lookup every frame
function getSunAlignedColor(planet: Planet): string {
  // Return cached color if available (avoids O(n) lookup per frame)
  if (planet.cachedSunColor) {
    return planet.cachedSunColor;
  }

  const focusArea = planet.project?.focusArea;
  let color = planet.project?.color || "#ffffff";

  if (focusArea) {
    // Find the matching focus area sun in the hierarchy (one-time lookup)
    const matchingSun = SUNS.find(
      (sun) =>
        sun.parentId === "focus-areas-galaxy" &&
        sun.id.includes(focusArea.replace(/-/g, "-")),
    );
    if (matchingSun?.color) {
      color = matchingSun.color;
    }
  }

  // Cache the result on the planet object
  planet.cachedSunColor = color;
  return color;
}

// Draw a portfolio comet/planet with its satellites
export const drawPlanet = (
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  deltaTime: number,
  planetSize: number,
  displayStyle: "initials" | "avatar" | "both",
): void => {
  if (!ctx || !planet) return;

  // Skip position updates if the planet is paused
  if (!planet.isMovementPaused) {
    // Update planet position based on orbit
    updateStarPosition(planet, deltaTime);
  }

  // Use both project color (core) and sun color (outer glow) for visual distinction
  const projectColor = planet.project?.color || "#ffffff";
  const sunColor = getSunAlignedColor(planet);

  // Project color for the core - use cached RGB to avoid hexToRgb per frame
  if (!planet.cachedCoreRgb) {
    planet.cachedCoreRgb = hexToRgb(projectColor);
  }
  const coreRgb = planet.cachedCoreRgb;
  const softCoreRgb = createSoftenedColor(coreRgb);

  // Sun color for outer glow/ring - use cached RGB to avoid hexToRgb per frame
  if (!planet.cachedGlowRgb) {
    planet.cachedGlowRgb = hexToRgb(sunColor);
  }
  const glowRgb = planet.cachedGlowRgb;
  const softGlowRgb = createSoftenedColor(glowRgb);

  // Use core color as main, glow color for effects
  const softRgb = softCoreRgb;

  // Calculate pulsation effect
  const scaleFactor = calculatePulsation(planet);

  // Scale size based on project mass/weight (normalize around 150 as baseline)
  const baseMass = 150;
  const projectMass = planet.project?.mass || baseMass;
  const massScale = Math.sqrt(projectMass / baseMass); // Square root for gentler scaling
  const clampedMassScale = Math.max(0.7, Math.min(1.5, massScale)); // Clamp between 0.7x and 1.5x

  const starSize =
    SIZE_CONFIG.planetBaseSize * planetSize * scaleFactor * clampedMassScale;

  // Draw nebula effects for important stars
  drawNebulaEffects(ctx, planet, starSize, softRgb);

  // Draw comet trail if applicable and enabled
  if (planet.pathType === "comet" && featureFlags.isEnabled("trailEffects")) {
    drawStarTrail(ctx, planet, starSize, softRgb, planetSize, scaleFactor);
  }

  // Draw random star flares
  drawStarFlares(ctx, planet, starSize, softRgb);

  // Draw star core and glow
  if (planet.useSimpleRendering) {
    // Simple rendering for performance
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, starSize, 0, TWO_PI);
    ctx.fillStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`;
    ctx.fill();
  } else {
    // Enhanced rendering with glow
    drawStarGlow(ctx, planet, starSize, softRgb);
  }

  // Draw outer ring in sun color (shows focus area affiliation)
  if (!planet.useSimpleRendering && projectColor !== sunColor) {
    ctx.beginPath();
    ctx.arc(
      planet.x,
      planet.y,
      starSize * SIZE_CONFIG.planetHoverScale,
      0,
      TWO_PI,
    );
    ctx.strokeStyle = `rgba(${softGlowRgb.r}, ${softGlowRgb.g}, ${softGlowRgb.b}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw satellites if enabled
  if (planet.satellites && planet.satellites.length > 0 && featureFlags.isEnabled("planetSatellites")) {
    drawSatellites(ctx, planet, scaleFactor, softRgb, deltaTime);
  }

  // Draw hover/selection effects if enabled
  if (featureFlags.isEnabled("hoverEffects")) {
    drawHoverEffects(ctx, planet, starSize, softRgb);
  }

  // Draw project identifier (initials or avatar)
  drawProjectIdentifier(ctx, planet, starSize, displayStyle);

  // Draw connections to related stars
  if ((planet.isHovered || planet.isSelected) && window.planets) {
    drawConnections(ctx, planet, window.planets, softRgb);
  }
};

// Draw project identifier (initials or avatar)
function drawProjectIdentifier(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  starSize: number,
  _displayStyle: "initials" | "avatar" | "both",
): void {
  // Extract project image path for cleaner logic
  const projectImagePath = !planet.useSimpleRendering
    ? planet.project.image
    : undefined;
  const img = projectImagePath ? getCachedImage(projectImagePath) : null;

  // Use SIZE_CONFIG for consistent sizing
  const clipRadius = starSize * SIZE_CONFIG.projectIconClipRadius;
  const imgSize = starSize * SIZE_CONFIG.projectIconImageSize;
  const ringRadius = starSize * SIZE_CONFIG.projectIconRingRadius;
  const bgRadius = starSize * SIZE_CONFIG.initialsBackgroundRadius;
  const fontSize = Math.floor(starSize * SIZE_CONFIG.initialsFontSize);

  // If we have a loaded image, display it prominently on the planet
  if (img) {
    ctx.save();

    // Draw a circular clip for the image
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, clipRadius, 0, TWO_PI);
    ctx.clip();

    // Draw the project icon image centered on the planet
    ctx.drawImage(
      img,
      planet.x - imgSize / 2,
      planet.y - imgSize / 2,
      imgSize,
      imgSize,
    );

    ctx.restore();

    // Add a subtle ring around the icon
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, ringRadius, 0, TWO_PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.stroke();
  } else if (projectImagePath) {
    // Image path exists but image not loaded yet - always show initials while loading
    ctx.save();
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, bgRadius, 0, TWO_PI);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();
    ctx.restore();

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(planet.project.initials || "?", planet.x, planet.y);

    // Add ring to indicate loading
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, clipRadius, 0, TWO_PI);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.stroke();
  } else {
    // No image or simple rendering - show initials
    if (!planet.useSimpleRendering) {
      // Add a subtle background circle for better text visibility
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, bgRadius, 0, TWO_PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fill();

      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 3;
    }

    // Larger, bolder font for initials
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(planet.project.initials || "?", planet.x, planet.y);

    if (!planet.useSimpleRendering) {
      ctx.shadowBlur = 0;

      // Add a subtle ring around the initials
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, clipRadius, 0, TWO_PI);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.stroke();
    }
  }

  // Draw focus area vector icon when there's NO project image
  // The project image/icon takes precedence as the primary visual identifier
  // Focus area icons are only shown as fallback for projects without images
  if (
    !planet.useSimpleRendering &&
    planet.project?.focusArea &&
    !projectImagePath
  ) {
    drawPlanetFocusAreaIcon(
      ctx,
      planet.x,
      planet.y,
      starSize,
      planet.project.focusArea,
      planet.isHovered,
    );
  }
}

/**
 * Draw a focus area vector icon on a planet/comet
 * The icon is drawn as a small overlay on the planet body
 * Icon is always visible and enlarges when hovered
 */
function drawPlanetFocusAreaIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  starSize: number,
  focusArea: string,
  isHovered: boolean = false,
): void {
  ctx.save();

  // Position the icon at the center of the planet (overlaid on top)
  // SIGNIFICANTLY increased base size for better visibility on small planets
  // The icon size is now based on a minimum pixel size plus scaling from starSize
  const hoverScale = isHovered ? 1.4 : 1.0; // 40% larger when hovered
  // Minimum icon size from config, plus scaling from starSize
  // This ensures icons are always visible even on small planets
  const baseIconSize = Math.max(CAMERA_CONFIG.minIconSize, starSize * 1.2);
  const iconSize = baseIconSize * hoverScale;
  const iconX = x;
  const iconY = y;

  // Draw a semi-transparent circular background for the icon
  // More visible background, brighter when hovered
  ctx.beginPath();
  ctx.arc(iconX, iconY, iconSize * 1.2, 0, TWO_PI);
  ctx.fillStyle = isHovered ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)";
  ctx.fill();
  ctx.strokeStyle = isHovered
    ? "rgba(255, 255, 255, 0.95)"
    : "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = isHovered ? 2.5 : 2.0;
  ctx.stroke();

  // Set icon drawing styles with increased stroke width for better visibility
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = Math.max(isHovered ? 2.5 : 2.0, iconSize * 0.15);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Draw the appropriate icon based on focus area
  switch (focusArea) {
    case "ai-ml":
      drawPlanetAIIcon(ctx, iconX, iconY, iconSize);
      break;
    case "fintech-blockchain":
      drawPlanetBlockchainIcon(ctx, iconX, iconY, iconSize);
      break;
    case "defense-security":
      drawPlanetShieldIcon(ctx, iconX, iconY, iconSize);
      break;
    case "mobility-transportation":
      drawPlanetMobilityIcon(ctx, iconX, iconY, iconSize);
      break;
    default:
      // Draw a simple star for unknown focus areas
      drawPlanetDefaultIcon(ctx, iconX, iconY, iconSize);
  }

  ctx.restore();
}

/**
 * Draw AI/ML icon (brain/circuit pattern) for planet
 */
function drawPlanetAIIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const r = size * 0.6;

  // Central node
  ctx.beginPath();
  ctx.arc(x, y, size * 0.15, 0, TWO_PI);
  ctx.fill();

  // Outer nodes
  const nodeCount = 4;
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i * TWO_PI) / nodeCount - Math.PI / 4;
    const px = x + r * fastCos(angle);
    const py = y + r * fastSin(angle);

    // Draw node
    ctx.beginPath();
    ctx.arc(px, py, size * 0.1, 0, TWO_PI);
    ctx.fill();

    // Connect to center
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(px, py);
    ctx.stroke();
  }
}

/**
 * Draw blockchain/fintech icon (hexagon with nodes) for planet
 */
function drawPlanetBlockchainIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const r = size * 0.6;

  // Draw hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    const px = x + r * fastCos(angle);
    const py = y + r * fastSin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // Draw center node
  ctx.beginPath();
  ctx.arc(x, y, size * 0.12, 0, TWO_PI);
  ctx.fill();
}

/**
 * Draw shield icon (defense/security) for planet
 */
function drawPlanetShieldIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const w = size * 0.55;
  const h = size * 0.7;

  // Draw shield shape
  ctx.beginPath();
  ctx.moveTo(x, y - h * 0.5); // Top center
  ctx.lineTo(x + w * 0.5, y - h * 0.25); // Top right
  ctx.lineTo(x + w * 0.5, y + h * 0.1); // Right side
  ctx.quadraticCurveTo(x + w * 0.25, y + h * 0.4, x, y + h * 0.5); // Bottom right curve
  ctx.quadraticCurveTo(x - w * 0.25, y + h * 0.4, x - w * 0.5, y + h * 0.1); // Bottom left curve
  ctx.lineTo(x - w * 0.5, y - h * 0.25); // Left side
  ctx.closePath();
  ctx.stroke();

  // Draw checkmark inside
  ctx.beginPath();
  ctx.moveTo(x - w * 0.2, y);
  ctx.lineTo(x - w * 0.05, y + h * 0.12);
  ctx.lineTo(x + w * 0.2, y - h * 0.1);
  ctx.stroke();
}

/**
 * Draw mobility/transportation icon (wheel) for planet
 */
function drawPlanetMobilityIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const r = size * 0.55;
  const innerR = size * 0.2;

  // Outer wheel
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.stroke();

  // Inner hub
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, TWO_PI);
  ctx.stroke();

  // Center point
  ctx.beginPath();
  ctx.arc(x, y, size * 0.06, 0, TWO_PI);
  ctx.fill();

  // Spokes
  const spokeCount = 4;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * TWO_PI) / spokeCount + Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(x + innerR * fastCos(angle), y + innerR * fastSin(angle));
    ctx.lineTo(x + r * fastCos(angle), y + r * fastSin(angle));
    ctx.stroke();
  }
}

/**
 * Draw default icon (star) for planet
 */
function drawPlanetDefaultIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const outerR = size * 0.5;
  const innerR = size * 0.2;
  const points = 4;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = x + r * fastCos(angle);
    const py = y + r * fastSin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}
