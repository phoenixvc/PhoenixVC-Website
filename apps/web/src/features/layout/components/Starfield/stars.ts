// components/Layout/Starfield/stars.ts
import { Star, BlackHole, MousePosition } from "./types";
import { getColorPalette } from "./constants";
import { distance, parseRgbaColor, brightenColor, colorWithAlpha } from "./utils";
import {
  GLOBAL_PHYSICS,
  STAR_PHYSICS,
  EXPLOSION_PHYSICS,
  EFFECT_TIMING,
  CONNECTION_CONFIG,
} from "./physicsConfig";
import { getFrameTime } from "./frameCache";

// ==========================================
// Star Rendering Constants
// ==========================================

/** Threshold for showing center highlight on stars (twinkleFactor must exceed this) */
const STAR_CENTER_HIGHLIGHT_THRESHOLD = 0.9;

/** Multiplier to convert twinkle factor difference to opacity (creates 0-0.5 range when factor is 0.9-1.0) */
const STAR_CENTER_OPACITY_MULTIPLIER = 5;

/** Minimum star size to show center highlight */
const STAR_CENTER_HIGHLIGHT_MIN_SIZE = 1.2;

// ==========================================
// Utility Functions
// ==========================================

/**
 * Smooth step interpolation function (Hermite interpolation)
 * Creates smooth transitions at the boundaries
 * @param t - Progress value (0-1)
 * @returns Smoothly interpolated value (0-1)
 */
function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

// Re-export physics config values as constants for backward compatibility
const GLOBAL_SPEED_MULTIPLIER = GLOBAL_PHYSICS.speedMultiplier;
const ACTIVE_STAR_MOVEMENT_MULTIPLIER = STAR_PHYSICS.activeMovementMultiplier;
const ACTIVE_STAR_VELOCITY_MULTIPLIER = STAR_PHYSICS.activeVelocityMultiplier;
const DAMPING_FACTOR_ACTIVE = STAR_PHYSICS.dampingActive;
const DAMPING_FACTOR_INACTIVE = STAR_PHYSICS.dampingInactive;

// Initialize completely static stars
export const initStars = (
  width: number,
  height: number,
  count: number,
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number,
  starSize: number,
  colorScheme: string
): Star[] => {
  const stars: Star[] = [];
  const colors = getColorPalette(colorScheme);

  // Calculate effective width (accounting for sidebar)
  const effectiveWidth = width - sidebarWidth;

  for (let i = 0; i < count; i++) {
    // Position stars within the effective width (after sidebar)
    const x = sidebarWidth + Math.random() * effectiveWidth;
    const y = Math.random() * height;

    // Random size with weighted distribution (more small stars, crisper appearance)
    const sizeMultiplier = Math.pow(Math.random(), 2.5) * 1.5 + 0.3; // Reduced from 2+0.5 for smaller stars
    const size = sizeMultiplier * starSize;

    // Random color from palette
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Add star with ZERO velocity and force - COMPLETELY FROZEN
    stars.push({
      x,
      y,
      size,
      color,
      vx: 0,
      vy: 0,
      originalX: x,
      originalY: y,
      mass: size * 2,
      speed: 0,  // Zero speed
      isActive: false,
      lastPushed: 0,
      targetVx: 0,
      targetVy: 0,
      // Add force tracking
      fx: 0,
      fy: 0
    });
  }

  return stars;
};

export function updateStarPositions(
  stars: Star[],
  width: number,
  height: number,
  deltaTime: number,
  enableFlowEffect: boolean,
  flowStrength: number,
  mousePosition: MousePosition,
  enableMouseInteraction: boolean,
  blackHoles: BlackHole[],
  gravitationalPull: number,
  heroMode: boolean,
  centerPosition: { x: number; y: number },
  mouseEffectRadius: number,
  maxVelocity: number = 0.5,
  animationSpeed: number = 1.0
) {
  // Safety check for deltaTime
  if (!deltaTime || isNaN(deltaTime) || deltaTime > 100) {
    deltaTime = 16; // Use a reasonable default if deltaTime is invalid
  }

  // Normalize deltaTime to prevent extreme values
  const normalizedDelta = Math.min(deltaTime, 32);

  // Scale time based on animation speed AND global multiplier
  const timeScale = 0.1 * animationSpeed * GLOBAL_SPEED_MULTIPLIER;

  // Update each star
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];

    // Apply flow effect if enabled (reduced intensity to minimize flicker)
    if (enableFlowEffect) {
      star.vx += (Math.random() - 0.5) * flowStrength * normalizedDelta * timeScale * 0.3;
      star.vy += (Math.random() - 0.5) * flowStrength * normalizedDelta * timeScale * 0.3;
    }

    // Apply black hole gravitational pull with much larger influence
    if (blackHoles && blackHoles.length > 0) {
      for (let j = 0; j < blackHoles.length; j++) {
        const blackHole = blackHoles[j];
        const dx = blackHole.x - star.x;
        const dy = blackHole.y - star.y;
        const distSq = Math.max(dx * dx + dy * dy, 100); // Prevent division by tiny numbers
        const dist = Math.sqrt(distSq);

        // Much larger influence range (15x radius instead of 4x)
        const influenceRange = blackHole.radius * 15;
        if (dist < influenceRange) {
          // Stronger force with falloff based on distance
          const falloff = 1 - (dist / influenceRange); // Linear falloff
          const force = gravitationalPull * blackHole.mass * falloff * 0.5 / distSq;
          star.vx += dx / dist * force * normalizedDelta * timeScale * 3; // 3x multiplier
          star.vy += dy / dist * force * normalizedDelta * timeScale * 3;
        }
      }
    }

    // Apply mouse interaction
    if (enableMouseInteraction && mousePosition.isOnScreen) {
      const dx = mousePosition.x - star.x;
      const dy = mousePosition.y - star.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      if (dist < mouseEffectRadius) {
        const repelForce = 0.2 * (mouseEffectRadius - dist) / mouseEffectRadius;
        star.vx -= dx / dist * repelForce * normalizedDelta * timeScale;
        star.vy -= dy / dist * repelForce * normalizedDelta * timeScale;
      }
    }

    // Apply velocity limits with smoother clamping
    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
    // Use a MUCH higher maxVelocity for recently pushed stars
    const effectiveMaxVelocity = star.isActive ? maxVelocity * ACTIVE_STAR_VELOCITY_MULTIPLIER : maxVelocity;
    if (speed > effectiveMaxVelocity) {
      star.vx = (star.vx / speed) * effectiveMaxVelocity;
      star.vy = (star.vy / speed) * effectiveMaxVelocity;
    }

    // Apply less damping for active stars so they travel further
    const dampingFactor = star.isActive ? DAMPING_FACTOR_ACTIVE : DAMPING_FACTOR_INACTIVE;
    star.vx *= dampingFactor;
    star.vy *= dampingFactor;

    // Update position - use higher multiplier for active stars
    const movementMultiplier = star.isActive ? ACTIVE_STAR_MOVEMENT_MULTIPLIER : GLOBAL_SPEED_MULTIPLIER;
    star.x += star.vx * normalizedDelta * animationSpeed * movementMultiplier;
    star.y += star.vy * normalizedDelta * animationSpeed * movementMultiplier;

    // Wrap around edges
    if (star.x < 0) star.x = width;
    if (star.x > width) star.x = 0;
    if (star.y < 0) star.y = height;
    if (star.y > height) star.y = 0;
  }
}

/**
 * Integrate accumulated forces to update velocities and positions.
 * Uses Velocity Verlet-style integration for smooth physics.
 *
 * This function should be called AFTER forces are accumulated in star.fx/fy
 * and BEFORE handleBoundaries.
 *
 * @param stars - Array of stars to update
 * @param dt - Delta time in milliseconds
 * @param maxVelocity - Maximum velocity cap
 * @param useActiveStarPhysics - Whether to use different physics for active stars
 */
export function integrateForces(
  stars: Star[],
  dt: number,
  maxVelocity: number = STAR_PHYSICS.maxVelocity,
  useActiveStarPhysics: boolean = true
): void {
  // Apply global speed multiplier to dt
  const adjustedDt = dt * GLOBAL_SPEED_MULTIPLIER;

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];

    // Use different damping based on star activity
    const damping = useActiveStarPhysics && star.isActive
      ? DAMPING_FACTOR_ACTIVE
      : (useActiveStarPhysics ? DAMPING_FACTOR_INACTIVE : STAR_PHYSICS.dampingIntegration);

    star.vx *= damping;
    star.vy *= damping;

    // Update velocity based on accumulated forces
    star.vx += star.fx * adjustedDt;
    star.vy += star.fy * adjustedDt;

    // Apply velocity limits
    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
    const effectiveMaxVelocity = useActiveStarPhysics && star.isActive
      ? maxVelocity * ACTIVE_STAR_VELOCITY_MULTIPLIER
      : maxVelocity;

    if (speed > effectiveMaxVelocity * GLOBAL_SPEED_MULTIPLIER) {
      const scale = (effectiveMaxVelocity * GLOBAL_SPEED_MULTIPLIER) / speed;
      star.vx *= scale;
      star.vy *= scale;
    }

    // Update position with movement multiplier for active stars
    const movementMultiplier = useActiveStarPhysics && star.isActive
      ? ACTIVE_STAR_MOVEMENT_MULTIPLIER
      : GLOBAL_SPEED_MULTIPLIER;

    star.x += star.vx * adjustedDt * movementMultiplier;
    star.y += star.vy * adjustedDt * movementMultiplier;

    // Reset forces after integration
    star.fx = 0;
    star.fy = 0;
  }
}

/**
 * Handle boundary wrapping with smooth buffer zone.
 * Stars smoothly wrap around canvas edges with a buffer to prevent pop-in.
 *
 * @param stars - Array of stars to process
 * @param width - Canvas width
 * @param height - Canvas height
 * @param buffer - Buffer zone size (default from STAR_PHYSICS config)
 */
export function handleBoundaries(
  stars: Star[],
  width: number,
  height: number,
  buffer: number = STAR_PHYSICS.boundaryBuffer
): void {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    if (star.x < -buffer) star.x = width + buffer;
    if (star.x > width + buffer) star.x = -buffer;
    if (star.y < -buffer) star.y = height + buffer;
    if (star.y > height + buffer) star.y = -buffer;
  }
}

export const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Star[]
): void => {
  const now = getFrameTime();
  const glowDuration = EFFECT_TIMING.pushGlowDuration;

  // Enable anti-aliasing for smoother star rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    // Check if star was recently pushed (within glow duration)
    const timeSincePush = now - star.lastPushed;
    const recentlyPushed = star.isActive && (timeSincePush < glowDuration);

    if (recentlyPushed) {
      // Calculate how recent the push was (1.0 = just now, 0.0 = glowDuration ago)
      const recency = 1 - timeSincePush / glowDuration;

      // Smooth glow effect for pushed stars
      const glowRadius = star.size * (3 + recency * 5);
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glowRadius
      );

      // Get base color and create brighter version for center (using cached parsing)
      const baseColor = star.color;
      const parsed = parseRgbaColor(baseColor);

      // Use optimized color functions to avoid string manipulation in hot path
      const brighterColorStr = parsed ? brightenColor(parsed, 100) : baseColor;
      const midOpacityColor = parsed ? colorWithAlpha(parsed, 0.7) : baseColor;
      const lowOpacityColor = parsed ? colorWithAlpha(parsed, 0.2) : baseColor;

      // Create smooth glow gradient with more color stops for better blending
      gradient.addColorStop(0, brighterColorStr);
      gradient.addColorStop(0.3, midOpacityColor);
      gradient.addColorStop(0.6, lowOpacityColor);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      // Draw glow
      ctx.beginPath();
      ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw actual star (larger than normal)
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * (1.5 + recency), 0, Math.PI * 2);
      ctx.fillStyle = brighterColorStr;
      ctx.fill();
    } else {
      // Smoother star rendering with subtle twinkling effect
      // Create unique twinkle timing for each star based on position
      const uniqueSeed = (star.x * 127.1 + star.y * 311.7) % 1000;
      // Slower twinkle speeds for smoother animation
      const twinkleSpeed1 = 0.0008 + (uniqueSeed % 100) / 80000;
      const twinkleSpeed2 = 0.0006 + (uniqueSeed % 50) / 60000;

      // Smoother multi-frequency twinkle with reduced variation
      const twinkle1 = Math.sin(now * twinkleSpeed1 + uniqueSeed * 0.1);
      const twinkle2 = Math.sin(now * twinkleSpeed2 + uniqueSeed * 0.2);
      // Narrower twinkle range for smoother appearance (0.85 to 1.0)
      const twinkleFactor = 0.85 + (twinkle1 * 0.075 + twinkle2 * 0.075);

      // Very subtle size variation for smoother appearance
      const twinkleSize = star.size * (0.95 + twinkleFactor * 0.1);

      // Parse color once for this star (cached)
      const parsed = parseRgbaColor(star.color);

      // Add subtle soft glow for all stars using smooth gradient
      const glowRadius = twinkleSize * 2.5;
      const glowGradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glowRadius
      );

      // Soft glow with multiple color stops for smooth falloff
      const glowOpacity = twinkleFactor * 0.2;
      const glowColor = parsed
        ? colorWithAlpha(parsed, glowOpacity)
        : star.color;
      const glowColorMid = parsed
        ? colorWithAlpha(parsed, glowOpacity * 0.5)
        : star.color;

      glowGradient.addColorStop(0, glowColor);
      glowGradient.addColorStop(0.4, glowColorMid);
      glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Draw star core with smooth gradient for better anti-aliasing
      const coreGradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, twinkleSize
      );

      // Stable alpha for core (less flickering)
      const alpha = 0.7 + twinkleFactor * 0.3; // Range: 0.7 to 1.0
      const coreColor = parsed
        ? colorWithAlpha(parsed, alpha)
        : star.color;
      const coreColorMid = parsed
        ? colorWithAlpha(parsed, alpha * 0.8)
        : star.color;

      coreGradient.addColorStop(0, coreColor);
      coreGradient.addColorStop(0.6, coreColorMid);
      coreGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.arc(star.x, star.y, twinkleSize, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Very subtle white center for brightest stars only
      if (twinkleFactor > STAR_CENTER_HIGHLIGHT_THRESHOLD && star.size > STAR_CENTER_HIGHLIGHT_MIN_SIZE) {
        const centerGradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, twinkleSize * 0.3
        );
        // Calculate opacity: when twinkleFactor is 0.9-1.0, this produces 0-0.5 range
        const centerOpacity = (twinkleFactor - STAR_CENTER_HIGHLIGHT_THRESHOLD) * STAR_CENTER_OPACITY_MULTIPLIER;
        centerGradient.addColorStop(0, `rgba(255, 255, 255, ${centerOpacity})`);
        centerGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.arc(star.x, star.y, twinkleSize * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = centerGradient;
        ctx.fill();
      }
    }
  }
};

// ==========================================
// Connection Stagger Animation Constants
// ==========================================

// Use centralized config for connection stagger settings
const CONNECTION_STAGGER_CONFIG = CONNECTION_CONFIG;

// Track when the starfield was initialized for staggered connection reveal
let connectionStartTime: number | null = null;

// Draw connections between nearby stars (network effect) with staggered reveal
export const drawConnections = (
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  maxDistance: number,
  opacity: number,
  colorScheme: string
): void => {
  const baseColor = colorScheme === "white" ? "255, 255, 255" : "147, 51, 234"; // White or purple

  // For performance, check only every 10th star
  const connectionSources = stars.filter((_, i) => i % 10 === 0);

  // Enable smooth line rendering
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Use cached frame time for animation
  const time = getFrameTime();
  
  // Initialize connection start time on first call (single-threaded canvas rendering)
  if (connectionStartTime === null) {
    connectionStartTime = time;
  }
  
  // Calculate elapsed time since connections started (for stagger effect)
  const elapsedTime = time - connectionStartTime;
  
  const { staggerDuration, fadeInDuration, primeMultiplier1, primeMultiplier2, seedModulo } = CONNECTION_STAGGER_CONFIG;

  connectionSources.forEach((star1, index1) => {
    // Check against all stars for connections
    stars.forEach((star2, index2) => {
      // Don't connect to self
      if (star1 === star2) return;

      const dist = distance(star1.x, star1.y, star2.x, star2.y);

      // Only connect stars within the maximum distance
      if (dist < maxDistance) {
        // Create unique timing offset for each connection based on star indices
        // This ensures each connection has its own animation phase
        const uniqueSeed = (index1 * primeMultiplier1 + index2 * primeMultiplier2) % seedModulo;
        const phaseOffset = uniqueSeed / seedModulo * Math.PI * 2;
        
        // Calculate when this specific connection should start appearing (staggered)
        // Use the unique seed to determine when each connection appears
        const connectionDelay = (uniqueSeed / seedModulo) * staggerDuration;
        
        // Calculate stagger progress for this connection (0 = not started, 1 = fully visible)
        let staggerProgress = 0;
        if (elapsedTime > connectionDelay) {
          staggerProgress = Math.min(1, (elapsedTime - connectionDelay) / fadeInDuration);
        }
        
        // Skip drawing if this connection hasn't started appearing yet
        if (staggerProgress <= 0) return;
        
        // Create a slow, smooth pulse with unique timing per connection
        // Slower frequencies for smoother animation
        const frequency1 = 0.00015 + (uniqueSeed % 100) / 200000;
        const frequency2 = 0.0001 + (uniqueSeed % 50) / 150000;
        
        const pulse1 = Math.sin(time * frequency1 + phaseOffset);
        const pulse2 = Math.sin(time * frequency2 + phaseOffset * 1.3);
        
        // Combine pulses for smoother animation (0.6 to 1.0 range - less variation)
        const pulseMultiplier = 0.7 + (pulse1 * 0.15 + pulse2 * 0.15);
        
        // Calculate opacity based on distance with smoother falloff
        const distanceRatio = dist / maxDistance;
        // Use cubic falloff for smoother fade at edges (optimized calculation)
        const distanceRatioSquared = distanceRatio * distanceRatio;
        const distanceFade = 1 - (distanceRatioSquared * distanceRatio);
        const baseLineOpacity = opacity * distanceFade;
        // Apply stagger progress with smooth step easing for smooth fade-in
        const easedProgress = smoothStep(staggerProgress);
        const lineOpacity = baseLineOpacity * pulseMultiplier * easedProgress;

        // Use gradient for smoother line appearance
        const gradient = ctx.createLinearGradient(star1.x, star1.y, star2.x, star2.y);
        gradient.addColorStop(0, `rgba(${baseColor}, ${lineOpacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(${baseColor}, ${lineOpacity})`);
        gradient.addColorStop(1, `rgba(${baseColor}, ${lineOpacity * 0.8})`);

        // Draw line with smooth gradient and slightly thicker line for better visibility
        ctx.beginPath();
        ctx.moveTo(star1.x, star1.y);
        ctx.lineTo(star2.x, star2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8 + pulseMultiplier * 0.4; // Slightly variable width for organic feel
        ctx.stroke();
      }
    });
  });
};

// Reset connection start time (useful when starfield is reinitialized)
export const resetConnectionStagger = (): void => {
  connectionStartTime = null;
};

// Create an explosion effect at a point
export const createExplosion = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  duration: number
): void => {
  // Apply global speed multiplier to duration to slow down the explosion animation
  const adjustedDuration = duration / GLOBAL_SPEED_MULTIPLIER;

  const startTime = performance.now();
  const animate = () => {
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
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Continue animation until complete
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Apply force to stars from an explosion with minimal effect
export const applyExplosionForce = (
  stars: Star[],
  x: number,
  y: number,
  radius: number,
  force: number
): void => {
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
};

// Reset stars to their original positions (with animation)
export const resetStars = (
  stars: Star[],
  duration: number = 1000
): void => {
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
    const animate = () => {
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
};

// Replace the existing applyClickForce function in stars.ts
// Enhanced click repulsion with much stronger force and visible effect
export const applyClickForce = (
  stars: Star[],
  clickX: number,
  clickY: number,
  radius: number = 350,
  force: number = 25
): number => {
  // Much stronger force multiplier for visible repulsion effect
  const adjustedForce = force * 5;

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
      const easeOut = Math.pow(1 - normalizedDist, 2); // Stronger at center
      const strength = adjustedForce * easeOut;

      // Apply strong radial force
      star.vx += dirX * strength;
      star.vy += dirY * strength;

      // Add slight tangential component for spiral effect
      const tangentStrength = strength * 0.2;
      star.vx += -dirY * tangentStrength;
      star.vy += dirX * tangentStrength;

      // Small random component for variety
      star.vx += (Math.random() - 0.5) * strength * 0.15;
      star.vy += (Math.random() - 0.5) * strength * 0.15;

      // Mark star as "pushed" for visual effects
      star.lastPushed = getFrameTime();
      star.isActive = true;
    }
  });

  return affectedCount;
};

// New function for completely static stars
export const initStaticStars = (
  width: number,
  height: number,
  starCount: number,
  sidebarWidth: number = 0,
  centerOffsetX: number = 0,
  centerOffsetY: number = 0,
  starSize: number = 1.0,
  colorScheme: string = "white"
): Star[] => {
  return initStars(
    width,
    height,
    starCount,
    sidebarWidth,
    centerOffsetX,
    centerOffsetY,
    starSize,
    colorScheme
  );
};

// Create a click explosion effect
export const createClickExplosion = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 200,
  color: string = "rgba(255, 255, 255, 0.8)",
  duration: number = 800 // Longer duration
): void => {
  // Don"t apply global speed multiplier to make effect more visible
  const adjustedDuration = duration;

  const startTime = performance.now();
  const animate = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / adjustedDuration, 1);

    // If animation is complete, stop
    if (progress >= 1) return;

    // Calculate current radius and opacity
    const currentRadius = radius * Math.pow(progress, 0.5); // Square root for faster initial expansion
    const opacity = (1 - progress) * 0.8; // Higher opacity

    // Draw expanding ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
    ctx.lineWidth = 3 * (1 - progress); // Thicker line
    ctx.strokeStyle = "rgba(255, 255, 255, " + opacity + ")"; // White ring
    ctx.stroke();

    // Draw inner glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius * 0.8);
    gradient.addColorStop(0, "rgba(255, 255, 255, " + opacity * 0.7 + ")");
    gradient.addColorStop(1, "rgba(138, 43, 226, 0)"); // Purple fade

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    // Add a bright flash at the center
    if (progress < 0.3) {
      const flashOpacity = (0.3 - progress) / 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
      ctx.fill();
    }

    // Continue animation
    requestAnimationFrame(animate);
  };

  // Start animation
  requestAnimationFrame(animate);
};

// Helper to gradually deactivate stars
export const updateStarActivity = (stars: Star[]): void => {
  const now = getFrameTime(); // Use cached frame time for consistency with lastPushed
  const deactivationTime = STAR_PHYSICS.deactivationTime;

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    // If star was pushed more than deactivationTime ago, deactivate it
    if (star.isActive && (now - star.lastPushed > deactivationTime)) {
      star.isActive = false;
    }
  }
};
