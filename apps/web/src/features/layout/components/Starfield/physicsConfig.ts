// components/Layout/Starfield/physicsConfig.ts
// Centralized physics configuration for the starfield visualization

/**
 * Global animation control
 * Controls the overall speed of all physics simulations
 */
export const GLOBAL_PHYSICS = {
  /** Master speed multiplier for all animations (0.05 = 5% speed, reduced for slower movement) */
  speedMultiplier: 0.05,
  /** Maximum delta time before capping (prevents physics explosion on tab return) */
  maxDeltaTime: 32,
  /** Default delta time when invalid value detected */
  defaultDeltaTime: 16,
} as const;

/**
 * Star physics configuration
 */
export const STAR_PHYSICS = {
  // Velocity limits
  /** Base maximum velocity for stars */
  maxVelocity: 0.5,
  /** Velocity multiplier for active (clicked) stars */
  activeVelocityMultiplier: 32,
  /** Movement multiplier for active stars during position update */
  activeMovementMultiplier: 2.0,

  // Damping (friction)
  /** Damping factor for active stars (less friction = travel further) */
  dampingActive: 0.985,
  /** Damping factor for inactive stars (more friction = settle quickly) */
  dampingInactive: 0.99,
  /** Damping factor for force integration mode */
  dampingIntegration: 0.9,

  // Boundary handling
  /** Buffer zone beyond canvas edges for smooth wrapping */
  boundaryBuffer: 50,

  // Deactivation
  /** Time in ms after which a pushed star becomes inactive */
  deactivationTime: 1500,
} as const;

/**
 * Mouse interaction configuration
 */
export const MOUSE_PHYSICS = {
  /** Default radius of mouse effect area */
  effectRadius: 250,
  /** Base repulsion force from mouse hover */
  hoverRepelForce: 0.15,

  // Click effect (reduced for less excessive animation)
  /** Default click force multiplier */
  clickForce: 12,
  /** Additional force multiplier for dramatic effect */
  clickForceMultiplier: 2.5,
  /** Tangential force component for spiral effect on click */
  tangentialStrength: 0.12,
  /** Random variance for click effect */
  randomVariance: 0.1,
} as const;

/**
 * Black hole physics configuration
 */
export const BLACK_HOLE_PHYSICS = {
  /** Minimum distance from canvas edges (as fraction of canvas) */
  edgePadding: 0.15,
  /** Minimum distance between black holes (as fraction of canvas) */
  minDistance: 0.35,
  /** Maximum attempts to find valid position */
  maxPositionAttempts: 50,
  /** Influence range multiplier (radius * this value) */
  influenceMultiplier: 15,
  /** Force application multiplier */
  forceMultiplier: 3,
  /** Minimum distance squared for force calculation */
  minDistanceSquared: 100,
} as const;

/**
 * Sun physics configuration
 * Controls position generation, drift motion, collision avoidance, and click interactions
 */
export const SUN_PHYSICS = {
  // Position generation
  /** Minimum distance from canvas edges (as fraction) */
  edgePadding: 0.15,
  /** Minimum distance between suns (as fraction) */
  minDistance: 0.35, // Increased from 0.25 so suns start further apart
  /** Offset to avoid sidebar area (as fraction) */
  sidebarOffset: 0.12,
  /** Maximum attempts to find valid sun position */
  maxPositionAttempts: 100,

  // Drift motion (gentle floating movement)
  /** Minimum drift amplitude (how far suns float) */
  driftAmplitudeMin: 0.015,
  /** Maximum drift amplitude */
  driftAmplitudeMax: 0.035,
  /** Minimum drift speed */
  driftSpeedMin: 0.00015,
  /** Maximum drift speed */
  driftSpeedMax: 0.0004,

  // Collision avoidance (propel mode)
  /** Distance threshold at which suns repel each other */
  propelThreshold: 0.15,
  /** Rotation speed increase when suns are close */
  rotationSpeedBoost: 0.00008,

  // Click repulsion
  /** Normalized radius for click effect on suns */
  clickRepulsionRadius: 0.25,
  /** Base force applied per click */
  clickRepulsionForce: 0.015,
  /** Maximum accumulated repulsion */
  maxClickRepulsion: 0.08,
  /** How fast repulsion decays each frame (0.97 = 3% decay) */
  clickRepulsionDecay: 0.97,

  // Staggered activation (startup animation)
  /** Minimum delay before a sun starts moving (ms) */
  activationDelayMin: 300,
  /** Maximum delay before a sun starts moving (ms) */
  activationDelayMax: 1200,
  /** Distance at which an active sun triggers inactive ones */
  activationTriggerRadius: 0.25,

  // Center repulsion (prevents clustering)
  /** Force pushing suns away from center */
  centerRepulsionStrength: 0.0002,
  /** Distance from center where repulsion activates */
  centerRepulsionRadius: 0.3,
  /** Canvas center X (normalized) */
  centerX: 0.5,
  /** Canvas center Y (normalized) */
  centerY: 0.5,

  // Physics
  /** Velocity damping for sun movement */
  velocityDamping: 0.98,
  /** Minimum distance to avoid division by zero */
  minDistanceThreshold: 0.001,
} as const;

/**
 * Flow effect configuration
 * Adds subtle random movement to stars
 */
export const FLOW_PHYSICS = {
  /** Intensity reduction factor for flow effect */
  intensityFactor: 0.3,
} as const;

/**
 * Connection rendering configuration
 */
export const CONNECTION_CONFIG = {
  /** Total duration for all connections to start appearing (ms) - faster for smoother reveal */
  staggerDuration: 5000,
  /** Duration for individual connection fade-in (ms) - smoother fade */
  fadeInDuration: 3000,
  /** Prime for unique timing (avoids clustering) */
  primeMultiplier1: 7919,
  /** Second prime for timing distribution */
  primeMultiplier2: 104729,
  /** Modulo value for normalizing seed */
  seedModulo: 10000,
} as const;

/**
 * Starfield size configuration
 * Consolidated size parameters for background stars, planets, and visual elements
 */
export const SIZE_CONFIG = {
  // Background stars
  /** Master size multiplier for background stars (0.06 = 6% of original size, reduced from 0.125) */
  backgroundStarMultiplier: 0.06,
  /** Random size variation exponent (higher = more small stars) */
  sizeVariationExponent: 4.0,
  /** Base size range (min + random * range) - reduced for smaller, crisper stars */
  sizeRangeMin: 0.05,
  sizeRangeMax: 0.2,
  
  // Planet/comet rendering
  /** Base planet size multiplier - increased from 2.5 for larger planets with more visible icons */
  planetBaseSize: 8,
  /** Planet hover scale factor */
  planetHoverScale: 1.15,
  /** Planet glow radius multiplier */
  planetGlowRadius: 1.5,
  
  // Project identifier (icon/initials on planets)
  /** Clip radius for project icon relative to star size */
  projectIconClipRadius: 0.85,
  /** Image size relative to star size */
  projectIconImageSize: 1.7,
  /** Ring radius around project icon */
  projectIconRingRadius: 0.9,
  /** Initials background circle radius */
  initialsBackgroundRadius: 0.75,
  /** Initials font size relative to star size */
  initialsFontSize: 0.95,
} as const;

/**
 * Explosion effect configuration
 */
export const EXPLOSION_PHYSICS = {
  /** Force reduction for explosion effects */
  forceMultiplier: 0.1,
  /** Maximum velocity for explosion-affected stars */
  maxVelocity: 0.00000001,
} as const;

/**
 * Visual effect timing configuration
 */
export const EFFECT_TIMING = {
  /** Duration of star push glow effect (ms) */
  pushGlowDuration: 1500,
  /** Duration of click explosion visual (ms) */
  clickExplosionDuration: 800,
  /** Duration of reset animation (ms) */
  resetAnimationDuration: 1000,
  /** Base delay before consumed star respawns (ms) */
  starRespawnDelayBase: 3000,
  /** Random additional delay for star respawn (ms) */
  starRespawnDelayRandom: 3000,
  /** Delay before starfield canvas fades in after initialization (ms) */
  starfieldInitializationDelay: 500,
} as const;

/**
 * Comet trail visual configuration
 */
export const COMET_CONFIG = {
  /** Trail width multiplier relative to planet size */
  trailWidthMultiplier: 24,
  /** Trail core width as fraction of main trail */
  coreWidthFraction: 0.6,
  /** Trail core length as fraction of main trail */
  coreLengthFraction: 0.8,
  /** Trail opacity boost */
  opacityBoost: 1.3,
} as const;

/**
 * Camera animation configuration
 * Controls zoom and pan animations for sun focus
 */
export const CAMERA_CONFIG = {
  /** Minimum icon size in pixels for planet focus area icons */
  minIconSize: 12,
  /** Camera lerp smoothing factor (lower = smoother, higher = faster) */
  cameraSmoothingFactor: 0.08,
  /** Threshold for camera position convergence */
  positionConvergenceThreshold: 0.001,
  /** Threshold for camera zoom convergence */
  zoomConvergenceThreshold: 0.01,
  /** Target zoom level when focusing on a sun */
  sunFocusZoom: 2.5,
} as const;

// Type exports for type safety
export type GlobalPhysics = typeof GLOBAL_PHYSICS;
export type StarPhysics = typeof STAR_PHYSICS;
export type MousePhysics = typeof MOUSE_PHYSICS;
export type BlackHolePhysics = typeof BLACK_HOLE_PHYSICS;
export type SunPhysics = typeof SUN_PHYSICS;
export type FlowPhysics = typeof FLOW_PHYSICS;
export type ConnectionConfig = typeof CONNECTION_CONFIG;
export type SizeConfig = typeof SIZE_CONFIG;
export type ExplosionPhysics = typeof EXPLOSION_PHYSICS;
export type EffectTiming = typeof EFFECT_TIMING;
export type CometConfig = typeof COMET_CONFIG;
export type CameraConfig = typeof CAMERA_CONFIG;
