import { FC, memo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroAnimations } from "../../animations";
import { DEFAULT_HERO_CONTENT } from "../../constants";
import styles from "./hero.module.css";
import type { HeroProps } from "../../types";
import { useSectionObserver } from "@/hooks/useSectionObserver";

const Hero: FC<HeroProps> = memo(
  ({
    title = DEFAULT_HERO_CONTENT.title,
    subtitle = DEFAULT_HERO_CONTENT.subtitle,
    primaryCta = DEFAULT_HERO_CONTENT.primaryCta,
    secondaryCta = DEFAULT_HERO_CONTENT.secondaryCta,
    isLoading = false,
  }) => {
    const sectionRef = useSectionObserver("home", (id) => {
      console.log(`[Home] Section "${id}" is now visible`);
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
    const [prevMousePosition, setPrevMousePosition] = useState({ x: -1000, y: -1000 });
    const [isMouseInCanvas, setIsMouseInCanvas] = useState(false);
    const [centerPosition, setCenterPosition] = useState({ x: 0, y: 0 });
    const [containerBounds, setContainerBounds] = useState({
      left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0
    });

    // Calculate center position and container bounds
    useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return;

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
    }, []);

    // Star field effect
    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match container
      const resizeCanvas = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();

      // Colors - improved to match Phoenix VC theme
      const colors = {
        nodeColor: "rgba(147, 51, 234, 0.7)", // Purple (matches Phoenix branding)
        lineColor: "rgba(147, 51, 234, 0.25)",
        mouseEffectColor: "rgba(147, 51, 234, 0.15)"
      };

      // Star/Node class with momentum preservation
      class Star {
        x: number;
        y: number;
        vx: number;
        vy: number;
        targetVx: number;
        targetVy: number;
        radius: number;
        color: string;
        mass: number;
        speed: number;

        constructor(x: number, y: number, color: string) {
          this.x = x;
          this.y = y;
          // Initial velocity
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = (Math.random() - 0.5) * 0.2;
          // Target velocity (for smooth transitions)
          this.targetVx = this.vx;
          this.targetVy = this.vy;
          this.radius = Math.random() * 1.5 + 0.8;
          this.color = color;
          this.mass = this.radius;
          this.speed = Math.random() * 0.3 + 0.1; // Variable speed for natural movement
        }

        update(
          width: number,
          height: number,
          mouseX: number,
          mouseY: number,
          prevMouseX: number,
          prevMouseY: number,
          isMouseActive: boolean,
          centerX: number,
          centerY: number,
          containerBounds: { left: number, right: number, top: number, bottom: number, width: number, height: number },
          deltaTime: number
        ) {
          // Calculate forces but don"t apply them directly - set them as targets

          // Calculate distance to center
          const dxCenter = centerX - this.x;
          const dyCenter = centerY - this.y;
          const distanceToCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

          // Calculate distance to mouse
          const dxMouse = mouseX - this.x;
          const dyMouse = mouseY - this.y;
          const distanceToMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          // Reset target velocity (will be recalculated)
          this.targetVx = this.vx * 0.95; // Natural deceleration
          this.targetVy = this.vy * 0.95;

          // Default behavior: gravitate toward center
          if (distanceToCenter > 5) {
            // Smooth, gradual attraction to center
            const centerGravity = 0.01;
            this.targetVx += (dxCenter / distanceToCenter) * centerGravity * this.speed;
            this.targetVy += (dyCenter / distanceToCenter) * centerGravity * this.speed;
          }

          // Mouse gravity (stronger than center gravity)
          if (isMouseActive && distanceToMouse > 5) {
            // Strong but smooth attraction to mouse
            const mouseGravity = 0.04; // 4x stronger than center gravity
            this.targetVx += (dxMouse / distanceToMouse) * mouseGravity * this.speed;
            this.targetVy += (dyMouse / distanceToMouse) * mouseGravity * this.speed;
          }

          // Smoothly interpolate current velocity toward target velocity
          // This creates momentum and prevents abrupt changes
          const lerpFactor = 0.03; // Lower = smoother transitions
          this.vx += (this.targetVx - this.vx) * lerpFactor;
          this.vy += (this.targetVy - this.vy) * lerpFactor;

          // Limit velocity for controlled movement
          const maxVel = 1.5;
          const vel = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (vel > maxVel) {
            this.vx = (this.vx / vel) * maxVel;
            this.vy = (this.vy / vel) * maxVel;
          }

          // Apply velocity (scaled by deltaTime for consistent speed)
          const timeScale = deltaTime / 16.67; // Normalize to 60fps
          this.x += this.vx * timeScale;
          this.y += this.vy * timeScale;

          // Check if star has reached the event horizon (container border)
          const isInsideContainer =
            this.x > containerBounds.left &&
            this.x < containerBounds.right &&
            this.y > containerBounds.top &&
            this.y < containerBounds.bottom;

          // If star has reached event horizon, reset it to a random edge position
          if (isInsideContainer) {
            // Reset to a random position on the edge of the canvas
            const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

            switch(side) {
              case 0: // top
                this.x = Math.random() * width;
                this.y = 0;
                break;
              case 1: // right
                this.x = width;
                this.y = Math.random() * height;
                break;
              case 2: // bottom
                this.x = Math.random() * width;
                this.y = height;
                break;
              case 3: // left
                this.x = 0;
                this.y = Math.random() * height;
                break;
            }

            // Reset velocity with slight bias toward center
            const angle = Math.atan2(centerY - this.y, centerX - this.x);
            this.vx = Math.cos(angle) * this.speed * 0.3;
            this.vy = Math.sin(angle) * this.speed * 0.3;
            this.targetVx = this.vx;
            this.targetVy = this.vy;
          }

          // Bounce off canvas edges with momentum preservation
          if (this.x < 0) {
            this.x = 0;
            this.vx *= -0.7;
            this.targetVx *= -0.7;
          } else if (this.x > width) {
            this.x = width;
            this.vx *= -0.7;
            this.targetVx *= -0.7;
          }

          if (this.y < 0) {
            this.y = 0;
            this.vy *= -0.7;
            this.targetVy *= -0.7;
          } else if (this.y > height) {
            this.y = height;
            this.vy *= -0.7;
            this.targetVy *= -0.7;
          }
        }

        draw(ctx: CanvasRenderingContext2D) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      // Create stars
      const { width, height } = canvas.getBoundingClientRect();
      const starCount = Math.floor((width * height) / 8000);
      const stars: Star[] = [];

      for (let i = 0; i < starCount; i++) {
        // Create stars around the edges, not in the center
        let x, y;
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

        stars.push(new Star(x ?? 0, y ?? 0, colors.nodeColor));
      }

      // Mouse effect visualization
      const drawMouseEffect = (x: number, y: number) => {
        if (!ctx || !isMouseInCanvas) return;

        // Gradient at mouse position
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 200);
        gradient.addColorStop(0, colors.mouseEffectColor);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(x, y, 200, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      };

      // Track mouse position with history
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Store previous position before updating
        setPrevMousePosition(mousePosition);
        setMousePosition({ x, y });
      };

      const handleMouseEnter = () => {
        setIsMouseInCanvas(true);
      };

      const handleMouseLeave = () => {
        setIsMouseInCanvas(false);
      };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseenter", handleMouseEnter);
      canvas.addEventListener("mouseleave", handleMouseLeave);

      // Animation variables for delta time calculation
      let lastFrameTime = 0;

      // Animation loop
      const animate = (currentTime: number) => {
        if (!ctx || !canvas) return;

        // Calculate delta time for smooth animation
        const deltaTime = currentTime - lastFrameTime || 16.67; // Default to 60fps if first frame
        lastFrameTime = currentTime;

        const { width, height } = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, width, height);

        // Draw mouse gravitational field
        drawMouseEffect(mousePosition.x, mousePosition.y);

        // Update and draw stars
        stars.forEach(star => {
          star.update(
            width,
            height,
            mousePosition.x,
            mousePosition.y,
            prevMousePosition.x,
            prevMousePosition.y,
            isMouseInCanvas,
            centerPosition.x,
            centerPosition.y,
            containerBounds,
            deltaTime
          );
          star.draw(ctx);
        });

        // Draw connections between nearby stars
        ctx.strokeStyle = colors.lineColor;
        ctx.lineWidth = 0.6;

        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only connect stars within a certain distance
            if (distance < 100) {
              // Fade lines based on distance
              ctx.globalAlpha = 1 - (distance / 100);
              ctx.beginPath();
              ctx.moveTo(stars[i].x, stars[i].y);
              ctx.lineTo(stars[j].x, stars[j].y);
              ctx.stroke();
            }
          }
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseenter", handleMouseEnter);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        cancelAnimationFrame(animationId);
      };
    }, [mousePosition, prevMousePosition, isMouseInCanvas, centerPosition, containerBounds]);

    return (
      <section
        className={styles.heroSection}
        ref={sectionRef}
        aria-label="hero section"
      >
        {/* Full page background */}
        <div className={styles.heroBackground} />

        {/* Network canvas background with mouse interaction */}
        <canvas ref={canvasRef} className={styles.networkCanvas} />

        <div className={styles.heroContainer} ref={containerRef}>
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                className={styles.heroContent}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={heroAnimations.container}
              >
                {/* Title with gradient text */}
                <motion.h1
                  className={styles.heroTitle}
                  variants={heroAnimations.item}
                >
                  {title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className={styles.heroSubtitle}
                  variants={heroAnimations.item}
                >
                  {subtitle}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  className={styles.heroButtonContainer}
                  variants={heroAnimations.item}
                >
                  <button className={`${styles.heroButton} ${styles.heroPrimaryButton}`}>
                    {primaryCta.text}
                  </button>

                  <button className={`${styles.heroButton} ${styles.heroSecondaryButton}`}>
                    {secondaryCta.text}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className={styles.heroLoading}>
              <div className={styles.heroSpinner} />
            </div>
          )}
        </div>
      </section>
    );
  }
);

Hero.displayName = "Hero";
export default Hero;
