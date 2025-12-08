// satelliteRendering.ts - Satellite and moon rendering for planets
// Single Responsibility: Handle all satellite visual effects and animations

import { hexToRgb } from "./starUtils";
import { getSecondaryColorRgb } from "./colorUtils";
import { Planet } from "./types";
import { getFrameTime } from "./frameCache";
import { SUNS } from "./cosmos/cosmicHierarchy";
import { TWO_PI, fastSin, fastCos } from "./math";

/**
 * Get the sun color for a planet based on its focus area
 */
function getSunColorForPlanet(planet: Planet): {
  r: number;
  g: number;
  b: number;
} {
  const focusArea = planet.project?.focusArea;
  if (focusArea) {
    const matchingSun = SUNS.find(
      (sun) =>
        sun.parentId === "focus-areas-galaxy" &&
        sun.id.includes(focusArea.replace(/-/g, "-")),
    );
    if (matchingSun?.color) {
      const rgb = hexToRgb(matchingSun.color);
      if (rgb) return rgb;
    }
  }
  return { r: 255, g: 255, b: 255 };
}

/**
 * Draw satellites with sun-aligned colors
 * Includes orbit paths, satellite bodies, glows, and particle effects
 */
export function drawSatellites(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  scaleFactor: number,
  _softRgb: { r: number; g: number; b: number },
  _deltaTime: number,
): void {
  const fixedDelta = planet.useSimpleRendering ? 0.2 : 0.5;

  // Get sun color for this planet's focus area
  const sunRgb = getSunColorForPlanet(planet);
  const secondaryRgb = getSecondaryColorRgb(sunRgb);
  const time = getFrameTime();

  // Pre-compute rgba prefix strings to avoid template creation in loops
  const sunRgbaPrefix = `rgba(${sunRgb.r}, ${sunRgb.g}, ${sunRgb.b}, `;
  const secRgbaPrefix = `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, `;

  // Draw orbit paths for satellites with sun-aligned gradient colors
  if (
    planet.satellites &&
    planet.satellites.length > 0 &&
    !planet.useSimpleRendering
  ) {
    planet.satellites.forEach((satellite, index) => {
      const a = satellite.distance * scaleFactor;
      const b = satellite.distance * (1 - satellite.eccentricity) * scaleFactor;

      // Animated orbit ring with sun color
      const orbitPhase = fastSin(time * 0.0003 + index * 0.5) * 0.5 + 0.5;
      const orbitOpacity = 0.15 + orbitPhase * 0.1;

      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y, a, b, 0, 0, TWO_PI);

      // Use sun's secondary color for orbit rings with gradient effect
      const orbitGradient = ctx.createLinearGradient(
        planet.x - a,
        planet.y,
        planet.x + a,
        planet.y,
      );
      orbitGradient.addColorStop(0, secRgbaPrefix + orbitOpacity + ")");
      orbitGradient.addColorStop(0.5, sunRgbaPrefix + orbitOpacity * 0.7 + ")");
      orbitGradient.addColorStop(1, secRgbaPrefix + orbitOpacity + ")");

      ctx.strokeStyle = orbitGradient;
      ctx.lineWidth = 1 + orbitPhase * 0.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Add subtle glow to orbit
      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y, a, b, 0, 0, TWO_PI);
      ctx.strokeStyle = sunRgbaPrefix + orbitOpacity * 0.3 + ")";
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }

  // Update and draw satellites with sun-aligned colors
  if (planet.satellites && planet.satellites.length > 0) {
    planet.satellites.forEach((satellite, index) => {
      // Independent pulsation for satellites - smoother and slower
      const satelliteTime = time * 0.0004;
      const satellitePulse =
        0.92 + fastSin(satelliteTime * (index + 1) * 0.25) * 0.08;

      // Update satellite position
      const directionMult = index % 2 === 0 ? 1 : -1;
      satellite.angle += satellite.speed * fixedDelta * directionMult;

      const eccentricity = satellite.eccentricity || 0.1;
      const a = satellite.distance * scaleFactor;
      const b = satellite.distance * (1 - eccentricity) * scaleFactor;

      // Calculate satellite position relative to the planet
      const satX = planet.x + a * fastCos(satellite.angle);
      const satY = planet.y + b * fastSin(satellite.angle);

      // Use sun's secondary color for satellites (moons)
      const moonRgb = index % 2 === 0 ? secondaryRgb : sunRgb;
      const softMoonRgb = {
        r: Math.round(moonRgb.r * 0.85 + 38),
        g: Math.round(moonRgb.g * 0.85 + 38),
        b: Math.round(moonRgb.b * 0.85 + 38),
      };
      // Pre-compute moon rgba prefix for this satellite
      const moonRgbaPrefix = index % 2 === 0 ? secRgbaPrefix : sunRgbaPrefix;
      const softMoonRgbaPrefix = `rgba(${softMoonRgb.r}, ${softMoonRgb.g}, ${softMoonRgb.b}, `;

      // Draw satellite outer glow
      ctx.save();
      const glowSize = satellite.size * 2.2 * scaleFactor * satellitePulse;
      ctx.beginPath();
      ctx.arc(satX, satY, glowSize, 0, TWO_PI);
      const glowGradient = ctx.createRadialGradient(
        satX,
        satY,
        0,
        satX,
        satY,
        glowSize,
      );

      glowGradient.addColorStop(0, softMoonRgbaPrefix + "0.85)");
      glowGradient.addColorStop(0.4, softMoonRgbaPrefix + "0.35)");
      glowGradient.addColorStop(0.7, sunRgbaPrefix + "0.15)");
      glowGradient.addColorStop(1, softMoonRgbaPrefix + "0)");

      ctx.fillStyle = glowGradient;
      ctx.fill();
      ctx.restore();

      // Draw satellite core with gradient
      const coreSize = satellite.size * scaleFactor * satellitePulse;
      const coreGradient = ctx.createRadialGradient(
        satX - coreSize * 0.2,
        satY - coreSize * 0.2,
        0,
        satX,
        satY,
        coreSize,
      );
      coreGradient.addColorStop(0, "#ffffff");
      coreGradient.addColorStop(0.3, softMoonRgbaPrefix + "1)");
      coreGradient.addColorStop(0.7, moonRgbaPrefix + "0.95)");
      coreGradient.addColorStop(1, moonRgbaPrefix + "0.8)");

      ctx.beginPath();
      ctx.arc(satX, satY, coreSize, 0, TWO_PI);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Draw bright center highlight
      ctx.save();
      const highlightGradient = ctx.createRadialGradient(
        satX - coreSize * 0.15,
        satY - coreSize * 0.15,
        0,
        satX,
        satY,
        coreSize * 0.5,
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      highlightGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.arc(satX, satY, coreSize * 0.5, 0, TWO_PI);
      ctx.fillStyle = highlightGradient;
      ctx.fill();
      ctx.restore();

      // Add trailing particles with sun color
      if (Math.random() < 0.008) {
        const particleCount = 2 + Math.floor(Math.random() * 2);

        ctx.save();
        for (let i = 0; i < particleCount; i++) {
          const particleAngle = Math.random() * TWO_PI;
          const particleDistance = satellite.size * (1.8 + Math.random() * 2);
          const particleX = satX + fastCos(particleAngle) * particleDistance;
          const particleY = satY + fastSin(particleAngle) * particleDistance;
          const particleSize = satellite.size * 0.2 * Math.random();

          // Use sun color for particles
          const particlePrefix = i % 2 === 0 ? sunRgbaPrefix : secRgbaPrefix;

          ctx.beginPath();
          ctx.arc(particleX, particleY, particleSize, 0, TWO_PI);
          ctx.fillStyle = particlePrefix + (0.3 + Math.random() * 0.3) + ")";
          ctx.fill();
        }
        ctx.restore();
      }
    });
  }
}
