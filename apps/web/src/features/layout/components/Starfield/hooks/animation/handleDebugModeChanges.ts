// components/Layout/Starfield/hooks/animation/handleDebugModeChanges.ts

import { AnimationRefs } from "./types";
import { logger } from "@/utils/logger";

export const handleDebugModeChanges = (
  debugMode: boolean,
  refs: AnimationRefs,
  ensureStarsExist?: () => void,
  restartAnimation?: () => void,
): void => {
  // Check if debug mode changed
  if (debugMode !== refs.lastDebugModeRef.current) {
    logger.debug(
      "Debug mode changed from",
      refs.lastDebugModeRef.current,
      "to",
      debugMode,
    );
    refs.lastDebugModeRef.current = debugMode;

    // Reset animation start time to force a complete redraw
    refs.animationStartTimeRef.current = Date.now();

    // Stop the current animation
    if (refs.animationRef.current) {
      window.cancelAnimationFrame(refs.animationRef.current);
    }

    // Force stars to be recreated when debug mode changes
    if (ensureStarsExist) {
      logger.debug("Forcing stars recreation due to debug mode change");
      ensureStarsExist();

      // Restart animation after a short delay to ensure stars are created
      if (restartAnimation) {
        setTimeout(() => {
          restartAnimation();
        }, 100);
      }
    }
  }
};
