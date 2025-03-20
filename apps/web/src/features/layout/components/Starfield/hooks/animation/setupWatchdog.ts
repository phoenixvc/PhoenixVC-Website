// components/Layout/Starfield/hooks/animation/setupWatchdog.ts

import { AnimationRefs } from "./types";

export const setupWatchdog = (refs: AnimationRefs, restartAnimation: () => void) => {
    if (refs.animationWatchdogRef.current) {
      window.clearInterval(refs.animationWatchdogRef.current);
    }

    refs.animationWatchdogRef.current = window.setInterval(() => {
      const now = Date.now();
      // If no frame has been rendered for 3 seconds and animation should be running
      if (now - refs.lastFrameTimeRef.current > 3000 && refs.isAnimatingRef.current && !refs.isRestartingRef.current) {
        console.warn(`Animation appears frozen (${now - refs.lastFrameTimeRef.current}ms since last frame). Attempting restart...`);

        // Force animation to restart
        if (refs.animationRef.current) {
          window.cancelAnimationFrame(refs.animationRef.current);
        }

        // Count errors to avoid infinite restart loops
        refs.animationErrorCountRef.current++;

        // Only try to restart a limited number of times
        if (refs.animationErrorCountRef.current < 5) {
          // Reset and restart
          refs.lastFrameTimeRef.current = now;
          console.log("Watchdog is restarting animation...");

          // Use restart animation instead of directly calling startAnimation
          restartAnimation();
        } else {
          console.error("Too many animation restarts attempted. Animation disabled to prevent browser issues.");
          refs.isAnimatingRef.current = false;
        }
      }
    }, 3000); // Check every 3 seconds

    return () => {
      if (refs.animationWatchdogRef.current) {
        window.clearInterval(refs.animationWatchdogRef.current);
      }
    };
  };
