// components/Layout/Starfield/hooks/animation/types.ts
import { MutableRefObject, SetStateAction } from "react";
import {
  BlackHole,
  BurstParticle,
  ClickBurst,
  CollisionEffect,
  CollisionParticle,
  EmployeeStar,
  GameState,
  HoverInfo,
  MousePosition,
  Star
} from "../../types";

export interface AnimationProps {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
    starsRef?: MutableRefObject<Star[]>; // Make optional to match AnimationLoopProps
    blackHolesRef?: MutableRefObject<BlackHole[]>;
    employeeStarsRef?: MutableRefObject<EmployeeStar[]>;
    frameCountRef?: MutableRefObject<number>;
    dimensions: { width: number; height: number };
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
    centerPosition?: { x: number; y: number };
    colorScheme: string;
    lineConnectionDistance: number;
    lineOpacity: number;
    mouseEffectRadius: number;
    mouseEffectColor: string;
    maxVelocity?: number; // Make optional
    animationSpeed?: number; // Make optional
    isDarkMode: boolean;
    debugMode?: boolean; // Make optional
    gameMode: boolean;
    setHoverInfo: (info: SetStateAction<HoverInfo>) => void;
    setClickBursts: (bursts: ClickBurst[]) => void;
    setGameState: (state: SetStateAction<GameState>) => void;
    setCollisionEffects: (effects: SetStateAction<CollisionEffect[]>) => void;
    createCollisionEffect: (x: number, y: number, color: string, score: number) => CollisionEffect;
    ensureStarsExist?: () => void;
    drawDebugInfo?: (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      mousePosition: MousePosition,
      stars: Star[],
      mouseEffectRadius: number,
      timestamp: number
    ) => void;
    clickBurstsRef?: MutableRefObject<ClickBurst[]>;
    updateFpsData?: (fps: number, timestamp: number) => void;
}

export interface AnimationRefs {
    animationRef: MutableRefObject<number>;
    lastTimeRef: MutableRefObject<number>;
    collisionEffectsRef: MutableRefObject<CollisionEffect[]>;
    pendingCollisionEffectsRef: MutableRefObject<CollisionEffect[]>;
    fpsValues: MutableRefObject<number[]>;
    isAnimatingRef: MutableRefObject<boolean>;
    lastDebugModeRef: MutableRefObject<boolean>;
    animationStartTimeRef: MutableRefObject<number>;
    isRestartingRef: MutableRefObject<boolean>;
    frameSkipRef: MutableRefObject<number>;
    lastFrameTimeRef: MutableRefObject<number>;
    animationWatchdogRef: MutableRefObject<number | null>;
    animationErrorCountRef: MutableRefObject<number>;
    mousePositionRef: MutableRefObject<MousePosition>;
    hoverInfoRef: MutableRefObject<HoverInfo>;
    gameStateRef: MutableRefObject<GameState>;
  }
