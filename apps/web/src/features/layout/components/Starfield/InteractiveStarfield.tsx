// components/Layout/Starfield/InteractiveStarfield.tsx
import { useRef, useEffect, useState, FC } from "react";
import styles from "./starfield.module.css";
import { initBlackHoles, drawBlackHole } from "./blackHoles";
import { initEmployeeStars, updateEmployeeStars, checkEmployeeHover } from "./employeeStars";
import { DEFAULT_BLACK_HOLES, DEFAULT_EMPLOYEES } from "./constants";
import { EmployeeData, HoverInfo, MousePosition, Star, BlackHole, EmployeeStar } from "./types";
import EmployeeTooltip from "./employeeTooltip";
import { drawConnections, drawStars, initStars, updateStarPositions } from "./stars";

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
  flowStrength?: number;
  gravitationalPull?: number;
  particleSpeed?: number;
  employeeStarSize?: number;
  employeeDisplayStyle?: "initials" | "avatar" | "both";
  blackHoleSize?: number;
  heroMode?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
  lineConnectionDistance?: number;
  lineOpacity?: number;
  mouseEffectRadius?: number;
  mouseEffectColor?: string;
  initialMousePosition?: { x: number; y: number; isActive: boolean };
  isDarkMode?: boolean;
}

const InteractiveStarfield: FC<InteractiveStarfieldProps> = ({
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
  flowStrength = 1.0,
  gravitationalPull = 1.0,
  particleSpeed = 1.0,
  employeeStarSize = 1.0,
  employeeDisplayStyle = "initials",
  blackHoleSize = 1.0,
  heroMode = false,
  containerRef = null,
  lineConnectionDistance = 150,
  lineOpacity = 0.15,
  mouseEffectRadius = 150,
  mouseEffectColor = "rgba(255, 255, 255, 0.1)",
  initialMousePosition = null,
  isDarkMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [containerBounds, setContainerBounds] = useState({ left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 });
  const [centerPosition, setCenterPosition] = useState({ x: 0, y: 0 });

  // State for animation elements
  const [stars, setStars] = useState<Star[]>([]);
  const [blackHoles, setBlackHoles] = useState<BlackHole[]>([]);
  const [employeeStars, setEmployeeStars] = useState<EmployeeStar[]>([]);

  // Mouse interaction state
  const [mousePosition, setMousePosition] = useState<MousePosition>({
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

  // Employee hover state
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({
    employee: null,
    x: 0,
    y: 0,
    show: false
  });

  // Set up canvas and initialize elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const { innerWidth: width, innerHeight: height } = window;
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });

      // Update container bounds if in hero mode
      if (heroMode && containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerBounds({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        });
        setCenterPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }

      // Reinitialize all elements with new dimensions
      initializeElements(width, height);
    };

    // Initialize elements
    const initializeElements = (width: number, height: number) => {
      // Initialize stars
      const starCount = Math.floor(width * height * 0.00015 * starDensity);
      const newStars = initStars(
        width,
        height,
        starCount,
        sidebarWidth,
        centerOffsetX,
        centerOffsetY,
        starSize,
        colorScheme
      );
      setStars(newStars);

      // Initialize black holes
      const newBlackHoles = initBlackHoles(
        width,
        height,
        enableBlackHole,
        DEFAULT_BLACK_HOLES,
        sidebarWidth,
        centerOffsetX,
        centerOffsetY,
        blackHoleSize,
        particleSpeed,
        colorScheme,
        starSize
      );
      setBlackHoles(newBlackHoles);

      // Initialize employee stars
      const newEmployeeStars = initEmployeeStars(
        width,
        height,
        enableEmployeeStars,
        DEFAULT_EMPLOYEES,
        sidebarWidth,
        centerOffsetX,
        centerOffsetY,
        employeeStarSize
      );
      setEmployeeStars(newEmployeeStars);
    };

    // Handle mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition(prev => {
        const speedX = clientX - prev.x;
        const speedY = clientY - prev.y;
        return {
          x: clientX,
          y: clientY,
          lastX: prev.x,
          lastY: prev.y,
          speedX,
          speedY,
          isClicked: prev.isClicked,
          clickTime: prev.clickTime,
          isOnScreen: true
        };
      });
    };

    const handleMouseDown = () => {
      setMousePosition(prev => ({
        ...prev,
        isClicked: true,
        clickTime: Date.now()
      }));
    };

    const handleMouseUp = () => {
      setMousePosition(prev => ({
        ...prev,
        isClicked: false
      }));
    };

    const handleMouseLeave = () => {
      setMousePosition(prev => ({
        ...prev,
        isOnScreen: false
      }));
    };

    // Initial setup
    handleResize();

    // Add event listeners
    window.addEventListener("resize", handleResize);

    if (enableMouseInteraction) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);

      if (enableMouseInteraction) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }

      cancelAnimationFrame(animationRef.current);
    };
  }, [
    enableBlackHole,
    enableEmployeeStars,
    enableMouseInteraction,
    starDensity,
    colorScheme,
    starSize,
    sidebarWidth,
    centerOffsetX,
    centerOffsetY,
    blackHoleSize,
    particleSpeed,
    employeeStarSize,
    heroMode,
    containerRef
  ]);

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
  }, [initialMousePosition]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Check for employee hover if enabled
      if (enableEmployeeStars && enableMouseInteraction) {
        checkEmployeeHover(
          mousePosition.x,
          mousePosition.y,
          employeeStars,
          employeeStarSize,
          hoverInfo,
          setHoverInfo
        );
      }

      // Draw connections between stars (network effect) if in hero mode
      if (heroMode) {
        drawConnections(
          ctx,
          stars,
          lineConnectionDistance,
          lineOpacity,
          colorScheme
        );
      }

      // Update and draw stars
      updateStarPositions(
        stars,
        dimensions.width,
        dimensions.height,
        deltaTime,
        enableFlowEffect,
        flowStrength,
        mousePosition,
        enableMouseInteraction,
        blackHoles,
        gravitationalPull,
        heroMode,
        centerPosition,
        mouseEffectRadius
      );

      drawStars(ctx, stars);

      // Draw black holes if enabled
      if (enableBlackHole) {
        blackHoles.forEach(blackHole => {
          drawBlackHole(ctx, blackHole, deltaTime, particleSpeed);
        });
      }

      // Draw employee stars if enabled
      if (enableEmployeeStars) {
        updateEmployeeStars(
          ctx,
          employeeStars,
          deltaTime,
          employeeStarSize,
          employeeDisplayStyle
        );
      }

      // Draw mouse effect if mouse is on screen and interaction is enabled
      if (enableMouseInteraction && mousePosition.isOnScreen) {
        // Draw mouse effect (glowing circle)
        const gradient = ctx.createRadialGradient(
          mousePosition.x,
          mousePosition.y,
          0,
          mousePosition.x,
          mousePosition.y,
          mouseEffectRadius
        );

        gradient.addColorStop(0, mouseEffectColor);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, mouseEffectRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [
    dimensions,
    stars,
    blackHoles,
    employeeStars,
    mousePosition,
    enableFlowEffect,
    enableBlackHole,
    enableMouseInteraction,
    enableEmployeeStars,
    flowStrength,
    gravitationalPull,
    particleSpeed,
    employeeStarSize,
    employeeDisplayStyle,
    heroMode,
    centerPosition,
    hoverInfo,
    colorScheme,
    lineConnectionDistance,
    lineOpacity,
    mouseEffectRadius,
    mouseEffectColor
  ]);

  return (
    <>
      {/* Base starfield background with CSS-based stars */}
      <div className={`${styles.starfieldBackground} ${!isDarkMode ? styles.lightThemeStarfield : ""}`}></div>

      {/* Nebula overlay */}
      <div className={`${styles.nebulaOverlay} ${!isDarkMode ? styles.lightThemeNebula : ""}`}></div>

      {/* Phoenix accent */}
      <div className={`${styles.phoenixAccent} ${!isDarkMode ? styles.lightThemePhoenix : ""}`}></div>
      <canvas
        ref={canvasRef}
        className={styles.starfieldCanvas}
        aria-hidden="true"
      />

      {hoverInfo.show && hoverInfo.employee && (
        <EmployeeTooltip
          employee={hoverInfo.employee}
          x={hoverInfo.x}
          y={hoverInfo.y}
        />
      )}
    </>
  );
};

export default InteractiveStarfield;
