// interfaces.ts
export interface EmployeeData {
    id: string;
    name: string;
    position: string;
    mass: number;
    color: string;
    image?: string;
    fullName?: string;
    description?: string;
  }

  export interface BlackHoleData {
    id: string;
    x: number; // 0-1 (percentage of screen width)
    y: number; // 0-1 (percentage of screen height)
    mass: number;
    particles: number;
  }

  export interface InteractiveStarfieldProps {
    // Core functionality toggles
    enableFlowEffect: boolean;          // Toggle for the flow effect around content
    enableBlackHole: boolean;           // Toggle for the black hole effect
    enableMouseInteraction: boolean;    // Toggle for mouse interaction
    enableEmployeeStars: boolean;       // Toggle for special employee stars

    // Visual customization
    starDensity: number;                // Controls number of stars (0.5-3.0, default 1.0)
    colorScheme: "purple" | "blue" | "multicolor" | "white"; // Color scheme for stars
    starSize: number;                   // Base size multiplier for stars (0.5-2.0, default 1.0)

    // Layout configuration
    sidebarWidth: number;               // Width of sidebar in pixels (for offset calculation)
    centerOffsetX: number;              // Horizontal offset for the center point (0 = center of visible area)
    centerOffsetY: number;              // Vertical offset for the center point (0 = center of visible area)

    // Black hole customization
    blackHoles?: BlackHoleData[];       // Multiple black holes configuration
    blackHoleSize: number;              // Visual size multiplier for black holes (0.5-2.0, default 1.0)

    // Physics customization
    flowStrength: number;               // Strength of the flow effect (0.0-2.0, default 1.0)
    gravitationalPull: number;          // Strength of gravitational effects (0.0-2.0, default 1.0)
    particleSpeed: number;              // Speed of particle movement (0.5-2.0, default 1.0)

    // Employee stars customization
    employees?: EmployeeData[];         // List of employees to show as special stars
    employeeStarSize: number;           // Size multiplier for employee stars (1.0-3.0, default 1.5)
    employeeDisplayStyle: "initials" | "avatar" | "both"; // How to display employees
  }

  export interface Star {
    x: number;
    y: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    originalX: number;
    originalY: number;
  }

  export interface EmployeeStar {
    employee: EmployeeData;
    x: number;
    y: number;
    angle: number;
    orbitRadius: number;
    orbitSpeed: number;
    orbitCenterX: number;
    orbitCenterY: number;
    satellites: {
      angle: number;
      distance: number;
      speed: number;
      size: number;
      color: string;
    }[];
  }

  export interface BlackHole {
    id: string;
    x: number;
    y: number;
    mass: number;
    particles: OrbitingParticle[];
    size: number;
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

  export interface Explosion {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    startTime: number;
    duration: number;
  }

  export interface OrbitingParticle {
    x: number;
    y: number;
    angle: number;
    speed: number;
    distance: number;
    size: number;
    color: string;
  }

  export interface HoverInfo {
    employee: EmployeeData | null;
    x: number;
    y: number;
    show: boolean;
  }
