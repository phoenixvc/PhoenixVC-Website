// components/Layout/Starfield/InteractiveStarfield.tsx
import React, { useRef, useEffect, useState } from "react";
import { Star, BlackHole, EmployeeStar, Explosion, MousePosition, BlackHoleData, EmployeeData } from "./types";
import { drawStar, drawBlackHole, drawEmployeeStar, drawExplosions, updateStar } from "./renderer";
import { initBlackHoles, initEmployeeStars } from "./utils";
import { DEFAULT_BLACK_HOLES, DEFAULT_EMPLOYEES, getColorPalette } from "./constants";
import styles from "./interactiveStarfield.module.css";

interface InteractiveStarfieldProps {
  enableFlowEffect?: boolean;
  enableBlackHole?: boolean;
  enableMouseInteraction?: boolean;
  enableEmployeeStars?: boolean;
  starDensity?: number;
  colorScheme?: string;
  starSize?: number;
  sidebarWidth?: number;
  centerOffsetX?: number;
  centerOffsetY?: number;
  blackHoles?: BlackHoleData[];
  blackHoleSize?: number;
  flowStrength?: number;
  gravitationalPull?: number;
  particleSpeed?: number;
  employees?: EmployeeData[];
  employeeStarSize?: number;
  employeeDisplayStyle?: "initials" | "avatar" | "both";
  isDarkMode?: boolean;
  isCollapsed?: boolean;
}

const InteractiveStarfield: React.FC<InteractiveStarfieldProps> = ({
  enableFlowEffect = true,
  enableBlackHole = true,
  enableMouseInteraction = true,
  enableEmployeeStars = true,
  starDensity = 0.8,
  colorScheme = "purple",
  starSize = 1.0,
  sidebarWidth: propSidebarWidth,
  centerOffsetX = 0,
  centerOffsetY = 0,
  blackHoles = DEFAULT_BLACK_HOLES,
  blackHoleSize = 1.0,
  flowStrength = 1.0,
  gravitationalPull = 1.0,
  particleSpeed = 1.0,
  employees = DEFAULT_EMPLOYEES,
  employeeStarSize = 1.0,
  employeeDisplayStyle = "initials",
  isDarkMode = true,
  isCollapsed = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const blackHolesRef = useRef<BlackHole[]>([]);
  const employeeStarsRef = useRef<EmployeeStar[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef<MousePosition>({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    speedX: 0,
    speedY: 0,
    isClicked: false,
    clickTime: 0,
    isOnScreen: false
  });

  // Calculate sidebar width based on props and layout state
  const [effectiveSidebarWidth, setEffectiveSidebarWidth] = useState(propSidebarWidth || 0);

  // Update sidebar width when the sidebar state changes
  useEffect(() => {
    // If sidebar width is provided as a prop, use that
    if (propSidebarWidth !== undefined) {
      setEffectiveSidebarWidth(propSidebarWidth);
    } else {
      // Otherwise, calculate based on collapsed state
      // These values should match your layout"s sidebar widths
      setEffectiveSidebarWidth(isCollapsed ? 60 : 220);
    }
  }, [propSidebarWidth, isCollapsed]);

  // Initialize stars
  const initStars = (canvas: HTMLCanvasElement) => {
    const stars: Star[] = [];
    const colors = getColorPalette(colorScheme);

    // Calculate number of stars based on canvas size and density
    const starCount = Math.floor((canvas.width * canvas.height) / 10000 * starDensity);

    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = (0.5 + Math.random() * 1.5) * starSize;
      const color = colors[Math.floor(Math.random() * colors.length)];

      stars.push({
        x,
        y,
        size,
        color,
        vx: 0,
        vy: 0,
        originalX: x,
        originalY: y
      });
    }

    return stars;
  };

  // Handle mouse movement
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current) return;

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
    mouseRef.current.isOnScreen = false;
  };

  // Handle mouse click
  const handleMouseClick = (e: MouseEvent) => {
    if (!canvasRef.current) return;

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

  // Animation loop
  const animate = (now: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Calculate delta time
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Clear canvas with a slight fade effect for trails
    ctx.fillStyle = isDarkMode ? "rgba(10, 10, 20, 0.1)" : "rgba(240, 240, 250, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw stars
    starsRef.current = starsRef.current.map(star =>
      updateStar(
        star,
        canvas,
        blackHolesRef.current,
        employeeStarsRef.current,
        mouseRef.current,
        enableBlackHole,
        enableEmployeeStars,
        enableFlowEffect,
        enableMouseInteraction,
        gravitationalPull,
        flowStrength,
        particleSpeed,
        effectiveSidebarWidth,
        centerOffsetX,
        centerOffsetY
      )
    );

    starsRef.current.forEach(star => drawStar(ctx, star));

    // Update and draw black holes
    if (enableBlackHole) {
      blackHolesRef.current.forEach(blackHole =>
        drawBlackHole(ctx, blackHole, deltaTime, particleSpeed)
      );
    }

    // Update and draw employee stars
    if (enableEmployeeStars) {
      employeeStarsRef.current.forEach(empStar =>
        drawEmployeeStar(ctx, empStar, deltaTime, employeeStarSize, employeeDisplayStyle)
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reinitialize stars when canvas is resized
      starsRef.current = initStars(canvas);

      // Reinitialize black holes
      blackHolesRef.current = initBlackHoles(
        canvas.width,
        canvas.height,
        enableBlackHole,
        blackHoles,
        effectiveSidebarWidth,
        centerOffsetX,
        centerOffsetY,
        blackHoleSize,
        particleSpeed,
        colorScheme,
        starSize
      );

      // Reinitialize employee stars
      employeeStarsRef.current = initEmployeeStars(
        canvas.width,
        canvas.height,
        enableEmployeeStars,
        employees,
        effectiveSidebarWidth,
        centerOffsetX,
        centerOffsetY,
        employeeStarSize
      );
    };

    // Initial setup
    resizeCanvas();

    // Add event listeners
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleMouseClick);

    // Start animation
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleMouseClick);
      cancelAnimationFrame(animationRef.current);
    };
  }, [
    enableBlackHole,
    enableEmployeeStars,
    blackHoles,
    employees,
    starDensity,
    colorScheme,
    starSize,
    blackHoleSize,
    employeeStarSize,
    employeeDisplayStyle,
    effectiveSidebarWidth
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.starfieldCanvas}
    />
  );
};

export default InteractiveStarfield;
