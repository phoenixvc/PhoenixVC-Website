// components/Layout/Starfield/hooks/animation/animate.ts
import { SetStateAction } from "react";
import { drawBlackHole } from "../../blackHoles";
import { drawConnections, drawStars, updateStarActivity, updateStarPositions } from "../../stars";
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
import { Camera, CosmicNavigationState, CosmicObject } from "../../cosmos/types";
// Import cosmic hierarchy data
import { GALAXIES, SPECIAL_COSMIC_OBJECTS, SUNS } from "../../cosmos/cosmicHierarchy";
import { checkPlanetHover, updatePlanets } from "../../Planets";
import { drawCosmicNavigation } from "./drawCosmicNavigation";
// Import sun system for dynamic sun positioning
import { getSunStates, initializeSunStates, updateSunPhysics, updateSunSizesFromPlanets, SunState } from "../../sunSystem";

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

    // Performance optimization: Skip heavy operations less frequently to reduce flicker
    // Changed from every 4 frames to every 8 frames for smoother star connections
    refs.frameSkipRef.current = (refs.frameSkipRef.current + 1) % 8;
    const shouldSkipHeavyOperations = refs.frameSkipRef.current !== 0;

    // Increment frame counter
    if (props.frameCountRef) props.frameCountRef.current++;

    // Clear canvas with full dimensions
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current stars from ref - make sure to create a safe copy to avoid mutation issues
    // Use optional chaining and provide a default empty array
    const currentStars: Star[] = props.starsRef?.current ? [...props.starsRef.current] : [];

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

    // Always draw stars first - this ensures they always appear
    drawStars(ctx, currentStars);

    // Get planets for sun size calculation
    const currentPlanets: Planet[] = props.planetsRef?.current ? [...props.planetsRef.current] : [];

    // Draw suns (focus area orbital centers) - always visible
    // Pass hovered sun id, focused sun id for interactive effects, deltaTime for physics, and planets for size calculation
    drawSuns(ctx, canvas.width, canvas.height, timestamp, props.isDarkMode, props.hoveredSunId, deltaTime, props.focusedSunId, currentPlanets);

    // Get current values from refs
    const currentBlackHoles: BlackHole[] = props.blackHolesRef?.current ? [...props.blackHolesRef.current] : [];

    // Fixed: Make sure isClicked is false by default
    const currentMousePosition: MousePosition = refs.mousePositionRef.current ?
        { ...refs.mousePositionRef.current } :
    {
      x: canvas.width / 2,
      y: canvas.height / 2,
      lastX: canvas.width / 2,
      lastY: canvas.height / 2,
      speedX: 0,
      speedY: 0,
      isClicked: false, // Ensure this is false by default
      clickTime: 0,
      isOnScreen: true // Changed to true to ensure visibility
    };

    // Debug logging removed for performance - re-enable if needed for debugging

    const currentHoverInfo: HoverInfo = { ...refs.hoverInfoRef.current };
    const currentGameState: GameState = { ...refs.gameStateRef.current };

    // NEW: Get cosmic navigation state and camera if available
    const currentCamera: Camera | undefined = props.camera ? { ...props.camera } : undefined;
    const currentNavigationState: CosmicNavigationState | undefined = props.navigationState ?
      { ...props.navigationState } : undefined;
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
    // Using elementFromPoint to detect if there's a higher z-index element at the mouse position
    let isOverContentCard = false;
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
        const isInsideHeroSection = elementAtMouse.closest('section[aria-label="hero section"]') !== null;
        // Check if hovering over header/navigation (should allow tooltips since they're transparent)
        const isInsideHeader = elementAtMouse.closest("header") !== null;
        // Check if hovering over sidebar (should allow tooltips)
        const isInsideSidebar = elementAtMouse.closest('aside, [role="complementary"]') !== null;
        
        // Only consider it as "over content card" if it's NOT any of the allowed elements
        // This allows tooltips to show when hovering over transparent overlays, header, sidebar, etc.
        isOverContentCard = !isCanvas && !isInsideStarfield && !isInsideHeroSection && !isInsideHeader && !isInsideSidebar;
      }
    }

    if (props.enablePlanets && props.enableMouseInteraction) {
      // Create a wrapper function that matches the expected type
      const updateHoverInfoIfChanged = (newInfo: SetStateAction<HoverInfo>): void => {
        // If newInfo is a function, we can"t directly compare it
        if (typeof newInfo === "function") {
          props.setHoverInfo(newInfo);
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
        // Clear hover info if currently showing
        if (currentHoverInfo.show) {
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

    // Draw black holes if enabled
    if (props.enableBlackHole) {
      currentBlackHoles.forEach((blackHole: BlackHole) => {
        drawBlackHole(ctx, blackHole, deltaTime, props.particleSpeed * 0.01);
      });
    }

    // Draw portfolio comets/planets
    updatePlanets(
      ctx,
      currentPlanets,
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
        // Calculate FPS for debug info (moved from drawDebugInfo)
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
          ctx.arc(currentMousePosition.x, currentMousePosition.y, props.mouseEffectRadius, 0, Math.PI * 2);
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
    ctx.arc(mouseX, mouseY, props.mouseEffectRadius, 0, Math.PI * 2);
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
        ctx.arc(mouseX, mouseY, rippleRadius, 0, Math.PI * 2);
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
      ctx.arc(mouseX, mouseY, flashRadius, 0, Math.PI * 2);
      ctx.fillStyle = flashColor;
      ctx.fill();
    }
  }

// Track if sun system is initialized
let sunSystemInitialized = false;
let sunSizesCalculated = false;

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
 * Helper to parse hex color to RGB
 * @param hex - A hex color string (e.g., "#ff0000" or "ff0000")
 * @returns Object with r, g, b values (0-255) or null if invalid
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== "string") {
    return null;
  }
  // Remove # if present and trim whitespace
  const cleanHex = hex.replace(/^#/, "").trim();
  // Validate hex format (6 hex characters)
  if (!/^[a-fA-F0-9]{6}$/.test(cleanHex)) {
    return null;
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Create a lighter version of a color
 */
function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, rgb.r + (255 - rgb.r) * amount);
  const g = Math.min(255, rgb.g + (255 - rgb.g) * amount);
  const b = Math.min(255, rgb.b + (255 - rgb.b) * amount);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
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

  sunStates.forEach((sunState) => {
    // Use dynamic position from sun system
    const x = sunState.x * width;
    const y = sunState.y * height;
    // Adjusted sun size for better proportions (increased from 0.35 to 0.38)
    const baseSize = Math.max(20, Math.min(width, height) * sunState.size * 0.38);
    
    // Check if this sun is hovered or focused
    const isHovered = hoveredSunId === sunState.id;
    const isFocused = focusedSunId === sunState.id;
    const isHighlighted = isHovered || isFocused;
    
    // Check if sun is in propel mode (avoiding collision)
    const isPropelling = sunState.isPropelling;
    
    // Multi-layered pulsating effect
    const pulseSpeed1 = isHighlighted ? 0.0005 : 0.00025;
    const pulseSpeed2 = isHighlighted ? 0.00035 : 0.00018;
    const pulseAmount = isHighlighted ? 0.18 : (isPropelling ? 0.15 : 0.1);
    const pulse1 = 1 + pulseAmount * Math.sin(time * pulseSpeed1);
    const pulse2 = 1 + (pulseAmount * 0.5) * Math.sin(time * pulseSpeed2 + Math.PI / 3);
    const pulse = (pulse1 + pulse2) / 2;
    const size = baseSize * pulse * (isHighlighted ? 1.2 : 1);
    
    const rgb = hexToRgb(sunState.color);
    const rgbStr = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "255, 200, 100";
    
    // ===== LAYER 1: Outer atmospheric glow =====
    const atmosphereSize = size * (isHighlighted ? 8 : 6);
    const atmosphereGradient = ctx.createRadialGradient(x, y, size * 0.5, x, y, atmosphereSize);
    atmosphereGradient.addColorStop(0, `rgba(${rgbStr}, ${isHighlighted ? 0.4 : 0.25})`);
    atmosphereGradient.addColorStop(0.3, `rgba(${rgbStr}, ${isHighlighted ? 0.2 : 0.12})`);
    atmosphereGradient.addColorStop(0.6, `rgba(${rgbStr}, ${isHighlighted ? 0.08 : 0.05})`);
    atmosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
    
    ctx.beginPath();
    ctx.fillStyle = atmosphereGradient;
    ctx.globalAlpha = isDarkMode ? 1 : 0.7;
    ctx.arc(x, y, atmosphereSize, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== LAYER 2: Corona rays (long, tapered) =====
    const rayCount = isHighlighted ? 16 : 12;
    ctx.globalAlpha = isDarkMode ? (isHighlighted ? 0.6 : 0.4) : (isHighlighted ? 0.4 : 0.25);
    
    for (let i = 0; i < rayCount; i++) {
      const baseAngle = (i * Math.PI * 2 / rayCount) + sunState.rotationAngle;
      // Add slight wave to rays
      const waveOffset = Math.sin(time * 0.0003 + i * 0.5) * 0.1;
      const angle = baseAngle + waveOffset;
      
      // Vary ray lengths
      const rayLengthVariation = 0.7 + 0.3 * Math.sin(time * 0.0002 + i * 1.2);
      const rayLength = size * (isHighlighted ? 4.5 : 3.5) * rayLengthVariation;
      
      const endX = x + Math.cos(angle) * rayLength;
      const endY = y + Math.sin(angle) * rayLength;
      
      // Tapered ray using a path
      ctx.beginPath();
      const rayWidth = size * (isHighlighted ? 0.15 : 0.12);
      const perpAngle = angle + Math.PI / 2;
      
      // Start point (at sun surface)
      const startDist = size * 0.8;
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
      rayGradient.addColorStop(0, `rgba(${rgbStr}, 0.8)`);
      rayGradient.addColorStop(0.3, `rgba(${rgbStr}, 0.4)`);
      rayGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      
      ctx.fillStyle = rayGradient;
      ctx.fill();
    }
    
    // ===== LAYER 3: Short spiky corona =====
    const spikeCount = isHighlighted ? 24 : 18;
    ctx.globalAlpha = isDarkMode ? 0.7 : 0.5;
    
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i * Math.PI * 2 / spikeCount) + sunState.rotationAngle * 1.5 + Math.PI / spikeCount;
      const spikeLength = size * (1.3 + 0.3 * Math.sin(time * 0.0004 + i * 0.8));
      
      const startX = x + Math.cos(angle) * size * 0.9;
      const startY = y + Math.sin(angle) * size * 0.9;
      const endX = x + Math.cos(angle) * spikeLength;
      const endY = y + Math.sin(angle) * spikeLength;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      
      const spikeGradient = ctx.createLinearGradient(startX, startY, endX, endY);
      spikeGradient.addColorStop(0, lightenColor(sunState.color, 0.5));
      spikeGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      
      ctx.strokeStyle = spikeGradient;
      ctx.lineWidth = size * 0.08;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    
    // ===== LAYER 4: Propel/collision effect rings =====
    if (isPropelling) {
      const propelRingCount = 4;
      for (let r = 0; r < propelRingCount; r++) {
        const ringRadius = size * (1.8 + r * 0.6);
        const ringAlpha = 0.4 - r * 0.08;
        const ringPhase = Math.sin(time * 0.002 + r * Math.PI / 2);
        
        ctx.beginPath();
        ctx.strokeStyle = sunState.color;
        ctx.lineWidth = 2 - r * 0.3;
        ctx.globalAlpha = ringAlpha * (0.6 + 0.4 * ringPhase);
        ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // ===== LAYER 5: Hover/focus ring indicator =====
    if (isHighlighted) {
      // Outer dashed ring
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.strokeStyle = lightenColor(sunState.color, 0.3);
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(time * 0.001);
      ctx.arc(x, y, size * 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Inner solid pulsing ring
      ctx.beginPath();
      ctx.strokeStyle = lightenColor(sunState.color, 0.5);
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7 + 0.2 * Math.sin(time * 0.0012);
      ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // ===== LAYER 6: Main photosphere (outer glow of core) =====
    const photosphereGradient = ctx.createRadialGradient(x, y, size * 0.3, x, y, size * 1.2);
    photosphereGradient.addColorStop(0, lightenColor(sunState.color, 0.8));
    photosphereGradient.addColorStop(0.4, sunState.color);
    photosphereGradient.addColorStop(0.7, `rgba(${rgbStr}, 0.8)`);
    photosphereGradient.addColorStop(1, `rgba(${rgbStr}, 0.3)`);
    
    ctx.beginPath();
    ctx.fillStyle = photosphereGradient;
    ctx.globalAlpha = isDarkMode ? 1 : 0.85;
    ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== LAYER 7: Main sun body =====
    const bodyGradient = ctx.createRadialGradient(
      x - size * 0.2, y - size * 0.2, 0, 
      x, y, size
    );
    bodyGradient.addColorStop(0, "#ffffff");
    bodyGradient.addColorStop(0.15, lightenColor(sunState.color, 0.7));
    bodyGradient.addColorStop(0.4, lightenColor(sunState.color, 0.3));
    bodyGradient.addColorStop(0.7, sunState.color);
    bodyGradient.addColorStop(1, `rgba(${rgbStr}, 0.9)`);
    
    ctx.beginPath();
    ctx.fillStyle = bodyGradient;
    ctx.globalAlpha = 1;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== LAYER 8: Surface texture (subtle noise-like spots) =====
    ctx.globalAlpha = 0.15;
    const spotCount = 6;
    for (let i = 0; i < spotCount; i++) {
      const spotAngle = (time * 0.00005 + i * Math.PI * 2 / spotCount) % (Math.PI * 2);
      const spotDist = size * (0.3 + 0.4 * Math.sin(i * 2.1));
      const spotX = x + Math.cos(spotAngle) * spotDist;
      const spotY = y + Math.sin(spotAngle) * spotDist;
      const spotSize = size * (0.15 + 0.1 * Math.sin(i * 1.7));
      
      const spotGradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotSize);
      spotGradient.addColorStop(0, `rgba(${rgbStr}, 0.5)`);
      spotGradient.addColorStop(1, `rgba(${rgbStr}, 0)`);
      
      ctx.beginPath();
      ctx.fillStyle = spotGradient;
      ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // ===== LAYER 9: Bright center hotspot =====
    const hotspotGradient = ctx.createRadialGradient(
      x - size * 0.15, y - size * 0.15, 0,
      x, y, size * 0.5
    );
    hotspotGradient.addColorStop(0, "#ffffff");
    hotspotGradient.addColorStop(0.3, "rgba(255, 255, 255, 0.9)");
    hotspotGradient.addColorStop(0.6, "rgba(255, 255, 255, 0.4)");
    hotspotGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    
    ctx.beginPath();
    ctx.fillStyle = hotspotGradient;
    ctx.globalAlpha = isHighlighted ? 1 : 0.9;
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // ===== LAYER 10: Specular highlight =====
    const highlightGradient = ctx.createRadialGradient(
      x - size * 0.3, y - size * 0.3, 0,
      x - size * 0.2, y - size * 0.2, size * 0.4
    );
    highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    highlightGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    
    ctx.beginPath();
    ctx.fillStyle = highlightGradient;
    ctx.globalAlpha = 0.7;
    ctx.arc(x - size * 0.25, y - size * 0.25, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.globalAlpha = 1;
  ctx.restore();
}
