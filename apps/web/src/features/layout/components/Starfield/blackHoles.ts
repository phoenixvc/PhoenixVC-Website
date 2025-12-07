// components/Layout/Starfield/blackHoles.ts

import { BlackHole, BlackHoleParticle } from "./types";
import { randomColor } from "./utils";
import { getFrameTime } from "./frameCache";
import { BLACK_HOLE_RENDERING_CONFIG as BH } from "./renderingConfig";

// Initialize black holes based on configuration
export const initBlackHoles = (
  width: number,
  height: number,
  enableBlackHole: boolean,
  defaultBlackHoles: Array<{ x: number; y: number; radius: number; color: string }>,
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number,
  blackHoleSize: number,
  _particleSpeed: number,
  _colorScheme: string,
  _starSize: number
): BlackHole[] => {
  if (!enableBlackHole) return [];

  return defaultBlackHoles.map((hole, index) => {
    // Position black hole relative to canvas size, accounting for sidebar
    const x = sidebarWidth + (hole.x * (width - sidebarWidth)) + centerOffsetX;
    const y = hole.y * height + centerOffsetY;

    // Reduce the radius significantly to make black holes less massive
    const radius = hole.radius * blackHoleSize * BH.radiusMultiplier;

    // Create a unique id for each black hole
    const id = `blackhole-${index}`;

    // Calculate mass based on radius
    const mass = radius * BH.massCoefficient;

    // Random rotation speed within configured range
    const rotationSpeed = BH.rotation.baseSpeed *
      (Math.random() * (BH.rotation.randomMax - BH.rotation.randomMin) + BH.rotation.randomMin);

    return {
      id,
      x,
      y,
      radius,
      mass,
      color: hole.color,
      particles: [],
      active: true,
      rotation: 0,
      rotationSpeed,
      lastParticleTime: 0
    };
  });
};

// Draw a black hole with its accretion disk
export const drawBlackHole = (
  ctx: CanvasRenderingContext2D,
  blackHole: BlackHole,
  deltaTime: number,
  particleSpeed: number
): void => {
  const { x, y, radius, color, particles } = blackHole;

  // Update rotation
  blackHole.rotation += blackHole.rotationSpeed * deltaTime;

  // Draw outer gravitational distortion glow (pulsing effect)
  const pulseTime = getFrameTime() * BH.pulse.timeMultiplier;
  const pulseFactor = 1 + Math.sin(pulseTime * BH.pulse.frequency) * BH.pulse.amplitude;

  // Outer gravitational glow - very subtle
  ctx.save();
  const outerGlowInner = radius * BH.outerGlow.innerRadiusMultiplier;
  const outerGlowOuter = radius * BH.outerGlow.outerRadiusMultiplier * pulseFactor;
  const outerGlow = ctx.createRadialGradient(x, y, outerGlowInner, x, y, outerGlowOuter);
  for (const stop of BH.outerGlow.colorStops) {
    outerGlow.addColorStop(stop.offset, stop.color);
  }
  ctx.beginPath();
  ctx.arc(x, y, outerGlowOuter, 0, Math.PI * 2);
  ctx.fillStyle = outerGlow;
  ctx.fill();
  ctx.restore();

  // Create particles for accretion disk
  const currentTime = getFrameTime();
  if (currentTime - blackHole.lastParticleTime > BH.particles.spawnIntervalMs) {
    blackHole.lastParticleTime = currentTime;

    // Add particles within configured range
    const particleRange = BH.particles.countMax - BH.particles.countMin;
    const particlesToAdd = Math.floor(Math.random() * (particleRange + 1)) + BH.particles.countMin;

    for (let i = 0; i < particlesToAdd; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distanceRange = BH.particles.distanceMax - BH.particles.distanceMin;
      const distance = radius * (BH.particles.distanceMin + Math.random() * distanceRange);
      const speedRange = BH.particles.speedRandomMax - BH.particles.speedRandomMin;
      const speed = BH.particles.speedBase * particleSpeed *
        (Math.random() * speedRange + BH.particles.speedRandomMin);
      const particleColor = randomColor("purple", BH.particles.alphaBase);
      const sizeRange = BH.particles.sizeMax - BH.particles.sizeMin;
      const particleSize = Math.random() * sizeRange + BH.particles.sizeMin;

      const newParticle: BlackHoleParticle = {
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        size: particleSize,
        angle,
        distance,
        speed,
        color: particleColor,
        alpha: BH.particles.alphaBase + Math.random() * BH.particles.alphaRandom
      };

      particles.push(newParticle);
    }
  }

  // Limit the maximum number of particles
  if (particles.length > BH.particles.maxCount) {
    particles.splice(0, particles.length - BH.particles.maxCount);
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];

    // Update angle for orbital motion
    particle.angle += particle.speed * deltaTime;

    // Spiral inward by decreasing distance
    particle.distance -= BH.particles.spiralSpeed * particleSpeed * deltaTime;

    // Update position based on angle and distance
    particle.x = x + Math.cos(particle.angle) * particle.distance;
    particle.y = y + Math.sin(particle.angle) * particle.distance;

    // Decrease alpha over time
    if (particle.alpha) {
      particle.alpha -= BH.particles.alphaDecay * deltaTime;
    }

    // Remove particles that are too close to center or have faded out
    if ((particle.alpha && particle.alpha <= 0) || particle.distance < radius * BH.particles.removalThreshold) {
      particles.splice(i, 1);
      continue;
    }

    // Draw particle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

    // Use alpha if available, otherwise default to 0.6
    const alpha = particle.alpha !== undefined ? particle.alpha : 0.6;

    // Extract base color without alpha
    let baseColor = particle.color;
    if (baseColor.startsWith("rgba(")) {
      baseColor = baseColor.replace(/,\s*[\d.]+\)$/, ")").replace("rgba", "rgb");
    }

    // Apply alpha
    const fillColor = baseColor.startsWith("rgb")
      ? baseColor.replace("rgb", "rgba").replace(")", `, ${alpha})`)
      : `rgba(255, 255, 255, ${alpha})`;

    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  // Draw rotating accretion disk rings
  ctx.save();
  const diskRadius = radius * BH.disk.radiusMultiplier;
  const rotationAngle = blackHole.rotation;

  // Draw multiple rotating rings for depth effect
  for (let ring = 0; ring < BH.disk.ringCount; ring++) {
    const ringRadius = diskRadius * (BH.disk.ringBaseSize + ring * BH.disk.ringSizeStep);
    const ringOpacity = BH.disk.ringBaseOpacity - ring * BH.disk.ringOpacityStep;
    const ringRotation = rotationAngle * (1 + ring * BH.disk.ringRotationFactor);

    ctx.beginPath();
    ctx.ellipse(x, y, ringRadius, ringRadius * BH.disk.ellipseRatio, ringRotation, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${BH.disk.color}, ${ringOpacity})`;
    ctx.lineWidth = BH.disk.baseLineWidth - ring * BH.disk.lineWidthStep;
    ctx.stroke();
  }
  ctx.restore();

  // Draw black hole with a more subtle gradient
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  for (const stop of BH.core.colorStops) {
    gradient.addColorStop(stop.offset, stop.color);
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw pulsing event horizon (inner ring)
  const eventHorizonPulse = (1 - BH.eventHorizon.pulseAmplitude) + Math.sin(pulseTime * 2) * BH.eventHorizon.pulseAmplitude;
  ctx.beginPath();
  ctx.arc(x, y, radius * BH.eventHorizon.radiusMultiplier * eventHorizonPulse, 0, Math.PI * 2);
  const ehOpacity = BH.eventHorizon.baseOpacity + Math.sin(pulseTime * 2.5) * BH.eventHorizon.opacityAmplitude;
  ctx.strokeStyle = `rgba(${BH.disk.color}, ${ehOpacity})`;
  ctx.lineWidth = BH.eventHorizon.baseLineWidth + Math.sin(pulseTime * 3) * BH.eventHorizon.lineWidthAmplitude;
  ctx.stroke();

  // Draw inner core highlight
  ctx.beginPath();
  ctx.arc(x, y, radius * BH.innerCore.radiusMultiplier, 0, Math.PI * 2);
  ctx.strokeStyle = BH.innerCore.color;
  ctx.lineWidth = BH.innerCore.lineWidth;
  ctx.stroke();
};
