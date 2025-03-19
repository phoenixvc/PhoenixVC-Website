// components/Layout/Starfield/types.ts

import React from "react";

// Basic types
export interface Point {
  x: number;
  y: number;
}

export interface CenterPosition {
  x: number;
  y: number;
}

// Employee-related types
export interface EmployeeData {
  id: string;
  name: string;
  fullName?: string;
  initials: string;
  color: string;
  position?: string;
  department?: string;
  mass?: number;
  speed?: number;
  image?: string;
  skills?: string[] | string;
  relatedIds?: string[];
  experience?: number;
  expertise?: string;
  projects?: string[];
  bio?: string;
  title: string;
  relatedEmployees: string[];
  product: string;
}

export interface Satellite {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  color: string;
  eccentricity: number;
}

export interface EmployeeSatellite {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  color: string;
}

export interface Pulsation {
  enabled: boolean;
  speed: number;
  minScale: number;
  maxScale: number;
  scale: number;
  direction: number;
}

export interface EmployeeStar {
  employee: EmployeeData;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rotationSpeed: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitCenter: Point;
  satellites?: Satellite[];
  isHovered?: boolean;
  isSelected?: boolean;
  orbitalDirection: "clockwise" | "counterclockwise";
  pathType: "comet" | "satellite" | "planet" | "asteroid" | "star" | "binary" | "elliptical";
  pathEccentricity: number; // 0-1 value where 0 is perfect circle, 1 is extremely elliptical
  pathTilt: number; // Angle in degrees for the tilt of the orbital plane
  trailLength?: number; // For comet-like objects with visible trails
  glowIntensity?: number; // For stars or other glowing objects
  pulsation?: Pulsation;
  useSimpleRendering: boolean;
  verticalFactor: number;
  skills?: {
    name: string;
    icon: string;
  }[];
  originalVx?: number;
  originalVy?: number;
  originalOrbitSpeed?: number;
  isMovementPaused: boolean;
}

export interface HoverInfo {
  employee: EmployeeData | null; // Allow null for employee
  x: number;
  y: number;
  show: boolean;
  isPinned?: boolean;
}

// Star-related types
export interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  fx: number;
  fy: number;
  originalX: number;
  originalY: number;
  mass: number;
  speed: number;
  targetVx?: number;
  targetVy?: number;
  isActive: boolean;
  lastPushed: number;
}

// Black hole types
export interface BlackHoleData {
  id: string;
  x: number; // Percentage of screen width (0-1)
  y: number; // Percentage of screen height (0-1)
  mass: number;
  particles: number; // Number of particles to generate
}

export interface BlackHole {
  id: string;
  x: number;
  y: number;
  mass: number;
  radius: number;
  particles: BlackHoleParticle[];
  active?: boolean;
  color: string;
  rotation: number;
  rotationSpeed: number;
  lastParticleTime: number;
}

export interface BlackHoleParticle {
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  speed: number;
  color: string;
  alpha?: number;
}

// Visual effects types
export interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  startTime: number;
  duration: number;
}

export interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  time: number;
}

export interface Burst {
  x: number;
  y: number;
  time: number;
  particles: BurstParticle[];
}

export interface ClickBurst {
  x: number;
  y: number;
  time: number;
  particles: BurstParticle[];
}

export interface CollisionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export interface CollisionEffect {
  x: number;
  y: number;
  color: string;
  time: number;
  score: number;
  particles: CollisionParticle[];
}

// Interaction types
export interface MousePosition {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  speedX: number;
  speedY: number;
  isClicked: boolean;
  clickTime: number;
  isOnScreen: boolean;
}

// Game-related types
export interface GameScore {
  score: number;
  date: string;
}

export interface GameCollision {
  x: number;
  y: number;
  time: number;
  score: number;
  employeeName: string;
}

export interface GameState {
  remainingClicks: number;
  score: number;
  lastClickTime: number;
  highScores: GameScore[];
  lastScoreUpdate: number;
  ipAddress: string | null;
  collisions: GameCollision[];
  clickAddInterval: number;
}

// Hero mode types
export interface HeroProps {
  title?: string;
  subtitle?: string;
  primaryCta?: {
    text: string;
    url: string;
  };
  secondaryCta?: {
    text: string;
    url: string;
  };
  isLoading?: boolean;
}

export interface ContainerBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface HeroStarfieldProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  colorScheme?: string;
  starDensity?: number;
  starSize?: number;
  lineConnectionDistance?: number;
  lineOpacity?: number;
  mouseEffectRadius?: number;
  mouseEffectColor?: string;
  isDarkMode?: boolean;
}

// Theme types
export type ThemeMode = "light" | "dark" | "auto";
export type ColorScheme = "purple" | "blue" | "green" | "amber" | "red" | string;

// Debug types
export interface DebugSettings {
  isDebugMode: boolean;
  animationSpeed: number;
  maxVelocity: number;
  flowStrength: number;
  gravitationalPull: number;
  particleSpeed: number;
  starSize: number;
  employeeOrbitSpeed: number;
  mouseEffectRadius: number;
  lineConnectionDistance: number;
  lineOpacity: number;
  sidebarWidth: number;
}

export interface UseDebugControlsProps {
  initialDebugMode: boolean;
  initialAnimationSpeed?: number;
  initialMaxVelocity?: number;
  initialFlowStrength?: number;
  initialGravitationalPull?: number;
  initialParticleSpeed?: number;
  initialStarSize?: number;
  initialEmployeeOrbitSpeed?: number;
  initialMouseEffectRadius?: number;
  initialLineConnectionDistance?: number;
  initialLineOpacity?: number;
  resetStarsCallback?: () => void;
  sidebarWidth: number;
}

// Component props
export interface AnimationLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  dimensions: { width: number; height: number };
  stars: Star[];
  blackHoles: BlackHole[];
  employeeStars: EmployeeStar[];
  mousePosition: MousePosition;
  enableFlowEffect: boolean;
  enableBlackHole: boolean;
  enableMouseInteraction: boolean;
  enableEmployeeStars: boolean;
  flowStrength: number;
  gravitationalPull: number;
  particleSpeed: number;
  employeeStarSize: number;
  employeeDisplayStyle: "initials" | "avatar" | "both";
  heroMode: boolean;
  centerPosition: { x: number; y: number };
  hoverInfo: HoverInfo;
  setHoverInfo: React.Dispatch<React.SetStateAction<HoverInfo>>;
  colorScheme: string;
  lineConnectionDistance: number;
  lineOpacity: number;
  mouseEffectRadius: number;
  mouseEffectColor: string;
  clickBursts: Burst[];
  setClickBursts: React.Dispatch<React.SetStateAction<Burst[]>>;
  clickBurstsRef: React.MutableRefObject<Burst[]>;
  gameMode: boolean;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  collisionEffects: CollisionEffect[];
  setCollisionEffects: React.Dispatch<React.SetStateAction<CollisionEffect[]>>;
  createCollisionEffect: (x: number, y: number, color: string, score: number) => CollisionEffect;
  isDarkMode: boolean;
  frameCountRef: React.MutableRefObject<number>;
  debugMode?: boolean;
  drawDebugInfo?: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mousePosition: MousePosition,
    stars: Star[],
    mouseEffectRadius: number,
    timestamp?: number
  ) => void;
  maxVelocity?: number;
  animationSpeed?: number;
  starsRef?: React.MutableRefObject<Star[]>;
  blackHolesRef?: React.MutableRefObject<BlackHole[]>;
  employeeStarsRef?: React.MutableRefObject<EmployeeStar[]>;
  ensureStarsExist?: () => void;
}

export interface InteractiveStarfieldProps {
  enableFlowEffect?: boolean;
  enableBlackHole?: boolean;
  enableMouseInteraction?: boolean;
  enableEmployeeStars?: boolean;
  starDensity?: number;
  colorScheme?: string;
  starSize?: number;
  sidebarWidth?: number;
  centerOffsetX?: number;
  centerOffsetY?: number;
  flowStrength?: number;
  gravitationalPull?: number;
  particleSpeed?: number;
  employeeStarSize?: number;
  employeeDisplayStyle?: "initials" | "avatar" | "both";
  blackHoleSize?: number;
  heroMode?: boolean;
  containerRef?: React.RefObject<HTMLElement> | null;
  lineConnectionDistance?: number;
  lineOpacity?: number;
  mouseEffectRadius?: number;
  mouseEffectColor?: string;
  initialMousePosition?: {
    x: number;
    y: number;
    isActive: boolean;
  } | null;
  isDarkMode?: boolean;
  gameMode?: boolean;
  debugMode?: boolean;
  maxVelocity?: number;
  animationSpeed?: number;
  drawDebugInfo?: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mousePosition: { x: number; y: number; isOnScreen?: boolean } | null,
    stars: Star[],
    mouseEffectRadius: number,
    timestamp?: number
  ) => void;
}

// Global declarations
declare global {
  interface Window {
    employeeStars?: EmployeeStar[];
    starfieldAPI?: {
      applyForce: (x: number, y: number, radius: number, force: number) => number;
      getStarsCount: () => number;
      createExplosion: (x: number, y: number) => boolean;
    };
  }
}
