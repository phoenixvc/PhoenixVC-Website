// components/Layout/Starfield/starRendering.ts
// Rendering functions for portfolio comets/planets in the starfield

import {
    drawConnections,
    drawHoverEffects,
    drawNebulaEffects,
    drawSatellites,
    drawStarFlares,
    drawStarGlow,
    drawStarTrail
} from "./starEffects";
import { calculatePulsation, createSoftenedColor, hexToRgb, updateStarPosition } from "./starUtils";
import { Planet } from "./types";
import { SUNS } from "./cosmos/cosmicHierarchy";

// Image cache to avoid creating new Image objects every frame
const imageCache = new Map<string, HTMLImageElement>();

// Preload and cache an image
function getCachedImage(src: string): HTMLImageElement | null {
  if (!src) return null;

  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }

  // Check both complete AND naturalWidth to ensure image actually loaded successfully
  // (complete is true even for failed loads, but naturalWidth would be 0)
  return (img.complete && img.naturalWidth > 0) ? img : null;
}

// Get the color a planet should use based on its focus area (matching its sun)
// Dynamically looks up sun color from cosmicHierarchy to avoid duplication
function getSunAlignedColor(planet: Planet): string {
  const focusArea = planet.project?.focusArea;
  if (focusArea) {
    // Find the matching focus area sun in the hierarchy
    const matchingSun = SUNS.find(sun =>
      sun.parentId === "focus-areas-galaxy" &&
      sun.id.includes(focusArea.replace(/-/g, "-"))
    );
    if (matchingSun?.color) {
      return matchingSun.color;
    }
  }
  // Fallback to project color or default
  return planet.project?.color || "#ffffff";
}

// Draw a portfolio comet/planet with its satellites
export const drawPlanet = (
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  deltaTime: number,
  planetSize: number,
  displayStyle: "initials" | "avatar" | "both"
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

  // Project color for the core
  const coreRgb = hexToRgb(projectColor);
  const softCoreRgb = createSoftenedColor(coreRgb);

  // Sun color for outer glow/ring (shows focus area affiliation)
  const glowRgb = hexToRgb(sunColor);
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

  const starSize = 2.5 * planetSize * scaleFactor * clampedMassScale; // Base size with mass scaling (reduced from 3 to 2.5 for 5/6 size)

  // Draw nebula effects for important stars
  drawNebulaEffects(ctx, planet, starSize, softRgb);

  // Draw comet trail if applicable
  if (planet.pathType === "comet") {
    drawStarTrail(ctx, planet, starSize, softRgb, planetSize, scaleFactor);
  }

  // Draw random star flares
  drawStarFlares(ctx, planet, starSize, softRgb);

  // Draw star core and glow
  if (planet.useSimpleRendering) {
    // Simple rendering for performance
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, starSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`;
    ctx.fill();
  } else {
    // Enhanced rendering with glow
    drawStarGlow(ctx, planet, starSize, softRgb);
  }

  // Draw outer ring in sun color (shows focus area affiliation)
  if (!planet.useSimpleRendering && projectColor !== sunColor) {
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, starSize * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${softGlowRgb.r}, ${softGlowRgb.g}, ${softGlowRgb.b}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw satellites
  if (planet.satellites && planet.satellites.length > 0) {
    drawSatellites(ctx, planet, scaleFactor, softRgb, deltaTime);
  }

  // Draw hover/selection effects
  drawHoverEffects(ctx, planet, starSize, softRgb);

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
  displayStyle: "initials" | "avatar" | "both"
): void {
  if (!planet.useSimpleRendering && displayStyle === "avatar" && planet.project.image) {
    const img = getCachedImage(planet.project.image);

    ctx.save();
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, starSize * 0.8, 0, Math.PI * 2);
    ctx.clip();

    if (img) {
      const imgSize = starSize * 1.6;
      ctx.drawImage(img, planet.x - imgSize/2, planet.y - imgSize/2, imgSize, imgSize);
    } else {
      // Show initials while image loads
      ctx.font = `bold ${Math.floor(starSize * 0.8)}px Arial`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planet.project.initials || "?", planet.x, planet.y);
    }

    ctx.restore();

    // Add a subtle ring around the avatar
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, starSize * 0.85, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.stroke();
  } else if (!planet.useSimpleRendering && displayStyle === "both" && planet.project.image) {
    const img = getCachedImage(planet.project.image);

    ctx.save();
    ctx.beginPath();
    ctx.arc(planet.x, planet.y - starSize * 0.3, starSize * 0.6, 0, Math.PI * 2);
    ctx.clip();

    if (img) {
      const imgSize = starSize * 1.2;
      ctx.drawImage(img, planet.x - imgSize/2, planet.y - starSize * 0.3 - imgSize/2, imgSize, imgSize);
    }

    ctx.restore();

    // Enhanced name display with better readability
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; // Reduced from 0.9
    ctx.shadowBlur = 4; // Reduced from 5
    ctx.font = `bold ${Math.floor(starSize * 0.6)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(planet.project.name || planet.project.initials || "?", planet.x, planet.y + starSize * 0.7);
    ctx.shadowBlur = 0;
  } else {
    // Improved initials display with better visibility
    if (!planet.useSimpleRendering) {
      // Add a subtle background circle for better text visibility
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, starSize * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)"; // Reduced from 0.3
      ctx.fill();

      ctx.shadowColor = "rgba(0, 0, 0, 0.7)"; // Reduced from 0.8
      ctx.shadowBlur = 3; // Reduced from 4
    }

    // Larger, bolder font for initials
    ctx.font = `bold ${Math.floor(starSize * 0.9)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(planet.project.initials || "?", planet.x, planet.y);

    if (!planet.useSimpleRendering) {
      ctx.shadowBlur = 0;

      // Add a subtle ring around the initials
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, starSize * 0.85, 0, Math.PI * 2);
      ctx.lineWidth = 1.2; // Reduced from 1.5
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)"; // Reduced from 0.53
      ctx.stroke();
    }
  }
  
  // Only draw focus area vector icon when there's NO project image
  // The project image/icon takes precedence as the primary visual identifier
  // Focus area icons are only shown as fallback for projects without images
  if (!planet.useSimpleRendering && planet.project?.focusArea && !planet.project.image) {
    drawPlanetFocusAreaIcon(ctx, planet.x, planet.y, starSize, planet.project.focusArea, planet.isHovered);
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
  isHovered: boolean = false
): void {
  ctx.save();
  
  // Position the icon at the center of the planet (overlaid on top)
  // Base size for better visibility, with larger size when hovered
  const hoverScale = isHovered ? 1.5 : 1.0; // 50% larger when hovered
  const iconSize = starSize * 0.55 * hoverScale;
  const iconX = x;
  const iconY = y;
  
  // Draw a semi-transparent circular background for the icon
  // More visible background, brighter when hovered
  ctx.beginPath();
  ctx.arc(iconX, iconY, iconSize * 1.3, 0, Math.PI * 2);
  ctx.fillStyle = isHovered ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.45)";
  ctx.fill();
  ctx.strokeStyle = isHovered ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = isHovered ? 2.5 : 1.5;
  ctx.stroke();
  
  // Set icon drawing styles with increased stroke width
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = Math.max(isHovered ? 2.0 : 1.5, iconSize * 0.12);
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
function drawPlanetAIIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.6;
  
  // Central node
  ctx.beginPath();
  ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Outer nodes
  const nodeCount = 4;
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i * Math.PI * 2 / nodeCount) - Math.PI / 4;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    
    // Draw node
    ctx.beginPath();
    ctx.arc(px, py, size * 0.1, 0, Math.PI * 2);
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
function drawPlanetBlockchainIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.6;
  
  // Draw hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI / 2;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
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
  ctx.arc(x, y, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw shield icon (defense/security) for planet
 */
function drawPlanetShieldIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
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
function drawPlanetMobilityIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.55;
  const innerR = size * 0.2;
  
  // Outer wheel
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner hub
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.stroke();
  
  // Center point
  ctx.beginPath();
  ctx.arc(x, y, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  
  // Spokes
  const spokeCount = 4;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * Math.PI * 2 / spokeCount) + Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(x + innerR * Math.cos(angle), y + innerR * Math.sin(angle));
    ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
    ctx.stroke();
  }
}

/**
 * Draw default icon (star) for planet
 */
function drawPlanetDefaultIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const outerR = size * 0.5;
  const innerR = size * 0.2;
  const points = 4;
  
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI / points) - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}
