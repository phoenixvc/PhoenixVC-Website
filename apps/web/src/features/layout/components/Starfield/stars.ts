// components/Layout/Starfield/stars.ts
import { Star, BlackHole, MousePosition, ParsedColor } from "./types";
import { getColorPalette } from "./constants";
import {
  distance,
  parseRgbaColor,
  brightenColor,
  colorWithAlpha,
} from "./utils";
import {
  GLOBAL_PHYSICS,
  STAR_PHYSICS,
  EFFECT_TIMING,
  CONNECTION_CONFIG,
  SIZE_CONFIG,
} from "./physicsConfig";
import { getFrameTime } from "./frameCache";
import { TWO_PI, fastSin, fastCos } from "./math";
import { getSunStates } from "./sunSystem";

// Re-export explosion functions from dedicated module for backward compatibility
export {
  createExplosion,
  applyExplosionForce,
  applyClickForce,
  createClickExplosion,
  resetStars,
  updateStarActivity,
} from "./starExplosions";

// ==========================================
// Star Rendering Constants
// ==========================================

/** Threshold for showing center highlight on stars (twinkleFactor must exceed this) */
const STAR_CENTER_HIGHLIGHT_THRESHOLD = 0.9;

/** Multiplier to convert twinkle factor difference to opacity (creates 0-0.5 range when factor is 0.9-1.0) */
const STAR_CENTER_OPACITY_MULTIPLIER = 5;

/** Minimum star size to show center highlight */
const STAR_CENTER_HIGHLIGHT_MIN_SIZE = 1.2;

/** Enhanced minimum size threshold for star center highlight (1.5x larger stars only) */
const STAR_CENTER_HIGHLIGHT_ENHANCED_MIN_SIZE =
  STAR_CENTER_HIGHLIGHT_MIN_SIZE * 1.5;

/** Reduction factor for center opacity in enhanced mode */
const CENTER_OPACITY_REDUCTION_FACTOR = 0.5;

// ==========================================
// Sun Gravitational Physics Constants
// ==========================================

/** Multiplier for sun influence range based on canvas size and sun size */
const SUN_INFLUENCE_MULTIPLIER = 8;

/** Multiplier to approximate sun mass from sun size */
const SUN_MASS_MULTIPLIER = 2000;

/** Damping factor for sun gravitational force */
const SUN_FORCE_DAMPING = 0.3;

/** Velocity multiplier for gravitational force application */
const GRAVITATIONAL_VELOCITY_MULTIPLIER = 2;

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
  colorScheme: string,
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
    // Use SIZE_CONFIG for consolidated size parameters
    const sizeMultiplier =
      (Math.pow(Math.random(), SIZE_CONFIG.sizeVariationExponent) *
        SIZE_CONFIG.sizeRangeMax +
        SIZE_CONFIG.sizeRangeMin) *
      SIZE_CONFIG.backgroundStarMultiplier;
    const size = sizeMultiplier * starSize;

    // Random color from palette
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Pre-calculate twinkle parameters (moved from drawStars for performance)
    // Use non-integer multipliers to break up repeating patterns
    const uniqueSeed = (x * 73.13 + y * 157.79 + i * 31.41) % 1000;
    const twinkleSpeed1 = 0.0003 + (uniqueSeed % 100) / 150000;
    const twinkleSpeed2 = 0.0002 + (uniqueSeed % 50) / 120000;

    // Pre-parse color for fast color manipulation during rendering
    const parsedColor = parseRgbaColor(color) as ParsedColor | undefined;

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
      speed: 0, // Zero speed
      isActive: false,
      lastPushed: 0,
      targetVx: 0,
      targetVy: 0,
      // Add force tracking
      fx: 0,
      fy: 0,
      // Pre-calculated animation values (performance optimization)
      uniqueSeed,
      twinkleSpeed1,
      twinkleSpeed2,
      parsedColor,
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
  animationSpeed: number = 1.0,
): void {
  // Safety check for deltaTime
  if (!deltaTime || isNaN(deltaTime) || deltaTime > 100) {
    deltaTime = 16; // Use a reasonable default if deltaTime is invalid
  }

  // Normalize deltaTime to prevent extreme values
  const normalizedDelta = Math.min(deltaTime, 32);

  // Scale time based on animation speed AND global multiplier
  const timeScale = 0.1 * animationSpeed * GLOBAL_SPEED_MULTIPLIER;

  // Get sun states for gravitational pull
  const sunStates = getSunStates();

  // Pre-calculate canvas max dimension for sun influence range (optimization)
  const canvasMaxDimension = Math.max(width, height);

  // Update each star
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];

    // Skip consumed stars
    if (star.isConsumed) continue;

    // Add natural autonomous drift - stars slowly move on their own
    // Each star has a unique drift direction based on its index
    const driftAngle = ((i * 137.508) % 360) * (Math.PI / 180); // Golden angle for variety
    const driftSpeed = 0.02 + (i % 10) * 0.003; // Vary drift speed slightly
    star.vx += fastCos(driftAngle) * driftSpeed * normalizedDelta * timeScale;
    star.vy += fastSin(driftAngle) * driftSpeed * normalizedDelta * timeScale;

    // Apply flow effect if enabled (reduced intensity to minimize flicker)
    if (enableFlowEffect) {
      star.vx +=
        (Math.random() - 0.5) *
        flowStrength *
        normalizedDelta *
        timeScale *
        0.3;
      star.vy +=
        (Math.random() - 0.5) *
        flowStrength *
        normalizedDelta *
        timeScale *
        0.3;
    }

    // Apply sun gravitational pull - creates natural movement toward suns
    if (sunStates && sunStates.length > 0) {
      for (let j = 0; j < sunStates.length; j++) {
        const sun = sunStates[j];
        // Convert normalized sun position to canvas coordinates
        const sunX = sun.x * width;
        const sunY = sun.y * height;
        const dx = sunX - star.x;
        const dy = sunY - star.y;
        const distSq = Math.max(dx * dx + dy * dy, 400); // Prevent division by tiny numbers
        const dist = Math.sqrt(distSq);

        // Suns have a large influence range based on their size
        const sunInfluenceRange =
          canvasMaxDimension * sun.size * SUN_INFLUENCE_MULTIPLIER;
        if (dist < sunInfluenceRange) {
          // Gentle gravitational pull with smooth falloff
          const falloff = 1 - dist / sunInfluenceRange;
          // Sun mass approximated from size (larger suns = more gravity)
          const sunMass = sun.size * SUN_MASS_MULTIPLIER;
          const force =
            (gravitationalPull * sunMass * falloff * SUN_FORCE_DAMPING) /
            distSq;
          star.vx +=
            (dx / dist) *
            force *
            normalizedDelta *
            timeScale *
            GRAVITATIONAL_VELOCITY_MULTIPLIER;
          star.vy +=
            (dy / dist) *
            force *
            normalizedDelta *
            timeScale *
            GRAVITATIONAL_VELOCITY_MULTIPLIER;
        }
      }
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
          const falloff = 1 - dist / influenceRange; // Linear falloff
          const force =
            (gravitationalPull * blackHole.mass * falloff * 0.5) / distSq;
          star.vx += (dx / dist) * force * normalizedDelta * timeScale * 3; // 3x multiplier
          star.vy += (dy / dist) * force * normalizedDelta * timeScale * 3;
        }
      }
    }

    // Apply mouse interaction with stronger repulsion
    if (enableMouseInteraction && mousePosition.isOnScreen) {
      const dx = mousePosition.x - star.x;
      const dy = mousePosition.y - star.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      if (dist < mouseEffectRadius) {
        // Increased repulsion force for more dramatic hover effect
        const repelForce =
          (0.35 * (mouseEffectRadius - dist)) / mouseEffectRadius;
        star.vx -= (dx / dist) * repelForce * normalizedDelta * timeScale;
        star.vy -= (dy / dist) * repelForce * normalizedDelta * timeScale;
      }
    }

    // Apply velocity limits with smoother clamping
    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
    // Use a MUCH higher maxVelocity for recently pushed stars
    const effectiveMaxVelocity = star.isActive
      ? maxVelocity * ACTIVE_STAR_VELOCITY_MULTIPLIER
      : maxVelocity;
    if (speed > effectiveMaxVelocity) {
      star.vx = (star.vx / speed) * effectiveMaxVelocity;
      star.vy = (star.vy / speed) * effectiveMaxVelocity;
    }

    // Apply less damping for active stars so they travel further
    const dampingFactor = star.isActive
      ? DAMPING_FACTOR_ACTIVE
      : DAMPING_FACTOR_INACTIVE;
    star.vx *= dampingFactor;
    star.vy *= dampingFactor;

    // Update position - use higher multiplier for active stars
    const movementMultiplier = star.isActive
      ? ACTIVE_STAR_MOVEMENT_MULTIPLIER
      : GLOBAL_SPEED_MULTIPLIER;
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
  useActiveStarPhysics: boolean = true,
): void {
  // Apply global speed multiplier to dt
  const adjustedDt = dt * GLOBAL_SPEED_MULTIPLIER;

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];

    // Use different damping based on star activity
    const damping =
      useActiveStarPhysics && star.isActive
        ? DAMPING_FACTOR_ACTIVE
        : useActiveStarPhysics
          ? DAMPING_FACTOR_INACTIVE
          : STAR_PHYSICS.dampingIntegration;

    star.vx *= damping;
    star.vy *= damping;

    // Update velocity based on accumulated forces
    star.vx += star.fx * adjustedDt;
    star.vy += star.fy * adjustedDt;

    // Apply velocity limits
    const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
    const effectiveMaxVelocity =
      useActiveStarPhysics && star.isActive
        ? maxVelocity * ACTIVE_STAR_VELOCITY_MULTIPLIER
        : maxVelocity;

    if (speed > effectiveMaxVelocity * GLOBAL_SPEED_MULTIPLIER) {
      const scale = (effectiveMaxVelocity * GLOBAL_SPEED_MULTIPLIER) / speed;
      star.vx *= scale;
      star.vy *= scale;
    }

    // Update position with movement multiplier for active stars
    const movementMultiplier =
      useActiveStarPhysics && star.isActive
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
  buffer: number = STAR_PHYSICS.boundaryBuffer,
): void {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    if (star.x < -buffer) star.x = width + buffer;
    if (star.x > width + buffer) star.x = -buffer;
    if (star.y < -buffer) star.y = height + buffer;
    if (star.y > height + buffer) star.y = -buffer;
  }
}

// Size threshold for simplified rendering (skip gradient glow for tiny stars)
const SIMPLE_STAR_SIZE_THRESHOLD = 1.2;

// Cached white color for center highlights (avoid string allocation in loop)
const CACHED_WHITE_PREFIX = "rgba(255, 255, 255, ";

export const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Star[],
): void => {
  const now = getFrameTime();
  const glowDuration = EFFECT_TIMING.pushGlowDuration;

  // BATCHING OPTIMIZATION: Separate stars into groups for more efficient rendering
  // Small stars: simple solid fill (no gradient)
  // Large stars: full gradient rendering
  // Recently pushed: special glow effect

  // First pass: Draw all small stars with batched solid fills
  // This minimizes gradient creation overhead for the majority of stars
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    if (star.isConsumed) continue;

    const timeSincePush = now - star.lastPushed;
    const recentlyPushed = star.isActive && timeSincePush < glowDuration;

    // Skip non-simple stars in first pass
    if (recentlyPushed || star.size >= SIMPLE_STAR_SIZE_THRESHOLD) continue;

    // Simple solid fill for small stars - no gradient, no glow
    const parsed = star.parsedColor ?? null;
    const alpha = 0.85 + (i % 10) * 0.015;
    const coreColor = parsed ? colorWithAlpha(parsed, alpha) : star.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * 0.7, 0, TWO_PI);
    ctx.fillStyle = coreColor;
    ctx.fill();
  }

  // Second pass: Draw larger stars and recently pushed stars (need gradients)
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];

    // Skip consumed stars (they're hidden while waiting to respawn)
    if (star.isConsumed) continue;

    // Check if star was recently pushed (within glow duration)
    const timeSincePush = now - star.lastPushed;
    const recentlyPushed = star.isActive && timeSincePush < glowDuration;

    if (recentlyPushed) {
      // Calculate how recent the push was (1.0 = just now, 0.0 = glowDuration ago)
      const recency = 1 - timeSincePush / glowDuration;

      // Use pre-cached parsed color from star initialization (avoids per-frame parsing)
      const baseColor = star.color;
      const parsed = star.parsedColor ?? null;
      const brighterColorStr = parsed ? brightenColor(parsed, 100) : baseColor;

      // Simplified glow for pushed stars - 2 stops instead of 4
      const glowRadius = star.size * (3 + recency * 5);
      const gradient = ctx.createRadialGradient(
        star.x,
        star.y,
        0,
        star.x,
        star.y,
        glowRadius,
      );
      const _glowColor = parsed ? colorWithAlpha(parsed, 0.6) : baseColor;
      gradient.addColorStop(0, brighterColorStr);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      // Draw glow
      ctx.beginPath();
      ctx.arc(star.x, star.y, glowRadius, 0, TWO_PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw actual star (larger than normal)
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * (1.5 + recency), 0, TWO_PI);
      ctx.fillStyle = brighterColorStr;
      ctx.fill();
    } else {
      // Skip small stars in second pass (already drawn in first pass)
      if (star.size < SIMPLE_STAR_SIZE_THRESHOLD) continue;

      // Use pre-parsed color from star init (performance optimization)
      const parsed = star.parsedColor ?? null;

      // Full rendering for larger stars
      const uniqueSeed = star.uniqueSeed ?? 0;
      const twinkleSpeed1 = star.twinkleSpeed1 ?? 0.0003;
      const twinkleSpeed2 = star.twinkleSpeed2 ?? 0.0002;

      // Very subtle twinkle with minimal variation to reduce flickering
      const twinkle1 = fastSin(now * twinkleSpeed1 + uniqueSeed * 0.05);
      const twinkle2 = fastSin(now * twinkleSpeed2 * 1.3 + uniqueSeed * 0.08);
      const twinkleFactor = 0.92 + (twinkle1 * 0.04 + twinkle2 * 0.04);

      // Minimal size variation for crisp, stable stars
      const twinkleSize = star.size * (0.98 + twinkleFactor * 0.04);

      // Simplified glow gradient - 2 stops instead of 3
      const glowRadius = twinkleSize * 1.0;
      const glowOpacity = twinkleFactor * 0.12;
      const glowColor = parsed
        ? colorWithAlpha(parsed, glowOpacity)
        : star.color;

      const glowGradient = ctx.createRadialGradient(
        star.x,
        star.y,
        0,
        star.x,
        star.y,
        glowRadius,
      );
      glowGradient.addColorStop(0, glowColor);
      glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.arc(star.x, star.y, glowRadius, 0, TWO_PI);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Draw solid star core for crisp appearance (no gradient)
      const alpha = 0.85 + twinkleFactor * 0.15;
      const coreColor = parsed ? colorWithAlpha(parsed, alpha) : star.color;

      ctx.beginPath();
      ctx.arc(star.x, star.y, twinkleSize * 0.7, 0, TWO_PI);
      ctx.fillStyle = coreColor;
      ctx.fill();

      // Very subtle white center for only the largest/brightest stars
      if (
        twinkleFactor > STAR_CENTER_HIGHLIGHT_THRESHOLD &&
        star.size > STAR_CENTER_HIGHLIGHT_ENHANCED_MIN_SIZE
      ) {
        const centerOpacity =
          (twinkleFactor - STAR_CENTER_HIGHLIGHT_THRESHOLD) *
          STAR_CENTER_OPACITY_MULTIPLIER *
          CENTER_OPACITY_REDUCTION_FACTOR;
        ctx.beginPath();
        ctx.arc(star.x, star.y, twinkleSize * 0.2, 0, TWO_PI);
        ctx.fillStyle = CACHED_WHITE_PREFIX + centerOpacity + ")";
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

// ==========================================
// Spatial Hash Grid for Connection Optimization
// ==========================================

interface SpatialCell {
  stars: Star[];
  indices: number[];
}

interface SpatialGrid {
  cells: Map<string, SpatialCell>;
  cellSize: number;
}

// Reusable spatial grid (avoid allocation each frame)
let spatialGrid: SpatialGrid | null = null;
let lastGridCellSize = 0;

// Reusable buffer for getNearbyStars to avoid creating new arrays each call
const nearbyStarsBuffer: { star: Star; index: number }[] = [];

/**
 * Get cell key for a given position
 */
function getCellKey(x: number, y: number, cellSize: number): string {
  const cellX = Math.floor(x / cellSize);
  const cellY = Math.floor(y / cellSize);
  return `${cellX},${cellY}`;
}

/**
 * Build spatial grid from stars array
 * @param stars Array of stars to index
 * @param cellSize Size of each cell (should be >= maxConnectionDistance)
 */
function buildSpatialGrid(stars: Star[], cellSize: number): SpatialGrid {
  // Reuse existing grid if cell size matches
  if (spatialGrid && lastGridCellSize === cellSize) {
    spatialGrid.cells.clear();
  } else {
    spatialGrid = { cells: new Map(), cellSize };
    lastGridCellSize = cellSize;
  }

  const grid = spatialGrid;

  // Add each star to its cell
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    const key = getCellKey(star.x, star.y, cellSize);

    let cell = grid.cells.get(key);
    if (!cell) {
      cell = { stars: [], indices: [] };
      grid.cells.set(key, cell);
    }
    cell.stars.push(star);
    cell.indices.push(i);
  }

  return grid;
}

/**
 * Get stars in nearby cells (including the cell containing the point and all 8 neighbors)
 * Uses a reusable buffer to avoid array allocation each call
 */
function getNearbyStars(
  x: number,
  y: number,
  grid: SpatialGrid,
): { star: Star; index: number }[] {
  // Clear buffer instead of creating new array (avoids GC pressure)
  nearbyStarsBuffer.length = 0;

  const cellX = Math.floor(x / grid.cellSize);
  const cellY = Math.floor(y / grid.cellSize);

  // Check 3x3 grid of cells centered on the star's cell
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const key = `${cellX + dx},${cellY + dy}`;
      const cell = grid.cells.get(key);
      if (cell) {
        for (let i = 0; i < cell.stars.length; i++) {
          nearbyStarsBuffer.push({
            star: cell.stars[i],
            index: cell.indices[i],
          });
        }
      }
    }
  }

  return nearbyStarsBuffer;
}

// Draw connections between nearby stars (network effect) with staggered reveal
// Uses spatial partitioning for O(n) instead of O(n²) performance
export const drawConnections = (
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  maxDistance: number,
  opacity: number,
  colorScheme: string,
): void => {
  // Use slightly muted colors for connection lines (balanced brightness)
  const baseColor = colorScheme === "white" ? "210, 210, 230" : "130, 80, 170";

  // Build spatial grid for efficient neighbor lookup
  // Cell size equals maxDistance so we only need to check adjacent cells
  const grid = buildSpatialGrid(stars, maxDistance);

  // For performance, check only every 10th star as connection sources
  const connectionSources: { star: Star; index: number }[] = [];
  for (let i = 0; i < stars.length; i += 10) {
    connectionSources.push({ star: stars[i], index: i });
  }

  // Enable smooth line rendering
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Use cached frame time for animation
  const time = getFrameTime();

  // Initialize connection start time on first call
  if (connectionStartTime === null) {
    connectionStartTime = time;
  }

  // Calculate elapsed time since connections started (for stagger effect)
  const elapsedTime = time - connectionStartTime;

  const {
    staggerDuration,
    fadeInDuration,
    primeMultiplier1,
    primeMultiplier2,
    seedModulo,
  } = CONNECTION_STAGGER_CONFIG;

  // Process each connection source
  for (let i = 0; i < connectionSources.length; i++) {
    const { star: star1, index: index1 } = connectionSources[i];

    // Only check nearby stars using spatial grid (much faster than checking all stars)
    const nearbyStars = getNearbyStars(star1.x, star1.y, grid);

    for (let j = 0; j < nearbyStars.length; j++) {
      const { star: star2, index: index2 } = nearbyStars[j];

      // Don't connect to self
      if (star1 === star2) continue;

      const dist = distance(star1.x, star1.y, star2.x, star2.y);

      // Only connect stars within the maximum distance
      if (dist < maxDistance) {
        // Create unique timing offset for each connection based on star indices
        const uniqueSeed =
          (index1 * primeMultiplier1 + index2 * primeMultiplier2) % seedModulo;
        const phaseOffset = (uniqueSeed / seedModulo) * TWO_PI;

        // Calculate when this specific connection should start appearing (staggered)
        const connectionDelay = (uniqueSeed / seedModulo) * staggerDuration;

        // Calculate stagger progress for this connection (0 = not started, 1 = fully visible)
        let staggerProgress = 0;
        if (elapsedTime > connectionDelay) {
          staggerProgress = Math.min(
            1,
            (elapsedTime - connectionDelay) / fadeInDuration,
          );
        }

        // Skip drawing if this connection hasn't started appearing yet
        if (staggerProgress <= 0) continue;

        // Create a slow, smooth pulse with unique timing per connection
        const frequency1 = 0.00005 + (uniqueSeed % 100) / 500000;
        const frequency2 = 0.00003 + (uniqueSeed % 50) / 400000;

        const pulse1 = fastSin(time * frequency1 + phaseOffset);
        const pulse2 = fastSin(time * frequency2 + phaseOffset * 1.3);

        // Combine pulses for smoother animation (0.92 to 1.0 range)
        const pulseMultiplier = 0.95 + (pulse1 * 0.025 + pulse2 * 0.025);

        // Calculate opacity based on distance with smoother falloff
        const distanceRatio = dist / maxDistance;
        const distanceRatioSquared = distanceRatio * distanceRatio;
        const distanceFade = 1 - distanceRatioSquared * distanceRatio;
        const baseLineOpacity = opacity * distanceFade * 0.65;
        const easedProgress = smoothStep(staggerProgress);
        const lineOpacity = baseLineOpacity * pulseMultiplier * easedProgress;

        // Use gradient for smoother line appearance
        const gradient = ctx.createLinearGradient(
          star1.x,
          star1.y,
          star2.x,
          star2.y,
        );
        gradient.addColorStop(0, `rgba(${baseColor}, ${lineOpacity * 0.7})`);
        gradient.addColorStop(0.5, `rgba(${baseColor}, ${lineOpacity})`);
        gradient.addColorStop(1, `rgba(${baseColor}, ${lineOpacity * 0.7})`);

        // Draw line with smooth gradient
        ctx.beginPath();
        ctx.moveTo(star1.x, star1.y);
        ctx.lineTo(star2.x, star2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5 + pulseMultiplier * 0.15;
        ctx.stroke();
      }
    }
  }
};

// Reset connection start time (useful when starfield is reinitialized)
export const resetConnectionStagger = (): void => {
  connectionStartTime = null;
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
  colorScheme: string = "white",
): Star[] => {
  return initStars(
    width,
    height,
    starCount,
    sidebarWidth,
    centerOffsetX,
    centerOffsetY,
    starSize,
    colorScheme,
  );
};
