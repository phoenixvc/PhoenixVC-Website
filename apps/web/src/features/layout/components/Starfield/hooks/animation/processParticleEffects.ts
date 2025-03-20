import { checkAddClick, checkCollisions, drawGameUI } from "../../gameState";
import { BurstParticle, ClickBurst, CollisionEffect, CollisionParticle, EmployeeStar, GameState, Star } from "../../types";
import { AnimationProps, AnimationRefs } from "./types";

export function processParticleEffects(
    ctx: CanvasRenderingContext2D,
    timestamp: number,
    deltaTime: number,
    props: AnimationProps,
    refs: AnimationRefs,
    currentStars: Star[],
    currentEmployeeStars: EmployeeStar[],
    currentGameState: GameState,
    shouldSkipHeavyOperations: boolean
  ): void {
    const normalizedDelta = Math.min(deltaTime / 160, 0.2);

    // Update and draw click bursts - only on every other frame
    if (!shouldSkipHeavyOperations && props.clickBurstsRef && props.clickBurstsRef.current) {
      const updatedBursts = props.clickBurstsRef.current.filter((burst: ClickBurst) => {
        const timeSinceBurst = timestamp - burst.time;

        // Remove bursts older than 1.5 seconds
        if (timeSinceBurst > 1500) return false;

        // Update and draw each particle - limit particles for performance
        const particlesToDraw = burst.particles.slice(0, 20);
        particlesToDraw.forEach((particle: BurstParticle) => {
          // Update position - slow down by 10x
          particle.x += particle.vx * (normalizedDelta * 0.05);
          particle.y += particle.vy * (normalizedDelta * 0.05);

          // Add gravity - reduce gravity effect by 10x
          particle.vy += 0.005 * normalizedDelta;

          // Slow down over time - make deceleration more gradual
          particle.vx *= 0.998;
          particle.vy *= 0.998;

          // Calculate opacity based on time
          const opacity = 1 - (timeSinceBurst / 1500);

          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

          // Extract base color and apply fading
          const baseColor = particle.color.replace(/[\d.]+\)$/, "");
          ctx.fillStyle = `${baseColor}${opacity})`;
          ctx.fill();
        });

        return true;
      });

      props.clickBurstsRef.current = updatedBursts;

      // Only update state periodically to reduce re-renders
      if (props.frameCountRef && props.frameCountRef.current % 60 === 0) {
        props.setClickBursts(updatedBursts);
      }
    }

    // Update and draw collision effects - only on every other frame
    if (!shouldSkipHeavyOperations) {
      const updatedCollisionEffects = refs.collisionEffectsRef.current.filter((effect: CollisionEffect) => {
        const timeSinceEffect = Date.now() - effect.time;

        // Remove effects older than 1 second
        if (timeSinceEffect > 1000) return false;

        // Update and draw each particle - limit particles for performance
        const particlesToDraw = effect.particles.slice(0, 15);
        particlesToDraw.forEach((particle: CollisionParticle) => {
          // Update position - slow down by 10x
          particle.x += particle.vx * (normalizedDelta * 0.05);
          particle.y += particle.vy * (normalizedDelta * 0.05);

          // Slow down over time - make deceleration more gradual
          particle.vx *= 0.995;
          particle.vy *= 0.995;

          // Fade out
          particle.alpha = 1 - (timeSinceEffect / 1000);

          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

          // Use the effect color with fading alpha
          const baseColor = effect.color.replace(/[\d.]+\)$/, "");
          ctx.fillStyle = `${baseColor}${particle.alpha})`;
          ctx.fill();
        });

        // Add a glow effect at the center that fades out
        if (timeSinceEffect < 300) {
          // Slow down glow expansion
          const glowRadius = 20 + (timeSinceEffect / 20);
          const glowAlpha = 1 - (timeSinceEffect / 300);

          const gradient = ctx.createRadialGradient(
            effect.x, effect.y, 0,
            effect.x, effect.y, glowRadius
          );

          gradient.addColorStop(0, `${effect.color.replace(/[\d.]+\)$/, "")}${glowAlpha})`);
          gradient.addColorStop(1, `${effect.color.replace(/[\d.]+\)$/, "")}0)`);

          ctx.beginPath();
          ctx.arc(effect.x, effect.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw score text
        if (timeSinceEffect < 800) {
          const textAlpha = 1 - (timeSinceEffect / 800);
          ctx.font = "bold 16px Arial";
          ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
          ctx.textAlign = "center";
          // Slow down text rise
          ctx.fillText(`+${effect.score}`, effect.x, effect.y - 20 - (timeSinceEffect / 100));
        }

        return true;
      });

      refs.collisionEffectsRef.current = updatedCollisionEffects;

      // Only update collision effects state periodically
      if (props.frameCountRef && props.frameCountRef.current % 60 === 0) {
        props.setCollisionEffects(updatedCollisionEffects);
      }
    }

    // Game mode: check for collisions and add clicks - only on every other frame
    if (!shouldSkipHeavyOperations && props.gameMode) {
      // Reset pending collision effects
      refs.pendingCollisionEffectsRef.current = [];

      // Check for collisions between stars and employee stars
      checkCollisions(
        currentStars,
        currentEmployeeStars,
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
          refs.pendingCollisionEffectsRef.current.push(props.createCollisionEffect(x, y, color, score));
        }
      );

      // Update collision effects at once to reduce state updates
      if (refs.pendingCollisionEffectsRef.current.length > 0 && props.frameCountRef && props.frameCountRef.current % 60 === 0) {
        props.setCollisionEffects((prev: CollisionEffect[]) => [...prev, ...refs.pendingCollisionEffectsRef.current]);
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
        drawGameUI(ctx, currentGameState, props.canvasRef.current.width, props.canvasRef.current.height);
      }
    }
}
