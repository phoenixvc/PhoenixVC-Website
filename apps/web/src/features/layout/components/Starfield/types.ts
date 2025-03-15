// components/Layout/Starfield/types.ts

export interface BlackHoleData {
    id: string;
    x: number; // Percentage of screen width (0-1)
    y: number; // Percentage of screen height (0-1)
    mass: number;
    particles: number; // Number of particles to generate
  }

  export interface EmployeeSatellite {
    angle: number;
    distance: number;
    speed: number;
    size: number;
    color: string;
  }

  export interface Explosion {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    startTime: number;
    duration: number;
  }

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

  // Container bounds for hero mode
  export interface ContainerBounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  }

  // Hero starfield specific props
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

  // components/Layout/Starfield/types.ts
export interface Star {
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    originalX: number;
    originalY: number;
    mass: number;
    speed: number;
    targetVx?: number;
    targetVy?: number;
  }

  export interface BlackHole {
    id: string;
    x: number;
    y: number;
    mass: number;
    radius: number; // Size of the black hole (used in drawing)
    particles: BlackHoleParticle[];
    active?: boolean; // Optional property from your original type
  }

  export interface BlackHoleParticle {
    x: number;
    y: number;
    size: number;
    angle: number;
    distance: number;
    speed: number;
    color: string;
    alpha?: number; // Optional property from your original type
  }

  export interface EmployeeData {
    id: string;
    name: string;
    fullName?: string;
    initials: string;
    position: string;
    image?: string;
    color: string;
    mass: number;
    speed: number;
    x?: number;
    y?: number;
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
    orbitCenter: {
      x: number;
      y: number;
    };
    satellites: Satellite[];
    // New properties
    orbitalDirection: "clockwise" | "counterclockwise";
    pathType: "comet" | "satellite" | "planet" | "asteroid" | "star" | "binary";
    pathEccentricity: number; // 0-1 value where 0 is perfect circle, 1 is extremely elliptical
    pathTilt: number; // Angle in degrees for the tilt of the orbital plane
    trailLength?: number; // For comet-like objects with visible trails
    glowIntensity?: number; // For stars or other glowing objects
    pulsation?: {
      enabled: boolean;
      speed: number;
      minScale: number;
      maxScale: number;
    };
  }

  export interface Satellite {
    angle: number;
    distance: number;
    speed: number;
    size: number;
    color: string;
  }

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

  export interface HoverInfo {
    employee: EmployeeData | null; // Allow null for employee
    x: number;
    y: number;
    show: boolean;
  }

  export interface CenterPosition {
    x: number;
    y: number;
  }

// Theme options
export type ThemeMode = "light" | "dark" | "auto";

// Color schemes
export type ColorScheme = "purple" | "blue" | "green" | "amber" | "red" | string;
