// starExplosions.ts - Star explosion and click force effects
// Single Responsibility: Handle explosion animations and click interactions

import { Star } from "./types";
import { distance } from "./utils";
import { GLOBAL_PHYSICS, EXPLOSION_PHYSICS, STAR_PHYSICS } from "./physicsConfig";
import { getFrameTime } from "./frameCache";
import { TWO_PI } from "./math";

// ==========================================
// Explosion Constants
// ==========================================

/** Purple glow fade color for click explosion effect */
const EXPLOSION_GLOW_FADE_COLOR = "rgba(138, 43, 226, 0)";

/** Speed multiplier from global physics */
const GLOBAL_SPEED_MULTIPLIER = GLOBAL_PHYSICS.speedMultiplier;

/**
 * Create an explosion effect at a point
 * Draws an expanding radial gradient that fades out
 */
export function createExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  duration: number
): void {
  // Apply global speed multiplier to duration to slow down the explosion animation
  const adjustedDuration = duration / GLOBAL_SPEED_MULTIPLIER;

  const startTime = performance.now();
  const animate = (): void => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / adjustedDuration, 1);

    // Expand radius and fade out
    const currentRadius = radius * progress;
    const alpha = 1 - progress;

    // Draw explosion
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
    gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`);
    gradient.addColorStop(1, `${color}00`); // Fully transparent at edge

    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, TWO_PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Continue animation until complete
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Apply force to stars from an explosion with minimal effect
 * Pushes stars outward from the explosion center
 */
export function applyExplosionForce(
  stars: Star[],
  x: number,
  y: number,
  radius: number,
  force: number
): void {
  // Use extremely low force with global speed multiplier
  const adjustedForce = force * EXPLOSION_PHYSICS.forceMultiplier;

  stars.forEach(star => {
    const dist = distance(star.x, star.y, x, y);

    // Only affect stars within explosion radius
    if (dist < radius) {
      // Calculate force based on distance from center
      const explosionForce = adjustedForce * (1 - dist / radius);

      // Direction from explosion to star
      const angle = Math.atan2(star.y - y, star.x - x);

      // Apply force with velocity clamping
      star.vx += Math.cos(angle) * explosionForce;
      star.vy += Math.sin(angle) * explosionForce;

      const currentVelocity = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
      const maxExplosionVelocity = EXPLOSION_PHYSICS.maxVelocity * GLOBAL_SPEED_MULTIPLIER;

      if (currentVelocity > maxExplosionVelocity) {
        star.vx = (star.vx / currentVelocity) * maxExplosionVelocity;
        star.vy = (star.vy / currentVelocity) * maxExplosionVelocity;
      }

      // Mark star as active
      star.lastPushed = getFrameTime();
      star.isActive = true;
    }
  });
}

/**
 * Enhanced click repulsion with much stronger force and visible effect that stacks
 * Returns the number of affected stars
 */
export function applyClickForce(
  stars: Star[],
  clickX: number,
  clickY: number,
  radius: number = 400,
  force: number = 40
): number {
  // Much stronger force multiplier for visible repulsion effect that stacks
  const adjustedForce = force * 8;

  let affectedCount = 0;

  stars.forEach(star => {
    const dx = star.x - clickX;
    const dy = star.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < radius) {
      affectedCount++;

      // Calculate direction vector (away from click point)
      const dirX = dx / Math.max(dist, 1); // Avoid division by zero
      const dirY = dy / Math.max(dist, 1);

      // Use cubic easing for stronger effect at center
      const normalizedDist = dist / radius;
      const easeOut = Math.pow(1 - normalizedDist, 2.5); // Stronger at center with more dramatic falloff
      const strength = adjustedForce * easeOut;

      // Apply strong radial force (stacks with existing velocity)
      star.vx += dirX * strength;
      star.vy += dirY * strength;

      // Add more tangential component for dramatic spiral effect
      const tangentStrength = strength * 0.3;
      star.vx += -dirY * tangentStrength;
      star.vy += dirX * tangentStrength;

      // More random component for variety and chaos
      star.vx += (Math.random() - 0.5) * strength * 0.2;
      star.vy += (Math.random() - 0.5) * strength * 0.2;

      // Mark star as "pushed" for visual effects
      star.lastPushed = getFrameTime();
      star.isActive = true;
    }
  });

  return affectedCount;
}

/**
 * Create a click explosion effect with expanding ring and inner glow
 */
export function createClickExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 200,
  color: string = "rgba(255, 255, 255, 0.8)",
  duration: number = 800
): void {
  // Don't apply global speed multiplier to make effect more visible
  const adjustedDuration = duration;

  // Parse color for use in gradients (extract base color without alpha)
  const baseColor = color.replace(/rgba?\(([^)]+)\).*/, "$1").split(",").slice(0, 3).join(",");

  const startTime = performance.now();
  const animate = (): void => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / adjustedDuration, 1);

    // If animation is complete, stop
    if (progress >= 1) return;

    // Calculate current radius and opacity
    const currentRadius = radius * Math.pow(progress, 0.5); // Square root for faster initial expansion
    const opacity = (1 - progress) * 0.8; // Higher opacity

    // Draw expanding ring using the provided color
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, TWO_PI);
    ctx.lineWidth = 3 * (1 - progress); // Thicker line
    ctx.strokeStyle = `rgba(${baseColor}, ${opacity})`;
    ctx.stroke();

    // Draw inner glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius * 0.8);
    gradient.addColorStop(0, `rgba(${baseColor}, ${opacity * 0.7})`);
    gradient.addColorStop(1, EXPLOSION_GLOW_FADE_COLOR);

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    // Add a bright flash at the center
    if (progress < 0.3) {
      const flashOpacity = (0.3 - progress) / 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, TWO_PI);
      ctx.fillStyle = `rgba(${baseColor}, ${flashOpacity})`;
      ctx.fill();
    }

    // Continue animation
    requestAnimationFrame(animate);
  };

  // Start animation
  requestAnimationFrame(animate);
}

/**
 * Reset stars to their original positions with smooth animation
 */
export function resetStars(
  stars: Star[],
  duration: number = 1000
): void {
  // Apply global speed multiplier to duration to slow down the reset animation
  const adjustedDuration = duration / GLOBAL_SPEED_MULTIPLIER;

  const startTime = performance.now();

  stars.forEach(star => {
    // Store current position and calculate target position
    const startX = star.x;
    const startY = star.y;
    const targetX = star.originalX;
    const targetY = star.originalY;

    // Reset forces and velocities
    star.fx = 0;
    star.fy = 0;
    star.vx = 0;
    star.vy = 0;

    // Create animation function for this star
    const animate = (): void => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / adjustedDuration, 1);

      // Ease progress for smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      // Interpolate position
      star.x = startX + (targetX - startX) * easedProgress;
      star.y = startY + (targetY - startY) * easedProgress;

      // Continue animation until complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  });
}

/**
 * Helper to gradually deactivate stars based on time since last push
 */
export function updateStarActivity(stars: Star[]): void {
  const now = getFrameTime(); // Use cached frame time for consistency with lastPushed
  const deactivationTime = STAR_PHYSICS.deactivationTime;

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    // If star was pushed more than deactivationTime ago, deactivate it
    if (star.isActive && (now - star.lastPushed > deactivationTime)) {
      star.isActive = false;
    }
  }
}
