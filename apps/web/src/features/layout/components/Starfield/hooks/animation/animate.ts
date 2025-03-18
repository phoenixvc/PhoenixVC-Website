// components/Layout/Starfield/hooks/animation/animate.ts
import { SetStateAction } from "react";
import {
  BlackHole,
  ClickBurst, // Updated from BurstParticle to ClickBurst
  BurstParticle,
  CollisionEffect,
  CollisionParticle,
  EmployeeStar,
  GameState,
  HoverInfo,
  MousePosition,
  Star
} from "../../types";
import { checkEmployeeHover, updateEmployeeStars } from "../../employeeStars";
import { drawConnections, drawStars, updateStarPositions } from "../../stars";
import { drawBlackHole } from "../../blackHoles";
import { checkAddClick, checkCollisions, drawGameUI } from "../../gameState";
import { AnimationProps, AnimationRefs } from "./types";
import { processParticleEffects } from "./processParticleEffects";

export const animate = (timestamp: number, props: AnimationProps, refs: AnimationRefs): void => {
  try {

    console.log("Animation frame running", {
        timestamp,
        starsCount: props.starsRef?.current?.length || 0,
        canvasWidth: props.canvasRef.current?.width,
        canvasHeight: props.canvasRef.current?.height,
        isAnimating: refs.isAnimatingRef.current,
        isRestarting: refs.isRestartingRef.current,
        debugMode: props.debugMode
      });

    // If we're in the middle of a restart, skip this frame
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

    // Performance optimization: Skip some frames if needed
    refs.frameSkipRef.current = (refs.frameSkipRef.current + 1) % 2;
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

      // Continue animation loop but don't try to draw anything
      if (refs.isAnimatingRef.current || refs.isRestartingRef.current) {
        refs.animationRef.current = window.requestAnimationFrame(
          (nextTimestamp) => animate(nextTimestamp, props, refs)
        );
      }
      return;
    }

    // Always draw stars first - this ensures they always appear
    drawStars(ctx, currentStars);

    // Get current values from refs
    const currentBlackHoles: BlackHole[] = props.blackHolesRef?.current ? [...props.blackHolesRef.current] : [];
    const currentEmployeeStars: EmployeeStar[] = props.employeeStarsRef?.current ? [...props.employeeStarsRef.current] : [];
    const currentMousePosition: MousePosition = refs.mousePositionRef.current ?
    { ...refs.mousePositionRef.current } :
    {
      x: canvas.width / 2,
      y: canvas.height / 2,
      lastX: canvas.width / 2,
      lastY: canvas.height / 2,
      speedX: 0,
      speedY: 0,
      isClicked: false,
      clickTime: 0,
      isOnScreen: true // Force to true for testing
    };
    console.log("Current mouse position in animation:", {
        x: currentMousePosition.x,
        y: currentMousePosition.y,
        isOnScreen: currentMousePosition.isOnScreen,
        isClicked: currentMousePosition.isClicked
      });

    const currentHoverInfo: HoverInfo = { ...refs.hoverInfoRef.current };
    const currentGameState: GameState = { ...refs.gameStateRef.current };

    if (props.enableEmployeeStars && props.enableMouseInteraction) {
      // Create a wrapper function that matches the expected type
      const updateHoverInfoIfChanged = (newInfo: SetStateAction<HoverInfo>): void => {
        // If newInfo is a function, we can't directly compare it
        if (typeof newInfo === "function") {
          props.setHoverInfo(newInfo);
          return;
        }

        // Only update state if it changed significantly
        if (
          newInfo.show !== currentHoverInfo.show ||
          (newInfo.employee && currentHoverInfo.employee &&
            newInfo.employee.id !== currentHoverInfo.employee.id) ||
          (!newInfo.employee && currentHoverInfo.employee) ||
          (newInfo.employee && !currentHoverInfo.employee)
        ) {
          props.setHoverInfo(newInfo);
        }
      };

      checkEmployeeHover(
        currentMousePosition.x,
        currentMousePosition.y,
        currentEmployeeStars,
        props.employeeStarSize,
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

    // Draw employee stars if enabled
    if (props.enableEmployeeStars) {
      updateEmployeeStars(
        ctx,
        currentEmployeeStars,
        deltaTime,
        props.employeeStarSize,
        props.employeeDisplayStyle
      );
    }

    // Draw mouse effects
    drawMouseEffects(ctx, currentMousePosition, props, deltaTime);

    // Process particles and effects
    processParticleEffects(ctx, timestamp, deltaTime, props, refs, currentStars, currentEmployeeStars, currentGameState, shouldSkipHeavyOperations);

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
      }

    // Update star positions in the ref - consolidate this to one place
    if (props.starsRef && props.starsRef.current && props.starsRef.current.length > 0) {
      try {
        // Only update positions, don't replace the entire array
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
    // Debug logging to see if this function is being called with valid data
    console.log("Drawing mouse effects:", {
      mouseX: currentMousePosition.x,
      mouseY: currentMousePosition.y,
      isOnScreen: currentMousePosition.isOnScreen,
      isClicked: currentMousePosition.isClicked,
      clickTime: currentMousePosition.clickTime,
      now: Date.now()
    });

    // CHANGE THIS LINE: Remove the isOnScreen condition for testing
    // if (props.enableMouseInteraction && currentMousePosition && currentMousePosition.isOnScreen) {
    if (props.enableMouseInteraction && currentMousePosition) {
      // Force mouse to be on screen for debugging
      const mouseX = currentMousePosition.x || ctx.canvas.width / 2;
      const mouseY = currentMousePosition.y || ctx.canvas.height / 2;

      // Draw mouse effect (glowing circle)
      const gradient = ctx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        props.mouseEffectRadius
      );

      // INCREASED OPACITY for better visibility
      const baseColor = props.isDarkMode ?
        "rgba(138, 43, 226, 0.5)" : // More visible purple in dark mode
        "rgba(138, 43, 226, 0.4)";  // More visible purple in light mode

      gradient.addColorStop(0, currentMousePosition.isClicked ? "rgba(138, 43, 226, 0.7)" : baseColor);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(mouseX, mouseY, props.mouseEffectRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      if (currentMousePosition.x !== 0 && currentMousePosition.y !== 0) {
        // Draw a trail behind the mouse
        const trailLength = 10;
        const trailWidth = 15;

        // Calculate trail direction based on mouse speed
        const speedX = currentMousePosition.speedX || 0.1;
        const speedY = currentMousePosition.speedY || 0.1;
        const speedMagnitude = Math.sqrt(speedX * speedX + speedY * speedY);

        if (speedMagnitude > 0.1) {
          // Normalize direction vector
          const dirX = speedX / speedMagnitude;
          const dirY = speedY / speedMagnitude;

          // Draw trail segments
          for (let i = 0; i < trailLength; i++) {
            const distance = i * 5;
            const x = mouseX - dirX * distance;
            const y = mouseY - dirY * distance;
            const opacity = 1 - (i / trailLength);

            ctx.beginPath();
            ctx.arc(x, y, trailWidth * opacity, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 100, 255, ${opacity * 0.5})`;
            ctx.fill();
          }
        }
      }

      // Always show ripple for testing
      const forceShowRipple = true;
      if (forceShowRipple || currentMousePosition.isClicked || Date.now() - currentMousePosition.clickTime < 1000) {
        // Use current time if clickTime is not set
        const timeSinceClick = currentMousePosition.clickTime ?
          Date.now() - currentMousePosition.clickTime :
          200; // Default value for testing

        // Draw multiple ripples with different speeds and colors
        for (let i = 0; i < 3; i++) {
          const speed = 0.8 + (i * 0.4); // Different speeds for each ripple
          const delay = i * 100; // Stagger the ripples

          if (timeSinceClick > delay) {
            const adjustedTime = timeSinceClick - delay;
            const maxRadius = props.mouseEffectRadius * 2.5;
            // Slow down ripple expansion
            const rippleRadius = Math.min(maxRadius, props.mouseEffectRadius * (adjustedTime / 1600) * speed);
            const rippleOpacity = 1 - (adjustedTime / 1000);

            if (rippleOpacity > 0) {
              // Different colors for each ripple - MUCH MORE VISIBLE
              let rippleColor;
              if (i === 0) rippleColor = `rgba(138, 43, 226, ${rippleOpacity * 0.95})`;
              else if (i === 1) rippleColor = `rgba(180, 100, 255, ${rippleOpacity * 0.85})`;
              else rippleColor = `rgba(255, 255, 255, ${rippleOpacity * 0.75})`;

              ctx.beginPath();
              ctx.arc(mouseX, mouseY, rippleRadius, 0, Math.PI * 2);
              ctx.strokeStyle = rippleColor;
              ctx.lineWidth = 6 - i; // Thicker lines for better visibility
              ctx.stroke();
            }
          }
        }

        // Add a flash effect at the center
        if (timeSinceClick < 300) {
          const flashOpacity = 1 - (timeSinceClick / 300);
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, 25, 0, Math.PI * 2); // Larger flash
          ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity * 0.9})`;
          ctx.fill();
        }
      }
    }
  }
