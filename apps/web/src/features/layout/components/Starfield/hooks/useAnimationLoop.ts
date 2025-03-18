// components/Layout/Starfield/hooks/useAnimationLoop.ts
import { SetStateAction, useEffect, useRef, useState, useCallback } from "react";
import { AnimationLoopProps } from "../types";
import { AnimationRefs } from "./animation/types";
import { useAnimationRefs } from "./animation/useAnimationRefs";
import { setupWatchdog } from "./animation/setupWatchdog";
import { handleDebugModeChanges } from "./animation/handleDebugModeChanges";
import { startAnimation } from "./animation/startAnimation";

export const useAnimationLoop = (props: AnimationLoopProps) => {
  // Add state for FPS and timestamp
  const [currentFps, setCurrentFps] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);
  const fpsValuesRef = useRef<number[]>([]);

  // Create all the refs needed for the animation
  const refs = useAnimationRefs(props);

  // Add the fpsValues ref to refs
  refs.fpsValues = fpsValuesRef;

  // Create a callback to update FPS data
  const updateFpsData = useCallback((fps: number, currentTimestamp: number) => {
    setCurrentFps(fps);
    setTimestamp(currentTimestamp);
  }, []);

  // Update refs when props change
  useEffect(() => {
    refs.mousePositionRef.current = props.mousePosition;
    refs.hoverInfoRef.current = props.hoverInfo;
    refs.gameStateRef.current = props.gameState;
    refs.collisionEffectsRef.current = props.collisionEffects || [];
  }, [props.mousePosition, props.hoverInfo, props.gameState, props.collisionEffects]);

  // Setup watchdog timer to check if animation is still running
  useEffect(() => {
    return setupWatchdog(refs, restartAnimation);
  }, []);

  // Handle debug mode changes separately
  useEffect(() => {
    // Pass a default value for debugMode
    handleDebugModeChanges(
      props.debugMode ?? false,
      refs,
      props.ensureStarsExist,
      restartAnimation
    );
  }, [props.debugMode, props.ensureStarsExist]);

  // Create the animation starter function with all necessary props and refs
  const startAnimationWithProps = () => {
    // Only start animation if starsRef is defined
    if (props.starsRef) {
      // Add updateFpsData to the props
      const animationProps = {
        ...props,
        updateFpsData
      };
      startAnimation(animationProps, refs);
    } else {
      console.error("Cannot start animation: starsRef is undefined");
    }
  };

  // Modify the restartAnimation function
  const restartAnimation = () => {
    console.log("Restarting animation with explicit cleanup");
    refs.isRestartingRef.current = true;

    // First ensure animation is stopped
    if (refs.animationRef.current) {
      console.log("Canceling previous animation frame");
      window.cancelAnimationFrame(refs.animationRef.current);
      refs.animationRef.current = 0; // Reset to 0
    }

    // Reset error count
    refs.animationErrorCountRef.current = 0;

    // Ensure stars exist before restarting
    if (props.ensureStarsExist) {
      console.log("Ensuring stars exist before restart");
      props.ensureStarsExist();
    }

    // Then restart with a slightly longer delay
    setTimeout(() => {
      console.log("Animation restart timeout fired, starting new animation");
      refs.isRestartingRef.current = false;
      refs.isAnimatingRef.current = true; // Ensure this is true before starting

      // Log the current state of stars
      console.log(`Stars before restart: ${props.starsRef?.current?.length || 0}`);

      startAnimationWithProps();
    }, 100);
  };

  // Main animation effect
  useEffect(() => {
    if (!props.canvasRef.current) {
      console.error("Cannot start animation: canvas ref is null");
      return;
    }

    // Check if starsRef is defined
    if (!props.starsRef) {
      console.error("Cannot start animation: starsRef is undefined");
      return;
    }

    // Reset error count when dependencies change
    refs.animationErrorCountRef.current = 0;

    // Cancel any existing animation before starting a new one
    if (refs.animationRef.current) {
      console.log("Canceling previous animation before starting new one");
      window.cancelAnimationFrame(refs.animationRef.current);
    }

    // Ensure we have stars before starting animation
    if (props.ensureStarsExist && (!props.starsRef.current || props.starsRef.current.length === 0)) {
      console.log("No stars found, ensuring stars exist before starting animation");
      props.ensureStarsExist();
    }

    // Start animation with a small delay to ensure stars are created
    const startTimeout = setTimeout(() => {
      // Double check that we haven't been unmounted
      if (props.canvasRef.current) {
        refs.isAnimatingRef.current = true; // Ensure this is true before starting
        startAnimationWithProps();
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(startTimeout);
      refs.isAnimatingRef.current = false;
      if (refs.animationRef.current) {
        window.cancelAnimationFrame(refs.animationRef.current);
      }
    };
  }, [
    // Only include stable dependencies that won't change every render
    props.canvasRef,
    props.dimensions.width,
    props.dimensions.height,
    props.enableFlowEffect,
    props.enableBlackHole,
    props.enableMouseInteraction,
    props.enableEmployeeStars,
    props.heroMode,
    props.colorScheme,
    props.gameMode,
    props.isDarkMode,
    props.ensureStarsExist,
    // Add starsRef as a dependency since we're checking it
    props.starsRef
  ]);

  return {
    cancelAnimation: () => {
      refs.isAnimatingRef.current = false;
      if (refs.animationRef.current) {
        window.cancelAnimationFrame(refs.animationRef.current);
      }
    },
    restartAnimation,
    // Export FPS data for use in the component
    currentFps,
    timestamp
  };
};
