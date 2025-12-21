// components/Layout/Starfield/hooks/useMouseInteraction.ts
import { useState, useRef, useCallback, useMemo, MutableRefObject } from "react";
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
  // Optional: external ref to sync for immediate updates (e.g., for animation loop)
  externalMousePositionRef?: MutableRefObject<MousePosition>,
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

  // Store game-related values in refs to keep callbacks stable
  const gameModeRef = useRef(gameMode);
  const gameStateRef = useRef(gameState);
  const starsRef = useRef(stars);
  const mouseEffectRadiusRef = useRef(mouseEffectRadius);
  const setGameStateRef = useRef(setGameState);

  // Keep refs in sync with props
  gameModeRef.current = gameMode;
  gameStateRef.current = gameState;
  starsRef.current = stars;
  mouseEffectRadiusRef.current = mouseEffectRadius;
  setGameStateRef.current = setGameState;

  // Shared handler for both mouse and touch events
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number): void => {
      const now = Date.now();
      if (now - lastMoveTimeRef.current < 16) return; // ~60fps
      lastMoveTimeRef.current = now;

      // Update external ref SYNCHRONOUSLY for immediate animation loop access
      if (externalMousePositionRef) {
        const prev = externalMousePositionRef.current;
        externalMousePositionRef.current = {
          ...prev,
          x: clientX,
          y: clientY,
          lastX: prev.x,
          lastY: prev.y,
          speedX: clientX - prev.x,
          speedY: clientY - prev.y,
          isOnScreen: true,
        };
      }

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
    [externalMousePositionRef],
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
  // Uses refs for game-related values to maintain stable callback identity
  const handlePointerDown = useCallback(
    (clientX: number, clientY: number): void => {
      const clickTime = Date.now();

      // CRITICAL FIX: Update external ref SYNCHRONOUSLY before React state update
      // This ensures the animation loop sees isOnScreen: true immediately for touch
      if (externalMousePositionRef) {
        externalMousePositionRef.current = {
          ...externalMousePositionRef.current,
          x: clientX,
          y: clientY,
          isClicked: true,
          clickTime,
          isOnScreen: true,
        };
      }

      // Update mouse position
      // Also set isOnScreen: true for mobile touch support - without this,
      // hover detection won't run on touch because it checks isMouseOnScreen
      setMousePosition((prev) => ({
        ...prev,
        x: clientX,
        y: clientY,
        isClicked: true,
        clickTime,
        isOnScreen: true,
      }));

      logger.debug("Pointer down:", { clientX, clientY });

      // Game mode: apply force to nearby stars and use a click
      // Read from refs to avoid callback instability
      if (
        gameModeRef.current &&
        gameStateRef.current.remainingClicks > 0
      ) {
        // Apply force to nearby stars
        applyClickForce(
          starsRef.current,
          clientX,
          clientY,
          mouseEffectRadiusRef.current * 1.5,
          2.0,
        );

        // Use a click
        setGameStateRef.current((prev) => ({
          ...prev,
          remainingClicks: prev.remainingClicks - 1,
        }));
      }
    },
    [externalMousePositionRef], // Only externalMousePositionRef - other values accessed via refs
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
    // On mobile, touch end is equivalent to mouse leave + mouse up
    // Clear both isClicked AND isOnScreen since finger has left the screen

    // CRITICAL FIX: Update external ref SYNCHRONOUSLY before React state update
    // This ensures the animation loop sees isOnScreen: false immediately,
    // preventing the "stuck hover" bug where the sun hover ring persists
    // because animation frames ran before the async state/useEffect propagated
    if (externalMousePositionRef) {
      externalMousePositionRef.current = {
        ...externalMousePositionRef.current,
        isClicked: false,
        isOnScreen: false,
      };
    }

    setMousePosition((prev) => ({
      ...prev,
      isClicked: false,
      isOnScreen: false,
    }));
    logger.debug("Touch ended - cleared hover state");
  }, [externalMousePositionRef]);

  const handleMouseLeave = useCallback((): void => {
    // CRITICAL FIX: Update external ref SYNCHRONOUSLY before React state update
    // Same rationale as handleTouchEnd - prevents stuck hover states
    if (externalMousePositionRef) {
      externalMousePositionRef.current = {
        ...externalMousePositionRef.current,
        isOnScreen: false,
        isClicked: false,
      };
    }

    setMousePosition((prev) => ({
      ...prev,
      isOnScreen: false,
      isClicked: false, // Ensure click is released when leaving screen
    }));
    logger.debug("Mouse left screen");
  }, [externalMousePositionRef]);

  // Event handlers object - memoized to prevent unstable identity causing
  // useEffect cleanup/setup cycles that remove event listeners permanently
  const handleMouseEvents = useMemo(
    () => ({
      setup: (): void => {
        // Mouse events
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseleave", handleMouseLeave);

        // Touch events
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("touchstart", handleTouchStart, {
          passive: true,
        });
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
    }),
    [
      handleMouseMove,
      handleMouseDown,
      handleMouseUp,
      handleMouseLeave,
      handleTouchMove,
      handleTouchStart,
      handleTouchEnd,
    ],
  );

  return {
    mousePosition,
    setMousePosition,
    handleMouseEvents,
  };
};
