// components/Layout/Starfield/hooks/animation/setupAnimationRefs.ts
import { useRef } from "react";
import { AnimationLoopProps, CollisionEffect } from "../../types";
import { AnimationRefs } from "./types";

export const useAnimationRefs = (props: AnimationLoopProps): AnimationRefs => {
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const collisionEffectsRef = useRef<CollisionEffect[]>(props.collisionEffects || []);
  const pendingCollisionEffectsRef = useRef<CollisionEffect[]>([]);
  const fpsValues = useRef<number[]>([]);
  const isAnimatingRef = useRef<boolean>(false);

  // Fix: Provide a default value for debugMode when it's undefined
  const lastDebugModeRef = useRef<boolean>(props.debugMode ?? false);

  const animationStartTimeRef = useRef<number>(Date.now());
  const isRestartingRef = useRef<boolean>(false);
  const frameSkipRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const animationWatchdogRef = useRef<number | null>(null);
  const animationErrorCountRef = useRef<number>(0);

  // For these refs, you might need to handle undefined values as well
  const mousePositionRef = useRef(props.mousePosition);
  const hoverInfoRef = useRef(props.hoverInfo);
  const gameStateRef = useRef(props.gameState);

  return {
    animationRef,
    lastTimeRef,
    collisionEffectsRef,
    pendingCollisionEffectsRef,
    fpsValues,
    isAnimatingRef,
    lastDebugModeRef,
    animationStartTimeRef,
    isRestartingRef,
    frameSkipRef,
    lastFrameTimeRef,
    animationWatchdogRef,
    animationErrorCountRef,
    mousePositionRef,
    hoverInfoRef,
    gameStateRef
  };
};
