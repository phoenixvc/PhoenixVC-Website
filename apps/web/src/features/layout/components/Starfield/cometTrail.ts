// cometTrail.ts - Comet trail rendering with multi-layer effects
// Single Responsibility: Handle all comet trail visual effects

import { hexToRgb } from "./starUtils";
import { getSecondaryColorRgb } from "./colorUtils";
import { Planet } from "./types";
import { getFrameTime } from "./frameCache";
import { SUNS } from "./cosmos/cosmicHierarchy";
import { COMET_CONFIG } from "./physicsConfig";
import { TWO_PI, fastSin, fastCos } from "./math";

/**
 * Get the sun color for a planet based on its focus area
 */
function getSunColorForPlanet(planet: Planet): { r: number; g: number; b: number } {
  const focusArea = planet.project?.focusArea;
  if (focusArea) {
    const matchingSun = SUNS.find(sun =>
      sun.parentId === "focus-areas-galaxy" &&
      sun.id.includes(focusArea.replace(/-/g, "-"))
    );
    if (matchingSun?.color) {
      const rgb = hexToRgb(matchingSun.color);
      if (rgb) return rgb;
    }
  }
  return { r: 255, g: 255, b: 255 };
}

/**
 * Draw comet trail with sun-aligned colors and realistic particle debris
 * Creates a multi-layer trail effect with:
 * - Main glowing trail body
 * - Inner bright core trail
 * - Debris particles
 * - Fine dust particles
 * - Bright sparkles
 * - Ice/gas jets
 */
export function drawStarTrail(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  starSize: number,
  _softRgb: {r: number, g: number, b: number},
  planetSize: number,
  scaleFactor: number
): void {
  const trailLength = planet.trailLength || 120;

  // Get sun color for enhanced trail coloring
  const sunRgb = getSunColorForPlanet(planet);
  const secondaryRgb = getSecondaryColorRgb(sunRgb);
  const time = getFrameTime();

  // Calculate movement direction (opposite to travel direction for trail)
  const dx = -fastSin(planet.angle) * (planet.orbitalDirection === "clockwise" ? 1 : -1);
  const dy = fastCos(planet.angle) * (planet.orbitalDirection === "clockwise" ? 1 : -1);

  const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;
  const normalizedDx = dx / magnitude;
  const normalizedDy = dy / magnitude;

  const trailEndX = planet.x - normalizedDx * trailLength;
  const trailEndY = planet.y - normalizedDy * trailLength;

  const perpDx = -normalizedDy;
  const perpDy = normalizedDx;

  // Color setup - pre-compute rgba prefix strings to avoid template creation in loops
  const sr = sunRgb.r;
  const sg = sunRgb.g;
  const sb = sunRgb.b;
  const scr = secondaryRgb.r;
  const scg = secondaryRgb.g;
  const scb = secondaryRgb.b;
  // Pre-computed rgba prefixes (avoids string template evaluation in hot loops)
  const sunRgbaPrefix = `rgba(${sr}, ${sg}, ${sb}, `;
  const secRgbaPrefix = `rgba(${scr}, ${scg}, ${scb}, `;
  const whiteRgbaPrefix = "rgba(255, 255, 255, ";

  // ===== LAYER 1: Main glowing trail body =====
  const startWidth = COMET_CONFIG.trailWidthMultiplier * planetSize * scaleFactor;

  // Subtle wobble for organic feel
  const wobbleTime = time * 0.0002;
  const wobbleAmount = 2 * fastSin(wobbleTime);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(planet.x + perpDx * startWidth/2, planet.y + perpDy * startWidth/2);

  // Create smooth curved trail path
  const cp1x = planet.x - normalizedDx * trailLength * 0.25 + perpDx * startWidth/3 + wobbleAmount;
  const cp1y = planet.y - normalizedDy * trailLength * 0.25 + perpDy * startWidth/3;
  const cp2x = planet.x - normalizedDx * trailLength * 0.5 + perpDx * 2;
  const cp2y = planet.y - normalizedDy * trailLength * 0.5 + perpDy * 2;

  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, trailEndX, trailEndY);

  const cp3x = planet.x - normalizedDx * trailLength * 0.5 - perpDx * 2;
  const cp3y = planet.y - normalizedDy * trailLength * 0.5 - perpDy * 2;
  const cp4x = planet.x - normalizedDx * trailLength * 0.25 - perpDx * startWidth/3 - wobbleAmount;
  const cp4y = planet.y - normalizedDy * trailLength * 0.25 - perpDy * startWidth/3;

  ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, planet.x - perpDx * startWidth/2, planet.y - perpDy * startWidth/2);
  ctx.closePath();

  // Gradient from bright head to fading tail
  const trailGradient = ctx.createLinearGradient(planet.x, planet.y, trailEndX, trailEndY);
  trailGradient.addColorStop(0, whiteRgbaPrefix + "1)");
  trailGradient.addColorStop(0.05, sunRgbaPrefix + "0.95)");
  trailGradient.addColorStop(0.2, sunRgbaPrefix + "0.75)");
  trailGradient.addColorStop(0.4, secRgbaPrefix + "0.5)");
  trailGradient.addColorStop(0.7, sunRgbaPrefix + "0.25)");
  trailGradient.addColorStop(1, secRgbaPrefix + "0)");

  ctx.fillStyle = trailGradient;
  ctx.fill();
  ctx.restore();

  // ===== LAYER 2: Inner bright core trail =====
  ctx.save();
  ctx.beginPath();
  const coreWidth = startWidth * COMET_CONFIG.coreWidthFraction;
  ctx.moveTo(planet.x, planet.y);
  ctx.lineTo(planet.x - normalizedDx * trailLength * COMET_CONFIG.coreLengthFraction, planet.y - normalizedDy * trailLength * COMET_CONFIG.coreLengthFraction);

  const coreGradient = ctx.createLinearGradient(
    planet.x, planet.y,
    planet.x - normalizedDx * trailLength * COMET_CONFIG.coreLengthFraction, planet.y - normalizedDy * trailLength * COMET_CONFIG.coreLengthFraction
  );
  coreGradient.addColorStop(0, whiteRgbaPrefix + "1)");
  coreGradient.addColorStop(0.3, sunRgbaPrefix + "0.8)");
  coreGradient.addColorStop(1, sunRgbaPrefix + "0)");

  ctx.strokeStyle = coreGradient;
  ctx.lineWidth = coreWidth;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();

  // ===== LAYER 3: Debris particles left behind (the "wake") =====
  const debrisCount = 60;
  ctx.save();

  for (let i = 0; i < debrisCount; i++) {
    const progress = (i / debrisCount);
    const distanceAlongTrail = progress * trailLength * 1.4;

    // Use deterministic "randomness" based on index and time
    const seed1 = fastSin(i * 127.1 + time * 0.00005);
    const seed2 = fastCos(i * 311.7 + time * 0.00004);
    const seed3 = fastSin(i * 74.3 + time * 0.00003);

    // Debris spreads wider as it trails behind
    const spreadFactor = progress * progress * trailLength * 0.4;
    const spreadX = seed1 * spreadFactor;
    const spreadY = seed2 * spreadFactor;

    // Base position along the trail
    const debrisX = planet.x - normalizedDx * distanceAlongTrail + perpDx * spreadX + spreadY * 0.3;
    const debrisY = planet.y - normalizedDy * distanceAlongTrail + perpDy * spreadX + spreadY * 0.3;

    // Size decreases and varies with distance
    const sizeVariation = 0.6 + seed3 * 0.4;
    const debrisSize = starSize * 0.28 * (1 - progress * 0.5) * sizeVariation;

    // Opacity fades with distance
    const debrisOpacity = (1 - progress) * 0.95 * (0.6 + Math.abs(seed1) * 0.4);

    if (debrisSize > 0.2 && debrisOpacity > 0.03) {
      // Draw debris particle with glow
      const debrisGlow = ctx.createRadialGradient(
        debrisX, debrisY, 0,
        debrisX, debrisY, debrisSize * 2.5
      );

      // Alternate between sun and secondary colors
      const useSecondary = i % 3 === 0;
      const debrisRgbaPrefix = useSecondary ? secRgbaPrefix : sunRgbaPrefix;
      debrisGlow.addColorStop(0, whiteRgbaPrefix + (debrisOpacity * 0.8) + ")");
      debrisGlow.addColorStop(0.3, debrisRgbaPrefix + (debrisOpacity * 0.6) + ")");
      debrisGlow.addColorStop(1, debrisRgbaPrefix + "0)");

      ctx.beginPath();
      ctx.arc(debrisX, debrisY, debrisSize * 2.5, 0, TWO_PI);
      ctx.fillStyle = debrisGlow;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(debrisX, debrisY, debrisSize * 0.5, 0, TWO_PI);
      ctx.fillStyle = whiteRgbaPrefix + (debrisOpacity * 0.9) + ")";
      ctx.fill();
    }
  }
  ctx.restore();

  // ===== LAYER 4: Fine dust particles (very small, numerous) =====
  const dustCount = 80;
  ctx.save();

  for (let i = 0; i < dustCount; i++) {
    const progress = i / dustCount;
    const distanceAlongTrail = progress * trailLength * 1.5;

    // More chaotic movement for dust
    const dustSeed1 = fastSin(i * 73.1 + time * 0.00008);
    const dustSeed2 = fastCos(i * 157.3 + time * 0.00006);

    // Wider spread for dust
    const dustSpread = progress * trailLength * 0.5;
    const dustOffsetX = dustSeed1 * dustSpread;
    const dustOffsetY = dustSeed2 * dustSpread;

    const dustX = planet.x - normalizedDx * distanceAlongTrail + dustOffsetX;
    const dustY = planet.y - normalizedDy * distanceAlongTrail + dustOffsetY;

    const dustSize = starSize * 0.1 * (1 - progress * 0.3);
    const dustOpacity = (1 - progress * 0.6) * 0.7 * Math.abs(dustSeed1);

    if (dustSize > 0.15 && dustOpacity > 0.02) {
      ctx.beginPath();
      ctx.arc(dustX, dustY, dustSize, 0, TWO_PI);
      ctx.fillStyle = sunRgbaPrefix + dustOpacity + ")";
      ctx.fill();
    }
  }
  ctx.restore();

  // ===== LAYER 5: Bright sparkles (occasional flashes) =====
  const sparkleCount = 12;
  ctx.save();

  for (let i = 0; i < sparkleCount; i++) {
    const progress = (i + 0.5) / sparkleCount;
    const distanceAlongTrail = progress * trailLength * 0.8;

    // Sparkles twinkle in and out
    const twinkle = fastSin(time * 0.002 + i * 2.7);
    if (twinkle < 0.2) continue;

    const sparkleSeed = fastSin(i * 43.7);
    const sparkleSpread = progress * trailLength * 0.15;

    const sparkleX = planet.x - normalizedDx * distanceAlongTrail + perpDx * sparkleSeed * sparkleSpread;
    const sparkleY = planet.y - normalizedDy * distanceAlongTrail + perpDy * sparkleSeed * sparkleSpread;

    const sparkleSize = starSize * 0.12 * twinkle;
    const sparkleOpacity = twinkle * (1 - progress * 0.4) * 0.95;

    // Draw sparkle with glow
    const sparkleGradient = ctx.createRadialGradient(
      sparkleX, sparkleY, 0,
      sparkleX, sparkleY, sparkleSize * 3.5
    );
    sparkleGradient.addColorStop(0, whiteRgbaPrefix + sparkleOpacity + ")");
    sparkleGradient.addColorStop(0.2, sunRgbaPrefix + (sparkleOpacity * 0.75) + ")");
    sparkleGradient.addColorStop(1, sunRgbaPrefix + "0)");

    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, sparkleSize * 3.5, 0, TWO_PI);
    ctx.fillStyle = sparkleGradient;
    ctx.fill();

    // Cross-flare for sparkle effect
    ctx.beginPath();
    ctx.moveTo(sparkleX - sparkleSize * 2.5, sparkleY);
    ctx.lineTo(sparkleX + sparkleSize * 2.5, sparkleY);
    ctx.moveTo(sparkleX, sparkleY - sparkleSize * 2.5);
    ctx.lineTo(sparkleX, sparkleY + sparkleSize * 2.5);
    ctx.strokeStyle = whiteRgbaPrefix + (sparkleOpacity * 0.7) + ")";
    ctx.lineWidth = sparkleSize * 0.4;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.restore();

  // ===== LAYER 6: Ice/gas jets (erupting from comet head) =====
  const jetCount = 3;
  ctx.save();

  for (let i = 0; i < jetCount; i++) {
    // Jets spray out at angles from the comet
    const jetAngle = (i - 1) * 0.4 + fastSin(time * 0.001 + i) * 0.15;
    const jetDirX = normalizedDx * fastCos(jetAngle) - perpDx * fastSin(jetAngle);
    const jetDirY = normalizedDy * fastCos(jetAngle) - perpDy * fastSin(jetAngle);

    const jetLength = trailLength * (0.3 + fastSin(time * 0.0008 + i * 2) * 0.1);
    const jetWidth = startWidth * 0.3;

    const jetEndX = planet.x - jetDirX * jetLength;
    const jetEndY = planet.y - jetDirY * jetLength;

    const jetGradient = ctx.createLinearGradient(planet.x, planet.y, jetEndX, jetEndY);
    jetGradient.addColorStop(0, secRgbaPrefix + "0.4)");
    jetGradient.addColorStop(0.3, sunRgbaPrefix + "0.25)");
    jetGradient.addColorStop(1, sunRgbaPrefix + "0)");

    ctx.beginPath();
    ctx.moveTo(planet.x, planet.y);
    ctx.lineTo(jetEndX, jetEndY);
    ctx.strokeStyle = jetGradient;
    ctx.lineWidth = jetWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.restore();
}
