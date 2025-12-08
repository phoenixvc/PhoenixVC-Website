// mouseEffects.ts - Mouse interaction visual effects
// Single Responsibility: Draw mouse-related visual effects (glow, ripples, click flash)

import { MousePosition } from "../../types";
import { AnimationProps } from "./types";
import { TWO_PI } from "../../math";
import { getFrameTime } from "../../frameCache";

/**
 * Draw mouse interaction effects (glow, ripples, click flash)
 */
export function drawMouseEffects(
  ctx: CanvasRenderingContext2D,
  currentMousePosition: MousePosition,
  props: AnimationProps,
  _deltaTime: number
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
  // Use getFrameTime() instead of Date.now() to avoid syscall per frame
  const timeSinceClick = currentMousePosition.clickTime > 0
    ? getFrameTime() - currentMousePosition.clickTime
    : 2000; // No click yet - beyond all effect thresholds

  // Draw three layered ripple effects.
  drawRippleEffects(ctx, mouseX, mouseY, props, timeSinceClick);

  // Toned-down flash effect on click.
  drawClickFlash(ctx, mouseX, mouseY, props, timeSinceClick);
}

/**
 * Draw ripple effects emanating from click position
 */
function drawRippleEffects(
  ctx: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  props: AnimationProps,
  timeSinceClick: number
): void {
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
}

/**
 * Draw flash effect on click
 */
function drawClickFlash(
  ctx: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  props: AnimationProps,
  timeSinceClick: number
): void {
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
