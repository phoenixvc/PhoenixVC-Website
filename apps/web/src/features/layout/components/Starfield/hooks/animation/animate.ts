// components/Layout/Starfield/hooks/animation/animate.ts
import { SetStateAction } from "react";
import { drawBlackHole } from "../../blackHoles";
import { drawConnections, drawStars, updateStarActivity, updateStarPositions } from "../../stars";
import { drawStarBirthplaces } from "../../renderer";
import { logger } from "@/utils/logger";
import { updateFrameCache, getFrameTime } from "../../frameCache";
import {
  BlackHole,
  GameState,
  HoverInfo,
  MousePosition,
  Planet,
  Star
} from "../../types";
import { processParticleEffects } from "./processParticleEffects";
import { AnimationProps, AnimationRefs } from "./types";
// Import cosmic rendering functions
import { lerpCamera } from "../../cosmos/camera";
import { renderCosmicHierarchy } from "../../cosmos/renderCosmicHierarchy";
import { Camera, CosmicNavigationState } from "../../cosmos/types";
// Import cosmic hierarchy data
import { SUNS } from "../../cosmos/cosmicHierarchy";
import { checkPlanetHover, updatePlanets } from "../../Planets";
import { drawCosmicNavigation } from "./drawCosmicNavigation";
// Import sun system for dynamic sun positioning
import { getSunStates, initializeSunStates, updateSunPhysics, updateSunSizesFromPlanets } from "../../sunSystem";
// Import centralized utilities
import { lightenColor } from "../../colorUtils";
import { TWO_PI } from "../../math";
import {
  SUN_RENDERING_CONFIG,
  STAR_RENDERING_CONFIG,
  ANIMATION_TIMING_CONFIG,
  SUN_ICON_CONFIG,
  OPACITY_CONFIG
} from "../../renderingConfig";

// Cached default mouse position to avoid allocation every frame
let cachedDefaultMousePosition: MousePosition | null = null;

// Throttle state for elementFromPoint (expensive DOM operation)
let lastElementCheckFrame = 0;
let cachedIsOverContentCard = false;

export const animate = (timestamp: number, props: AnimationProps, refs: AnimationRefs): void => {
  try {
    // Update frame cache at the start of each frame
    updateFrameCache();

    if (props.debugSettings?.verboseLogs) {
      logger.debug("frame:", timestamp, "stars:", props.starsRef?.current.length ?? 0);
    }

    // If we"re in the middle of a restart, skip this frame
    if (refs.isRestartingRef.current) {
      logger.debug("Skipping animation frame during restart");
      refs.animationRef.current = window.requestAnimationFrame(
        (nextTimestamp) => animate(nextTimestamp, props, refs)
      );
      return;
    }

    // Update last frame time for watchdog (use cached frame time)
    refs.lastFrameTimeRef.current = getFrameTime();

    // Add a safety check for starsRef at the beginning of each frame
    if (!props.starsRef) {
      logger.error("Animation frame error: starsRef is undefined");
      if (refs.isAnimatingRef.current) {
        refs.animationRef.current = window.requestAnimationFrame(
          (nextTimestamp) => animate(nextTimestamp, props, refs)
        );
      }
      return;
    }

    const canvas = props.canvasRef.current;
    if (!canvas) {
      logger.error("Animation frame error: canvas is null");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      logger.error("Animation frame error: context is null");
      return;
    }

    // Frame rate limiter - if delta time is too large, it might indicate the tab was inactive
    if (!refs.lastTimeRef.current) refs.lastTimeRef.current = timestamp;

    // Calculate delta time with safety cap
    let deltaTime = timestamp - refs.lastTimeRef.current;

    // If deltaTime is extremely large (tab was inactive or browser paused),
    // cap it to prevent physics explosions
    if (deltaTime > 200) {
      logger.debug(`Large delta time detected: ${deltaTime}ms, capping to 16ms`);
      deltaTime = 16;
    }

    refs.lastTimeRef.current = timestamp;

    // Performance optimization: Draw connections every 2 frames for smoother appearance
    // Previously every 8 frames caused visible flickering on star connections
    refs.frameSkipRef.current = (refs.frameSkipRef.current + 1) % 2;
    const shouldSkipHeavyOperations = refs.frameSkipRef.current !== 0;

    // Increment frame counter
    if (props.frameCountRef) props.frameCountRef.current++;

    // Clear canvas with full dimensions
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current stars from ref - use direct reference to avoid copying array every frame
    // This significantly reduces GC pressure at 60fps
    const currentStars: Star[] = props.starsRef?.current ?? [];

    // Check if stars exist and are not empty
    if (currentStars.length === 0) {
      logger.error("No stars to draw! Will retry on next frame.");

      // Try to ensure stars exist before the next frame
      if (props.ensureStarsExist) {
        logger.debug("Calling ensureStarsExist from animation loop");
        props.ensureStarsExist();
      }

      // Continue animation loop but don"t try to draw anything
      if (refs.isAnimatingRef.current || refs.isRestartingRef.current) {
        refs.animationRef.current = window.requestAnimationFrame(
          (nextTimestamp) => animate(nextTimestamp, props, refs)
        );
      }
      return;
    }

    // Apply camera transformation to show the camera's view
    // This creates a smooth zoom and pan effect centered on the camera target
    // Use cameraRef for synchronous access (avoids stale state issues)
    // Fall back to props.camera for backward compatibility
    const cameraValues = props.cameraRef?.current ?? props.camera;
    if (cameraValues && cameraValues.zoom !== 1) {
      ctx.save();
      // Calculate the center point to zoom towards (in canvas coordinates)
      const cameraCenterX = cameraValues.cx * canvas.width;
      const cameraCenterY = cameraValues.cy * canvas.height;

      // Apply transformation to center the camera target in the viewport
      // 1. Translate to center of viewport
      // 2. Scale around origin (zoom)
      // 3. Translate so camera target becomes the origin
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(cameraValues.zoom, cameraValues.zoom);
      ctx.translate(-cameraCenterX, -cameraCenterY);
    }

    // Draw background stars with reduced opacity when focused on a sun
    // This makes the focused area more prominent
    if (props.focusedSunId) {
      ctx.save();
      ctx.globalAlpha = STAR_RENDERING_CONFIG.focusedBackgroundAlpha;
      drawStars(ctx, currentStars);
      ctx.restore();
    } else {
      // Always draw stars first - this ensures they always appear
      drawStars(ctx, currentStars);
    }
    
    // Draw star birthplace indicators at the edges where stars respawn
    // Hide these when focused on a sun for cleaner view
    if (!props.focusedSunId) {
      drawStarBirthplaces(ctx, canvas.width, canvas.height);
    }

    // Get planets for sun size calculation - use direct reference to avoid GC pressure
    const currentPlanets: Planet[] = props.planetsRef?.current ?? [];

    // Draw suns (focus area orbital centers) - always visible
    // Pass hovered sun id, focused sun id for interactive effects, deltaTime for physics, and planets for size calculation
    drawSuns(ctx, canvas.width, canvas.height, timestamp, props.isDarkMode, props.hoveredSunId, deltaTime, props.focusedSunId, currentPlanets);

    // Get current values from refs - use direct reference to avoid GC pressure
    const currentBlackHoles: BlackHole[] = props.blackHolesRef?.current ?? [];

    // Use refs directly to avoid object allocation every frame
    // Create cached default only once (lazily initialized)
    if (!cachedDefaultMousePosition) {
      cachedDefaultMousePosition = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        lastX: canvas.width / 2,
        lastY: canvas.height / 2,
        speedX: 0,
        speedY: 0,
        isClicked: false,
        clickTime: 0,
        isOnScreen: true
      };
    }
    const currentMousePosition: MousePosition = refs.mousePositionRef.current ?? cachedDefaultMousePosition;

    // Use refs directly - these are read-only in animation loop
    const currentHoverInfo: HoverInfo = refs.hoverInfoRef.current;
    const currentGameState: GameState = refs.gameStateRef.current;

    // Get cosmic navigation state and camera - use cameraRef for synchronous access
    const currentCamera: Camera | undefined = props.cameraRef?.current as Camera | undefined;
    const currentNavigationState: CosmicNavigationState | undefined = props.navigationState;
    const currentHoveredObjectId: string | null = props.hoveredObjectId || null;

    // NEW: Apply camera lerp if camera is available
    if (
      props.enableCosmicNavigation &&
      currentCamera?.target &&              // ← must have a target to lerp to
      props.setCamera
    ) {
      const updatedCamera = lerpCamera(currentCamera, 0.08);
      if (updatedCamera !== currentCamera) {
        props.setCamera(updatedCamera);
      }
    }

    // Check if mouse is actually over the canvas vs over a content card
    // Throttle this expensive DOM operation to every N frames
    const currentFrameCount = props.frameCountRef?.current ?? 0;
    let isOverContentCard = cachedIsOverContentCard;

    if (currentFrameCount - lastElementCheckFrame >= ANIMATION_TIMING_CONFIG.elementFromPointCheckInterval) {
      lastElementCheckFrame = currentFrameCount;
      isOverContentCard = false;

      if (typeof document !== "undefined" && currentMousePosition.isOnScreen) {
        const elementAtMouse = document.elementFromPoint(
          currentMousePosition.x,
          currentMousePosition.y
        );
        if (elementAtMouse) {
          // Check if the element is the canvas or inside the starfield container
          const isCanvas = elementAtMouse.tagName === "CANVAS";
          const isInsideStarfield = elementAtMouse.closest("[data-starfield]") !== null;
          // Check if the element is inside the hero section (which should allow tooltips)
          const isInsideHeroSection = elementAtMouse.closest("section[aria-label=\"hero section\"]") !== null;
          // Check if hovering over header/navigation (should allow tooltips since they're transparent)
          const isInsideHeader = elementAtMouse.closest("header") !== null;
          // Check if hovering over sidebar (should allow tooltips)
          const isInsideSidebar = elementAtMouse.closest("aside, [role=\"complementary\"]") !== null;

          // Only consider it as "over content card" if it's NOT any of the allowed elements
          isOverContentCard = !isCanvas && !isInsideStarfield && !isInsideHeroSection && !isInsideHeader && !isInsideSidebar;
        }
      }
      cachedIsOverContentCard = isOverContentCard;
    }

    if (props.enablePlanets && props.enableMouseInteraction) {
      // Create a wrapper function that matches the expected type
      const updateHoverInfoIfChanged = (newInfo: SetStateAction<HoverInfo>): void => {
        // If newInfo is a function, we can"t directly compare it
        if (typeof newInfo === "function") {
          props.setHoverInfo(newInfo);
          return;
        }

        // Don't hide the tooltip if mouse is currently over it (allows clicking links)
        if (!newInfo.show && props.isMouseOverProjectTooltipRef?.current) {
          return;
        }

        // Only update state if it changed significantly
        if (
          newInfo.show !== currentHoverInfo.show ||
          (newInfo.project && currentHoverInfo.project &&
            newInfo.project.id !== currentHoverInfo.project.id) ||
          (!newInfo.project && currentHoverInfo.project) ||
          (newInfo.project && !currentHoverInfo.project)
        ) {
          props.setHoverInfo(newInfo);
        }
      };

      // If over a content card, hide any active tooltip; otherwise check for planet hover
      if (isOverContentCard) {
        // Clear hover info if currently showing (but not if mouse is over tooltip)
        if (currentHoverInfo.show && !props.isMouseOverProjectTooltipRef?.current) {
          props.setHoverInfo({ project: null, x: 0, y: 0, show: false });
        }
      } else {
        checkPlanetHover(
          currentMousePosition.x,
          currentMousePosition.y,
          currentPlanets,
          props.planetSize,
          currentHoverInfo,
          updateHoverInfoIfChanged
        );
      }
    }

    // Draw connections between stars (network effect) - only if not skipping heavy operations
    if (!shouldSkipHeavyOperations) {
      drawConnections(
        ctx,
        currentStars,
        props.lineConnectionDistance,
        props.lineOpacity,
        props.colorScheme
      );
    }

    // Update star positions with proper null handling for centerPosition
    updateStarPositions(
      currentStars,
      canvas.width,
      canvas.height,
      deltaTime,
      props.enableFlowEffect,
      props.flowStrength,
      currentMousePosition,
      props.enableMouseInteraction,
      currentBlackHoles,
      props.gravitationalPull,
      props.heroMode,
      props.centerPosition || { x: canvas.width / 2, y: canvas.height / 2 }, // Provide default if undefined
      props.mouseEffectRadius,
      props.maxVelocity,
      props.animationSpeed
    );

    // Note: handleBoundaries removed - updateStarPositions already handles wrapping
    // Adding it here caused double-wrapping and potential oscillation at edges

    // Draw black holes if enabled (hide when focused on a sun for cleaner view)
    if (props.enableBlackHole && !props.focusedSunId) {
      currentBlackHoles.forEach((blackHole: BlackHole) => {
        drawBlackHole(ctx, blackHole, deltaTime, props.particleSpeed * 0.01);
      });
    }

    // Draw portfolio comets/planets
    // Filter planets if a sun is focused (show only planets orbiting that sun)
    const planetsToRender = props.focusedSunId 
      ? currentPlanets.filter(planet => planet.orbitParentId === props.focusedSunId)
      : currentPlanets;
    
    updatePlanets(
      ctx,
      planetsToRender,
      deltaTime,
      props.planetSize,
      props.employeeDisplayStyle,
      currentCamera // Pass the camera (may be undefined if cosmic navigation is disabled)
    );

    // Draw mouse effects
    drawMouseEffects(ctx, currentMousePosition, props, deltaTime);

    // Draw cosmic navigation if enabled
    if (props.enableCosmicNavigation && props.navigationState && props.camera) {
      drawCosmicNavigation(
        ctx,
        canvas.width,
        canvas.height,
        props.navigationState,
        props.camera,
        timestamp,
        props.hoveredObjectId || null,
        props.isDarkMode
      );
    }

    // NEW: Draw cosmic objects if navigation is enabled
    if (
      props.enableCosmicNavigation &&
      currentCamera?.target &&              // ← must have a target to lerp to
      currentNavigationState
    ) {
      // Draw cosmic objects at 30fps for performance
      if (props.frameCountRef && props.frameCountRef.current % 2 === 0) {
        renderCosmicHierarchy(
          ctx,
          canvas.width,
          canvas.height,
          currentNavigationState,
          currentCamera,
          timestamp * (props.animationSpeed || 1),
          currentHoveredObjectId,
          props.starSize || 1,
          props.isDarkMode || true
        );

        // Debug logging removed for performance
      }
    }

    // Process particles and effects
    processParticleEffects(ctx, timestamp, deltaTime, props, refs, currentStars, currentPlanets, currentGameState, shouldSkipHeavyOperations);

    // Draw debug information if debug mode is enabled
    if (props.debugMode && !shouldSkipHeavyOperations) {
        // Calculate FPS for debug info - throttle to every 10 frames
        const frameCount = props.frameCountRef?.current ?? 0;
        if (frameCount % 10 === 0) {
          const fps = deltaTime > 0 ? 1000 / deltaTime : 0;

          // Make sure fpsValues exists
          if (!refs.fpsValues || !refs.fpsValues.current) {
            refs.fpsValues = { current: [] };
          }

          refs.fpsValues.current.push(fps);
          if (refs.fpsValues.current.length > 60) {
            refs.fpsValues.current.shift();
          }

          // Calculate average FPS over the last 60 frames
          const avgFps = refs.fpsValues.current.reduce((sum, val) => sum + val, 0) /
            refs.fpsValues.current.length;

          // Call the update function if provided
          if (props.updateFpsData) {
            props.updateFpsData(avgFps, timestamp);
          }
        }

        // Draw velocity vectors for stars (sample of stars to improve performance)
        const sampleStars = currentStars.filter((_, i) => i % 20 === 0); // Only show 5% of stars
        sampleStars.forEach(star => {
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x + star.vx * 10, star.y + star.vy * 10);
          ctx.strokeStyle = "red";
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Draw mouse effect radius with a more visible outline
        if (currentMousePosition.isOnScreen) {
          ctx.beginPath();
          ctx.arc(currentMousePosition.x, currentMousePosition.y, props.mouseEffectRadius, 0, TWO_PI);
          ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // NEW: Draw camera info if cosmic navigation is enabled
        if (props.enableCosmicNavigation && currentCamera) {
          ctx.font = "12px Arial";
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillText(`Camera: x=${currentCamera.cx.toFixed(2)}, y=${currentCamera.cy.toFixed(2)}, zoom=${currentCamera.zoom.toFixed(2)}`, 10, canvas.height - 60);
          ctx.fillText(`Navigation: ${currentNavigationState?.currentLevel || "universe"}`, 10, canvas.height - 40);
        }
      }

      updateStarActivity(currentStars);

    // Restore canvas context if camera transformation was applied
    // Must match the save condition: cameraValues && cameraValues.zoom !== 1
    const cameraForRestore = props.cameraRef?.current ?? props.camera;
    if (cameraForRestore && cameraForRestore.zoom !== 1) {
      ctx.restore();
    }

    // Update star positions in the ref - consolidate this to one place
    if (props.starsRef && props.starsRef.current && props.starsRef.current.length > 0) {
      try {
        // Only update positions, don"t replace the entire array
        // Use a safer approach with bounds checking
        const minLength = Math.min(currentStars.length, props.starsRef.current.length);
        for (let i = 0; i < minLength; i++) {
          props.starsRef.current[i].x = currentStars[i].x;
          props.starsRef.current[i].y = currentStars[i].y;
          props.starsRef.current[i].vx = currentStars[i].vx;
          props.starsRef.current[i].vy = currentStars[i].vy;
        }
      } catch (err) {
        logger.error("Error updating star positions:", err);
      }
    }

    // Continue the animation loop if still animating or restarting
    if (refs.isAnimatingRef.current || refs.isRestartingRef.current) {
      refs.animationRef.current = window.requestAnimationFrame(
        (nextTimestamp) => animate(nextTimestamp, props, refs)
      );
    } else {
      logger.debug("Animation stopped because isAnimatingRef.current is false and not restarting");
    }
  } catch (error) {
    logger.error("Error in animation loop:", error);

    // Log detailed error info
    logger.error("Animation state:", {
      isAnimating: refs.isAnimatingRef.current,
      isRestarting: refs.isRestartingRef.current,
      starsCount: props.starsRef?.current?.length || 0,
      canvasExists: !!props.canvasRef.current,
      timestamp
    });

    // Try to recover by continuing the animation
    if (refs.isAnimatingRef.current || refs.isRestartingRef.current) {
      logger.debug("Attempting to recover from animation error");
      setTimeout(() => {
        refs.animationRef.current = window.requestAnimationFrame(
          (nextTimestamp) => animate(nextTimestamp, props, refs)
        );
      }, 100);
    }
  }
};

function drawMouseEffects(
    ctx: CanvasRenderingContext2D,
    currentMousePosition: MousePosition,
    props: AnimationProps,
    deltaTime: number
  ): void {
    // Default to canvas center if mouse position is undefined.
    const mouseX = currentMousePosition.x || ctx.canvas.width / 2;
    const mouseY = currentMousePosition.y || ctx.canvas.height / 2;

    // Base color for the glow: less opaque in light mode.
    const baseColor = props.isDarkMode
      ? "rgba(138,43,226,0.5)"
      : "rgba(75,0,130,0.3)";

    // Use transparent black for dark mode, but transparent white for light mode.
    const endColor = props.isDarkMode ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)";

    // Set up the radial gradient for the mouse glow.
    const gradient = ctx.createRadialGradient(
      mouseX,
      mouseY,
      0,
      mouseX,
      mouseY,
      props.mouseEffectRadius
    );
    gradient.addColorStop(
      0,
      currentMousePosition.isClicked
        ? (props.isDarkMode ? "rgba(138,43,226,0.7)" : "rgba(75,0,130,0.6)")
        : baseColor
    );
    gradient.addColorStop(1, endColor);

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, props.mouseEffectRadius, 0, TWO_PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Determine time since click to drive ripple effects.
    // Use a large value (2000ms+) if no click has occurred to prevent effects on load
    const timeSinceClick = currentMousePosition.clickTime > 0
      ? Date.now() - currentMousePosition.clickTime
      : 2000; // No click yet - beyond all effect thresholds

    // Draw three layered ripple effects.
    for (let i = 0; i < 3; i++) {
      const speed = 0.8 + i * 0.4;
      const delay = i * 100;
      if (timeSinceClick > delay) {
        const adjustedTime = timeSinceClick - delay;
        const maxRadius = props.mouseEffectRadius * 2.5;
        const rippleRadius = Math.min(
          maxRadius,
          props.mouseEffectRadius * (adjustedTime / 1600) * speed
        );
        const rippleOpacity = 1 - adjustedTime / 1000;

        let rippleColor;
        if (i === 0) {
          rippleColor = props.isDarkMode
            ? `rgba(138,43,226,${rippleOpacity * 0.95})`
            : `rgba(75,0,130,${rippleOpacity * 0.6})`;
        } else if (i === 1) {
          rippleColor = props.isDarkMode
            ? `rgba(180,100,255,${rippleOpacity * 0.85})`
            : `rgba(100,0,200,${rippleOpacity * 0.5})`;
        } else {
          rippleColor = props.isDarkMode
            ? `rgba(255,255,255,${rippleOpacity * 0.75})`
            : `rgba(50,50,50,${rippleOpacity * 0.4})`;
        }

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, rippleRadius, 0, TWO_PI);
        ctx.strokeStyle = rippleColor;
        ctx.lineWidth = 6 - i;
        ctx.stroke();
      }
    }

    // Toned-down flash effect on click.
    if (timeSinceClick < 300) {
      const flashOpacity = 1 - timeSinceClick / 300;
      const flashRadius = 15; // Subtle flash radius.
      const flashColor = props.isDarkMode
        ? `rgba(255,255,255,${flashOpacity * 0.5})`
        : `rgba(0,0,0,${flashOpacity * 0.5})`;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, flashRadius, 0, TWO_PI);
      ctx.fillStyle = flashColor;
      ctx.fill();
    }
  }

// Track if sun system is initialized
let sunSystemInitialized = false;
let sunSizesCalculated = false;

/**
 * Reset animation module state - call this when unmounting the starfield component
 * to prevent memory leaks and stale state on remount
 */
export function resetAnimationModuleState(): void {
  sunSystemInitialized = false;
  sunSizesCalculated = false;
}

// Get the focus area suns for external use
export function getFocusAreaSuns(): typeof SUNS {
  return SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");
}

// Check if mouse is hovering over a sun - returns only the CLOSEST sun
// Uses dynamic sun positions from the sun system
export function checkSunHover(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number
): { sun: typeof SUNS[0]; index: number; x: number; y: number } | null {
  const sunStates = getSunStates();
  
  // Initialize if needed
  if (sunStates.length === 0) {
    initializeSunStates();
    return null;
  }
  
  let closestSun: { sun: typeof SUNS[0]; index: number; x: number; y: number; distance: number } | null = null;
  const focusAreaSuns = SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");
  
  for (let i = 0; i < sunStates.length; i++) {
    const sunState = sunStates[i];
    const x = sunState.x * width;
    const y = sunState.y * height;
    const baseSize = Math.max(20, Math.min(width, height) * sunState.size * 0.6);
    // Increase hit area for better clickability
    const hitRadius = baseSize * 3;
    
    const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
    if (distance <= hitRadius) {
      // Find matching sun from SUNS array
      const matchingSun = focusAreaSuns.find(s => s.id === sunState.id);
      if (matchingSun) {
        // Only keep the closest sun
        if (!closestSun || distance < closestSun.distance) {
          closestSun = { sun: matchingSun, index: i, x, y, distance };
        }
      }
    }
  }
  
  // Return without the distance property
  if (closestSun) {
    return { sun: closestSun.sun, index: closestSun.index, x: closestSun.x, y: closestSun.y };
  }
  return null;
}

// Get current sun positions for external use (e.g., orbit centers)
export function getCurrentSunPositions(width: number, height: number): Map<string, { x: number; y: number }> {
  const sunStates = getSunStates();
  const positions = new Map<string, { x: number; y: number }>();
  
  for (const sun of sunStates) {
    positions.set(sun.id, { x: sun.x * width, y: sun.y * height });
  }
  
  return positions;
}


/**
 * Draw suns (focus area orbital centers) on the canvas
 * Enhanced graphics with multiple layers, corona effects, and realistic appearance
 */
function drawSuns(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isDarkMode: boolean,
  hoveredSunId?: string | null,
  deltaTime: number = 16,
  focusedSunId?: string | null,
  planets?: Planet[]
): void {
  // Use centralized config constants
  const { sizeMultiplier, minSize, particles, ejectParticles, pulse, layers, flares, rays, propelRings, granulation, hoverRing } = SUN_RENDERING_CONFIG;
  
  // Initialize sun system if needed
  if (!sunSystemInitialized) {
    initializeSunStates();
    sunSystemInitialized = true;
  }

  // Calculate sun sizes based on planet masses (only once)
  if (!sunSizesCalculated && planets && planets.length > 0) {
    updateSunSizesFromPlanets(planets);
    sunSizesCalculated = true;
  }

  // Update sun physics
  updateSunPhysics(deltaTime);

  const sunStates = getSunStates();
  
  ctx.save();
  
  // Enable smooth rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  sunStates.forEach((sunState) => {
    // If a sun is focused, only render that sun (hide others for cleaner zoom view)
    if (focusedSunId && focusedSunId !== sunState.id) {
      return; // Skip rendering this sun
    }
    
    // Use dynamic position from sun system
    const x = sunState.x * width;
    const y = sunState.y * height;
    // Slightly reduced sun size for better proportion
    const baseSize = Math.max(minSize, Math.min(width, height) * sunState.size * sizeMultiplier);
    
    // Check if this sun is hovered or focused
    const isHovered = hoveredSunId === sunState.id;
    const isFocused = focusedSunId === sunState.id;
    const isHighlighted = isHovered || isFocused;
    
    // Check if sun is in propel mode (avoiding collision)
    const isPropelling = sunState.isPropelling;
    
    // Smoother multi-layered pulsating effect
    const pulseSpeed1 = isHighlighted ? pulse.speed1.highlighted : pulse.speed1.normal;
    const pulseSpeed2 = isHighlighted ? pulse.speed2.highlighted : pulse.speed2.normal;
    const pulseSpeed3 = isHighlighted ? pulse.speed3.highlighted : pulse.speed3.normal;
    const pulseAmount = isHighlighted ? pulse.amount.highlighted : (isPropelling ? pulse.amount.propelling : pulse.amount.normal);
    const pulse1 = 1 + pulseAmount * Math.sin(time * pulseSpeed1);
    const pulse2 = 1 + (pulseAmount * 0.6) * Math.sin(time * pulseSpeed2 + Math.PI / 3);
    const pulse3 = 1 + (pulseAmount * 0.4) * Math.sin(time * pulseSpeed3 + Math.PI / 1.5);
    const pulseValue = (pulse1 + pulse2 + pulse3) / 3;
    const size = baseSize * pulseValue * (isHighlighted ? pulse.highlightScale : 1);
    
    // Use pre-computed RGB values from SunState to avoid parsing hex every frame
    const rgbStr = sunState.colorRgbStr;
    // For secondary color, use a slightly shifted version of the primary (cheaper than full HSL conversion)
    const rgb = sunState.colorRgb;
    const secondaryRgbStr = `${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 20)}, ${rgb.b}`;
    
    // ===== LAYER 0: Outer halo (very soft, large) =====
    const haloSize = size * (isHighlighted ? layers.haloSize.highlighted : layers.haloSize.normal);
    const haloGradient = ctx.createRadialGradient(x, y, size * 0.3, x, y, haloSize);
    haloGradient.addColorStop(0, `rgba(${rgbStr}, ${isHighlighted ? 0.15 : 0.08})`);
    haloGradient.addColorStop(0.3, `rgba(${rgbStr}, ${isHighlighted ? 0.08 : 0.04})`);
    haloGradient.addColorStop(0.6, `rgba(${rgbStr}, ${isHighlighted ? 0.03 : 0.015})`);
    haloGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    
    ctx.beginPath();
    ctx.fillStyle = haloGradient;
    ctx.globalAlpha = isDarkMode ? 1 : 0.8;
    ctx.arc(x, y, haloSize, 0, TWO_PI);
    ctx.fill();
    
    // ===== LAYER 1: Outer atmospheric glow with color gradient =====
    const atmosphereSize = size * (isHighlighted ? layers.atmosphereSize.highlighted : layers.atmosphereSize.normal);
    const atmosphereGradient = ctx.createRadialGradient(x, y, size * 0.4, x, y, atmosphereSize);
    atmosphereGradient.addColorStop(0, `rgba(${rgbStr}, ${isHighlighted ? 0.5 : 0.35})`);
    atmosphereGradient.addColorStop(0.2, `rgba(${rgbStr}, ${isHighlighted ? 0.3 : 0.2})`);
    atmosphereGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, ${isHighlighted ? 0.12 : 0.08})`);
    atmosphereGradient.addColorStop(0.8, `rgba(${rgbStr}, ${isHighlighted ? 0.05 : 0.03})`);
    atmosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    
    ctx.beginPath();
    ctx.fillStyle = atmosphereGradient;
    ctx.globalAlpha = isDarkMode ? 1 : 0.75;
    ctx.arc(x, y, atmosphereSize, 0, TWO_PI);
    ctx.fill();
    
    // ===== LAYER 2: Dynamic solar flares (curved, organic) =====
    const flareCount = isHighlighted ? flares.count.highlighted : flares.count.normal;
    ctx.globalAlpha = isDarkMode
      ? (isHighlighted ? OPACITY_CONFIG.sun.flares.dark.highlighted : OPACITY_CONFIG.sun.flares.dark.normal)
      : (isHighlighted ? OPACITY_CONFIG.sun.flares.light.highlighted : OPACITY_CONFIG.sun.flares.light.normal);
    
    for (let i = 0; i < flareCount; i++) {
      const baseAngle = (i * TWO_PI / flareCount) + sunState.rotationAngle * 0.5;
      const waveOffset = Math.sin(time * flares.waveSpeed + i * 0.7) * 0.15;
      const angle = baseAngle + waveOffset;

      // Vary flare lengths with smooth animation
      const flarePhase = Math.sin(time * flares.phaseSpeed + i * 1.5);
      const flareLength = size * (isHighlighted ? flares.lengthMultiplier.highlighted : flares.lengthMultiplier.normal) * (0.7 + 0.3 * flarePhase);
      
      // Draw curved flare using bezier curve
      const startDist = size * 0.85;
      const startX = x + Math.cos(angle) * startDist;
      const startY = y + Math.sin(angle) * startDist;
      const endX = x + Math.cos(angle) * flareLength;
      const endY = y + Math.sin(angle) * flareLength;
      
      // Control point for curve
      const curveFactor = Math.sin(time * flares.curveFactor + i) * size * 0.5;
      const perpAngle = angle + Math.PI / 2;
      const cpX = (startX + endX) / 2 + Math.cos(perpAngle) * curveFactor;
      const cpY = (startY + endY) / 2 + Math.sin(perpAngle) * curveFactor;
      
      // Create gradient for flare
      const flareGradient = ctx.createLinearGradient(startX, startY, endX, endY);
      flareGradient.addColorStop(0, lightenColor(sunState.color, 0.6));
      flareGradient.addColorStop(0.3, `rgba(${rgbStr}, 0.6)`);
      flareGradient.addColorStop(0.6, `rgba(${secondaryRgbStr}, 0.3)`);
      flareGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.strokeStyle = flareGradient;
      ctx.lineWidth = size * (isHighlighted ? flares.lineWidthMultiplier.highlighted : flares.lineWidthMultiplier.normal) * (1 + 0.3 * flarePhase);
      ctx.lineCap = "round";
      ctx.stroke();
    }
    
    // ===== LAYER 3: Corona rays (refined, smoother) =====
    const rayCount = isHighlighted ? rays.count.highlighted : rays.count.normal;
    ctx.globalAlpha = isDarkMode
      ? (isHighlighted ? OPACITY_CONFIG.sun.rays.dark.highlighted : OPACITY_CONFIG.sun.rays.dark.normal)
      : (isHighlighted ? OPACITY_CONFIG.sun.rays.light.highlighted : OPACITY_CONFIG.sun.rays.light.normal);
    
    for (let i = 0; i < rayCount; i++) {
      const baseAngle = (i * TWO_PI / rayCount) + sunState.rotationAngle;
      const waveOffset = Math.sin(time * rays.waveSpeed + i * 0.4) * 0.08;
      const angle = baseAngle + waveOffset;

      const rayLengthVariation = 0.75 + 0.25 * Math.sin(time * 0.00018 + i * 1.1);
      const rayLength = size * (isHighlighted ? rays.lengthMultiplier.highlighted : rays.lengthMultiplier.normal) * rayLengthVariation;

      const endX = x + Math.cos(angle) * rayLength;
      const endY = y + Math.sin(angle) * rayLength;

      ctx.beginPath();
      const rayWidth = size * (isHighlighted ? rays.widthMultiplier.highlighted : rays.widthMultiplier.normal);
      const perpAngle = angle + Math.PI / 2;
      
      const startDist = size * 0.75;
      const startX = x + Math.cos(angle) * startDist;
      const startY = y + Math.sin(angle) * startDist;
      
      ctx.moveTo(
        startX + Math.cos(perpAngle) * rayWidth,
        startY + Math.sin(perpAngle) * rayWidth
      );
      ctx.lineTo(endX, endY);
      ctx.lineTo(
        startX - Math.cos(perpAngle) * rayWidth,
        startY - Math.sin(perpAngle) * rayWidth
      );
      ctx.closePath();
      
      const rayGradient = ctx.createLinearGradient(startX, startY, endX, endY);
      rayGradient.addColorStop(0, `rgba(${rgbStr}, 0.9)`);
      rayGradient.addColorStop(0.4, `rgba(${rgbStr}, 0.4)`);
      rayGradient.addColorStop(0.7, `rgba(${secondaryRgbStr}, 0.15)`);
      rayGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      
      ctx.fillStyle = rayGradient;
      ctx.fill();
    }
    
    // ===== LAYER 4: Chromosphere ring =====
    ctx.globalAlpha = isDarkMode ? OPACITY_CONFIG.sun.chromosphere.dark : OPACITY_CONFIG.sun.chromosphere.light;
    const chromosphereGradient = ctx.createRadialGradient(x, y, size * 0.95, x, y, size * layers.chromosphereRadius);
    chromosphereGradient.addColorStop(0, `rgba(${rgbStr}, 0.8)`);
    chromosphereGradient.addColorStop(0.3, `rgba(${secondaryRgbStr}, 0.5)`);
    chromosphereGradient.addColorStop(0.6, `rgba(${rgbStr}, 0.3)`);
    chromosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    
    ctx.beginPath();
    ctx.fillStyle = chromosphereGradient;
    ctx.arc(x, y, size * layers.chromosphereRadius, 0, TWO_PI);
    ctx.fill();
    
    // ===== LAYER 5: Propel/collision effect rings =====
    if (isPropelling) {
      for (let r = 0; r < propelRings.count; r++) {
        const ringRadius = size * (propelRings.baseRadius + r * propelRings.radiusStep);
        const ringAlpha = 0.5 - r * 0.09;
        const ringPhase = Math.sin(time * propelRings.animationSpeed + r * Math.PI / 2.5);

        ctx.beginPath();
        const ringGradient = ctx.createRadialGradient(x, y, ringRadius - 2, x, y, ringRadius + 2);
        ringGradient.addColorStop(0, `rgba(${rgbStr}, 0)`);
        ringGradient.addColorStop(0.5, sunState.color);
        ringGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
        ctx.strokeStyle = ringGradient;
        ctx.lineWidth = propelRings.lineWidthBase - r * propelRings.lineWidthDecrement;
        ctx.globalAlpha = ringAlpha * (0.5 + 0.5 * ringPhase);
        ctx.arc(x, y, ringRadius, 0, TWO_PI);
        ctx.stroke();
      }
    }
    
    // ===== LAYER 5.5: Solar particles (orbiting plasma dots) =====
    const particleCount = isHighlighted ? particles.count.highlighted : particles.count.normal;
    ctx.globalAlpha = isDarkMode
      ? (isHighlighted ? OPACITY_CONFIG.sun.particles.dark.highlighted : OPACITY_CONFIG.sun.particles.dark.normal)
      : (isHighlighted ? OPACITY_CONFIG.sun.particles.light.highlighted : OPACITY_CONFIG.sun.particles.light.normal);

    for (let i = 0; i < particleCount; i++) {
      // Create particles orbiting at different distances and speeds
      const orbitRadius = size * (particles.orbitBaseRadius + (i % 4) * particles.orbitRadiusStep); // Multiple orbit rings
      const orbitSpeed = particles.orbitSpeedBase + (i % 3) * particles.orbitSpeedVariation; // Varying speeds
      const particleAngle = (i * TWO_PI / particleCount) + time * orbitSpeed + sunState.rotationAngle * 0.3;

      // Add slight wobble to particle path
      const wobble = Math.sin(time * particles.wobbleSpeed + i * 1.7) * size * particles.wobbleAmount;
      const particleX = x + Math.cos(particleAngle) * (orbitRadius + wobble);
      const particleY = y + Math.sin(particleAngle) * (orbitRadius + wobble);

      // Particle size varies with pulsing
      const particlePulse = 0.7 + 0.3 * Math.sin(time * particles.pulseSpeed + i * 2.1);
      const particleSize = (size * 0.04 + (i % 3) * size * 0.015) * particlePulse;
      
      // Create glowing particle
      const particleGradient = ctx.createRadialGradient(
        particleX, particleY, 0,
        particleX, particleY, particleSize * 2.5
      );
      
      // Alternate between sun color and lighter particles
      if (i % 3 === 0) {
        particleGradient.addColorStop(0, "#ffffff");
        particleGradient.addColorStop(0.3, lightenColor(sunState.color, 0.7));
        particleGradient.addColorStop(0.6, `rgba(${rgbStr}, 0.5)`);
        particleGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      } else if (i % 3 === 1) {
        particleGradient.addColorStop(0, lightenColor(sunState.color, 0.8));
        particleGradient.addColorStop(0.4, `rgba(${rgbStr}, 0.7)`);
        particleGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      } else {
        particleGradient.addColorStop(0, `rgba(${secondaryRgbStr}, 0.9)`);
        particleGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, 0.4)`);
        particleGradient.addColorStop(1, `rgba(${secondaryRgbStr}, 0)`);
      }
      
      ctx.beginPath();
      ctx.fillStyle = particleGradient;
      ctx.arc(particleX, particleY, particleSize * 2.5, 0, TWO_PI);
      ctx.fill();
      
      // Add a bright core to larger particles
      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = (isDarkMode ? 0.9 : 0.7) * particlePulse;
        ctx.arc(particleX, particleY, particleSize * 0.5, 0, TWO_PI);
        ctx.fill();
        ctx.globalAlpha = isDarkMode
          ? (isHighlighted ? OPACITY_CONFIG.sun.particles.dark.highlighted : OPACITY_CONFIG.sun.particles.dark.normal)
          : (isHighlighted ? OPACITY_CONFIG.sun.particles.light.highlighted : OPACITY_CONFIG.sun.particles.light.normal);
      }
    }

    // ===== LAYER 5.6: Ejected particles (escaping plasma) =====
    const ejectCount = isHighlighted ? ejectParticles.count.highlighted : ejectParticles.count.normal;
    for (let i = 0; i < ejectCount; i++) {
      // Particles that appear to be ejected outward
      const ejectAngle = (i * TWO_PI / ejectCount) + time * ejectParticles.speed + sunState.rotationAngle;
      const ejectPhase = (time * 0.0002 + i * 1.5) % 1; // 0-1 cycle
      const ejectDist = size * (ejectParticles.distanceRange.min + ejectPhase * (ejectParticles.distanceRange.max - ejectParticles.distanceRange.min)); // Move outward
      const ejectX = x + Math.cos(ejectAngle) * ejectDist;
      const ejectY = y + Math.sin(ejectAngle) * ejectDist;
      
      // Fade out as particle moves away
      const ejectAlpha = Math.max(0, 1 - ejectPhase) * (isDarkMode ? 0.6 : 0.4);
      const ejectSize = size * 0.06 * (1 - ejectPhase * 0.5);
      
      if (ejectAlpha > 0.05) {
        const ejectGradient = ctx.createRadialGradient(
          ejectX, ejectY, 0,
          ejectX, ejectY, ejectSize * 3
        );
        ejectGradient.addColorStop(0, lightenColor(sunState.color, 0.6));
        ejectGradient.addColorStop(0.4, `rgba(${rgbStr}, ${ejectAlpha})`);
        ejectGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
        
        ctx.beginPath();
        ctx.fillStyle = ejectGradient;
        ctx.globalAlpha = ejectAlpha;
        ctx.arc(ejectX, ejectY, ejectSize * 3, 0, TWO_PI);
        ctx.fill();
      }
    }
    
    // ===== LAYER 6: Hover/focus ring indicator =====
    if (isHighlighted) {
      // Outer animated ring
      const dashOffset = time * hoverRing.dashSpeed;
      ctx.setLineDash(hoverRing.dashPattern as unknown as number[]);
      ctx.lineDashOffset = dashOffset;
      ctx.beginPath();
      ctx.strokeStyle = lightenColor(sunState.color, 0.4);
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.6 + 0.25 * Math.sin(time * hoverRing.pulseSpeed);
      ctx.arc(x, y, size * layers.hoverRingRadius, 0, TWO_PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner solid pulsing ring
      ctx.beginPath();
      const innerRingGradient = ctx.createRadialGradient(x, y, size * 1.9, x, y, size * 2.1);
      innerRingGradient.addColorStop(0, `rgba(${rgbStr}, 0)`);
      innerRingGradient.addColorStop(0.5, lightenColor(sunState.color, 0.5));
      innerRingGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      ctx.strokeStyle = innerRingGradient;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.75 + 0.2 * Math.sin(time * hoverRing.innerPulseSpeed);
      ctx.arc(x, y, size * layers.innerRingRadius, 0, TWO_PI);
      ctx.stroke();
    }
    
    // ===== LAYER 7: Main photosphere (outer glow of core) =====
    const photosphereGradient = ctx.createRadialGradient(x, y, size * 0.25, x, y, size * layers.photosphereRadius);
    photosphereGradient.addColorStop(0, lightenColor(sunState.color, 0.85));
    photosphereGradient.addColorStop(0.3, lightenColor(sunState.color, 0.5));
    photosphereGradient.addColorStop(0.5, sunState.color);
    photosphereGradient.addColorStop(0.75, `rgba(${rgbStr}, 0.85)`);
    photosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0.4)`);

    ctx.beginPath();
    ctx.fillStyle = photosphereGradient;
    ctx.globalAlpha = isDarkMode ? 1 : 0.9;
    ctx.arc(x, y, size * layers.photosphereRadius, 0, TWO_PI);
    ctx.fill();
    
    // ===== LAYER 8: Main sun body with 3D depth =====
    const bodyGradient = ctx.createRadialGradient(
      x - size * 0.25, y - size * 0.25, 0, 
      x + size * 0.1, y + size * 0.1, size
    );
    bodyGradient.addColorStop(0, "#ffffff");
    bodyGradient.addColorStop(0.1, lightenColor(sunState.color, 0.8));
    bodyGradient.addColorStop(0.3, lightenColor(sunState.color, 0.5));
    bodyGradient.addColorStop(0.55, sunState.color);
    bodyGradient.addColorStop(0.8, `rgba(${rgbStr}, 0.95)`);
    bodyGradient.addColorStop(1, `rgba(${rgbStr}, 0.85)`);
    
    ctx.beginPath();
    ctx.fillStyle = bodyGradient;
    ctx.globalAlpha = 1;
    ctx.arc(x, y, size, 0, TWO_PI);
    ctx.fill();
    
    // ===== LAYER 9: Surface granulation (subtle texture) =====
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < granulation.spotCount; i++) {
      const spotAngle = (time * granulation.rotationSpeed + i * TWO_PI / granulation.spotCount) % (TWO_PI);
      const spotDist = size * (0.25 + 0.45 * Math.sin(i * 2.3 + time * granulation.variationSpeed));
      const spotX = x + Math.cos(spotAngle) * spotDist;
      const spotY = y + Math.sin(spotAngle) * spotDist;
      const spotSize = size * (0.12 + 0.08 * Math.sin(i * 1.9));
      
      const spotGradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotSize);
      const isLightSpot = i % 2 === 0;
      const spotColor = isLightSpot ? "rgba(255, 255, 255, 0.4)" : `rgba(${rgbStr}, 0.6)`;
      spotGradient.addColorStop(0, spotColor);
      spotGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      
      ctx.beginPath();
      ctx.fillStyle = spotGradient;
      ctx.arc(spotX, spotY, spotSize, 0, TWO_PI);
      ctx.fill();
    }
    
    // ===== LAYER 10: Bright center hotspot =====
    const hotspotGradient = ctx.createRadialGradient(
      x - size * 0.12, y - size * 0.12, 0,
      x, y, size * layers.hotspotRadius
    );
    hotspotGradient.addColorStop(0, "#ffffff");
    hotspotGradient.addColorStop(0.2, "rgba(255, 255, 255, 0.95)");
    hotspotGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
    hotspotGradient.addColorStop(0.8, "rgba(255, 255, 255, 0.15)");
    hotspotGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.fillStyle = hotspotGradient;
    ctx.globalAlpha = isHighlighted ? 1 : 0.92;
    ctx.arc(x, y, size * layers.hotspotRadius, 0, TWO_PI);
    ctx.fill();
    
    // ===== LAYER 11: Specular highlight (glass-like reflection) =====
    const highlightGradient = ctx.createRadialGradient(
      x - size * layers.highlightRadius, y - size * layers.highlightRadius, 0,
      x - size * 0.25, y - size * 0.25, size * layers.highlightRadius
    );
    highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    highlightGradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
    highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.fillStyle = highlightGradient;
    ctx.globalAlpha = 0.8;
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, TWO_PI);
    ctx.fill();

    // ===== LAYER 12: Secondary highlight (subtle rim light) =====
    const rimGradient = ctx.createRadialGradient(
      x + size * 0.4, y + size * 0.4, 0,
      x + size * 0.3, y + size * 0.3, size * layers.rimRadius
    );
    rimGradient.addColorStop(0, `rgba(${secondaryRgbStr}, 0.4)`);
    rimGradient.addColorStop(0.5, `rgba(${secondaryRgbStr}, 0.15)`);
    rimGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.fillStyle = rimGradient;
    ctx.globalAlpha = 0.5;
    ctx.arc(x + size * layers.highlightRadius, y + size * layers.highlightRadius, size * 0.2, 0, TWO_PI);
    ctx.fill();
    
    // ===== LAYER 13: Focus area vector icon =====
    // Draw a vector icon in the center of the sun to represent the focus area
    ctx.globalAlpha = isDarkMode ? OPACITY_CONFIG.sun.icon.dark : OPACITY_CONFIG.sun.icon.light;
    const iconSize = size * SUN_ICON_CONFIG.sizeMultiplier;
    
    // Draw icon based on sun type
    drawSunIcon(ctx, x, y, iconSize, sunState.id);
  });
  
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Draw a vector icon representing the focus area in the center of a sun
 */
function drawSunIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  iconSize: number,
  sunId: string
): void {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = Math.max(SUN_ICON_CONFIG.minLineWidth, iconSize * SUN_ICON_CONFIG.lineWidthMultiplier);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  switch (sunId) {
    case "fintech-blockchain-sun":
      // Draw a blockchain/coin icon (hexagon with connecting nodes)
      drawBlockchainIcon(ctx, x, y, iconSize);
      break;
    case "ai-ml-sun":
      // Draw an AI/brain icon (circuit-like pattern)
      drawAIIcon(ctx, x, y, iconSize);
      break;
    case "defense-security-sun":
      // Draw a shield icon
      drawShieldIcon(ctx, x, y, iconSize);
      break;
    case "mobility-transportation-sun":
      // Draw a wheel/motion icon
      drawMobilityIcon(ctx, x, y, iconSize);
      break;
    default:
      // Default: draw a simple star
      drawDefaultStarIcon(ctx, x, y, iconSize);
  }
  
  ctx.restore();
}

/**
 * Draw a blockchain/fintech icon (hexagon with nodes)
 */
function drawBlockchainIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * SUN_ICON_CONFIG.blockchain.hexagonRadius;
  
  // Draw hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI / 2;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();
  
  // Draw nodes at vertices
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI / 2;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(px, py, size * SUN_ICON_CONFIG.blockchain.nodeRadius, 0, TWO_PI);
    ctx.fill();
  }

  // Draw center node
  ctx.beginPath();
  ctx.arc(x, y, size * SUN_ICON_CONFIG.blockchain.centerNodeRadius, 0, TWO_PI);
  ctx.fill();
  
  // Draw connecting lines from center to alternate vertices (0, 2, 4)
  // This creates a triangular pattern for visual balance
  for (let i = 0; i < 6; i += 2) {
    const angle = (i * Math.PI / 3) - Math.PI / 2;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(px, py);
    ctx.stroke();
  }
}

/**
 * Draw an AI/ML icon (neural network pattern)
 */
function drawAIIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  // Draw brain-like circuit pattern
  const r = size * SUN_ICON_CONFIG.ai.networkRadius;

  // Central node
  ctx.beginPath();
  ctx.arc(x, y, size * SUN_ICON_CONFIG.ai.centerNodeRadius, 0, TWO_PI);
  ctx.fill();

  // Outer nodes in a circle
  const nodeCount = SUN_ICON_CONFIG.ai.nodeCount;
  const outerNodes: Array<{x: number; y: number}> = [];
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i * TWO_PI / nodeCount) - Math.PI / 2;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    outerNodes.push({x: px, y: py});

    // Draw node
    ctx.beginPath();
    ctx.arc(px, py, size * SUN_ICON_CONFIG.ai.outerNodeRadius, 0, TWO_PI);
    ctx.fill();
    
    // Connect to center
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(px, py);
    ctx.stroke();
  }
  
  // Connect outer nodes to adjacent nodes (neural network connections)
  for (let i = 0; i < nodeCount; i++) {
    const next = (i + 1) % nodeCount;
    ctx.beginPath();
    ctx.moveTo(outerNodes[i].x, outerNodes[i].y);
    ctx.lineTo(outerNodes[next].x, outerNodes[next].y);
    ctx.stroke();
  }
}

/**
 * Draw a shield icon (defense/security)
 */
function drawShieldIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const w = size * SUN_ICON_CONFIG.shield.width;
  const h = size * SUN_ICON_CONFIG.shield.height;
  
  // Draw shield shape
  ctx.beginPath();
  ctx.moveTo(x, y - h * 0.5); // Top center
  ctx.lineTo(x + w * 0.5, y - h * 0.3); // Top right
  ctx.lineTo(x + w * 0.5, y + h * 0.1); // Right side
  ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.4, x, y + h * 0.5); // Bottom right curve
  ctx.quadraticCurveTo(x - w * 0.3, y + h * 0.4, x - w * 0.5, y + h * 0.1); // Bottom left curve
  ctx.lineTo(x - w * 0.5, y - h * 0.3); // Left side
  ctx.closePath();
  ctx.stroke();
  
  // Draw checkmark inside
  ctx.beginPath();
  ctx.moveTo(x - w * 0.2, y);
  ctx.lineTo(x - w * 0.05, y + h * 0.15);
  ctx.lineTo(x + w * 0.25, y - h * 0.15);
  ctx.stroke();
}

/**
 * Draw a mobility/transportation icon (wheel with spokes)
 */
function drawMobilityIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * SUN_ICON_CONFIG.mobility.outerRadius;
  const innerR = size * SUN_ICON_CONFIG.mobility.innerRadius;

  // Outer wheel
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.stroke();

  // Inner hub
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, TWO_PI);
  ctx.stroke();

  // Center point
  ctx.beginPath();
  ctx.arc(x, y, size * SUN_ICON_CONFIG.mobility.centerRadius, 0, TWO_PI);
  ctx.fill();

  // Spokes
  const spokeCount = SUN_ICON_CONFIG.mobility.spokeCount;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * TWO_PI / spokeCount);
    ctx.beginPath();
    ctx.moveTo(x + innerR * Math.cos(angle), y + innerR * Math.sin(angle));
    ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
    ctx.stroke();
  }
  
  // Motion lines (speed indicator)
  const originalLineWidth = ctx.lineWidth;
  ctx.lineWidth = originalLineWidth * 0.6;
  for (let i = 0; i < SUN_ICON_CONFIG.mobility.motionLineCount; i++) {
    const lineY = y - size * 0.1 + i * size * 0.15;
    const lineX = x + r + size * 0.15;
    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX + size * 0.3 - i * size * 0.08, lineY);
    ctx.stroke();
  }
  ctx.lineWidth = originalLineWidth; // Restore original lineWidth
}

/**
 * Draw a default star icon
 */
function drawDefaultStarIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const outerR = size * SUN_ICON_CONFIG.defaultStar.outerRadius;
  const innerR = size * SUN_ICON_CONFIG.defaultStar.innerRadius;
  const points = SUN_ICON_CONFIG.defaultStar.pointCount;
  
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI / points) - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}
