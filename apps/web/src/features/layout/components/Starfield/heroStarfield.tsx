// components/Layout/Starfield/HeroStarfield.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Star,
  Explosion,
  MousePosition,
  ContainerBounds,
  CenterPosition
} from "./types";
import { getColorPalette } from "./constants";
import {
  drawStar,
  drawExplosions,
  updateHeroStar,
  drawMouseEffect,
  drawStarConnections
} from "./renderer";
import styles from "./interactiveStarfield.module.css";

interface HeroStarfieldProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  colorScheme?: string;
  starDensity?: number;
  starSize?: number;
  lineConnectionDistance?: number;
  lineOpacity?: number;
  mouseEffectRadius?: number;
  mouseEffectColor?: string;
  isDarkMode?: boolean;
  initialMousePosition?: { x: number; y: number; isActive: boolean };
  enableMouseTracking?: boolean;
  theme?: "light" | "dark" | "auto";
  accentColor?: string;
}

const HeroStarfield: React.FC<HeroStarfieldProps> = ({
  containerRef,
  colorScheme = "purple",
  starDensity = 1.2,
  starSize = 1.0,
  lineConnectionDistance = 100,
  lineOpacity = 0.25,
  mouseEffectRadius = 200,
  mouseEffectColor,
  isDarkMode = true,
  initialMousePosition,
  enableMouseTracking = true,
  theme = "dark",
  accentColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef<MousePosition>({
    x: -1000,
    y: -1000,
    lastX: -1000,
    lastY: -1000,
    speedX: 0,
    speedY: 0,
    isClicked: false,
    clickTime: 0,
    isOnScreen: false
  });

  // Determine if dark mode based on theme prop
  const effectiveDarkMode = theme === "auto"
    ? isDarkMode
    : theme === "dark";

  // Set default mouse effect color based on theme and accent color
  const effectiveMouseEffectColor = mouseEffectColor || (
    accentColor
      ? `${accentColor}25` // 25 is hex for 15% opacity
      : effectiveDarkMode
        ? "rgba(147, 51, 234, 0.15)" // Purple for dark mode
        : "rgba(59, 130, 246, 0.15)"  // Blue for light mode
  );

  // Hero-specific state
  const [centerPosition, setCenterPosition] = useState<CenterPosition>({ x: 0, y: 0 });
  const [containerBounds, setContainerBounds] = useState<ContainerBounds>({
    left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0
  });
  const [windowCenter, setWindowCenter] = useState({ x: 0, y: 0 });

  // Calculate window center
  useEffect(() => {
    const updateWindowCenter = () => {
      setWindowCenter({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    };

    updateWindowCenter();
    window.addEventListener("resize", updateWindowCenter);

    return () => {
      window.removeEventListener("resize", updateWindowCenter);
    };
  }, []);

  // Apply initial mouse position if provided
  useEffect(() => {
    if (initialMousePosition && initialMousePosition.isActive && enableMouseTracking) {
      mouseRef.current = {
        ...mouseRef.current,
        x: initialMousePosition.x,
        y: initialMousePosition.y,
        lastX: initialMousePosition.x,
        lastY: initialMousePosition.y,
        isOnScreen: true
      };
    }
  }, [initialMousePosition, enableMouseTracking]);

  // Calculate container bounds for hero mode
  useEffect(() => {
    if (!containerRef?.current || !canvasRef.current) return;

    const updatePositions = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const canvasRect = canvas.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Center of the container relative to canvas
      const centerX = containerRect.left + containerRect.width / 2 - canvasRect.left;
      const centerY = containerRect.top + containerRect.height / 2 - canvasRect.top;
      setCenterPosition({ x: centerX, y: centerY });

      // Container bounds relative to canvas
      setContainerBounds({
        left: containerRect.left - canvasRect.left,
        right: containerRect.right - canvasRect.left,
        top: containerRect.top - canvasRect.top,
        bottom: containerRect.bottom - canvasRect.top,
        width: containerRect.width,
        height: containerRect.height
      });
    };

    updatePositions();
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("resize", updatePositions);
    };
  }, [containerRef]);

  // Initialize stars
  const initStars = (canvas: HTMLCanvasElement) => {
    const stars: Star[] = [];
    const colors = getColorPalette(colorScheme, effectiveDarkMode, accentColor);

    // Calculate number of stars based on canvas size and density
    const { width, height } = canvas.getBoundingClientRect();
    const starCount = Math.floor((width * height) / 10000 * starDensity);

    // Get center point for distribution
    const centerX = containerRef?.current
      ? containerBounds.left + containerBounds.width / 2
      : width / 2;
    const centerY = containerRef?.current
      ? containerBounds.top + containerBounds.height / 2
      : height / 2;

    // Hero mode: Create stars in a more balanced distribution
    for (let i = 0; i < starCount; i++) {
      let x, y;

      // Distribution strategy - mix of random and edge-weighted
      const distributionType = Math.random();

      if (distributionType < 0.7) {
        // Random position across the canvas
        x = Math.random() * width;
        y = Math.random() * height;
      } else {
        // Edge-weighted distribution
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        switch(side) {
          case 0: // top
            x = Math.random() * width;
            y = Math.random() * (height / 4);
            break;
          case 1: // right
            x = width - Math.random() * (width / 4);
            y = Math.random() * height;
            break;
          case 2: // bottom
            x = Math.random() * width;
            y = height - Math.random() * (height / 4);
            break;
          case 3: // left
            x = Math.random() * (width / 4);
            y = Math.random() * height;
            break;
        }
      }

      const size = (0.5 + Math.random() * 1.5) * starSize;
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Calculate initial velocity - slightly biased toward center
      const dx = centerX - (x ?? 0);
      const dy = centerY - (y ?? 0);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Normalize and scale velocity
      const scale = 0.05 / (dist + 1);
      const vx = (Math.random() - 0.5) * 0.2 + dx * scale;
      const vy = (Math.random() - 0.5) * 0.2 + dy * scale;

      stars.push({
        x: x ?? 0,
        y: y ?? 0,
        size,
        color,
        vx,
        vy,
        originalX: x ?? 0,
        originalY: y ?? 0,
        targetVx: vx,
        targetVy: vy,
        mass: size,
        speed: Math.random() * 0.3 + 0.1
      });
    }

    return stars;
  };

  // Handle mouse movement
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current || !enableMouseTracking) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current.lastX = mouseRef.current.x;
    mouseRef.current.lastY = mouseRef.current.y;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.speedX = x - mouseRef.current.lastX;
    mouseRef.current.speedY = y - mouseRef.current.lastY;
    mouseRef.current.isOnScreen = true;
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (!enableMouseTracking) return;
    mouseRef.current.isOnScreen = false;
  };

  // Handle mouse click
  const handleMouseClick = (e: MouseEvent) => {
    if (!canvasRef.current || !enableMouseTracking) return;

    mouseRef.current.isClicked = true;
    mouseRef.current.clickTime = performance.now();

    // Create explosion at click point
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    explosionsRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: 50,
      startTime: performance.now(),
      duration: 1000
    });
  };

  // Animation loop for hero mode
  const animate = (now: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Calculate delta time
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Clear canvas with a slight fade effect for trails
    ctx.fillStyle = effectiveDarkMode
      ? "rgba(10, 10, 20, 0.1)"
      : "rgba(240, 240, 250, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update mouse position from props if available and tracking is enabled
    if (enableMouseTracking && initialMousePosition && initialMousePosition.isActive) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = initialMousePosition.x - rect.left;
      mouseRef.current.y = initialMousePosition.y - rect.top;
      mouseRef.current.isOnScreen = true;
    }

    // Update stars using hero-specific logic
    starsRef.current = starsRef.current.map(star =>
      updateHeroStar(
        star,
        canvas,
        mouseRef.current,
        centerPosition,
        containerBounds,
        deltaTime
      )
    );

    // Get connection color based on theme
    const connectionColor = accentColor
      ? `${accentColor}`
      : colorScheme === "purple"
        ? (effectiveDarkMode ? "rgba(147, 51, 234, 1)" : "rgba(168, 85, 247, 1)")
        : (effectiveDarkMode ? "rgba(59, 130, 246, 1)" : "rgba(96, 165, 250, 1)");

    // Draw connections between nearby stars
    drawStarConnections(
      ctx,
      starsRef.current,
      lineConnectionDistance,
      lineOpacity,
      connectionColor
    );

    // Draw stars
    starsRef.current.forEach(star => drawStar(ctx, star));

    // Draw mouse effect if mouse is on screen
    if (mouseRef.current.isOnScreen && enableMouseTracking) {
      drawMouseEffect(
        ctx,
        mouseRef.current.x,
        mouseRef.current.y,
        mouseEffectRadius,
        effectiveMouseEffectColor,
        mouseRef.current.isOnScreen
      );
    }

    // Update and draw explosions
    explosionsRef.current = drawExplosions(ctx, explosionsRef.current, now);

    // Request next frame
    animationRef.current = requestAnimationFrame(animate);
  };

  // Initialize canvas and start animation
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to match window
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Reinitialize stars when canvas is resized
      starsRef.current = initStars(canvas);
    };

    // Initial setup
    resizeCanvas();

    // Add event listeners
    window.addEventListener("resize", resizeCanvas);

    // Only add mouse event listeners if tracking is enabled
    if (enableMouseTracking) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
      canvas.addEventListener("click", handleMouseClick);
    }

    // Start animation
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);

      if (enableMouseTracking) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("click", handleMouseClick);
      }

      cancelAnimationFrame(animationRef.current);
    };
  }, [
    colorScheme,
    starDensity,
    starSize,
    lineConnectionDistance,
    lineOpacity,
    mouseEffectRadius,
    effectiveMouseEffectColor,
    effectiveDarkMode,
    enableMouseTracking,
    accentColor
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.starfieldCanvas}
    />
  );
};

export default HeroStarfield;
