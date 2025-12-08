// components/Layout/Starfield/hooks/useMouseInteraction.ts
import { useState, useRef, useCallback } from "react";
import { MousePosition, Star, GameState } from "../types";
import { applyClickForce } from "../stars";
import { logger } from "@/utils/logger";

export const useMouseInteraction = (
  enableMouseInteraction: boolean,
  mouseEffectRadius: number,
  stars: Star[],
  gameMode: boolean,
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
): {
  mousePosition: MousePosition;
  setMousePosition: React.Dispatch<React.SetStateAction<MousePosition>>;
  handleMouseEvents: {
    setup: () => void;
    cleanup: () => void;
  };
} => {
  // Mouse interaction state
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    speedX: 0,
    speedY: 0,
    isClicked: false,
    clickTime: 0,
    isOnScreen: false,
  });

  // Throttling refs
  const lastMoveTimeRef = useRef(0);

  // Shared handler for both mouse and touch events
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number): void => {
      const now = Date.now();
      if (now - lastMoveTimeRef.current < 16) return; // ~60fps
      lastMoveTimeRef.current = now;

      setMousePosition((prev) => ({
        ...prev,
        x: clientX,
        y: clientY,
        lastX: prev.x,
        lastY: prev.y,
        speedX: clientX - prev.x,
        speedY: clientY - prev.y,
        isOnScreen: true,
      }));
    },
    [],
  );

  // Throttled mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent): void => {
      const { clientX, clientY } = e;
      handlePointerMove(clientX, clientY);
    },
    [handlePointerMove],
  );

  // Touch move handler
  const handleTouchMove = useCallback(
    (e: TouchEvent): void => {
      if (e.touches.length > 0) {
        const { clientX, clientY } = e.touches[0];
        handlePointerMove(clientX, clientY);
      }
    },
    [handlePointerMove],
  );

  // Shared handler for pointer down events
  const handlePointerDown = useCallback(
    (clientX: number, clientY: number): void => {
      // Update mouse position
      setMousePosition((prev) => ({
        ...prev,
        x: clientX,
        y: clientY,
        isClicked: true,
        clickTime: Date.now(),
      }));

      logger.debug("Pointer down:", { clientX, clientY });

      // Game mode: apply force to nearby stars and use a click
      if (gameMode && gameState.remainingClicks > 0) {
        // Apply force to nearby stars
        applyClickForce(stars, clientX, clientY, mouseEffectRadius * 1.5, 2.0);

        // Use a click
        setGameState((prev) => ({
          ...prev,
          remainingClicks: prev.remainingClicks - 1,
        }));
      }
    },
    [gameMode, gameState, mouseEffectRadius, setGameState, stars],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent): void => {
      const { clientX, clientY } = e;
      handlePointerDown(clientX, clientY);
    },
    [handlePointerDown],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent): void => {
      if (e.touches.length > 0) {
        const { clientX, clientY } = e.touches[0];
        handlePointerDown(clientX, clientY);
      }
    },
    [handlePointerDown],
  );

  const handlePointerUp = useCallback((): void => {
    setMousePosition((prev) => ({
      ...prev,
      isClicked: false,
    }));
    logger.debug("Pointer up");
  }, []);

  const handleMouseUp = useCallback((): void => {
    handlePointerUp();
  }, [handlePointerUp]);

  const handleTouchEnd = useCallback((): void => {
    handlePointerUp();
  }, [handlePointerUp]);

  const handleMouseLeave = useCallback((): void => {
    setMousePosition((prev) => ({
      ...prev,
      isOnScreen: false,
      isClicked: false, // Ensure click is released when leaving screen
    }));
    logger.debug("Mouse left screen");
  }, []);

  // Event handlers object
  const handleMouseEvents = {
    setup: (): void => {
      // Mouse events
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mouseleave", handleMouseLeave);

      // Touch events
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);

      logger.debug("Mouse and touch event listeners set up");
    },
    cleanup: (): void => {
      // Mouse events
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseLeave);

      // Touch events
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);

      logger.debug("Mouse and touch event listeners cleaned up");
    },
  };

  return {
    mousePosition,
    setMousePosition,
    handleMouseEvents,
  };
};
