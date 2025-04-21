import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { drillDown, pickObject } from "./cosmos/cosmicNavigation";
import { Camera, CosmicNavigationState } from "./cosmos/types";
import DebugControlsOverlay from "./DebugControlsOverlay";
import { fetchIpAddress, getHighScoresForIP, initGameState, saveScore } from "./gameState";
import { useAnimationLoop } from "./hooks/useAnimationLoop";
import { useDebugControls } from "./hooks/useDebugControls";
import { useMouseInteraction } from "./hooks/useMouseInteraction";
import { useParticleEffects } from "./hooks/useParticleEffects";
import { useStarInitialization } from "./hooks/useStarInitialization";
import ScoreOverlay from "./scoreOverlay";
import styles from "./starfield.module.css";
import { applyClickForce, createClickExplosion } from "./stars";
import Tooltip from "./tooltip";
import {
  DebugSettings,
  EmployeeData,
  GameState,
  HoverInfo,
  MousePosition,
  StarfieldProps
} from "./types";

// Define the ref type
export type StarfieldRef = {
  updateDebugSetting: <K extends keyof DebugSettings>(key: K, value: DebugSettings[K]) => void;
};

// Only modifying the relevant part of the component to ensure cosmic navigation is enabled
// This should be added to the component props section

const Starfield = forwardRef<StarfieldRef, StarfieldProps>(({
  enableFlowEffect = false,
  enableBlackHole = true,
  enableMouseInteraction = true,
  enablePlanets = true,
  enableCosmicNavigation = true, // Enable cosmic navigation by default
  starDensity = 1.0,
  colorScheme = "white",
  starSize = 1.0,
  sidebarWidth = 0,
  centerOffsetX = 0,
  centerOffsetY = 0,
  flowStrength = 0.01,
  gravitationalPull = 0.05,
  particleSpeed = 0.00001,
  planetSize = 1.0,
  employeeDisplayStyle = "initials",
  blackHoleSize = 1.0,
  heroMode = false,
  containerRef = null,
  lineConnectionDistance = 150,
  lineOpacity = 0.3,
  mouseEffectRadius = 150,
  mouseEffectColor = "rgba(255, 255, 255, 0.1)",
  initialMousePosition = null,
  isDarkMode = false,
  gameMode = false,
  debugMode = false,
  maxVelocity = 0.5,
  animationSpeed = 1.0,
  drawDebugInfo: externalDrawDebugInfo,
  // Add default navigation state and camera if not provided
  navigationState = {
    currentLevel: "universe",
    isTransitioning: false
  },
  camera = {
    cx: 0.5,
    cy: 0.5,
    zoom: 1
  }
}, ref) => {
  // Rest of the component remains unchanged
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const containerBoundsRef = useRef({ left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 });
  const centerPositionRef = useRef({ x: 0, y: 0 });
  const frameCountRef = useRef(0);
  const hasRunInitialSetupRef = useRef(false);
  const cancelAnimationRef = useRef<() => void>(() => {});
  const animationControllerRef = useRef<{
    cancelAnimation: () => void;
    restartAnimation: () => void;
  }>({
    cancelAnimation: () => {},
    restartAnimation: () => {}
  });

  const [internalCamera, setCamera] = useState<Camera>({ cx: 0.5, cy: 0.5, zoom: 1 });
  const [internalNavigationState, setNavigationState] = useState<CosmicNavigationState>({
    currentLevel: "universe",
    isTransitioning: false
  });
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  // FPS tracking state
  const [currentFps, setCurrentFps] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);
  const fpsValuesRef = useRef<number[]>([]);

  const updateFpsData = useCallback((fps: number, currentTimestamp: number) => {
    setCurrentFps(fps);
    setTimestamp(currentTimestamp);
  }, []);

  // Employee hover state
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({
    employee: null,
    x: 0,
    y: 0,
    show: false
  });
  const [pinnedEmployee, setPinnedEmployee] = useState<EmployeeData | null>(null);
  const [pinnedPosition, setPinnedPosition] = useState({ x: 0, y: 0 });

  const handlePinEmployee = (employee: EmployeeData) => {
    console.log("Pinning employee in starfield:", employee.name);
    setPinnedEmployee(employee);
    setPinnedPosition({ x: mousePosition.x, y: mousePosition.y });
    // Hide hover tooltip when pinning
    setHoverInfo({ employee: null, x: 0, y: 0, show: false });
  };

  const handleUnpinEmployee = () => {
    console.log("Unpinning employee in starfield");
    setPinnedEmployee(null);
  };

  // Game state
  const [gameState, setGameState] = useState<GameState>(initGameState());
  const prevModeRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Type assertion to tell TypeScript that canvas is not null
    const nonNullCanvas = canvas as HTMLCanvasElement;

    function handleMove(ev: MouseEvent) {
      if (!internalCamera) return;
      const pick = pickObject(
        ev.clientX, ev.clientY,
        internalCamera,
        nonNullCanvas.width, nonNullCanvas.height
      );
      setHoveredObjectId(pick ? pick.id : null);
    }

    function handleClick(ev: MouseEvent) {
      if (!internalCamera) return;
      const clicked = pickObject(
        ev.clientX, ev.clientY,
        internalCamera,
        nonNullCanvas.width, nonNullCanvas.height
      );
      if (!clicked) return;

      const { nav, cam } = drillDown(
        internalNavigationState,
        internalCamera,
        clicked
      );
      setNavigationState(nav);
      setCamera(cam);
    }

    nonNullCanvas.addEventListener("mousemove", handleMove);
    nonNullCanvas.addEventListener("click", handleClick);
    return () => {
      nonNullCanvas.removeEventListener("mousemove", handleMove);
      nonNullCanvas.removeEventListener("click", handleClick);
    };
  }, [canvasRef, internalCamera, internalNavigationState]);

  // Use debug controls hook
  const {
    debugSettings,
    updateDebugSetting,
    drawDebugInfo
  } = useDebugControls({
    initialDebugMode: debugMode,
    initialAnimationSpeed: animationSpeed,
    initialMaxVelocity: maxVelocity,
    initialFlowStrength: flowStrength * 5,
    initialGravitationalPull: gravitationalPull,
    initialParticleSpeed: particleSpeed,
    initialStarSize: starSize,
    initialEmployeeOrbitSpeed: 0.01,
    initialMouseEffectRadius: mouseEffectRadius,
    initialLineConnectionDistance: lineConnectionDistance,
    initialLineOpacity: lineOpacity,
    sidebarWidth: sidebarWidth
  });

  // Expose updateDebugSetting to parent components through ref
  useImperativeHandle(ref, () => ({
    updateDebugSetting: (key, value) => {
      console.log(`Updating debug setting from parent: ${String(key)} = ${value}`);
      updateDebugSetting(key, value);
    }
  }), [updateDebugSetting]);

  // Track debug mode changes
  useEffect(() => {
    console.log("Debug mode in Starfield:", debugSettings.isDebugMode);
  }, [debugSettings.isDebugMode]);

  const {
    clickBursts,
    setClickBursts,
    clickBurstsRef,
    collisionEffects,
    setCollisionEffects,
    createCollisionEffect
  } = useParticleEffects();

  // Use the star initialization hook
  const {
    stars,
    starsRef,
    blackHoles,
    blackHolesRef,
    planets,
    planetsRef,
    initializeElements,
    ensureStarsExist,
    resetStars,
    isStarsInitializedRef
  } = useStarInitialization({
    canvasRef,
    dimensionsRef,
    starDensity,
    sidebarWidth,
    centerOffsetX,
    centerOffsetY,
    starSize,
    colorScheme,
    enableBlackHole,
    blackHoleSize,
    particleSpeed,
    enablePlanets,
    planetSize,
    debugSettings,
    cancelAnimation: () => cancelAnimationRef.current()
  });

  const mousePositionRef = useRef<MousePosition>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    lastX: window.innerWidth / 2,
    lastY: window.innerHeight / 2,
    speedX: 0,
    speedY: 0,
    isClicked: false,
    clickTime: 0,
    isOnScreen: true // Force to true for testing
  });

  // Get mouse interaction hooks
  const { mousePosition, setMousePosition, handleMouseEvents } = useMouseInteraction(
    enableMouseInteraction,
    mouseEffectRadius,
    stars,
    gameMode,
    gameState,
    setGameState
  );

// In Starfield.tsx, add this effect to animate the camera
useEffect(() => {
  // Skip if no camera or no target
  if (!internalCamera || !internalCamera.target) return;

  // Animation frame function
  const animateCamera = () => {
    // Make sure target still exists (TypeScript safety check)
    if (!internalCamera.target) return;

    // Calculate distance to target
    const dCx = internalCamera.target.cx - internalCamera.cx;
    const dCy = internalCamera.target.cy - internalCamera.cy;
    const dZoom = internalCamera.target.zoom - internalCamera.zoom;

    // Check if we're close enough to target
    const distanceSquared = dCx * dCx + dCy * dCy + dZoom * dZoom;
    if (distanceSquared < 0.0001) {
      // We've reached the target, stop animation
      setCamera({
        cx: internalCamera.target.cx,
        cy: internalCamera.target.cy,
        zoom: internalCamera.target.zoom
      });

      // Mark navigation as no longer transitioning
      if (internalNavigationState.isTransitioning) {
        setNavigationState({
          ...internalNavigationState,
          isTransitioning: false
        });
      }
      return;
    }

    // Smoothly interpolate camera position (lerp)
    const t = 0.05; // Adjust for faster/slower animation
    setCamera({
      cx: internalCamera.cx + dCx * t,
      cy: internalCamera.cy + dCy * t,
      zoom: internalCamera.zoom + dZoom * t,
      target: internalCamera.target // Preserve the target for continued animation
    });

    // Continue animation
    requestAnimationFrame(animateCamera);
  };

  // Start animation
  const animationId = requestAnimationFrame(animateCamera);

  // Cleanup
  return () => cancelAnimationFrame(animationId);
}, [internalCamera, internalNavigationState, setCamera, setNavigationState]);

  useEffect(() => {
    // Update the ref with the latest state
    mousePositionRef.current = mousePosition;

    console.log("Updated mousePositionRef from state:", mousePosition);
  }, [mousePosition]);

  // Create a custom debug draw function that uses either the external or internal debug function
  const customDrawDebugInfo = useCallback((ctx: CanvasRenderingContext2D) => {
    if (externalDrawDebugInfo) {
      externalDrawDebugInfo(
        ctx,
        dimensionsRef.current.width,
        dimensionsRef.current.height,
        mousePosition,
        starsRef.current,
        debugSettings.mouseEffectRadius
      );
    } else {
      // Use the default debug info function if none is provided
      drawDebugInfo(
        ctx,
        dimensionsRef.current.width,
        dimensionsRef.current.height,
        mousePosition,
        starsRef.current,
        debugSettings.mouseEffectRadius
      );
    }
  }, [drawDebugInfo, externalDrawDebugInfo, mousePosition, debugSettings.mouseEffectRadius, starsRef]);

  useEffect(() => {
    // Create a global API for testing
    window.starfieldAPI = {
      applyForce: (x: number, y: number, radius: number, force: number) => {
        if (starsRef.current && starsRef.current.length > 0) {
          console.log(`API: Applying force at ${x}, ${y} with radius ${radius} and force ${force}`);
          return applyClickForce(starsRef.current, x, y, radius, force);
        }
        return 0;
      },
      getStarsCount: () => starsRef.current?.length || 0,
      createExplosion: (x: number, y: number) => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            createClickExplosion(ctx, x, y, 300, "rgba(255, 255, 255, 0.9)", 1000);
            return true;
          }
        }
        return false;
      }
    };

    return () => {
      delete window.starfieldAPI;
    };
  }, [starsRef]);

  useEffect(() => {
    const initTimeout = setTimeout(() => {
      if (!isStarsInitializedRef.current || starsRef.current.length === 0) {
        console.log("Forcing initialization on mount");
        initializeElements();

        // Force animation restart after initialization
        setTimeout(() => {
          if (animationControllerRef.current) {
            console.log("Force restarting animation after initialization");
            animationControllerRef.current.restartAnimation();
          }
        }, 200);
      }
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Detect debug mode changes
  useEffect(() => {
    const lastDebugMode = debugSettings.isDebugMode;
    console.log("Debug mode state:", lastDebugMode);

    // When debug mode changes, ensure stars are reset properly
    return () => {
      if (lastDebugMode !== debugSettings.isDebugMode) {
        console.log("Debug mode changed, resetting stars");
        setTimeout(() => {
          resetStars();
        }, 50);
      }
    };
  }, [debugSettings.isDebugMode, resetStars]);

  // Fetch IP address on component mount for game mode
  useEffect(() => {
    if (gameMode) {
      const getIP = async () => {
        const ip = await fetchIpAddress();
        if (ip) {
          setGameState(prev => ({
            ...prev,
            ipAddress: ip,
            highScores: getHighScoresForIP(ip)
          }));
        }
      };

      getIP().catch(e => console.log("IP address fetching failed:", e));
    }
  }, [gameMode]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If we have a pinned employee and click is not on tooltip
      if (pinnedEmployee && canvasRef.current && e.target === canvasRef.current) {
        handleUnpinEmployee();
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [pinnedEmployee]);

  // Set up canvas and handle resize
  useEffect(() => {
    if (hasRunInitialSetupRef.current) {
      console.log("Initial setup already run, skipping");
      return;
    }

    console.log("Running initial setup");
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("No canvas ref, skipping setup");
      return;
    }

    // Handle resize without triggering state updates in a loop
    const handleResize = () => {
      console.log("Resize event triggered");
      const { innerWidth: width, innerHeight: height } = window;

      // Set canvas dimensions directly
      canvas.width = width;
      canvas.height = height;

      // Update refs directly
      dimensionsRef.current = { width, height };

      // Update container bounds if in hero mode
      if (heroMode && containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        containerBoundsRef.current = {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        };
        centerPositionRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }

      // Call initialize directly
      setTimeout(() => {
        initializeElements();
      }, 50);
    };

    // Initial setup
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Add mouse event listeners
    if (enableMouseInteraction) {
      handleMouseEvents.setup();
    }

    // Mark initial setup as complete
    hasRunInitialSetupRef.current = true;

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);

      if (enableMouseInteraction) {
        handleMouseEvents.cleanup();
      }

      // Save score when component unmounts
      if (gameMode && gameState.score > 0 && gameState.ipAddress) {
        saveScore(gameState);
      }
    };
  }, [
    enableMouseInteraction,
    heroMode,
    containerRef,
    gameMode,
    gameState,
    handleMouseEvents,
    initializeElements
  ]);

  useEffect(() => {
    const currentMode = isDarkMode;

    // Only run this effect if the mode has actually changed
    if (currentMode !== prevModeRef.current) {
      console.log("Theme changed, forcing complete reset");
      prevModeRef.current = currentMode;

      // First stop the current animation
      cancelAnimationRef.current();

      // Force a complete reset of stars
      resetStars();

      // Reset animation error count and ensure stars exist
      if (ensureStarsExist) {
        console.log("Ensuring stars exist after theme change");
        ensureStarsExist();
      }

      // Then restart with a delay to ensure everything is ready
      const restartTimeout = setTimeout(() => {
        // Use the stored animation controller to restart
        if (animationControllerRef.current) {
          console.log("Restarting animation after theme change");
          animationControllerRef.current.restartAnimation();
        }
      }, 300);

      return () => {
        clearTimeout(restartTimeout);
      };
    }
  }, [isDarkMode, resetStars, ensureStarsExist]);

  // Apply initial mouse position if provided
  useEffect(() => {
    if (initialMousePosition && initialMousePosition.isActive) {
      setMousePosition(prev => ({
        ...prev,
        x: initialMousePosition.x,
        y: initialMousePosition.y,
        lastX: initialMousePosition.x,
        lastY: initialMousePosition.y,
        isOnScreen: true
      }));
    }
  }, [initialMousePosition, setMousePosition]);

  // Add this to your Starfield component
  useEffect(() => {
    // Test function to simulate mouse movement
    const simulateMouseMovement = () => {
      // Get the current mouse position from the browser
      const mouseTracker = (e: MouseEvent) => {
        const newPosition = {
          x: e.clientX,
          y: e.clientY,
          lastX: mousePositionRef.current.x,
          lastY: mousePositionRef.current.y,
          speedX: e.clientX - mousePositionRef.current.x,
          speedY: e.clientY - mousePositionRef.current.y,
          isClicked: mousePositionRef.current.isClicked,
          clickTime: mousePositionRef.current.clickTime,
          isOnScreen: true
        };

        // Update both the state and the ref directly
        setMousePosition(newPosition);
        mousePositionRef.current = newPosition;

        console.log("Mouse moved:", {
          x: e.clientX,
          y: e.clientY,
          speedX: newPosition.speedX,
          speedY: newPosition.speedY
        });
      };

      // Add mouse event listeners directly here
      window.addEventListener("mousemove", mouseTracker);

      // Also add mouse down/up events
      window.addEventListener("mousedown", (e) => {
        mousePositionRef.current = {
          ...mousePositionRef.current,
          isClicked: true,
          clickTime: Date.now()
        };
        setMousePosition({
          ...mousePositionRef.current,
          isClicked: true,
          clickTime: Date.now()
        });
      });

      window.addEventListener("mouseup", () => {
        mousePositionRef.current = {
          ...mousePositionRef.current,
          isClicked: false
        };
        setMousePosition({
          ...mousePositionRef.current,
          isClicked: false
        });
      });

      // Cleanup
      return () => {
        window.removeEventListener("mousemove", mouseTracker);
        window.removeEventListener("mousedown", mouseTracker);
        window.removeEventListener("mouseup", mouseTracker);
      };
    };

    // Start the mouse tracking
    return simulateMouseMovement();
  }, [setMousePosition]); // Only depend on setMousePosition to avoid re-creating listeners

// Memoize animation loop parameters to prevent unnecessary re-renders
const animationParams = useMemo(() => ({
  canvasRef,
  dimensions: dimensionsRef.current,
  stars: starsRef.current,
  blackHoles: blackHolesRef.current,
  planets: planetsRef.current,
  mousePosition,
  enableFlowEffect,
  enableBlackHole,
  enableMouseInteraction,
  enablePlanets,
  flowStrength: debugSettings.flowStrength,
  gravitationalPull: debugSettings.gravitationalPull,
  particleSpeed: debugSettings.particleSpeed,
  planetSize,
  employeeDisplayStyle,
  heroMode,
  centerPosition: centerPositionRef.current,
  hoverInfo,
  setHoverInfo,
  colorScheme,
  lineConnectionDistance: debugSettings.lineConnectionDistance,
  lineOpacity: debugSettings.lineOpacity,
  mouseEffectRadius: debugSettings.mouseEffectRadius,
  mouseEffectColor,
  clickBursts,
  setClickBursts,
  clickBurstsRef,
  gameMode,
  gameState,
  setGameState,
  collisionEffects,
  setCollisionEffects,
  createCollisionEffect,
  isDarkMode,
  frameCountRef,
  debugMode: debugSettings.isDebugMode,
  drawDebugInfo: customDrawDebugInfo,
  maxVelocity: debugSettings.maxVelocity,
  animationSpeed: debugSettings.animationSpeed,
  starsRef,
  blackHolesRef,
  planetsRef,
  ensureStarsExist,
  updateFpsData,
  fpsValuesRef,
  starSize,

  // cosmic‑navigation plumbing
  enableCosmicNavigation,
  camera: internalCamera,
  navigationState: internalNavigationState,
  setCamera,
  setNavigationState,
  hoveredObjectId,

  debugSettings,
}), [
  mousePosition,
  enableFlowEffect,
  enableBlackHole,
  enableMouseInteraction,
  enablePlanets,
  heroMode,
  hoverInfo,
  gameMode,
  gameState,
  customDrawDebugInfo,
  debugSettings.isDebugMode,
  debugSettings.maxVelocity,
  debugSettings.animationSpeed,
  debugSettings.flowStrength,
  debugSettings.gravitationalPull,
  debugSettings.mouseEffectRadius,
  debugSettings.lineConnectionDistance,
  debugSettings.lineOpacity,
  colorScheme,
  planetSize,
  employeeDisplayStyle,
  mouseEffectColor,
  clickBursts,
  collisionEffects,
  starsRef,
  blackHolesRef,
  planetsRef,
  ensureStarsExist,
  updateFpsData,
  internalCamera,
  internalNavigationState,
  enableCosmicNavigation,
  hoveredObjectId,
  debugSettings // ← re‑memo when sliders move
]);

  // Use the animation loop with memoized parameters - ONLY CALL THIS ONCE
  const { cancelAnimation, restartAnimation } = useAnimationLoop(animationParams);

  // Update the refs with the animation controller functions
  useEffect(() => {
    animationControllerRef.current = {
      cancelAnimation,
      restartAnimation
    };
    cancelAnimationRef.current = cancelAnimation;
  }, [cancelAnimation, restartAnimation]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      cancelAnimationRef.current();
    };
  }, []);

  // Update employee stars when orbit speed changes
  const handleEmployeeOrbitSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    updateDebugSetting("employeeOrbitSpeed", newSpeed);

    // Update employee stars with new orbit speed
    if (planetsRef.current.length > 0) {
      const updatedPlanets = planetsRef.current.map(empStar => ({
        ...empStar,
        orbitSpeed: newSpeed
      }));

      planetsRef.current = updatedPlanets;
    }
  };

  const applyStarfieldRepulsion = useCallback((x: number, y: number, radius: number = 300, force: number = 100) => {
    console.log(`Applying repulsion at (${x}, ${y}) with radius ${radius} and force ${force}`);

    if (window.starfieldAPI) {
      // Log before calling the API
      console.log("starfieldAPI is available, calling applyForce");

      // Call the API function
      const affectedStars = window.starfieldAPI.applyForce(x, y, radius, force);

      // Log the result
      console.log(`Applied force to ${affectedStars} stars`);

      // Create an explosion effect
      const explosionCreated = window.starfieldAPI.createExplosion(x, y);
      console.log(`Explosion created: ${explosionCreated}`);

      return affectedStars;
    } else {
      console.error("starfieldAPI is not available!");
      return 0;
    }
  }, []);

  // Update the click handler to use this unified function:
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!debugSettings.repulsionEnabled) return;

    // … compute x,y …
    applyStarfieldRepulsion(
      event.clientX, event.clientY,
      debugSettings.repulsionRadius,
      debugSettings.repulsionForce
    );
  }, [debugSettings.repulsionEnabled, debugSettings.repulsionRadius, debugSettings.repulsionForce, applyStarfieldRepulsion]);

  useEffect(() => {
    if (canvasRef.current) {
      console.log("Adding click event listener to canvas");

      // Add a direct DOM event listener as a backup
      const canvas = canvasRef.current;
      const clickHandler = (e: MouseEvent) => {
        console.log("Native canvas click detected", e.clientX, e.clientY);

        // Get click coordinates relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        console.log(`Converted to canvas coordinates: (${x}, ${y})`);

        applyStarfieldRepulsion(
          x,
          y,
          debugSettings.repulsionRadius,
          debugSettings.repulsionForce
        );
      };

      canvas.addEventListener("click", clickHandler);

      return () => {
        console.log("Removing click event listener from canvas");
        canvas.removeEventListener("click", clickHandler);
      };
    }
  }, [canvasRef, applyStarfieldRepulsion]);

  return (
    <>
      {/* Background elements with positive z-index */}
      <div className={styles.starfieldWrapper}>
        <div className={`${styles.starfieldBackground} ${isDarkMode ? "" : styles.light}`}></div>
        <div className={`${styles.nebulaOverlay} ${isDarkMode ? "" : styles.light}`}></div>
        <div className={`${styles.frontierAccent} ${isDarkMode ? "" : styles.light}`}></div>
        <div className={`${styles.purpleAccent} ${isDarkMode ? "" : styles.light}`}></div>

        {/* Canvas for interactive elements */}
        <canvas
          ref={canvasRef}
          className={styles.starfieldCanvas}
          aria-hidden="true"
          onClick={(e) => {
            e.stopPropagation(); // Stop event propagation
            handleCanvasClick(e);
          }}
        />

        {/* Add transparent overlay to capture clicks */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 4,
            cursor: "pointer",
            background: "transparent"
          }}
          onClick={e => {
            if (!debugSettings.repulsionEnabled) return;
            const x = e.clientX, y = e.clientY;
            applyStarfieldRepulsion(
              x, y,
              debugSettings.repulsionRadius,
              debugSettings.repulsionForce
            );

            // Also update mouse position state
            if (setMousePosition) {
              setMousePosition(prev => ({
                ...prev,
                x: x,
                y: y,
                isClicked: true,
                clickTime: Date.now()
              }));
            }
          }}
        />
      </div>

      {/* Only render debug controls when debug mode is active */}
      {debugSettings.isDebugMode && (
        <DebugControlsOverlay
          debugSettings={debugSettings}
          updateDebugSetting={updateDebugSetting}
          resetStars={resetStars}
          sidebarWidth={sidebarWidth}
          stars={stars}
          mousePosition={mousePosition}
          fps={currentFps}
          timestamp={timestamp}
          setMousePosition={setMousePosition}
          isDarkMode={isDarkMode}
          onEmployeeOrbitSpeedChange={handleEmployeeOrbitSpeedChange}
        />
      )}

      {pinnedEmployee && (
        <Tooltip
          employee={pinnedEmployee}
          x={pinnedPosition.x}
          y={pinnedPosition.y}
          isPinned={true}
          isDarkMode={isDarkMode}
          onUnpin={handleUnpinEmployee}
        />
      )}

      {hoverInfo.show && hoverInfo.employee && !pinnedEmployee && (
        <Tooltip
          employee={hoverInfo.employee}
          x={hoverInfo.x}
          y={hoverInfo.y}
          isDarkMode={isDarkMode}
          onPin={handlePinEmployee}
        />
      )}

      {/* Add score overlay if in game mode */}
      {gameMode && (
        <ScoreOverlay
          remainingClicks={gameState.remainingClicks}
          currentScore={gameState.score}
          highScores={gameState.highScores}
        />
      )}
    </>
  );
});

export default Starfield;

