import { useCallback, useEffect, useRef, useState } from "react";
import { CollisionEffect, GameState } from "../types";
import { animate } from "./animation/animate";
import { AnimationProps, AnimationRefs } from "./animation/types";

export const useAnimationLoop = (props: AnimationProps) => {
  const [currentFps, setCurrentFps] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);

  // Animation refs
  const animationRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(true);
  const isRestartingRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number | null>(null); // Explicitly typed as number | null
  const lastFrameTimeRef = useRef<number>(Date.now());
  const frameSkipRef = useRef<number>(0);
  const mousePositionRef = useRef(props.mousePosition || {
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    speedX: 0,
    speedY: 0,
    isClicked: false,
    clickTime: 0,
    isOnScreen: true
  });
  const hoverInfoRef = useRef(props.hoverInfo || { project: null, x: 0, y: 0, show: false });

  // Initialize gameStateRef with a proper GameState object
  const gameStateRef = useRef<GameState>((props.gameState as GameState) || {
    remainingClicks: 3,
    score: 0,
    lastClickTime: 0,
    highScores: [],
    lastScoreUpdate: 0,
    ipAddress: null,
    collisions: [],
    clickAddInterval: 10000
  });

  const animationErrorCountRef = useRef<number>(0);
  const fpsValuesRef = useRef<number[]>([]);

  // Add the missing refs required by AnimationRefs interface
  const collisionEffectsRef = useRef<CollisionEffect[]>([]);
  const pendingCollisionEffectsRef = useRef<CollisionEffect[]>([]);
  const lastDebugModeRef = useRef<boolean>(!!props.debugMode);
  const animationStartTimeRef = useRef<number>(Date.now());
  const animationWatchdogRef = useRef<number | null>(null);

  /* ------------------------------------------------------------------ */
  /* 1. Make sure animate() always sees the **latest** props + settings */
  /* ------------------------------------------------------------------ */
  const latestPropsRef = useRef(props);
  useEffect(() => {
    latestPropsRef.current = props;
  });

  /* ------------------------------------------ */
  /* 2. Optional: toggle verbose frame logging  */
  /* ------------------------------------------ */
  const DEBUG_LOG = latestPropsRef.current.debugSettings?.verboseLogs ?? false;

  // Update refs when props change
  useEffect(() => {
    if (props.mousePosition) {
      mousePositionRef.current = props.mousePosition;
    }
    if (props.hoverInfo) {
      hoverInfoRef.current = props.hoverInfo;
    }
    if (props.gameState) {
      // Type assertion to ensure we're treating gameState as GameState
      gameStateRef.current = props.gameState as GameState;
    }
  }, [props.mousePosition, props.hoverInfo, props.gameState]);

  // Update FPS data callback
  const updateFpsData = useCallback((fps: number, currentTimestamp: number) => {
    setCurrentFps(fps);
    setTimestamp(currentTimestamp);
    if (props.updateFpsData) {
      props.updateFpsData(fps, currentTimestamp);
    }
  }, [props.updateFpsData]);

  // Create animation refs object with proper types
  const refs: AnimationRefs = {
    animationRef,
    isAnimatingRef,
    isRestartingRef,
    lastTimeRef, // This is correctly typed as MutableRefObject<number | null>
    lastFrameTimeRef,
    frameSkipRef,
    mousePositionRef,
    hoverInfoRef,
    gameStateRef,
    animationErrorCountRef,
    fpsValues: fpsValuesRef,
    // Add the missing refs
    collisionEffectsRef,
    pendingCollisionEffectsRef,
    lastDebugModeRef,
    animationStartTimeRef,
    animationWatchdogRef
  };

  // Restart animation function
  const restartAnimation = useCallback(() => {
    console.log("Restarting animation");
    isRestartingRef.current = true;

    // Cancel current animation frame
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }

    // Reset animation state
    lastTimeRef.current = null;
    frameSkipRef.current = 0;

    // Ensure we have stars
    if (props.ensureStarsExist && (!props.starsRef?.current || props.starsRef.current.length === 0)) {
      console.log("No stars found during restart, ensuring stars exist");
      props.ensureStarsExist();
      }

    // Start animation with a small delay to ensure everything is ready
    setTimeout(() => {
      if (props.canvasRef.current) {
        isRestartingRef.current = false;
        isAnimatingRef.current = true;
        // Start animation
        animationRef.current = window.requestAnimationFrame((timestamp) => {
          animate(timestamp, { ...latestPropsRef.current, updateFpsData }, refs);
        });
      }
    }, 100);
  }, [props]);

  // Start animation function
  const startAnimationWithProps = useCallback(() => {
    console.log("Starting animation with props");

    // Start animation – read from the ref each frame
    const frame = (ts: number) => {
      if (DEBUG_LOG) console.log("→ frame", ts);
      animate(ts, { ...latestPropsRef.current, updateFpsData }, refs);
  };
    animationRef.current = window.requestAnimationFrame(frame);
  }, [updateFpsData]);

  // Set up animation loop
  useEffect(() => {
    console.log("Setting up animation loop with dimensions", props.dimensions);

    // Reset error count when dependencies change
    animationErrorCountRef.current = 0;

    // Cancel any existing animation before starting a new one
    if (animationRef.current) {
      console.log("Canceling previous animation before starting new one");
      window.cancelAnimationFrame(animationRef.current);
    }

    // Ensure we have stars before starting animation
    if (props.ensureStarsExist && (!props.starsRef?.current || props.starsRef?.current.length === 0)) {
      console.log("No stars found, ensuring stars exist before starting animation");
      props.ensureStarsExist();
    }

    // Start animation with a small delay to ensure stars are created
    const startTimeout = setTimeout(() => {
      // Double check that we haven't been unmounted
      if (props.canvasRef.current) {
        isAnimatingRef.current = true; // Ensure this is true before starting
        startAnimationWithProps();
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(startTimeout);
      isAnimatingRef.current = false;
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
      // Clear watchdog if it exists
      if (animationWatchdogRef.current) {
        window.clearInterval(animationWatchdogRef.current);
        animationWatchdogRef.current = null;
      }
};
  }, [
    // Only include stable dependencies that won't change every render
    props.canvasRef,
    props.dimensions?.width,
    props.dimensions?.height,
    props.enableFlowEffect,
    props.enableBlackHole,
    props.enableMouseInteraction,
    props.enablePlanets,
    props.enableCosmicNavigation, // << ADDED
    props.heroMode,
    props.colorScheme,
    props.gameMode,
    props.isDarkMode,
    props.ensureStarsExist,
    // Add starsRef as a dependency since we're checking it
    props.starsRef,
    startAnimationWithProps,
    props.debugSettings         // << allows loop restart when sliders move
  ]);

  return {
    cancelAnimation: () => {
      isAnimatingRef.current = false;
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
      // Clear watchdog if it exists
      if (animationWatchdogRef.current) {
        window.clearInterval(animationWatchdogRef.current);
        animationWatchdogRef.current = null;
      }
    },
    restartAnimation,
    // Export FPS data for use in the component
    currentFps,
    timestamp
  };
};
