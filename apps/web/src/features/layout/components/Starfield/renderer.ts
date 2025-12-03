// components/Layout/Starfield/renderer.ts
import { BlackHole, CenterPosition, ContainerBounds, Explosion, MousePosition, Planet, Star } from "./types";
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
    blackHole.x, blackHole.y, blackHole.radius
  );

  gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
  gradient.addColorStop(0.7, "rgba(20, 20, 20, 0.8)");
  gradient.addColorStop(1, "rgba(20, 20, 20, 0)");

  ctx.beginPath();
  ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
};

// Draw an employee star with its satellites
// export const drawPlanet = (
//     ctx: CanvasRenderingContext2D,
//     empStar: Planet,
//     deltaTime: number,
//     planetSize: number,
//     employeeDisplayStyle: "initials" | "avatar" | "both"
//   ): void => {
//     // Update position based on orbit
//     empStar.angle += empStar.orbitSpeed * deltaTime;
//     empStar.x = empStar.orbitCenter.x + Math.cos(empStar.angle) * empStar.orbitRadius;
//     empStar.y = empStar.orbitCenter.y + Math.sin(empStar.angle) * empStar.orbitRadius;

//     // Update and draw satellites
//     empStar.satellites.forEach(satellite => {
//       satellite.angle += satellite.speed * deltaTime;
//       const satX = empStar.x + Math.cos(satellite.angle) * satellite.distance;
//       const satY = empStar.y + Math.sin(satellite.angle) * satellite.distance;

//       ctx.beginPath();
//       ctx.arc(satX, satY, satellite.size, 0, Math.PI * 2);
//       ctx.fillStyle = satellite.color;
//       ctx.fill();
//     });

//     const starSize = 12 * planetSize;
//     const baseColor = empStar.employee.color || "#ffffff";

//     // Draw employee star with glow effect
//     const glowGradient = ctx.createRadialGradient(
//       empStar.x, empStar.y, 0,
//       empStar.x, empStar.y, starSize * 1.5
//     );

//     glowGradient.addColorStop(0, baseColor);
//     glowGradient.addColorStop(0.5, `${baseColor}40`); // 25% opacity
//     glowGradient.addColorStop(1, `${baseColor}00`); // 0% opacity

//     ctx.beginPath();
//     ctx.arc(empStar.x, empStar.y, starSize * 1.5, 0, Math.PI * 2);
//     ctx.fillStyle = glowGradient;
//     ctx.fill();

//     // Inner star
//     const gradient = ctx.createRadialGradient(
//       empStar.x, empStar.y, 0,
//       empStar.x, empStar.y, starSize
//     );

//     gradient.addColorStop(0, baseColor);
//     gradient.addColorStop(0.7, `${baseColor}80`); // 50% opacity
//     gradient.addColorStop(1, `${baseColor}20`); // 12% opacity

//     ctx.beginPath();
//     ctx.arc(empStar.x, empStar.y, starSize, 0, Math.PI * 2);
//     ctx.fillStyle = gradient;
//     ctx.fill();

//     // Draw employee representation based on display style
//     if (employeeDisplayStyle === "avatar" && empStar.employee.image) {
//       // Create a circular clip path for the avatar
//       ctx.save();
//       ctx.beginPath();
//       ctx.arc(empStar.x, empStar.y, starSize * 0.8, 0, Math.PI * 2);
//       ctx.clip();

//       // Create image element and draw when loaded
//       const img = new Image();
//       img.src = empStar.employee.image;

//       // Only draw if the image is already loaded
//       if (img.complete) {
//         const imgSize = starSize * 1.6;
//         ctx.drawImage(img, empStar.x - imgSize/2, empStar.y - imgSize/2, imgSize, imgSize);
//       } else {
//         // If image not loaded, draw initials as fallback
//         ctx.font = `bold ${Math.floor(10 * planetSize)}px Arial`;
//         ctx.fillStyle = "#ffffff";
//         ctx.textAlign = "center";
//         ctx.textBaseline = "middle";
//         ctx.fillText(empStar.employee.initials, empStar.x, empStar.y); // Use initials instead of name
//       }

//       ctx.restore();
//     } else if (employeeDisplayStyle === "both" && empStar.employee.image) {
//       // Draw smaller avatar with name below
//       ctx.save();
//       ctx.beginPath();
//       ctx.arc(empStar.x, empStar.y - starSize * 0.3, starSize * 0.6, 0, Math.PI * 2);
//       ctx.clip();

//       const img = new Image();
//       img.src = empStar.employee.image;

//       if (img.complete) {
//         const imgSize = starSize * 1.2;
//         ctx.drawImage(img, empStar.x - imgSize/2, empStar.y - starSize * 0.3 - imgSize/2, imgSize, imgSize);
//       }

//       ctx.restore();

//       // Draw name below
//       ctx.font = `bold ${Math.floor(8 * planetSize)}px Arial`;
//       ctx.fillStyle = "#ffffff";
//       ctx.textAlign = "center";
//       ctx.textBaseline = "middle";
//       ctx.fillText(empStar.employee.name, empStar.x, empStar.y + starSize * 0.5);
//     } else {
//       // Default: just draw initials
//       ctx.font = `bold ${Math.floor(10 * planetSize)}px Arial`;
//       ctx.fillStyle = "#ffffff";
//       ctx.textAlign = "center";
//       ctx.textBaseline = "middle";
//       ctx.fillText(empStar.employee.initials, empStar.x, empStar.y); // Use initials instead of name
//     }
//   };

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
  planets: Planet[],
  mouseRef: MousePosition,
  enableBlackHole: boolean,
  enablePlanets: boolean,
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
        if (dist < blackHole.radius * 0.8) {
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
  if (enablePlanets) {
    for (const empStar of planets) {
      const dx = empStar.x - star.x;
      const dy = empStar.y - star.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      if (dist > 10 && dist < 200) {
        // Use nullish coalescing to provide a default mass value if undefined
        // Note: Planet type uses 'project' property, not 'employee'
        const employeeMass = empStar.project?.mass ?? 100; // Default mass of 100 if undefined
        const force = (employeeMass / distSq) * gravitationalPull * 0.005;
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

// Update stars for hero mode
export const updateHeroStar = (
    star: Star,
    canvas: HTMLCanvasElement,
    mouse: MousePosition,
    centerPosition: CenterPosition,
    containerBounds: ContainerBounds,
    deltaTime: number
  ): Star => {
    const { width, height } = canvas.getBoundingClientRect();
    const newStar = { ...star };

    // Calculate attraction to center of container
    const centerAttractionStrength = 0.00002 * deltaTime;
    const dx = centerPosition.x - star.x;
    const dy = centerPosition.y - star.y;
    const distToCenter = Math.sqrt(dx * dx + dy * dy);

    // Only apply center attraction if we"re outside the container
    const isOutsideContainer = (
      star.x < containerBounds.left ||
      star.x > containerBounds.right ||
      star.y < containerBounds.top ||
      star.y > containerBounds.bottom
    );

    if (isOutsideContainer && distToCenter > 0) {
      const centerForce = centerAttractionStrength * (distToCenter / 100);
      newStar.vx += (dx / distToCenter) * centerForce;
      newStar.vy += (dy / distToCenter) * centerForce;
    }

    // Calculate mouse repulsion/attraction
    if (mouse.isOnScreen) {
      const mouseDistX = mouse.x - star.x;
      const mouseDistY = mouse.y - star.y;
      const mouseDistance = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY);

      if (mouseDistance < 150) {
        // Mouse repulsion in close range
        const repulsionStrength = 0.00015 * deltaTime;
        const repulsionForce = repulsionStrength * (1 - mouseDistance / 150);

        newStar.vx -= (mouseDistX / mouseDistance) * repulsionForce;
        newStar.vy -= (mouseDistY / mouseDistance) * repulsionForce;
      } else if (mouseDistance < 300) {
        // Slight attraction in medium range
        const attractionStrength = 0.00005 * deltaTime;
        const attractionForce = attractionStrength * ((mouseDistance - 150) / 150);

        newStar.vx += (mouseDistX / mouseDistance) * attractionForce;
        newStar.vy += (mouseDistY / mouseDistance) * attractionForce;
      }

      // Add some influence from mouse movement
      const mouseInfluence = 0.00002 * deltaTime;
      newStar.vx += mouse.speedX * mouseInfluence;
      newStar.vy += mouse.speedY * mouseInfluence;
    }

    // Apply velocity with damping
    const damping = 0.98;
    newStar.vx *= damping;
    newStar.vy *= damping;

    newStar.x += newStar.vx * deltaTime;
    newStar.y += newStar.vy * deltaTime;

    // Boundary handling - wrap around with momentum preservation
    if (newStar.x < -50) newStar.x = width + 50;
    if (newStar.x > width + 50) newStar.x = -50;
    if (newStar.y < -50) newStar.y = height + 50;
    if (newStar.y > height + 50) newStar.y = -50;

    return newStar;
  };

// Mouse effect visualization for hero mode
export const drawMouseEffect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    isActive: boolean
  ) => {
    if (!isActive) return;

    // Draw outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  };

// Draw connections between stars (for hero mode)
export const drawStarConnections = (
    ctx: CanvasRenderingContext2D,
    stars: Star[],
    maxDistance: number,
    opacity: number,
    color: string
  ) => {
    ctx.strokeStyle = color;

    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          // Calculate opacity based on distance
          const lineOpacity = opacity * (1 - distance / maxDistance);
          ctx.globalAlpha = lineOpacity;

          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1.0;
  };
