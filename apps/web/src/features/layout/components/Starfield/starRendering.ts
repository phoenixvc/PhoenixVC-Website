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
  empStar: Planet,
  deltaTime: number,
  planetSize: number,
  employeeDisplayStyle: "initials" | "avatar" | "both"
): void => {
  if (!ctx || !empStar) return;

  // Skip position updates if the star is paused
  if (!empStar.isMovementPaused) {
    // Update star position based on orbit
    updateStarPosition(empStar, deltaTime);
  }

  // Get base color and create softer version
  const baseColor = empStar.employee.color || "#ffffff";
  const baseRgb = hexToRgb(baseColor);
  const softRgb = createSoftenedColor(baseRgb);

  // Calculate pulsation effect
  const scaleFactor = calculatePulsation(empStar);
  const starSize = 20 * planetSize * scaleFactor;

  // Draw nebula effects for important stars
  drawNebulaEffects(ctx, empStar, starSize, softRgb);

  // Draw comet trail if applicable
  if (empStar.pathType === "comet") {
    drawStarTrail(ctx, empStar, starSize, softRgb, planetSize, scaleFactor);
  }

  // Draw random star flares
  drawStarFlares(ctx, empStar, starSize, softRgb);

  // Draw star core and glow
  if (empStar.useSimpleRendering) {
    // Simple rendering for performance
    ctx.beginPath();
    ctx.arc(empStar.x, empStar.y, starSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`;
    ctx.fill();
  } else {
    // Enhanced rendering with glow
    drawStarGlow(ctx, empStar, starSize, softRgb);
  }

  // Draw satellites
  if (empStar.satellites && empStar.satellites.length > 0) {
    drawSatellites(ctx, empStar, scaleFactor, softRgb, deltaTime);
  }

  // Draw hover/selection effects
  drawHoverEffects(ctx, empStar, starSize, softRgb);

  // Draw employee identifier (initials or avatar)
  drawEmployeeIdentifier(ctx, empStar, starSize, employeeDisplayStyle);

  // Draw connections to related stars
  if ((empStar.isHovered || empStar.isSelected) && window.planets) {
    drawConnections(ctx, empStar, window.planets, softRgb);
  }
};

// Draw employee identifier (initials or avatar)
function drawEmployeeIdentifier(
  ctx: CanvasRenderingContext2D,
  empStar: Planet,
  starSize: number,
  employeeDisplayStyle: "initials" | "avatar" | "both"
): void {
  if (!empStar.useSimpleRendering && employeeDisplayStyle === "avatar" && empStar.employee.image) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(empStar.x, empStar.y, starSize * 0.8, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.src = empStar.employee.image;

    if (img.complete) {
      const imgSize = starSize * 1.6;
      ctx.drawImage(img, empStar.x - imgSize/2, empStar.y - imgSize/2, imgSize, imgSize);
    } else {
      ctx.font = `bold ${Math.floor(starSize * 0.8)}px Arial`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(empStar.employee.initials || "?", empStar.x, empStar.y);
    }

    ctx.restore();

    // Add a subtle ring around the avatar
    ctx.beginPath();
    ctx.arc(empStar.x, empStar.y, starSize * 0.85, 0, Math.PI * 2);
    ctx.lineWidth = 1.5; // Reduced from 2
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; // Reduced from 0.67
    ctx.stroke();
  } else if (!empStar.useSimpleRendering && employeeDisplayStyle === "both" && empStar.employee.image) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(empStar.x, empStar.y - starSize * 0.3, starSize * 0.6, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.src = empStar.employee.image;

    if (img.complete) {
      const imgSize = starSize * 1.2;
      ctx.drawImage(img, empStar.x - imgSize/2, empStar.y - starSize * 0.3 - imgSize/2, imgSize, imgSize);
    }

    ctx.restore();

    // Enhanced name display with better readability
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; // Reduced from 0.9
    ctx.shadowBlur = 4; // Reduced from 5
    ctx.font = `bold ${Math.floor(starSize * 0.6)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(empStar.employee.name || empStar.employee.initials || "?", empStar.x, empStar.y + starSize * 0.7);
    ctx.shadowBlur = 0;
  } else {
    // Improved initials display with better visibility
    if (!empStar.useSimpleRendering) {
      // Add a subtle background circle for better text visibility
      ctx.beginPath();
      ctx.arc(empStar.x, empStar.y, starSize * 0.7, 0, Math.PI * 2);
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
    ctx.fillText(empStar.employee.initials || "?", empStar.x, empStar.y);

    if (!empStar.useSimpleRendering) {
      ctx.shadowBlur = 0;

      // Add a subtle ring around the initials
      ctx.beginPath();
      ctx.arc(empStar.x, empStar.y, starSize * 0.85, 0, Math.PI * 2);
      ctx.lineWidth = 1.2; // Reduced from 1.5
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)"; // Reduced from 0.53
      ctx.stroke();
    }
  }
}
