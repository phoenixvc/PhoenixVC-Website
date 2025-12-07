// components/Layout/Starfield/starEffects.ts

import { hexToRgb } from "./starUtils";
import { getSecondaryColorRgb } from "./colorUtils";
import { Planet, PortfolioProject } from "./types";
import { getFrameTime } from "./frameCache";
import { SUNS } from "./cosmos/cosmicHierarchy";
import { COMET_CONFIG } from "./physicsConfig";
import { TWO_PI } from "./math";

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

// Draw star glow and core
export function drawStarGlow(
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    starSize: number,
    softRgb: {r: number, g: number, b: number}
  ): void {
    // Create a unique offset for this star based on project ID with proper null checking
    const uniqueOffset = planet.project?.id
      ? (typeof planet.project.id === "string"
          ? planet.project.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
          : Number(planet.project.id))
      : Math.random() * 1000; // Fallback to a random offset if no project ID

    // Apply subtle pulsing effect using the unique offset
    const pulseTime = getFrameTime() * 0.0003 + (uniqueOffset * 0.05);
    const pulseFactor = 1 + Math.sin(pulseTime) * 0.1; // 10% size variation

    // Enhanced glow effect - softer glow with independent pulsing
    const glowMultiplier = planet.glowIntensity ||
      (planet.pathType === "star" ? 2.5 * pulseFactor :
       planet.pathType === "planet" ? 1.6 * pulseFactor :
       planet.pathType === "comet" ? 2.0 * pulseFactor : 1.6 * pulseFactor);

    const glowGradient = ctx.createRadialGradient(
      planet.x, planet.y, 0,
      planet.x, planet.y, starSize * 2.0 * glowMultiplier
    );

    // Use rgba format for star glow to avoid color parsing issues - softer glow
    glowGradient.addColorStop(0, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`);
    glowGradient.addColorStop(0.3, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.4)`);
    glowGradient.addColorStop(0.6, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.2)`);
    glowGradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0)`);

    ctx.beginPath();
    ctx.arc(planet.x, planet.y, starSize * 2.0 * glowMultiplier, 0, TWO_PI);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    const gradient = ctx.createRadialGradient(
      planet.x, planet.y, 0,
      planet.x, planet.y, starSize * pulseFactor // Apply pulse to core size too
    );

    // Enhanced core appearance based on path type - with softer colors
    switch (planet.pathType) {
      case "star":
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        gradient.addColorStop(0.2, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`);
        gradient.addColorStop(0.7, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.5)`);
        gradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.2)`);
        break;
      case "planet":
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        gradient.addColorStop(0.3, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.9)`);
        gradient.addColorStop(0.7, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.55)`);
        gradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.2)`);
        break;
      case "comet":
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        gradient.addColorStop(0.2, "rgba(255, 255, 238, 0.9)");
        gradient.addColorStop(0.4, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.85)`);
        gradient.addColorStop(0.7, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.5)`);
        gradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.25)`);
        break;
      default:
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        gradient.addColorStop(0.3, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.85)`);
        gradient.addColorStop(0.8, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.45)`);
        gradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.15)`);
    }

    ctx.beginPath();
    ctx.arc(planet.x, planet.y, starSize * pulseFactor, 0, TWO_PI);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

// Draw comet trail with sun-aligned colors and realistic particle debris
export function drawStarTrail(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  starSize: number,
  softRgb: {r: number, g: number, b: number},
  planetSize: number,
  scaleFactor: number
): void {
  const trailLength = planet.trailLength || 120; // Reduced from 200 to 120 for shorter, more consistent tails
  
  // Get sun color for enhanced trail coloring
  const sunRgb = getSunColorForPlanet(planet);
  const secondaryRgb = getSecondaryColorRgb(sunRgb);
  const time = getFrameTime();

  // Calculate movement direction (opposite to travel direction for trail)
  const dx = -Math.sin(planet.angle) * (planet.orbitalDirection === "clockwise" ? 1 : -1);
  const dy = Math.cos(planet.angle) * (planet.orbitalDirection === "clockwise" ? 1 : -1);

  const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;
  const normalizedDx = dx / magnitude;
  const normalizedDy = dy / magnitude;

  const trailEndX = planet.x - normalizedDx * trailLength;
  const trailEndY = planet.y - normalizedDy * trailLength;

  const perpDx = -normalizedDy;
  const perpDy = normalizedDx;

  // Color setup
  const sr = sunRgb.r;
  const sg = sunRgb.g;
  const sb = sunRgb.b;
  const scr = secondaryRgb.r;
  const scg = secondaryRgb.g;
  const scb = secondaryRgb.b;

  // ===== LAYER 1: Main glowing trail body =====
  // Use configurable width multiplier for trail visibility
  const startWidth = COMET_CONFIG.trailWidthMultiplier * planetSize * scaleFactor;
  
  // Subtle wobble for organic feel
  const wobbleTime = time * 0.0002;
  const wobbleAmount = 2 * Math.sin(wobbleTime);

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

  // Gradient from bright head to fading tail - increased opacity
  const trailGradient = ctx.createLinearGradient(planet.x, planet.y, trailEndX, trailEndY);
  trailGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  trailGradient.addColorStop(0.05, `rgba(${sr}, ${sg}, ${sb}, 0.95)`);
  trailGradient.addColorStop(0.2, `rgba(${sr}, ${sg}, ${sb}, 0.75)`);
  trailGradient.addColorStop(0.4, `rgba(${scr}, ${scg}, ${scb}, 0.5)`);
  trailGradient.addColorStop(0.7, `rgba(${sr}, ${sg}, ${sb}, 0.25)`);
  trailGradient.addColorStop(1, `rgba(${scr}, ${scg}, ${scb}, 0)`);

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
  coreGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  coreGradient.addColorStop(0.3, `rgba(${sr}, ${sg}, ${sb}, 0.8)`);
  coreGradient.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);
  
  ctx.strokeStyle = coreGradient;
  ctx.lineWidth = coreWidth;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();

  // ===== LAYER 3: Debris particles left behind (the "wake") =====
  // These simulate material shed by the comet - increased count and size for more visible trail
  const debrisCount = 60;
  ctx.save();
  
  for (let i = 0; i < debrisCount; i++) {
    // Debris spreads out more as it gets further from the comet
    const progress = (i / debrisCount);
    const distanceAlongTrail = progress * trailLength * 1.4; // Extend further past main trail
    
    // Use deterministic "randomness" based on index and time for consistent positioning
    const seed1 = Math.sin(i * 127.1 + time * 0.00005);
    const seed2 = Math.cos(i * 311.7 + time * 0.00004);
    const seed3 = Math.sin(i * 74.3 + time * 0.00003);
    
    // Debris spreads wider as it trails behind
    const spreadFactor = progress * progress * trailLength * 0.4;
    const spreadX = seed1 * spreadFactor;
    const spreadY = seed2 * spreadFactor;
    
    // Base position along the trail
    const debrisX = planet.x - normalizedDx * distanceAlongTrail + perpDx * spreadX + spreadY * 0.3;
    const debrisY = planet.y - normalizedDy * distanceAlongTrail + perpDy * spreadX + spreadY * 0.3;
    
    // Size decreases and varies with distance - significantly increased base size for visibility
    const sizeVariation = 0.6 + seed3 * 0.4;
    const debrisSize = starSize * 0.28 * (1 - progress * 0.5) * sizeVariation;
    
    // Opacity fades with distance - increased for visibility
    const debrisOpacity = (1 - progress) * 0.95 * (0.6 + Math.abs(seed1) * 0.4);
    
    if (debrisSize > 0.2 && debrisOpacity > 0.03) {
      // Draw debris particle with glow
      const debrisGlow = ctx.createRadialGradient(
        debrisX, debrisY, 0,
        debrisX, debrisY, debrisSize * 2.5
      );
      
      // Alternate between sun and secondary colors
      const useSecondary = i % 3 === 0;
      const dr = useSecondary ? scr : sr;
      const dg = useSecondary ? scg : sg;
      const db = useSecondary ? scb : sb;
      
      debrisGlow.addColorStop(0, `rgba(255, 255, 255, ${debrisOpacity * 0.8})`);
      debrisGlow.addColorStop(0.3, `rgba(${dr}, ${dg}, ${db}, ${debrisOpacity * 0.6})`);
      debrisGlow.addColorStop(1, `rgba(${dr}, ${dg}, ${db}, 0)`);
      
      ctx.beginPath();
      ctx.arc(debrisX, debrisY, debrisSize * 2.5, 0, TWO_PI);
      ctx.fillStyle = debrisGlow;
      ctx.fill();
      
      // Bright core
      ctx.beginPath();
      ctx.arc(debrisX, debrisY, debrisSize * 0.5, 0, TWO_PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${debrisOpacity * 0.9})`;
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
    const dustSeed1 = Math.sin(i * 73.1 + time * 0.00008);
    const dustSeed2 = Math.cos(i * 157.3 + time * 0.00006);
    
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
      ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${dustOpacity})`;
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
    const twinkle = Math.sin(time * 0.002 + i * 2.7);
    if (twinkle < 0.2) continue; // Only show when "bright" - lowered threshold for more sparkles
    
    const sparkleSeed = Math.sin(i * 43.7);
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
    sparkleGradient.addColorStop(0, `rgba(255, 255, 255, ${sparkleOpacity})`);
    sparkleGradient.addColorStop(0.2, `rgba(${sr}, ${sg}, ${sb}, ${sparkleOpacity * 0.75})`);
    sparkleGradient.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);
    
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
    ctx.strokeStyle = `rgba(255, 255, 255, ${sparkleOpacity * 0.7})`;
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
    const jetAngle = (i - 1) * 0.4 + Math.sin(time * 0.001 + i) * 0.15;
    const jetDirX = normalizedDx * Math.cos(jetAngle) - perpDx * Math.sin(jetAngle);
    const jetDirY = normalizedDy * Math.cos(jetAngle) - perpDy * Math.sin(jetAngle);
    
    const jetLength = trailLength * (0.3 + Math.sin(time * 0.0008 + i * 2) * 0.1);
    const jetWidth = startWidth * 0.3;
    
    const jetEndX = planet.x - jetDirX * jetLength;
    const jetEndY = planet.y - jetDirY * jetLength;
    
    const jetGradient = ctx.createLinearGradient(planet.x, planet.y, jetEndX, jetEndY);
    jetGradient.addColorStop(0, `rgba(${scr}, ${scg}, ${scb}, 0.4)`);
    jetGradient.addColorStop(0.3, `rgba(${sr}, ${sg}, ${sb}, 0.25)`);
    jetGradient.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);
    
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

// Draw satellites with sun-aligned colors
export function drawSatellites(
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    scaleFactor: number,
    softRgb: {r: number, g: number, b: number},
    deltaTime: number
  ): void {
    const fixedDelta = planet.useSimpleRendering ? 0.2 : 0.5;
    
    // Get sun color for this planet's focus area
    const sunRgb = getSunColorForPlanet(planet);
    const secondaryRgb = getSecondaryColorRgb(sunRgb);
    const time = getFrameTime();

    // Draw orbit paths for satellites with sun-aligned gradient colors
    if (planet.satellites && planet.satellites.length > 0 && !planet.useSimpleRendering) {
      planet.satellites.forEach((satellite, index) => {
        const a = satellite.distance * scaleFactor;
        const b = satellite.distance * (1 - satellite.eccentricity) * scaleFactor;
        
        // Animated orbit ring with sun color
        const orbitPhase = Math.sin(time * 0.0003 + index * 0.5) * 0.5 + 0.5;
        const orbitOpacity = 0.15 + orbitPhase * 0.1;

        ctx.beginPath();
        ctx.ellipse(
          planet.x,
          planet.y,
          a,
          b,
          0,
          0,
          TWO_PI
        );
        
        // Use sun's secondary color for orbit rings with gradient effect
        const orbitGradient = ctx.createLinearGradient(
          planet.x - a, planet.y,
          planet.x + a, planet.y
        );
        orbitGradient.addColorStop(0, `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, ${orbitOpacity})`);
        orbitGradient.addColorStop(0.5, `rgba(${sunRgb.r}, ${sunRgb.g}, ${sunRgb.b}, ${orbitOpacity * 0.7})`);
        orbitGradient.addColorStop(1, `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, ${orbitOpacity})`);
        
        ctx.strokeStyle = orbitGradient;
        ctx.lineWidth = 1 + orbitPhase * 0.5;
        ctx.lineCap = "round";
        ctx.stroke();
        
        // Add subtle glow to orbit
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, a, b, 0, 0, TWO_PI);
        ctx.strokeStyle = `rgba(${sunRgb.r}, ${sunRgb.g}, ${sunRgb.b}, ${orbitOpacity * 0.3})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      });
    }

    // Update and draw satellites with sun-aligned colors
    if (planet.satellites && planet.satellites.length > 0) {
      planet.satellites.forEach((satellite, index) => {
        // Independent pulsation for satellites - smoother and slower
        const satelliteTime = time * 0.0004;
        const satellitePulse = 0.92 + Math.sin(satelliteTime * (index + 1) * 0.25) * 0.08;

        // Update satellite position
        const directionMult = index % 2 === 0 ? 1 : -1;
        satellite.angle += satellite.speed * fixedDelta * directionMult;

        const eccentricity = satellite.eccentricity || 0.1;
        const a = satellite.distance * scaleFactor;
        const b = satellite.distance * (1 - eccentricity) * scaleFactor;

        // Calculate satellite position relative to the planet
        const satX = planet.x + a * Math.cos(satellite.angle);
        const satY = planet.y + b * Math.sin(satellite.angle);
        
        // Use sun's secondary color for satellites (moons)
        const moonRgb = index % 2 === 0 ? secondaryRgb : sunRgb;
        const softMoonRgb = {
          r: Math.round(moonRgb.r * 0.85 + 38),
          g: Math.round(moonRgb.g * 0.85 + 38),
          b: Math.round(moonRgb.b * 0.85 + 38)
        };

        // Draw satellite outer glow
        ctx.save();
        const glowSize = satellite.size * 2.2 * scaleFactor * satellitePulse;
        ctx.beginPath();
        ctx.arc(satX, satY, glowSize, 0, TWO_PI);
        const glowGradient = ctx.createRadialGradient(
          satX, satY, 0,
          satX, satY, glowSize
        );

        glowGradient.addColorStop(0, `rgba(${softMoonRgb.r}, ${softMoonRgb.g}, ${softMoonRgb.b}, 0.85)`);
        glowGradient.addColorStop(0.4, `rgba(${softMoonRgb.r}, ${softMoonRgb.g}, ${softMoonRgb.b}, 0.35)`);
        glowGradient.addColorStop(0.7, `rgba(${sunRgb.r}, ${sunRgb.g}, ${sunRgb.b}, 0.15)`);
        glowGradient.addColorStop(1, `rgba(${softMoonRgb.r}, ${softMoonRgb.g}, ${softMoonRgb.b}, 0)`);

        ctx.fillStyle = glowGradient;
        ctx.fill();
        ctx.restore();

        // Draw satellite core with gradient
        const coreSize = satellite.size * scaleFactor * satellitePulse;
        const coreGradient = ctx.createRadialGradient(
          satX - coreSize * 0.2, satY - coreSize * 0.2, 0,
          satX, satY, coreSize
        );
        coreGradient.addColorStop(0, "#ffffff");
        coreGradient.addColorStop(0.3, `rgba(${softMoonRgb.r}, ${softMoonRgb.g}, ${softMoonRgb.b}, 1)`);
        coreGradient.addColorStop(0.7, `rgba(${moonRgb.r}, ${moonRgb.g}, ${moonRgb.b}, 0.95)`);
        coreGradient.addColorStop(1, `rgba(${moonRgb.r}, ${moonRgb.g}, ${moonRgb.b}, 0.8)`);
        
        ctx.beginPath();
        ctx.arc(satX, satY, coreSize, 0, TWO_PI);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        // Draw bright center highlight
        ctx.save();
        const highlightGradient = ctx.createRadialGradient(
          satX - coreSize * 0.15, satY - coreSize * 0.15, 0,
          satX, satY, coreSize * 0.5
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
            const particleX = satX + Math.cos(particleAngle) * particleDistance;
            const particleY = satY + Math.sin(particleAngle) * particleDistance;
            const particleSize = satellite.size * 0.2 * Math.random();
            
            // Use sun color for particles
            const particleRgb = i % 2 === 0 ? sunRgb : secondaryRgb;

            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, TWO_PI);
            ctx.fillStyle = `rgba(${particleRgb.r}, ${particleRgb.g}, ${particleRgb.b}, ${0.3 + Math.random() * 0.3})`;
            ctx.fill();
          }
          ctx.restore();
        }
      });
    }
  }

// Draw hover/select effects
export function drawHoverEffects(
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    starSize: number,
    softRgb: {r: number, g: number, b: number}
  ): void {
    if (planet.isHovered || planet.isSelected) {
      // Add a pulsing ring around the star when hovered or selected
      ctx.save();

      if (planet.isHovered) {
        // Draw a "clickable" cursor icon or text
        ctx.save();
        ctx.font = "14px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        // Fix: Use starSize instead of planetSize
        ctx.fillText("Click for details", planet.x, planet.y - starSize * 5);
        ctx.restore();
      }

      // Use the employee ID or another unique property to create independent pulse timing
      // with proper null checking
      const uniqueOffset = planet.employee?.id
        ? (typeof planet.employee.id === "string"
            ? planet.employee.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
            : Number(planet.employee.id))
        : Math.random() * 1000; // Fallback to a random offset if no employee ID

      // Use the unique offset to create independent pulse timing
      const pulseTime = getFrameTime() * 0.0005 + (uniqueOffset * 0.1);
      const pulseOpacity = 0.4 + Math.sin(pulseTime * 1.5) * 0.2;
      const pulseSize = starSize * (1.3 + Math.sin(pulseTime * 1) * 0.2);

      ctx.beginPath();
      ctx.arc(planet.x, planet.y, pulseSize, 0, TWO_PI);
      ctx.lineWidth = 1.5 + Math.sin(pulseTime * 2) * 0.5;
      ctx.strokeStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, ${pulseOpacity})`;
      ctx.stroke();
      ctx.restore();

      // Add "click for details" indicator when hovered
      if (planet.isHovered && !planet.isSelected) {
        ctx.save();
        const clickIndicatorSize = starSize * 0.4;
        const clickIndicatorX = planet.x + starSize * 1.2;
        const clickIndicatorY = planet.y - starSize * 1.2;

        // Draw pulsing circle with smoother animation - also use unique timing
        const clickPulse = 0.85 + Math.sin(pulseTime * 2.5) * 0.15;
        ctx.beginPath();
        ctx.arc(clickIndicatorX, clickIndicatorY, clickIndicatorSize * clickPulse, 0, TWO_PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(pulseTime * 2) * 0.2})`;
        ctx.fill();

        // Draw click icon
        ctx.beginPath();
        ctx.moveTo(clickIndicatorX - clickIndicatorSize * 0.3, clickIndicatorY);
        ctx.lineTo(clickIndicatorX, clickIndicatorY + clickIndicatorSize * 0.3);
        ctx.lineTo(clickIndicatorX + clickIndicatorSize * 0.3, clickIndicatorY - clickIndicatorSize * 0.3);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.stroke();
        ctx.restore();
      }

      // Add floating skill icons around the star when hovered
      if (planet.isHovered || planet.isSelected) {
        // Get skills from project data
        const skills = getSkillsForProject(planet.project);
        const skillCount = skills.length;

        if (skillCount > 0) {
          ctx.save();
          const iconSize = starSize * 0.5;
          const orbitRadius = starSize * 2.2;

          skills.forEach((skill, i) => {
            // Use unique timing for skill icon rotation too
            const angle = (i / skillCount) * TWO_PI + getFrameTime() * 0.0005 + (uniqueOffset * 0.01);
            const iconX = planet.x + Math.cos(angle) * orbitRadius;
            const iconY = planet.y + Math.sin(angle) * orbitRadius;

            // Draw skill icon background
            ctx.beginPath();
            ctx.arc(iconX, iconY, iconSize, 0, TWO_PI);
            ctx.fillStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.3)`;
            ctx.fill();

            // Draw skill icon border
            ctx.beginPath();
            ctx.arc(iconX, iconY, iconSize, 0, TWO_PI);
            ctx.strokeStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.8)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw skill text or icon
            ctx.font = `bold ${Math.floor(iconSize * 1.2)}px Arial`;
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(skill.charAt(0), iconX, iconY);
          });
          ctx.restore();
        }
      }
    }
  }

  // Draw star flares
  export function drawStarFlares(
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    starSize: number,
    softRgb: {r: number, g: number, b: number}
  ): void {
    // Create occasional "star flares" that randomly appear on stars - less frequent
    if (planet.pathType === "star" && Math.random() < 0.002) { // Reduced from 0.005 to 0.002 (0.2% chance)
      ctx.save();
      const flareCount = 2 + Math.floor(Math.random() * 2); // Reduced from 3+3
      const flareLength = starSize * (1.8 + Math.random() * 2.2); // Reduced slightly

      for (let i = 0; i < flareCount; i++) {
        const flareAngle = (i / flareCount) * TWO_PI + Math.random() * 0.5;

        ctx.beginPath();
        ctx.moveTo(planet.x, planet.y);
        ctx.lineTo(
          planet.x + Math.cos(flareAngle) * flareLength,
          planet.y + Math.sin(flareAngle) * flareLength
        );

        const flareGradient = ctx.createLinearGradient(
          planet.x, planet.y,
          planet.x + Math.cos(flareAngle) * flareLength,
          planet.y + Math.sin(flareAngle) * flareLength
        );

        flareGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)"); // Reduced opacity
        flareGradient.addColorStop(0.3, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.5)`); // Reduced opacity
        flareGradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0)`);

        ctx.strokeStyle = flareGradient;
        ctx.lineWidth = 1.5 + Math.random() * 1.5; // Reduced from 2+2
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Draw nebula effects
  export function drawNebulaEffects(
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    starSize: number,
    softRgb: {r: number, g: number, b: number}
  ): void {
    // Add subtle background nebula effects behind important stars - more subtle
    // Use nullish coalescing to provide a default value of 0 for mass if it"s undefined
    // Note: Planet type uses 'project' property, not 'employee'
    if (((planet.project?.mass ?? 0) > 200 || planet.isSelected) && !planet.useSimpleRendering) {
      ctx.save();
      const nebulaSize = starSize * 7; // Reduced from 8
      const nebulaOpacity = 0.12; // Reduced from 0.15

      const nebulaGradient = ctx.createRadialGradient(
        planet.x, planet.y, 0,
        planet.x, planet.y, nebulaSize
      );

      nebulaGradient.addColorStop(0, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, ${nebulaOpacity})`);
      nebulaGradient.addColorStop(0.5, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, ${nebulaOpacity/2})`);
      nebulaGradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0)`);

      ctx.beginPath();
      ctx.arc(planet.x, planet.y, nebulaSize, 0, TWO_PI);
      ctx.fillStyle = nebulaGradient;
      ctx.globalCompositeOperation = "screen";
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }
  }

  // Draw connections between related stars
  export function drawConnections(
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    allStars: Planet[],
    softRgb: {r: number, g: number, b: number}
  ): void {
    const relatedStars = findRelatedPlanets(planet, allStars);

    if (relatedStars.length > 0) {
      ctx.save();

      relatedStars.forEach(relatedStar => {
        // Draw connection line with animated dash pattern - much slower animation to reduce flicker
        const dashOffset = getFrameTime() * 0.001; // Reduced from 0.005 for much slower animation

        ctx.beginPath();
        ctx.moveTo(planet.x, planet.y);
        ctx.lineTo(relatedStar.x, relatedStar.y);

        // Create gradient for connection line - much softer and less visible
        const connectionGradient = ctx.createLinearGradient(
          planet.x, planet.y,
          relatedStar.x, relatedStar.y
        );

        connectionGradient.addColorStop(0, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.3)`); // Reduced from 0.6
        connectionGradient.addColorStop(1, `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.1)`); // Reduced from 0.25

        ctx.strokeStyle = connectionGradient;
        ctx.lineWidth = 0.8; // Reduced from 1.2 for thinner lines
        ctx.setLineDash([8, 8]); // Longer dashes for less flickering
        ctx.lineDashOffset = dashOffset;
        ctx.stroke();

        // Draw small indicator at midpoint - more subtle
        const midX = (planet.x + relatedStar.x) / 2;
        const midY = (planet.y + relatedStar.y) / 2;

        ctx.beginPath();
        ctx.arc(midX, midY, 1.5, 0, TWO_PI); // Reduced from 2.5
        ctx.fillStyle = `rgba(${softRgb.r}, ${softRgb.g}, ${softRgb.b}, 0.4)`; // Reduced from 0.7
        ctx.fill();
      });

      ctx.restore();
    }
  }

  // Helper function to find related stars
  export function findRelatedPlanets(planet: Planet, allStars: Planet[]): Planet[] {
    if (!planet || !planet.project || !planet.project.relatedIds || !allStars) {
      return [];
    }

    return allStars.filter(star =>
      star !== planet &&
      planet.project.relatedIds &&
      planet.project.relatedIds.includes(star.project.id)
    );
  }

  // Helper function to get project skills
  export function getSkillsForProject(project: PortfolioProject): string[] {
    if (!project || !project.skills) {
      return [];
    }

    return Array.isArray(project.skills) ? project.skills : [project.skills];
  }
