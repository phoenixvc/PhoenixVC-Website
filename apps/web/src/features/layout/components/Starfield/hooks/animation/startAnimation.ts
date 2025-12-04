// components/Layout/Starfield/hooks/animation/startAnimation.ts
import { animate } from "./animate";
import { AnimationProps, AnimationRefs } from "./types";
import { logger } from "@/utils/logger";

export const startAnimation = (props: AnimationProps, refs: AnimationRefs) => {
    // Clear any previous animation frame first
    if (refs.animationRef.current) {
      window.cancelAnimationFrame(refs.animationRef.current);
      refs.animationRef.current = 0;
    }

    if (!props.starsRef) {
      logger.error("Cannot start animation: starsRef is undefined");
      return;
    }

    const canvas = props.canvasRef.current;
    if (!canvas) {
      logger.error("Cannot start animation: canvas ref is null");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      logger.error("Cannot start animation: failed to get canvas context");
      return;
    }

    logger.debug("Starting animation loop with stars:", props.starsRef.current?.length || 0);
    refs.isAnimatingRef.current = true;
    refs.lastTimeRef.current = 0;
    refs.lastFrameTimeRef.current = Date.now(); // Reset the last frame time
    refs.animationErrorCountRef.current = 0; // Reset error count on fresh start

    // Ensure we have stars before starting animation
    if (props.ensureStarsExist && (!props.starsRef.current || props.starsRef.current.length === 0)) {
      logger.debug("No stars found at animation start, ensuring stars exist");
      props.ensureStarsExist();
    }

    // Start the animation loop with a small delay to ensure everything is ready
    setTimeout(() => {
      if (refs.isAnimatingRef.current) {
        refs.animationRef.current = window.requestAnimationFrame(
          (timestamp) => animate(timestamp, props, refs)
        );
      }
    }, 50);
  };
