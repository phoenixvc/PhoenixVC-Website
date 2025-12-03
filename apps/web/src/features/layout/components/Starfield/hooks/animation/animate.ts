// components/Layout/Starfield/hooks/animation/animate.ts
import { SetStateAction } from "react";
import { drawBlackHole } from "../../blackHoles";
import { drawConnections, drawStars, updateStarActivity, updateStarPositions } from "../../stars";
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

export const animate = (timestamp: number, props: AnimationProps, refs: AnimationRefs): void => {
  try {
    if (props.debugSettings?.verboseLogs) {
      console.log("frame:", timestamp, "stars:", props.starsRef?.current.length ?? 0);
    }

    // If we"re in the middle of a restart, skip this frame
    if (refs.isRestartingRef.current) {
      console.log("Skipping animation frame during restart");
      refs.animationRef.current = window.requestAnimationFrame(
        (nextTimestamp) => animate(nextTimestamp, props, refs)
      );
      return;
    }

    // Update last frame time for watchdog
    refs.lastFrameTimeRef.current = Date.now();

    // Add a safety check for starsRef at the beginning of each frame
    if (!props.starsRef) {
      console.error("Animation frame error: starsRef is undefined");
      if (refs.isAnimatingRef.current) {
        refs.animationRef.current = window.requestAnimationFrame(
          (nextTimestamp) => animate(nextTimestamp, props, refs)
        );
      }
      return;
    }

    const canvas = props.canvasRef.current;
    if (!canvas) {
      console.error("Animation frame error: canvas is null");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Animation frame error: context is null");
      return;
    }

    // Frame rate limiter - if delta time is too large, it might indicate the tab was inactive
    if (!refs.lastTimeRef.current) refs.lastTimeRef.current = timestamp;

    // Calculate delta time with safety cap
    let deltaTime = timestamp - refs.lastTimeRef.current;

    // If deltaTime is extremely large (tab was inactive or browser paused),
    // cap it to prevent physics explosions
    if (deltaTime > 200) {
      console.log(`Large delta time detected: ${deltaTime}ms, capping to 16ms`);
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
      console.error("No stars to draw! Will retry on next frame.");

      // Try to ensure stars exist before the next frame
      if (props.ensureStarsExist) {
        console.log("Calling ensureStarsExist from animation loop");
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

    // Draw suns (focus area orbital centers) - always visible
    drawSuns(ctx, canvas.width, canvas.height, timestamp, props.isDarkMode);

    // Get current values from refs
    const currentBlackHoles: BlackHole[] = props.blackHolesRef?.current ? [...props.blackHolesRef.current] : [];
    const currentPlanets: Planet[] = props.planetsRef?.current ? [...props.planetsRef.current] : [];

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

      checkPlanetHover(
        currentMousePosition.x,
        currentMousePosition.y,
        currentPlanets,
        props.planetSize,
        currentHoverInfo,
        updateHoverInfoIfChanged
      );
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
        console.error("Error updating star positions:", err);
      }
    }

    // Continue the animation loop if still animating or restarting
    if (refs.isAnimatingRef.current || refs.isRestartingRef.current) {
      refs.animationRef.current = window.requestAnimationFrame(
        (nextTimestamp) => animate(nextTimestamp, props, refs)
      );
    } else {
      console.log("Animation stopped because isAnimatingRef.current is false and not restarting");
    }
  } catch (error) {
    console.error("Error in animation loop:", error);

    // Log detailed error info
    console.error("Animation state:", {
      isAnimating: refs.isAnimatingRef.current,
      isRestarting: refs.isRestartingRef.current,
      starsCount: props.starsRef?.current?.length || 0,
      canvasExists: !!props.canvasRef.current,
      timestamp
    });

    // Try to recover by continuing the animation
    if (refs.isAnimatingRef.current || refs.isRestartingRef.current) {
      console.log("Attempting to recover from animation error");
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
    const timeSinceClick = currentMousePosition.clickTime
      ? Date.now() - currentMousePosition.clickTime
      : 200; // Fallback for testing

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

/**
 * Draw suns (focus area orbital centers) on the canvas
 * These are always visible in the starfield as glowing orbital centers
 * Positioned in corners/edges for better visual distribution
 */
function drawSuns(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isDarkMode: boolean
): void {
  ctx.save();

  // Only draw the 4 main focus area suns with better positioned coordinates
  // These represent the 4 investment focus areas and are spread across the visible area
  const focusAreaSuns = SUNS.filter(sun => sun.parentId === "focus-areas-galaxy");
  
  // Define better positions spread across the canvas (avoiding center where hero content is)
  const sunPositions = [
    { x: 0.12, y: 0.18 },  // Top-left
    { x: 0.88, y: 0.15 },  // Top-right
    { x: 0.15, y: 0.82 },  // Bottom-left  
    { x: 0.85, y: 0.78 },  // Bottom-right
  ];

  focusAreaSuns.forEach((sun, index) => {
    // Use our better distributed positions
    const pos = sunPositions[index % sunPositions.length];
    const x = pos.x * width;
    const y = pos.y * height;
    // Much larger base size for visibility (minimum 20px, scaled by canvas size)
    const baseSize = Math.max(20, Math.min(width, height) * sun.size * 0.6);
    
    // Pulsating effect
    const pulse = 1 + 0.2 * Math.sin(time * 0.002 + pos.x * 10);
    const size = baseSize * pulse;
    
    // Draw outer glow (larger for visibility)
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
    glowGradient.addColorStop(0, `${sun.color}60`);
    glowGradient.addColorStop(0.4, `${sun.color}30`);
    glowGradient.addColorStop(0.7, `${sun.color}15`);
    glowGradient.addColorStop(1, `${sun.color}00`);
    
    ctx.beginPath();
    ctx.fillStyle = glowGradient;
    ctx.globalAlpha = isDarkMode ? 0.9 : 0.6;
    ctx.arc(x, y, size * 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw inner core
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    coreGradient.addColorStop(0, "#ffffff");
    coreGradient.addColorStop(0.3, sun.color);
    coreGradient.addColorStop(0.7, `${sun.color}CC`);
    coreGradient.addColorStop(1, `${sun.color}66`);
    
    ctx.beginPath();
    ctx.fillStyle = coreGradient;
    ctx.globalAlpha = isDarkMode ? 1.0 : 0.8;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bright center point
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 1.0;
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw rotating rays/corona effect
    ctx.globalAlpha = isDarkMode ? 0.5 : 0.3;
    const rayCount = 8;
    for (let i = 0; i < rayCount; i++) {
      const angle = (time * 0.0005) + (i * Math.PI * 2 / rayCount);
      const rayLength = size * 2.5;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      const endX = x + Math.cos(angle) * rayLength;
      const endY = y + Math.sin(angle) * rayLength;
      
      const rayGradient = ctx.createLinearGradient(x, y, endX, endY);
      rayGradient.addColorStop(0, sun.color);
      rayGradient.addColorStop(1, `${sun.color}00`);
      
      ctx.strokeStyle = rayGradient;
      ctx.lineWidth = size * 0.2;
      ctx.lineCap = "round";
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  });
  
  ctx.globalAlpha = 1;
  ctx.restore();
}
