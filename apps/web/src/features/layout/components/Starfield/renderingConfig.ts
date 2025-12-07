// renderingConfig.ts - Centralized rendering configuration for the starfield visualization
// Consolidates magic numbers and strings from animate.ts, stars.ts, starEffects.ts, etc.

/**
 * Mouse effect rendering configuration
 * Controls ripples, glow, and flash effects on click
 */
export const MOUSE_EFFECT_CONFIG = {
  // Ripple effect settings
  rippleCount: 3,
  rippleSpeedBase: 0.8,
  rippleSpeedIncrement: 0.4,
  rippleDelayMs: 100,
  rippleMaxRadiusMultiplier: 2.5,
  rippleDurationMs: 1600,
  rippleFadeDurationMs: 1000,

  // Flash effect settings
  flashDurationMs: 300,
  flashRadius: 15,

  // Glow settings
  glowBaseColor: { dark: "rgba(138,43,226,0.5)", light: "rgba(75,0,130,0.3)" },
  glowClickColor: { dark: "rgba(138,43,226,0.7)", light: "rgba(75,0,130,0.6)" },
  rippleColors: {
    dark: [
      "rgba(138,43,226,{opacity})",
      "rgba(180,100,255,{opacity})",
      "rgba(255,255,255,{opacity})",
    ],
    light: [
      "rgba(75,0,130,{opacity})",
      "rgba(100,0,200,{opacity})",
      "rgba(50,50,50,{opacity})",
    ],
  },
  rippleOpacityMultipliers: [0.95, 0.85, 0.75],
  rippleLineWidths: [6, 5, 4],
} as const;

/**
 * Sun rendering configuration
 * Controls sizes, effects, and animations for focus area suns
 */
export const SUN_RENDERING_CONFIG = {
  // Size constants
  sizeMultiplier: 0.35,
  minSize: 20,

  // Pulse animation
  pulse: {
    speed1: { highlighted: 0.0003, normal: 0.00015 },
    speed2: { highlighted: 0.00022, normal: 0.00011 },
    speed3: { highlighted: 0.00017, normal: 0.00008 },
    amount: { highlighted: 0.12, propelling: 0.1, normal: 0.06 },
    highlightScale: 1.15,
  },

  // Layer sizes (multipliers of base size)
  layers: {
    haloSize: { highlighted: 12, normal: 9 },
    atmosphereSize: { highlighted: 7, normal: 5 },
    chromosphereRadius: 1.4,
    photosphereRadius: 1.15,
    hotspotRadius: 0.45,
    highlightRadius: 0.35,
    rimRadius: 0.25,
    hoverRingRadius: 3,
    innerRingRadius: 2,
  },

  // Flare settings
  flares: {
    count: { highlighted: 8, normal: 5 },
    lengthMultiplier: { highlighted: 3.5, normal: 2.5 },
    waveSpeed: 0.0002,
    phaseSpeed: 0.00015,
    curveFactor: 0.0003,
    lineWidthMultiplier: { highlighted: 0.12, normal: 0.08 },
  },

  // Corona ray settings
  rays: {
    count: { highlighted: 20, normal: 14 },
    lengthMultiplier: { highlighted: 3.8, normal: 2.8 },
    waveSpeed: 0.00025,
    widthMultiplier: { highlighted: 0.1, normal: 0.07 },
  },

  // Propel ring settings (collision avoidance animation)
  propelRings: {
    count: 5,
    baseRadius: 1.6,
    radiusStep: 0.5,
    lineWidthBase: 2.5,
    lineWidthDecrement: 0.4,
    animationSpeed: 0.0015,
  },

  // Solar particle settings
  particles: {
    count: { highlighted: 24, normal: 16 },
    orbitBaseRadius: 1.3,
    orbitRadiusStep: 0.4,
    orbitSpeedBase: 0.0001,
    orbitSpeedVariation: 0.00003,
    wobbleSpeed: 0.0003,
    wobbleAmount: 0.08,
    pulseSpeed: 0.0004,
  },

  // Ejected particle settings
  ejectParticles: {
    count: { highlighted: 8, normal: 5 },
    speed: 0.00008,
    distanceRange: { min: 1.5, max: 5 },
  },

  // Surface granulation (texture)
  granulation: {
    spotCount: 8,
    rotationSpeed: 0.00004,
    variationSpeed: 0.00003,
  },

  // Hover/focus ring animation
  hoverRing: {
    dashPattern: [12, 6],
    dashSpeed: 0.02,
    pulseSpeed: 0.0008,
    innerPulseSpeed: 0.001,
  },
} as const;

/**
 * Star rendering configuration
 */
export const STAR_RENDERING_CONFIG = {
  // Background star dimming when focused on sun
  focusedBackgroundAlpha: 0.15,

  // Connection drawing
  connections: {
    defaultColor: "210, 210, 230",
    frameSkip: 2, // Draw connections every N frames
  },

  // Debug visualization
  debug: {
    sampleRate: 20, // Show 1 in N stars for velocity vectors
    velocityVectorScale: 10,
    fpsUpdateInterval: 10, // Update FPS every N frames
  },
} as const;

/**
 * Animation timing and throttling configuration
 */
export const ANIMATION_TIMING_CONFIG = {
  // Throttling intervals (in frames)
  elementFromPointCheckInterval: 5,
  fpsCalculationInterval: 10,

  // Camera animation
  camera: {
    lerpFactor: 0.08,
  },
} as const;

/**
 * Icon rendering configuration for sun focus area icons
 */
export const SUN_ICON_CONFIG = {
  // Relative size of icon within sun
  sizeMultiplier: 0.45,
  lineWidthMultiplier: 0.08,
  minLineWidth: 1.5,

  // Blockchain icon
  blockchain: {
    hexagonRadius: 0.6,
    nodeRadius: 0.1,
    centerNodeRadius: 0.15,
  },

  // AI/Neural network icon
  ai: {
    networkRadius: 0.5,
    nodeCount: 5,
    centerNodeRadius: 0.18,
    outerNodeRadius: 0.12,
  },

  // Shield icon
  shield: {
    width: 0.6,
    height: 0.75,
  },

  // Mobility/wheel icon
  mobility: {
    outerRadius: 0.55,
    innerRadius: 0.25,
    centerRadius: 0.08,
    spokeCount: 6,
    motionLineCount: 3,
  },

  // Default star icon
  defaultStar: {
    outerRadius: 0.5,
    innerRadius: 0.2,
    pointCount: 5,
  },
} as const;

/**
 * Standard colors used across rendering
 * Eliminates hardcoded color strings
 */
export const RENDERING_COLORS = {
  // Purple theme colors (main accent)
  purple: {
    primary: "138, 43, 226",
    light: "180, 100, 255",
    dark: "75, 0, 130",
  },

  // UI colors
  white: "255, 255, 255",
  black: "0, 0, 0",

  // Debug colors
  debug: {
    velocityVector: "red",
    mouseRadius: "rgba(255, 0, 0, 0.5)",
  },

  // Default fallback colors
  defaults: {
    sunColor: { r: 255, g: 200, b: 100 },
    connectionColor: "210, 210, 230",
  },
} as const;

/**
 * Opacity values used in rendering
 * Centralizes opacity magic numbers
 */
export const OPACITY_CONFIG = {
  // Sun layer opacities
  sun: {
    halo: { highlighted: 0.15, normal: 0.08 },
    atmosphere: { highlighted: 0.5, normal: 0.35 },
    flares: { dark: { highlighted: 0.7, normal: 0.5 }, light: { highlighted: 0.5, normal: 0.35 } },
    rays: { dark: { highlighted: 0.5, normal: 0.35 }, light: { highlighted: 0.35, normal: 0.22 } },
    chromosphere: { dark: 0.6, light: 0.45 },
    particles: { dark: { highlighted: 0.85, normal: 0.65 }, light: { highlighted: 0.7, normal: 0.5 } },
    icon: { dark: 0.85, light: 0.75 },
  },

  // Background dimming
  focusedBackground: 0.15,
} as const;

// Type exports for type safety
export type MouseEffectConfig = typeof MOUSE_EFFECT_CONFIG;
export type SunRenderingConfig = typeof SUN_RENDERING_CONFIG;
export type StarRenderingConfig = typeof STAR_RENDERING_CONFIG;
export type AnimationTimingConfig = typeof ANIMATION_TIMING_CONFIG;
export type SunIconConfig = typeof SUN_ICON_CONFIG;
export type RenderingColors = typeof RENDERING_COLORS;
export type OpacityConfig = typeof OPACITY_CONFIG;
