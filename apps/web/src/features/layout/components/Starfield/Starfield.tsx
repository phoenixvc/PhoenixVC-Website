import { useRef, useEffect, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import styles from "./starfield.module.css";
import { logger } from "@/utils/logger";
import {
  PortfolioProject,
  HoverInfo,
  GameState,
  InteractiveStarfieldProps,
  MousePosition,
  DebugSettings
} from "./types";
import { Camera } from "./cosmos/types";
import { ProjectTooltip } from "./projectTooltip";
import { fetchIpAddress, getHighScoresForIP, initGameState, saveScore } from "./gameState";
import ScoreOverlay from "./scoreOverlay";
import { useAnimationLoop } from "./hooks/useAnimationLoop";
import { useMouseInteraction } from "./hooks/useMouseInteraction";
import { useParticleEffects } from "./hooks/useParticleEffects";
import { useDebugControls } from "./hooks/useDebugControls";
import DebugControlsOverlay from "./DebugControlsOverlay";
import { useStarInitialization } from "./hooks/useStarInitialization";
import { applyClickForce, createClickExplosion } from "./stars";
import { checkSunHover } from "./hooks/animation/animate";
import { applyClickRepulsionToSunsCanvas, getSunPosition } from "./sunSystem";
import SunTooltip, { SunInfo } from "./sunTooltip";

// Define the ref type
export type StarfieldRef = {
  updateDebugSetting: <K extends keyof DebugSettings>(key: K, value: DebugSettings[K]) => void;
};

// Convert to forwardRef
const InteractiveStarfield = forwardRef<StarfieldRef, InteractiveStarfieldProps>(({
  enableFlowEffect = false,
  enableBlackHole = true,
  enableMouseInteraction = true,
  enableEmployeeStars = true,
  starDensity = 1.0,
  colorScheme = "white",
  starSize = 1.0,
  sidebarWidth = 0,
  centerOffsetX = 0,
  centerOffsetY = 0,
  flowStrength = 0.01,
  gravitationalPull = 0.05,
  particleSpeed = 0.00001,
  employeeStarSize = 0.7,
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
  drawDebugInfo: externalDrawDebugInfo
}, ref) => {
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

  // FPS tracking state
  const [currentFps, setCurrentFps] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);
  const fpsValuesRef = useRef<number[]>([]);

  const updateFpsData = useCallback((fps: number, currentTimestamp: number) => {
    setCurrentFps(fps);
    setTimestamp(currentTimestamp);
  }, []);

  // Project hover state
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({
    project: null,
    x: 0,
    y: 0,
    show: false
  });
  const [pinnedProject, setPinnedProject] = useState<PortfolioProject | null>(null);
  const [pinnedPosition, setPinnedPosition] = useState({ x: 0, y: 0 });

  const handlePinProject = (project: PortfolioProject) => {
    setPinnedProject(project);
    setPinnedPosition({ x: mousePosition.x, y: mousePosition.y });
    // Hide hover tooltip when pinning
    setHoverInfo({ project: null, x: 0, y: 0, show: false });
  };

  const handleUnpinProject = () => {
    setPinnedProject(null);
  };

  // Sun hover state for focus area suns
  const [hoveredSun, setHoveredSun] = useState<SunInfo | null>(null);
  const [hoveredSunId, setHoveredSunId] = useState<string | null>(null);
  // Ref to track current value and avoid unnecessary state updates
  const hoveredSunIdRef = useRef<string | null>(null);
  // Ref for debouncing sun tooltip hide
  const sunHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focused sun state - when user clicks on a focus area, we scope the view
  const [focusedSunId, setFocusedSunId] = useState<string | null>(null);
  const focusAnimationRef = useRef<number | null>(null);
  
  // Internal camera state for sun zoom functionality
  const [internalCamera, setInternalCamera] = useState<Camera>({
    cx: 0.5,
    cy: 0.5,
    zoom: 1,
    target: undefined
  });
  const cameraAnimationRef = useRef<number | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>(initGameState());
  const prevModeRef = useRef<boolean>(false);

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
      updateDebugSetting(key, value);
    }
  }), [updateDebugSetting]);

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
    employeeStars,
    employeeStarsRef,
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
    enableEmployeeStars,
    employeeStarSize,
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

  useEffect(() => {
    // Update the ref with the latest state
    mousePositionRef.current = mousePosition;

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
        initializeElements();

        // Force animation restart after initialization
        setTimeout(() => {
          if (animationControllerRef.current) {
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

    // When debug mode changes, ensure stars are reset properly
    return () => {
      if (lastDebugMode !== debugSettings.isDebugMode) {
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

    }
  }, [gameMode]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If we have a pinned project and click is not on tooltip
      if (pinnedProject && canvasRef.current && e.target === canvasRef.current) {
        handleUnpinProject();
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [pinnedProject]);

  // Set up canvas and handle resize
  useEffect(() => {
    if (hasRunInitialSetupRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Handle resize without triggering state updates in a loop
    const handleResize = () => {
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
      prevModeRef.current = currentMode;

      // First stop the current animation
      cancelAnimationRef.current();

      // Force a complete reset of stars
      resetStars();

      // Recalculate canvas dimensions to fix coordinate offset issues
      const canvas = canvasRef.current;
      if (canvas) {
        const { innerWidth: width, innerHeight: height } = window;
        canvas.width = width;
        canvas.height = height;
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
      }

      // Reset animation error count and ensure stars exist
      if (ensureStarsExist) {
        ensureStarsExist();
      }

      // Then restart with a delay to ensure everything is ready
      const restartTimeout = setTimeout(() => {
        // Use the stored animation controller to restart
        if (animationControllerRef.current) {
          animationControllerRef.current.restartAnimation();
        }
      }, 300);

      return () => {
        clearTimeout(restartTimeout);
      };
    }
  }, [isDarkMode, resetStars, ensureStarsExist, heroMode, containerRef]);

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

  // Mouse tracking effect with proper cleanup
  useEffect(() => {
    // Define all handlers as named functions for proper cleanup
    const handleMouseMove = (e: MouseEvent) => {
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

      // Check for sun hover
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        const sunHoverResult = checkSunHover(canvasX, canvasY, rect.width, rect.height);

        if (sunHoverResult) {
          // Clear any pending hide timeout since we're hovering over a sun
          if (sunHideTimeoutRef.current) {
            clearTimeout(sunHideTimeoutRef.current);
            sunHideTimeoutRef.current = null;
          }
          // Only update state if the hovered sun changed
          // Use the sun's fixed position (converted to viewport coordinates) instead of following the mouse
          // This keeps the tooltip stable so users can click on it
          if (hoveredSunIdRef.current !== sunHoverResult.sun.id) {
            hoveredSunIdRef.current = sunHoverResult.sun.id;
            setHoveredSunId(sunHoverResult.sun.id);
            // Convert canvas-relative sun position to viewport coordinates
            const sunScreenX = sunHoverResult.x + rect.left;
            const sunScreenY = sunHoverResult.y + rect.top;
            setHoveredSun({
              id: sunHoverResult.sun.id,
              name: sunHoverResult.sun.name,
              description: sunHoverResult.sun.description,
              color: sunHoverResult.sun.color || "#ffffff",
              x: sunScreenX,
              y: sunScreenY
            });
          }
          // Don't update position when hovering over the same sun - keep tooltip stable
          // Change cursor to pointer
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "pointer";
          }
        } else {
          // Only clear state if we were previously hovering (avoid unnecessary updates)
          // Add a delay to allow user to move mouse to the tooltip
          if (hoveredSunIdRef.current !== null) {
            // Clear any existing hide timeout
            if (sunHideTimeoutRef.current) {
              clearTimeout(sunHideTimeoutRef.current);
            }
            // Set a new hide timeout with 300ms delay
            sunHideTimeoutRef.current = setTimeout(() => {
              hoveredSunIdRef.current = null;
              setHoveredSunId(null);
              setHoveredSun(null);
              // Reset cursor
              if (canvasRef.current) {
                canvasRef.current.style.cursor = "default";
              }
            }, 300);
          }
        }
      }
    };

    const handleMouseDown = () => {
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
    };

    const handleMouseUp = () => {
      mousePositionRef.current = {
        ...mousePositionRef.current,
        isClicked: false
      };
      setMousePosition({
        ...mousePositionRef.current,
        isClicked: false
      });
    };

    // Add all event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Cleanup - remove all listeners with correct references
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setMousePosition]);

  // Memoize animation loop parameters to prevent unnecessary re-renders
  const animationParams = useMemo(() => ({
    canvasRef,
    dimensions: dimensionsRef.current,
    stars: starsRef.current,
    blackHoles: blackHolesRef.current,
    mousePosition,
    enableFlowEffect,
    enableBlackHole,
    enableMouseInteraction,
    enablePlanets: enableEmployeeStars, // Map to correct name expected by animation
    flowStrength: debugSettings.flowStrength,
    gravitationalPull: debugSettings.gravitationalPull,
    particleSpeed: debugSettings.particleSpeed,
    planetSize: employeeStarSize, // Map to correct name expected by animation
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
    starSize: starSize,
    starsRef,
    blackHolesRef,
    planetsRef: employeeStarsRef, // Map to correct name expected by animation
    ensureStarsExist,
    updateFpsData, // Add the FPS update callback
    fpsValuesRef, // Add the FPS values ref
    hoveredSunId, // Pass the hovered sun id to the animation
    focusedSunId, // Pass the focused sun id for camera zoom
    camera: internalCamera, // Pass the internal camera for zoom functionality
    setCamera: setInternalCamera // Pass camera setter
  }), [
    mousePosition,
    enableFlowEffect,
    enableBlackHole,
    enableMouseInteraction,
    enableEmployeeStars,
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
    employeeStarSize,
    employeeDisplayStyle,
    mouseEffectColor,
    clickBursts,
    collisionEffects,
    starsRef,
    blackHolesRef,
    employeeStarsRef,
    ensureStarsExist,
    updateFpsData,
    hoveredSunId,
    focusedSunId,
    internalCamera
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
    if (employeeStarsRef.current.length > 0) {
      const updatedEmployeeStars = employeeStarsRef.current.map(empStar => ({
        ...empStar,
        orbitSpeed: newSpeed
      }));

      employeeStarsRef.current = updatedEmployeeStars;
    }
  };

  const applyStarfieldRepulsion = useCallback((x: number, y: number, radius: number = 300, force: number = 100) => {

    if (window.starfieldAPI) {
      // Log before calling the API

      // Call the API function
      const affectedStars = window.starfieldAPI.applyForce(x, y, radius, force);

      // Log the result

      // Create an explosion effect
      const explosionCreated = window.starfieldAPI.createExplosion(x, y);

      return affectedStars;
    } else {
      logger.warn("[Starfield] starfieldAPI is not available");
      return 0;
    }
  }, []);

  // Function to zoom the camera to focus on a specific sun
  const zoomToSun = useCallback((sunId: string) => {
    
    // Cancel any existing camera animation
    if (cameraAnimationRef.current) {
      cancelAnimationFrame(cameraAnimationRef.current);
    }
    
    // If clicking on the same sun, toggle off (zoom out)
    if (focusedSunId === sunId) {
      setFocusedSunId(null);
      
      // Set camera target to zoom out
      setInternalCamera(prev => ({
        ...prev,
        target: {
          cx: 0.5,
          cy: 0.5,
          zoom: 1
        }
      }));
      return;
    }
    
    // Get the sun's current position
    const sunPosition = getSunPosition(sunId);
    if (!sunPosition) {
      logger.warn(`[Starfield] Could not find sun with id: ${sunId}`);
      return;
    }
    
    setFocusedSunId(sunId);
    
    // Set camera target to zoom in on the sun
    // Sun position is normalized (0-1), camera uses same coordinates
    setInternalCamera(prev => ({
      ...prev,
      target: {
        cx: sunPosition.x,
        cy: sunPosition.y,
        zoom: 2.5 // Zoom in 2.5x when focused on a sun
      }
    }));
    
  }, [focusedSunId]);

  // Smooth camera lerp animation
  useEffect(() => {
    if (!internalCamera.target) return;
    
    const animateCamera = () => {
      setInternalCamera(prev => {
        if (!prev.target) return prev;
        
        const smoothing = 0.08;
        const newCx = prev.cx + (prev.target.cx - prev.cx) * smoothing;
        const newCy = prev.cy + (prev.target.cy - prev.cy) * smoothing;
        const newZoom = prev.zoom + (prev.target.zoom - prev.zoom) * smoothing;
        
        // Check if we're close enough to target
        const isCloseEnough = 
          Math.abs(newCx - prev.target.cx) < 0.001 &&
          Math.abs(newCy - prev.target.cy) < 0.001 &&
          Math.abs(newZoom - prev.target.zoom) < 0.01;
        
        if (isCloseEnough) {
          return {
            cx: prev.target.cx,
            cy: prev.target.cy,
            zoom: prev.target.zoom,
            target: undefined
          };
        }
        
        return {
          cx: newCx,
          cy: newCy,
          zoom: newZoom,
          target: prev.target
        };
      });
      
      cameraAnimationRef.current = requestAnimationFrame(animateCamera);
    };
    
    cameraAnimationRef.current = requestAnimationFrame(animateCamera);
    
    return () => {
      if (cameraAnimationRef.current) {
        cancelAnimationFrame(cameraAnimationRef.current);
      }
    };
  }, [internalCamera.target?.cx, internalCamera.target?.cy, internalCamera.target?.zoom]);

  // Legacy function kept for backward compatibility
  const scrollToFocusArea = useCallback((sunId: string, sunX: number, sunY: number) => {
    // Now just delegates to the camera zoom function
    zoomToSun(sunId);
  }, [zoomToSun]);

  // Update the click handler to use this unified function:
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) {
      logger.warn("[Starfield] Click handler called but canvas ref is null");
      return;
    }

    // Get click coordinates relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // First check if we clicked on a focus area sun BEFORE applying any repulsion
    // This ensures the sun position is checked before any physics are applied
    const sunHoverResult = checkSunHover(x, y, rect.width, rect.height);
    
    if (sunHoverResult) {
      // Clicked on a sun - zoom to focus on that area
      zoomToSun(sunHoverResult.sun.id);
      return;
    }

    // Only apply repulsion effects if we didn't click on a sun
    // Apply repulsive force to suns (this stacks up with multiple clicks)
    applyClickRepulsionToSunsCanvas(x, y, rect.width, rect.height);

    // Use the unified function for regular click repulsion
    applyStarfieldRepulsion(x, y);

    // Update mouse position state
    if (setMousePosition) {
      setMousePosition(prev => ({
        ...prev,
        x: x,
        y: y,
        isClicked: false,
        clickTime: Date.now()
      }));
    }
  }, [canvasRef, setMousePosition, applyStarfieldRepulsion, zoomToSun]);

  useEffect(() => {
    if (canvasRef.current) {

      // Add a direct DOM event listener as a backup
      const canvas = canvasRef.current;
      const clickHandler = (e: MouseEvent) => {

        // Get click coordinates relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // First check if we clicked on a focus area sun BEFORE applying any repulsion
        const sunHoverResult = checkSunHover(x, y, rect.width, rect.height);
        
        if (sunHoverResult) {
          // Clicked on a sun - zoom to focus on that area
          zoomToSun(sunHoverResult.sun.id);
          return;
        }

        // Only apply repulsion effects if we didn't click on a sun
        applyClickRepulsionToSunsCanvas(x, y, rect.width, rect.height);
        applyStarfieldRepulsion(x, y);
      };

      canvas.addEventListener("click", clickHandler);

      return () => {
        canvas.removeEventListener("click", clickHandler);
      };
    }
  }, [canvasRef, applyStarfieldRepulsion, zoomToSun]);

  return (
    <>
      {/* Background elements with positive z-index */}
      <div className={styles.starfieldWrapper} data-starfield>
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
          onTouchStart={(e) => {
            // Prevent default to avoid issues on touch
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            // Convert touch to click for mobile support
            if (e.changedTouches.length > 0) {
              const touch = e.changedTouches[0];
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;

                // First check if we touched a sun BEFORE applying any repulsion
                const sunHoverResult = checkSunHover(x, y, rect.width, rect.height);

                if (sunHoverResult) {
                  zoomToSun(sunHoverResult.sun.id);
                } else {
                  // Only apply repulsion if we didn't touch a sun
                  applyClickRepulsionToSunsCanvas(x, y, rect.width, rect.height);
                  applyStarfieldRepulsion(x, y);
                }
              }
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
        />
      )}

      {pinnedProject && (
        <ProjectTooltip
          project={pinnedProject}
          x={pinnedPosition.x}
          y={pinnedPosition.y}
          isPinned={true}
          isDarkMode={isDarkMode}
          onUnpin={handleUnpinProject}
        />
      )}

      {hoverInfo.show && hoverInfo.project && !pinnedProject && (
        <ProjectTooltip
          project={hoverInfo.project}
          x={hoverInfo.x}
          y={hoverInfo.y}
          isDarkMode={isDarkMode}
          onPin={handlePinProject}
        />
      )}

      {/* Sun tooltip when hovering over a focus area sun */}
      {hoveredSun && (
        <SunTooltip
          sun={hoveredSun}
          isDarkMode={isDarkMode}
          onClick={(sunId) => zoomToSun(sunId)}
          onMouseEnter={() => {
            // Clear any pending hide timeout when mouse enters tooltip
            if (sunHideTimeoutRef.current) {
              clearTimeout(sunHideTimeoutRef.current);
              sunHideTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            // Start hide timeout when mouse leaves tooltip
            sunHideTimeoutRef.current = setTimeout(() => {
              hoveredSunIdRef.current = null;
              setHoveredSunId(null);
              setHoveredSun(null);
            }, 200);
          }}
        />
      )}

      {/* Zoom out button when focused on a sun */}
      {focusedSunId && (
        <button
          className={`${styles.zoomOutButton} ${!isDarkMode ? styles.zoomOutButtonLight : ""}`}
          onClick={() => zoomToSun(focusedSunId)}
        >
          <span className={styles.zoomOutIcon}>←</span>
          Zoom Out
        </button>
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

export default InteractiveStarfield;
