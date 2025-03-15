import React, { useEffect, useRef, useState } from "react";

interface EmployeeData {
  id: string;
  name: string;
  position: string;
  mass: number;
  color: string;
  image?: string;
}

interface InteractiveStarfieldProps {
  // Core functionality toggles
  enableFlowEffect: boolean;          // Toggle for the flow effect around content
  enableBlackHole: boolean;           // Toggle for the black hole effect
  enableMouseInteraction: boolean;    // Toggle for mouse interaction
  enableEmployeeStars: boolean;       // Toggle for special employee stars

  // Visual customization
  starDensity: number;                // Controls number of stars (0.5-3.0, default 1.0)
  colorScheme: "purple" | "blue" | "multicolor" | "white"; // Color scheme for stars
  starSize: number;                   // Base size multiplier for stars (0.5-2.0, default 1.0)

  // Black hole customization
  blackHolePositionY: number;         // Vertical position as percentage of screen height (0.0-1.0)
  blackHoleMass: number;              // Mass/strength of black hole (100-500, default 300)
  blackHoleParticles: number;         // Number of particles orbiting black hole (0-100)

  // Physics customization
  flowStrength: number;               // Strength of the flow effect (0.0-2.0, default 1.0)
  gravitationalPull: number;          // Strength of gravitational effects (0.0-2.0, default 1.0)
  particleSpeed: number;              // Speed of particle movement (0.5-2.0, default 1.0)

  // Employee stars customization
  employees?: EmployeeData[];         // List of employees to show as special stars
}

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  originalX: number;
  originalY: number;
}

interface EmployeeStar {
  employee: EmployeeData;
  x: number;
  y: number;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitCenterX: number;
  orbitCenterY: number;
  satellites: {
    angle: number;
    distance: number;
    speed: number;
    size: number;
    color: string;
  }[];
}

interface MousePosition {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  speedX: number;
  speedY: number;
  isClicked: boolean;
  clickTime: number;
  isOnScreen: boolean;
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  startTime: number;
  duration: number;
}

interface OrbitingParticle {
  x: number;
  y: number;
  angle: number;
  speed: number;
  distance: number;
  size: number;
  color: string;
}

interface HoverInfo {
  employee: EmployeeData | null;
  x: number;
  y: number;
  show: boolean;
}

const DEFAULT_EMPLOYEES: EmployeeData[] = [
  {
    id: "js",
    name: "JS",
    position: "Software Architect",
    mass: 100,
    color: "#60a5fa" // Blue
  },
  {
    id: "em",
    name: "EM",
    position: "CEO",
    mass: 200, // Bigger weight as requested
    color: "#f87171" // Red
  },
  {
    id: "ym",
    name: "YM",
    position: "CTO",
    mass: 100,
    color: "#4ade80" // Green
  }
];

const InteractiveStarfield: React.FC<InteractiveStarfieldProps> = ({
  // Default values for all parameters
  enableFlowEffect = true,
  enableBlackHole = true,
  enableMouseInteraction = true,
  enableEmployeeStars = true,
  starDensity = 1.0,
  colorScheme = "purple",
  starSize = 1.0,
  blackHolePositionY = 0.6,
  blackHoleMass = 300,
  blackHoleParticles = 50,
  flowStrength = 1.0,
  gravitationalPull = 1.0,
  particleSpeed = 1.0,
  employees = DEFAULT_EMPLOYEES
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
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
  const animationFrameRef = useRef<number>(0);
  const blackHoleRef = useRef({ x: 0, y: 0, mass: blackHoleMass });
  const timeRef = useRef(Date.now());
  const orbitingParticlesRef = useRef<OrbitingParticle[]>([]);
  const employeeStarsRef = useRef<EmployeeStar[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({
    employee: null,
    x: 0,
    y: 0,
    show: false
  });

  // Get color palette based on selected scheme
  const getColorPalette = () => {
    switch (colorScheme) {
      case "purple":
        return [
          "rgba(147, 51, 234, 0.9)",  // Purple
          "rgba(168, 85, 247, 0.9)",  // Light purple
          "rgba(139, 92, 246, 0.9)",  // Violet
          "rgba(196, 181, 253, 0.9)", // Lavender
          "rgba(255, 255, 255, 0.8)"  // White (for contrast)
        ];
      case "blue":
        return [
          "rgba(59, 130, 246, 0.9)",  // Blue
          "rgba(96, 165, 250, 0.9)",  // Light blue
          "rgba(37, 99, 235, 0.9)",   // Royal blue
          "rgba(191, 219, 254, 0.9)", // Sky blue
          "rgba(255, 255, 255, 0.8)"  // White (for contrast)
        ];
      case "multicolor":
        return [
          "rgba(239, 68, 68, 0.9)",   // Red
          "rgba(249, 115, 22, 0.9)",  // Orange
          "rgba(59, 130, 246, 0.9)",  // Blue
          "rgba(16, 185, 129, 0.9)",  // Green
          "rgba(147, 51, 234, 0.9)",  // Purple
          "rgba(255, 255, 255, 0.8)"  // White (for contrast)
        ];
      case "white":
        return [
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 255, 255, 0.8)",
          "rgba(255, 255, 255, 0.7)",
          "rgba(255, 255, 255, 0.6)",
          "rgba(255, 255, 255, 1.0)"
        ];
      default:
        return [
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 255, 255, 0.7)",
          "rgba(255, 255, 255, 0.5)"
        ];
    }
  };

  // Initialize employee stars
  const initEmployeeStars = (width: number, height: number) => {
    if (!enableEmployeeStars) return [];

    const employeeStars: EmployeeStar[] = [];
    const centerX = width / 2;
    const centerY = height * 0.5; // Center of the screen

    // Place employees in a circular pattern around the center
    employees.forEach((employee, index) => {
      const totalEmployees = employees.length;
      const angleStep = (Math.PI * 2) / totalEmployees;
      const baseAngle = index * angleStep;

      // Calculate orbit parameters
      const orbitRadius = 150 + (index * 20); // Different orbit radii
      const orbitSpeed = 0.00005 + (0.00002 * (index % 3)); // Different speeds

      // Calculate initial position
      const x = centerX + Math.cos(baseAngle) * orbitRadius;
      const y = centerY + Math.sin(baseAngle) * orbitRadius;

      // Create satellites (small particles orbiting the employee star)
      const satellites = [];
      const satelliteCount = 5 + Math.floor(employee.mass / 40); // More satellites for higher mass

      for (let i = 0; i < satelliteCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 10;
        const speed = 0.001 + Math.random() * 0.002;
        const size = 0.5 + Math.random() * 1;

        // Use employee color with transparency for satellites
        const color = employee.color ?
          `${employee.color}${Math.floor(Math.random() * 50 + 50).toString(16)}` : // Random transparency
          "rgba(255, 255, 255, 0.7)";

        satellites.push({
          angle,
          distance,
          speed,
          size,
          color
        });
      }

      employeeStars.push({
        employee,
        x,
        y,
        angle: baseAngle,
        orbitRadius,
        orbitSpeed,
        orbitCenterX: centerX,
        orbitCenterY: centerY,
        satellites
      });
    });

    return employeeStars;
  };

  // Initialize stars
  const initStars = (width: number, height: number) => {
    const stars: Star[] = [];
    // Adjust star count based on density parameter
    const starCount = Math.floor((width * height) / 2000 * starDensity);

    if (enableBlackHole) {
      // Calculate the position for the black hole
      const blackHoleX = width / 2;
      const blackHoleY = height * blackHolePositionY;

      // Set black hole position and mass
      blackHoleRef.current = {
        x: blackHoleX,
        y: blackHoleY,
        mass: blackHoleMass
      };

      // Initialize orbiting particles for the black hole
      if (blackHoleParticles > 0) {
        const orbitingParticles: OrbitingParticle[] = [];
        const colors = getColorPalette();

        for (let i = 0; i < blackHoleParticles; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 35 + Math.random() * 25;
          const speed = (0.0005 + Math.random() * 0.001) * particleSpeed;

          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = (0.5 + Math.random() * 1.5) * starSize;

          orbitingParticles.push({
            angle,
            distance,
            speed,
            x: blackHoleRef.current.x + Math.cos(angle) * distance,
            y: blackHoleRef.current.y + Math.sin(angle) * distance,
            size,
            color
          });
        }

        orbitingParticlesRef.current = orbitingParticles;
      }
    }

    // Initialize employee stars
    employeeStarsRef.current = initEmployeeStars(width, height);

    // Create stars
    const colors = getColorPalette();
    for (let i = 0; i < starCount; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;

      // Create a more interesting initial distribution if black hole is enabled
      if (enableBlackHole) {
        const distToBlackHole = Math.sqrt(
          Math.pow(x - blackHoleRef.current.x, 2) +
          Math.pow(y - blackHoleRef.current.y, 2)
        );

        // If too close to black hole, move it a bit
        if (distToBlackHole < 100 && Math.random() > 0.3) {
          const angle = Math.random() * Math.PI * 2;
          x = blackHoleRef.current.x + Math.cos(angle) * (100 + Math.random() * 50);
          y = blackHoleRef.current.y + Math.sin(angle) * (100 + Math.random() * 50);
        }
      }

      // Also avoid placing stars too close to employee stars
      if (enableEmployeeStars) {
        let tooClose = false;
        for (const empStar of employeeStarsRef.current) {
          const distToEmpStar = Math.sqrt(
            Math.pow(x - empStar.x, 2) +
            Math.pow(y - empStar.y, 2)
          );

          if (distToEmpStar < 30) {
            tooClose = true;
            break;
          }
        }

        if (tooClose && Math.random() > 0.2) {
          // Try a new position
          x = Math.random() * width;
          y = Math.random() * height;
        }
      }

      const size = (Math.random() * 2 + 0.7) * starSize;
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

  // Check if mouse is hovering over an employee star
  const checkEmployeeHover = (mouseX: number, mouseY: number) => {
    if (!enableEmployeeStars) return false;

    for (const empStar of employeeStarsRef.current) {
      const dist = Math.sqrt(
        Math.pow(mouseX - empStar.x, 2) +
        Math.pow(mouseY - empStar.y, 2)
      );

      if (dist < 20) { // Hover radius
        setHoverInfo({
          employee: empStar.employee,
          x: empStar.x,
          y: empStar.y,
          show: true
        });
        return true;
      }
    }

    // If we get here, we"re not hovering over any employee
    if (hoverInfo.show) {
      setHoverInfo(prev => ({ ...prev, show: false }));
    }
    return false;
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();

        canvas.width = width;
        canvas.height = height;

        setDimensions({ width, height });
        starsRef.current = initStars(width, height);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [starDensity, colorScheme, blackHolePositionY, blackHoleMass, blackHoleParticles, enableBlackHole, enableEmployeeStars, starSize]);

  // Handle mouse movement
  useEffect(() => {
    if (!enableMouseInteraction) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        mouseRef.current.lastX = mouseRef.current.x;
        mouseRef.current.lastY = mouseRef.current.y;
        mouseRef.current.x = x;
        mouseRef.current.y = y;
        mouseRef.current.speedX = mouseRef.current.x - mouseRef.current.lastX;
        mouseRef.current.speedY = mouseRef.current.y - mouseRef.current.lastY;
        mouseRef.current.isOnScreen = true;

        // Check if we"re hovering over an employee star
        checkEmployeeHover(x, y);
      }
    };

    const handleMouseDown = () => {
      mouseRef.current.isClicked = true;
      mouseRef.current.clickTime = Date.now();
    };

    const handleMouseUp = () => {
      mouseRef.current.isClicked = false;

      if (canvasRef.current && Date.now() - mouseRef.current.clickTime < 200) {
        // Create an explosion on click
        explosionsRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          radius: 0,
          maxRadius: 100,
          startTime: Date.now(),
          duration: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.isOnScreen = false;
      setHoverInfo(prev => ({ ...prev, show: false }));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enableMouseInteraction, enableEmployeeStars]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const now = Date.now();
      const deltaTime = now - timeRef.current;
      timeRef.current = now;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      starsRef.current.forEach(star => {
        // Reset acceleration
        let ax = 0;
        let ay = 0;

        // Apply gravitational pull toward black hole
        if (enableBlackHole) {
          const dx = blackHoleRef.current.x - star.x;
          const dy = blackHoleRef.current.y - star.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist > 5) {
            // Gravitational force
            const force = (blackHoleRef.current.mass / distSq) * gravitationalPull * 0.01;
            ax += dx / dist * force;
            ay += dy / dist * force;

            // If star is too close to black hole, reset it
            if (dist < 20) {
              star.x = Math.random() * canvas.width;
              star.y = Math.random() * canvas.height;
              star.vx = 0;
              star.vy = 0;
              star.originalX = star.x;
              star.originalY = star.y;
            }
          }
        }

        // Apply gravitational pull toward employee stars
        if (enableEmployeeStars) {
          for (const empStar of employeeStarsRef.current) {
            const dx = empStar.x - star.x;
            const dy = empStar.y - star.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist > 10 && dist < 200) {
              // Gravitational force based on employee mass
              const force = (empStar.employee.mass / distSq) * gravitationalPull * 0.005;
              ax += dx / dist * force;
              ay += dy / dist * force;
            }
          }
        }

        // Apply flow effect around the content area if enabled
        if (enableFlowEffect) {
          const contentAreaX = canvas.width / 2;
          const contentAreaY = canvas.height * 0.5; // Center of content area
          const contentAreaRadius = 200; // Approximate radius of content area

          const dxContent = star.x - contentAreaX;
          const dyContent = star.y - contentAreaY;
          const distContent = Math.sqrt(dxContent * dxContent + dyContent * dyContent);

          if (distContent < contentAreaRadius * 1.5 && distContent > contentAreaRadius * 0.8) {
            // Calculate tangential velocity components for flowing around content
            const tangentialFactor = 0.01 * flowStrength *
              (1 - Math.abs(distContent - contentAreaRadius) / (contentAreaRadius * 0.5));
            const perpX = -dyContent / distContent;
            const perpY = dxContent / distContent;

            // Apply tangential force for flowing (clockwise or counter-clockwise depending on position)
            const direction = star.y < contentAreaY ? 1 : -1;
            ax += perpX * tangentialFactor * direction;
            ay += perpY * tangentialFactor * direction;
          }
        }

        // Apply mouse interaction if enabled and mouse is on screen
        if (enableMouseInteraction && mouseRef.current.isOnScreen) {
          const dx = mouseRef.current.x - star.x;
          const dy = mouseRef.current.y - star.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < 200) {
            // Push stars away from mouse
            const force = (200 - dist) / 200 * 0.05;
            ax -= dx / dist * force;
            ay -= dy / dist * force;

            // Add some of the mouse"s velocity
            star.vx += mouseRef.current.speedX * 0.01;
            star.vy += mouseRef.current.speedY * 0.01;
          }
        }

        // Update velocity with acceleration
        star.vx += ax;
        star.vy += ay;

        // Apply drag to slow down stars over time
        star.vx *= 0.99;
        star.vy *= 0.99;

        // Apply a slight pull back to original position
        const homeForce = 0.0001;
        star.vx += (star.originalX - star.x) * homeForce;
        star.vy += (star.originalY - star.y) * homeForce;

        // Update position
        star.x += star.vx * particleSpeed;
        star.y += star.vy * particleSpeed;

        // Wrap around screen edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
      });

      // Update and draw employee stars
      if (enableEmployeeStars) {
        employeeStarsRef.current.forEach(empStar => {
          // Update position based on orbit
          empStar.angle += empStar.orbitSpeed * deltaTime;
          empStar.x = empStar.orbitCenterX + Math.cos(empStar.angle) * empStar.orbitRadius;
          empStar.y = empStar.orbitCenterY + Math.sin(empStar.angle) * empStar.orbitRadius;

          // Update and draw satellites
          empStar.satellites.forEach(satellite => {
            satellite.angle += satellite.speed * deltaTime;
            const satX = empStar.x + Math.cos(satellite.angle) * satellite.distance;
            const satY = empStar.y + Math.sin(satellite.angle) * satellite.distance;

            ctx.beginPath();
            ctx.arc(satX, satY, satellite.size, 0, Math.PI * 2);
            ctx.fillStyle = satellite.color;
            ctx.fill();
          });

          // Draw employee star
          const gradient = ctx.createRadialGradient(
            empStar.x, empStar.y, 0,
            empStar.x, empStar.y, 20
          );

          // Use employee color for the gradient
          const baseColor = empStar.employee.color || "#ffffff";
          gradient.addColorStop(0, baseColor);
          gradient.addColorStop(0.7, `${baseColor}80`); // 50% opacity
          gradient.addColorStop(1, `${baseColor}00`); // 0% opacity

          ctx.beginPath();
          ctx.arc(empStar.x, empStar.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Draw employee initials
          ctx.font = "bold 10px Arial";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(empStar.employee.name, empStar.x, empStar.y);
        });
      }

      // Update and draw orbiting particles
      if (enableBlackHole && blackHoleParticles > 0) {
        orbitingParticlesRef.current.forEach(particle => {
          // Update angle based on speed
          particle.angle += particle.speed * deltaTime * particleSpeed;

          // Update position
          particle.x = blackHoleRef.current.x + Math.cos(particle.angle) * particle.distance;
          particle.y = blackHoleRef.current.y + Math.sin(particle.angle) * particle.distance;

          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
        });

        // Draw black hole
        const gradient = ctx.createRadialGradient(
          blackHoleRef.current.x, blackHoleRef.current.y, 0,
          blackHoleRef.current.x, blackHoleRef.current.y, 30
        );

        gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        gradient.addColorStop(0.7, "rgba(20, 20, 20, 0.8)");
        gradient.addColorStop(1, "rgba(20, 20, 20, 0)");

        ctx.beginPath();
        ctx.arc(blackHoleRef.current.x, blackHoleRef.current.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Update and draw explosions
      explosionsRef.current = explosionsRef.current.filter(explosion => {
        const elapsed = now - explosion.startTime;
        if (elapsed > explosion.duration) return false;

        const progress = elapsed / explosion.duration;
        const radius = explosion.maxRadius * progress;
        const opacity = 1 - progress;

        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableBlackHole, enableFlowEffect, enableMouseInteraction, enableEmployeeStars, flowStrength, gravitationalPull, particleSpeed]);
  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10
        }}
      />

      {/* Employee hover tooltip */}
      {hoverInfo.show && hoverInfo.employee && (
        <div
          style={{
            position: "fixed",
            left: `${hoverInfo.x + 20}px`,
            top: `${hoverInfo.y + 20}px`,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 20,
            pointerEvents: "none",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            border: `1px solid ${hoverInfo.employee.color || "#ffffff"}`
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
            {hoverInfo.employee.name}
          </div>
          <div>{hoverInfo.employee.position}</div>
          {hoverInfo.employee.image && (
            <img
              src={hoverInfo.employee.image}
              alt={hoverInfo.employee.name}
              style={{ width: "50px", height: "50px", borderRadius: "50%", marginTop: "5px" }}
            />
          )}
        </div>
      )}
    </>
  );
};
