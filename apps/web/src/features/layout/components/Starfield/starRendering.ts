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

  // Get base color and create softer version
  const baseColor = planet.project.color || "#ffffff";
  const baseRgb = hexToRgb(baseColor);
  const softRgb = createSoftenedColor(baseRgb);

  // Calculate pulsation effect
  const scaleFactor = calculatePulsation(planet);
  const starSize = 15 * planetSize * scaleFactor; // Reduced from 20 to 15 (smaller planets)

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
    ctx.save();
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, starSize * 0.8, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.src = planet.project.image;

    if (img.complete) {
      const imgSize = starSize * 1.6;
      ctx.drawImage(img, planet.x - imgSize/2, planet.y - imgSize/2, imgSize, imgSize);
    } else {
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
    ctx.lineWidth = 1.5; // Reduced from 2
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; // Reduced from 0.67
    ctx.stroke();
  } else if (!planet.useSimpleRendering && displayStyle === "both" && planet.project.image) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(planet.x, planet.y - starSize * 0.3, starSize * 0.6, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.src = planet.project.image;

    if (img.complete) {
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
}
