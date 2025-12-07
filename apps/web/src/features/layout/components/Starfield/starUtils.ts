// components/Layout/Starfield/starUtils.ts

import { Planet } from "./types";
import { getFrameTime } from "./frameCache";
import {
  hexToRgbSafe as hexToRgbFromColorUtils,
  createSoftenedColor as createSoftenedColorFromColorUtils,
  RGB,
} from "./colorUtils";

// Default white color for stars
const WHITE_RGB: RGB = { r: 255, g: 255, b: 255 };

/**
 * Helper function to convert hex color to RGB
 * Uses colorUtils.ts implementation with white as default fallback
 * Re-exported for backwards compatibility
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return hexToRgbFromColorUtils(hex, WHITE_RGB);
}

/**
 * Create a softened version of a color
 * Re-exported from colorUtils.ts for backwards compatibility
 */
export function createSoftenedColor(
  baseRgb: { r: number; g: number; b: number }
): { r: number; g: number; b: number } {
  return createSoftenedColorFromColorUtils(baseRgb);
}

  // Helper function to ensure valid hex color with opacity
  export const ensureValidHexColor = (baseColor: string, opacity: number): string => {
    // Make sure opacity is between 0-255 and convert to hex
    const opacityHex = Math.min(255, Math.max(0, Math.floor(opacity * 255))).toString(16).padStart(2, "0");

    // If baseColor is already a hex color with # prefix
    if (baseColor.startsWith("#")) {
      // Remove any existing alpha component if it"s an 8-digit hex
      const baseHex = baseColor.length > 7 ? baseColor.substring(0, 7) : baseColor;
      return `${baseHex}${opacityHex}`;
    }

    // Default fallback color if format is invalid
    return `#ffffff${opacityHex}`;
  };

  // Calculate star pulsation
  export function calculatePulsation(empStar: Planet): number {
    let scaleFactor = 1;
    if (!empStar.useSimpleRendering && empStar.pulsation) {
      if (!empStar.pulsation.enabled) {
        empStar.pulsation.enabled = true;
      }

      // Smoother pulsation with sine wave and reduced amplitude
      const pulsationTime = getFrameTime() * empStar.pulsation.speed;
      const pulsationRange = empStar.pulsation.maxScale - empStar.pulsation.minScale;
      const pulsationMid = (empStar.pulsation.maxScale + empStar.pulsation.minScale) / 2;

      // Use sine wave for smoother pulsation with more subtle effect
      empStar.pulsation.scale = pulsationMid + Math.sin(pulsationTime) * (pulsationRange / 2);

      scaleFactor = empStar.pulsation.scale;
    }
    return scaleFactor;
  }

  export function updateStarPosition(empStar: Planet, deltaTime: number): void {
    const fixedDelta = empStar.useSimpleRendering ? 0.2 : 0.5;
    const directionMultiplier = empStar.orbitalDirection === "clockwise" ? 1 : -1;

    const ox = empStar.orbitCenter?.x ?? 0;
    const oy = empStar.orbitCenter?.y ?? 0;

    if (empStar.useSimpleRendering) {
      empStar.angle += directionMultiplier * 0.00005 * fixedDelta;
    } else {
      const speedMultiplier = directionMultiplier * empStar.orbitSpeed * fixedDelta * 1.0; // Reduced from 2.0 to 1.0 (halved movement)
      empStar.angle += speedMultiplier;
    }

    const a = empStar.orbitRadius;
    // Apply vertical factor to create more vertically stretched orbits
    const verticalFactor = empStar.verticalFactor || 1.0;
    const b = empStar.orbitRadius * (1 - empStar.pathEccentricity) * verticalFactor;

    if (empStar.useSimpleRendering) {
      empStar.x = ox + a * Math.cos(empStar.angle);
      empStar.y = oy + b * Math.sin(empStar.angle);
    } else {
      const tiltRadians = empStar.pathTilt * (Math.PI / 180);
      const baseX = a * Math.cos(empStar.angle);
      const baseY = b * Math.sin(empStar.angle);

      empStar.x = ox + baseX;
      empStar.y = oy + baseY * Math.cos(tiltRadians);
    }
  }
