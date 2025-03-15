// renderer.ts
import { Star, BlackHole, EmployeeStar, Explosion, MousePosition } from "./types";
import { calculateCenter } from "./utils";

// Draw a single star
export const drawStar = (ctx: CanvasRenderingContext2D, star: Star) => {
  ctx.beginPath();
  ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
  ctx.fillStyle = star.color;
  ctx.fill();
};

// Draw a black hole and its particles
export const drawBlackHole = (
  ctx: CanvasRenderingContext2D,
  blackHole: BlackHole,
  deltaTime: number,
  particleSpeed: number
) => {
  // Update and draw orbiting particles
  blackHole.particles.forEach(particle => {
    // Update angle based on speed
    particle.angle += particle.speed * deltaTime * particleSpeed;

    // Update position
    particle.x = blackHole.x + Math.cos(particle.angle) * particle.distance;
    particle.y = blackHole.y + Math.sin(particle.angle) * particle.distance;

    // Draw particle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
  });

  // Draw black hole
  const gradient = ctx.createRadialGradient(
    blackHole.x, blackHole.y, 0,
    blackHole.x, blackHole.y, blackHole.size
  );

  gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
  gradient.addColorStop(0.7, "rgba(20, 20, 20, 0.8)");
  gradient.addColorStop(1, "rgba(20, 20, 20, 0)");

  ctx.beginPath();
  ctx.arc(blackHole.x, blackHole.y, blackHole.size, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
};

// Draw an employee star with its satellites
export const drawEmployeeStar = (
  ctx: CanvasRenderingContext2D,
  empStar: EmployeeStar,
  deltaTime: number,
  employeeStarSize: number,
  employeeDisplayStyle: "initials" | "avatar" | "both"
) => {
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

  const starSize = 12 * employeeStarSize;
  const baseColor = empStar.employee.color || "#ffffff";

  // Draw employee star with glow effect
  const glowGradient = ctx.createRadialGradient(
    empStar.x, empStar.y, 0,
    empStar.x, empStar.y, starSize * 1.5
  );

  glowGradient.addColorStop(0, baseColor);
  glowGradient.addColorStop(0.5, `${baseColor}40`); // 25% opacity
  glowGradient.addColorStop(1, `${baseColor}00`); // 0% opacity

  ctx.beginPath();
  ctx.arc(empStar.x, empStar.y, starSize * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.fill();

  // Inner star
  const gradient = ctx.createRadialGradient(
    empStar.x, empStar.y, 0,
    empStar.x, empStar.y, starSize
  );

  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(0.7, `${baseColor}80`); // 50% opacity
  gradient.addColorStop(1, `${baseColor}20`); // 12% opacity

  ctx.beginPath();
  ctx.arc(empStar.x, empStar.y, starSize, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw employee representation based on display style
  if (employeeDisplayStyle === "avatar" && empStar.employee.image) {
    // Create a circular clip path for the avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(empStar.x, empStar.y, starSize * 0.8, 0, Math.PI * 2);
    ctx.clip();

    // Create image element and draw when loaded
    const img = new Image();
    img.src = empStar.employee.image;

    // Only draw if the image is already loaded
    if (img.complete) {
      const imgSize = starSize * 1.6;
      ctx.drawImage(img, empStar.x - imgSize/2, empStar.y - imgSize/2, imgSize, imgSize);
    } else {
      // If image not loaded, draw initials as fallback
      ctx.font = `bold ${Math.floor(10 * employeeStarSize)}px Arial`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(empStar.employee.name, empStar.x, empStar.y);
    }

    ctx.restore();
  } else if (employeeDisplayStyle === "both" && empStar.employee.image) {
    // Draw smaller avatar with name below
    ctx.save();
    ctx.beginPath();
    ctx.arc(empStar.x, empStar.y - starSize * 0.3, starSize * 0.6, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.src = empStar.employee.image;

    if (img.complete) {
      const imgSize = starSize * 1.2;
      ctx.drawImage(img, empStar.x - imgSize/2, empStar.y - starSize * 0.3 - imgSize/2, imgSize, imgSize);
    }

    ctx.restore();

    // Draw name below
    ctx.font = `bold ${Math.floor(8 * employeeStarSize)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(empStar.employee.name, empStar.x, empStar.y + starSize * 0.5);
  } else {
    // Default: just draw initials
    ctx.font = `bold ${Math.floor(10 * employeeStarSize)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(empStar.employee.name, empStar.x, empStar.y);
  }
};

// Draw explosions
export const drawExplosions = (
  ctx: CanvasRenderingContext2D,
  explosions: Explosion[],
  now: number
): Explosion[] => {
  return explosions.filter(explosion => {
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
};

// Calculate forces and update star positions
export const updateStar = (
  star: Star,
  canvas: HTMLCanvasElement,
  blackHoles: BlackHole[],
  employeeStars: EmployeeStar[],
  mouseRef: MousePosition,
  enableBlackHole: boolean,
  enableEmployeeStars: boolean,
  enableFlowEffect: boolean,
  enableMouseInteraction: boolean,
  gravitationalPull: number,
  flowStrength: number,
  particleSpeed: number,
  sidebarWidth: number,
  centerOffsetX: number,
  centerOffsetY: number
) => {
  // Reset acceleration
  let ax = 0;
  let ay = 0;

  // Apply gravitational pull toward black holes
  if (enableBlackHole) {
    for (const blackHole of blackHoles) {
      const dx = blackHole.x - star.x;
      const dy = blackHole.y - star.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      if (dist > 5) {
        // Gravitational force
        const force = (blackHole.mass / distSq) * gravitationalPull * 0.01;
        ax += dx / dist * force;
        ay += dy / dist * force;

        // If star is too close to black hole, reset it
        if (dist < blackHole.size * 0.8) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.vx = 0;
          star.vy = 0;
          star.originalX = star.x;
          star.originalY = star.y;
        }
      }
    }
  }

  // Apply gravitational pull toward employee stars
  if (enableEmployeeStars) {
    for (const empStar of employeeStars) {
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
    const { centerX, centerY } = calculateCenter(
      canvas.width, canvas.height, sidebarWidth, centerOffsetX, centerOffsetY
    );
    const contentAreaRadius = 150; // Approximate radius of content area

    const dxContent = star.x - centerX;
    const dyContent = star.y - centerY;
    const distContent = Math.sqrt(dxContent * dxContent + dyContent * dyContent);

    if (distContent < contentAreaRadius * 1.5 && distContent > contentAreaRadius * 0.8) {
      // Calculate tangential velocity components for flowing around content
      const tangentialFactor = 0.01 * flowStrength *
        (1 - Math.abs(distContent - contentAreaRadius) / (contentAreaRadius * 0.5));
      const perpX = -dyContent / distContent;
      const perpY = dxContent / distContent;

      // Apply tangential force for flowing (clockwise or counter-clockwise depending on position)
      const direction = star.y < centerY ? 1 : -1;
      ax += perpX * tangentialFactor * direction;
      ay += perpY * tangentialFactor * direction;
    }
  }

  // Apply mouse interaction if enabled and mouse is on screen
  if (enableMouseInteraction && mouseRef.isOnScreen) {
    const dx = mouseRef.x - star.x;
    const dy = mouseRef.y - star.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist < 200) {
      // Push stars away from mouse
      const force = (200 - dist) / 200 * 0.05;
      ax -= dx / dist * force;
      ay -= dy / dist * force;

      // Add some of the mouse"s velocity
      star.vx += mouseRef.speedX * 0.01;
      star.vy += mouseRef.speedY * 0.01;
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

  return star;
};
