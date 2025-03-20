// components/Layout/Starfield/blackHoles.ts

import { BlackHole, BlackHoleParticle } from "./types";
import { randomColor } from "./utils";

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
  particleSpeed: number,
  colorScheme: string,
  starSize: number
): BlackHole[] => {
  if (!enableBlackHole) return [];

  return defaultBlackHoles.map((hole, index) => {
    // Position black hole relative to canvas size, accounting for sidebar
    const x = sidebarWidth + (hole.x * (width - sidebarWidth)) + centerOffsetX;
    const y = hole.y * height + centerOffsetY;

    // Reduce the radius significantly to make black holes less massive
    // Using a smaller multiplier for blackHoleSize
    const radius = hole.radius * blackHoleSize * 0.4; // Reduced by 60%

    // Create a unique id for each black hole
    const id = `blackhole-${index}`;

    // Calculate mass based on radius but with a smaller coefficient
    const mass = radius * 50; // Reduced from 100 to 50

    return {
      id,
      x,
      y,
      radius,
      mass,
      color: hole.color,
      particles: [], // Start with empty particles array
      active: true,
      rotation: 0,
      rotationSpeed: 0.001 * (Math.random() * 0.5 + 0.75), // Random rotation speed
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

  // Create particles for accretion disk - less frequently
  const currentTime = Date.now();
  if (currentTime - blackHole.lastParticleTime > 75) { // Increased from 50ms to 75ms
    blackHole.lastParticleTime = currentTime;

    // Add 1-2 new particles (reduced from 1-3)
    const particlesToAdd = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < particlesToAdd; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Increase the distance from the black hole center
      const distance = radius * (1.5 + Math.random() * 1.0); // Increased from 1.2-2.0 to 1.5-2.5
      const speed = 0.0015 * particleSpeed * (Math.random() * 0.5 + 0.75); // Reduced speed slightly
      const particleColor = randomColor("purple", 0.6); // Reduced alpha
      const particleSize = Math.random() * 1.5 + 0.5; // Reduced max size from 2.5 to 2.0

      // Create a new particle conforming to the BlackHoleParticle type
      const newParticle: BlackHoleParticle = {
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        size: particleSize,
        angle,
        distance,
        speed,
        color: particleColor,
        alpha: 0.6 + Math.random() * 0.3 // Slightly reduced alpha
      };

      particles.push(newParticle);
    }
  }

  // Limit the maximum number of particles to prevent overwhelming visuals
  if (particles.length > 100) {
    particles.splice(0, particles.length - 100);
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];

    // Update angle for orbital motion
    particle.angle += particle.speed * deltaTime;

    // Spiral inward by decreasing distance - more slowly
    particle.distance -= 0.03 * particleSpeed * deltaTime;

    // Update position based on angle and distance
    particle.x = x ;
    particle.y = y ;+ Math.sin(particle.angle) * particle.distance;

    // Decrease alpha over time - more slowly
    if (particle.alpha) {
      particle.alpha -= 0.03 * deltaTime;
    }

    // Remove particles that are too close to center or have faded out
    if ((particle.alpha && particle.alpha <= 0) || particle.distance < radius * 0.6) { // Increased from 0.5 to 0.6
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

  // Draw black hole with a more subtle gradient
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
  gradient.addColorStop(0.6, "rgba(20, 0, 40, 0.8)"); // Darker middle
  gradient.addColorStop(0.9, "rgba(40, 0, 80, 0.3)"); // More transparent edge
  gradient.addColorStop(1, "rgba(60, 0, 120, 0)");

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw a more subtle event horizon (inner ring)
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(138, 43, 226, 0.3)"; // Reduced opacity from 0.4 to 0.3
  ctx.lineWidth = 1.5; // Reduced from 2 to 1.5
  ctx.stroke();
};
