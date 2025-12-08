import { checkAddClick, checkCollisions, drawGameUI } from "../../gameState";
import {
  BurstParticle as _BurstParticle,
  ClickBurst as _ClickBurst,
  CollisionEffect,
  CollisionParticle as _CollisionParticle,
  GameState,
  Planet,
  Star,
} from "../../types";
import { AnimationProps, AnimationRefs } from "./types";
import { TWO_PI } from "../../math";

// Helper to extract base color (called once per particle creation, not per frame)
function getBaseColor(color: string): string {
  return color.replace(/[\d.]+\)$/, "");
}

export function processParticleEffects(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  deltaTime: number,
  props: AnimationProps,
  refs: AnimationRefs,
  currentStars: Star[],
  currentPlanets: Planet[],
  currentGameState: GameState,
  shouldSkipHeavyOperations: boolean,
): void {
  const normalizedDelta = Math.min(deltaTime / 160, 0.2);

  // Update and draw click bursts - only on every other frame
  // Uses swap-and-pop pattern for O(1) removal instead of filter's O(n) allocation
  if (
    !shouldSkipHeavyOperations &&
    props.clickBurstsRef &&
    props.clickBurstsRef.current
  ) {
    const bursts = props.clickBurstsRef.current;
    let burstIdx = 0;

    while (burstIdx < bursts.length) {
      const burst = bursts[burstIdx];
      const timeSinceBurst = timestamp - burst.time;

      // Remove bursts older than 1.5 seconds using swap-and-pop
      if (timeSinceBurst > 1500) {
        const lastIdx = bursts.length - 1;
        if (burstIdx !== lastIdx) {
          bursts[burstIdx] = bursts[lastIdx];
        }
        bursts.pop();
        continue; // Don't increment - need to process swapped element
      }

      // Calculate opacity once per burst
      const opacity = 1 - timeSinceBurst / 1500;

      // Update and draw particles - direct iteration with limit (avoids slice allocation)
      const maxParticles = Math.min(burst.particles.length, 20);
      for (let j = 0; j < maxParticles; j++) {
        const particle = burst.particles[j];

        // Update position - slow down by 10x
        particle.x += particle.vx * (normalizedDelta * 0.05);
        particle.y += particle.vy * (normalizedDelta * 0.05);

        // Add gravity - reduce gravity effect by 10x
        particle.vy += 0.005 * normalizedDelta;

        // Slow down over time - make deceleration more gradual
        particle.vx *= 0.998;
        particle.vy *= 0.998;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, TWO_PI);

        // Use cached base color if available, otherwise compute and cache it
        if (!particle.colorBase) {
          particle.colorBase = getBaseColor(particle.color);
        }
        ctx.fillStyle = `${particle.colorBase}${opacity})`;
        ctx.fill();
      }

      burstIdx++;
    }

    // Only update state periodically to reduce re-renders
    if (props.frameCountRef && props.frameCountRef.current % 60 === 0) {
      props.setClickBursts([...bursts]); // Create new array for React state
    }
  }

  // Update and draw collision effects - only on every other frame
  // Uses swap-and-pop pattern for O(1) removal
  if (!shouldSkipHeavyOperations) {
    const effects = refs.collisionEffectsRef.current;
    // Use timestamp for consistency with click bursts (avoids Date.now() call)
    let effectIdx = 0;

    while (effectIdx < effects.length) {
      const effect = effects[effectIdx];
      const timeSinceEffect = timestamp - effect.time;

      // Remove effects older than 1 second using swap-and-pop
      if (timeSinceEffect > 1000) {
        const lastIdx = effects.length - 1;
        if (effectIdx !== lastIdx) {
          effects[effectIdx] = effects[lastIdx];
        }
        effects.pop();
        continue;
      }

      // Cache base color if not already cached
      if (!effect.colorBase) {
        effect.colorBase = getBaseColor(effect.color);
      }

      // Update and draw particles - direct iteration with limit
      const maxParticles = Math.min(effect.particles.length, 15);
      for (let j = 0; j < maxParticles; j++) {
        const particle = effect.particles[j];

        // Update position - slow down by 10x
        particle.x += particle.vx * (normalizedDelta * 0.05);
        particle.y += particle.vy * (normalizedDelta * 0.05);

        // Slow down over time - make deceleration more gradual
        particle.vx *= 0.995;
        particle.vy *= 0.995;

        // Fade out
        particle.alpha = 1 - timeSinceEffect / 1000;

        // Draw particle using cached base color
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, TWO_PI);
        ctx.fillStyle = `${effect.colorBase}${particle.alpha})`;
        ctx.fill();
      }

      // Add a glow effect at the center that fades out
      if (timeSinceEffect < 300) {
        // Slow down glow expansion
        const glowRadius = 20 + timeSinceEffect / 20;
        const glowAlpha = 1 - timeSinceEffect / 300;

        const gradient = ctx.createRadialGradient(
          effect.x,
          effect.y,
          0,
          effect.x,
          effect.y,
          glowRadius,
        );

        // Use cached base color
        gradient.addColorStop(0, `${effect.colorBase}${glowAlpha})`);
        gradient.addColorStop(1, `${effect.colorBase}0)`);

        ctx.beginPath();
        ctx.arc(effect.x, effect.y, glowRadius, 0, TWO_PI);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw score text
      if (timeSinceEffect < 800) {
        const textAlpha = 1 - timeSinceEffect / 800;
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
        ctx.textAlign = "center";
        // Slow down text rise
        ctx.fillText(
          `+${effect.score}`,
          effect.x,
          effect.y - 20 - timeSinceEffect / 100,
        );
      }

      effectIdx++;
    }

    // Only update collision effects state periodically
    if (props.frameCountRef && props.frameCountRef.current % 60 === 0) {
      props.setCollisionEffects([...effects]);
    }
  }

  // Game mode: check for collisions and add clicks - only on every other frame
  if (!shouldSkipHeavyOperations && props.gameMode) {
    // Reset pending collision effects
    refs.pendingCollisionEffectsRef.current = [];

    // Check for collisions between stars and employee stars
    checkCollisions(
      currentStars,
      currentPlanets,
      currentGameState,
      (newGameState: GameState) => {
        // Only update game state periodically
        if (props.frameCountRef && props.frameCountRef.current % 20 === 0) {
          props.setGameState(newGameState);
        } else {
          refs.gameStateRef.current = newGameState;
        }
      },
      (x: number, y: number, color: string, score: number) => {
        // Instead of immediately setting state, add to pending array
        refs.pendingCollisionEffectsRef.current.push(
          props.createCollisionEffect(x, y, color, score),
        );
      },
    );

    // Update collision effects at once to reduce state updates
    if (
      refs.pendingCollisionEffectsRef.current.length > 0 &&
      props.frameCountRef &&
      props.frameCountRef.current % 60 === 0
    ) {
      props.setCollisionEffects((prev: CollisionEffect[]) => [
        ...prev,
        ...refs.pendingCollisionEffectsRef.current,
      ]);
      refs.pendingCollisionEffectsRef.current = [];
    }

    // Check if it's time to add a new click
    checkAddClick(currentGameState, (newGameState: GameState) => {
      // Only update game state periodically
      if (props.frameCountRef && props.frameCountRef.current % 20 === 0) {
        props.setGameState(newGameState);
      } else {
        refs.gameStateRef.current = newGameState;
      }
    });

    // Draw game UI - add null check for canvas
    if (props.canvasRef.current) {
      drawGameUI(
        ctx,
        currentGameState,
        props.canvasRef.current.width,
        props.canvasRef.current.height,
      );
    }
  }
}
