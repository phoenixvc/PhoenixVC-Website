// components/Layout/Starfield/starUtils.ts

import { Planet } from "./types";
import { getFrameTime } from "./frameCache";

// Helper function to convert hex color to RGB
export function hexToRgb(hex: string): { r: number, g: number, b: number } {
    // Default color if invalid
    if (!hex || typeof hex !== "string") {
      return { r: 255, g: 255, b: 255 };
    }

    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Handle shorthand hex
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Handle invalid hex
    if (hex.length !== 6) {
      return { r: 255, g: 255, b: 255 };
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }

  // Create a softened version of a color
  export function createSoftenedColor(baseRgb: {r: number, g: number, b: number}): {r: number, g: number, b: number} {
    return {
      r: Math.round(baseRgb.r * 0.85 + 38), // Add a bit of brightness to maintain visibility
      g: Math.round(baseRgb.g * 0.85 + 38),
      b: Math.round(baseRgb.b * 0.85 + 38)
    };
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
