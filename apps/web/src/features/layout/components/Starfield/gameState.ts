// components/Layout/Starfield/gameState.ts
import { GameState, Planet, Star } from "./types";

// Initialize game state
export const initGameState = (): GameState => {
  return {
    remainingClicks: 20,
    score: 0,
    lastClickTime: Date.now(),
    highScores: [],
    lastScoreUpdate: Date.now(),
    ipAddress: null,
    collisions: [],
    clickAddInterval: 300000 // 5 minutes in milliseconds
  };
};

// Check for collisions between stars and employee stars
export const checkCollisions = (
  stars: Star[],
  planets: Planet[],
  gameState: GameState,
  setGameState: (state: GameState) => void,
  createCollisionEffect?: (x: number, y: number, color: string, score: number) => void
): void => {
  if (!stars.length || !planets.length) return;

  let scoreAdded = false;
  const newCollisions = [...gameState.collisions];
  const collidedStars: number[] = [];

  // Check each star against each employee star
  stars.forEach((star, starIndex) => {
    if (!star.isActive) return; // Skip inactive stars

    planets.forEach(empStar => {
      const dist = Math.sqrt(
        Math.pow(star.x - empStar.x, 2) +
        Math.pow(star.y - empStar.y, 2)
      );

      // Collision detection radius - adjust based on star and employee sizes
      const collisionRadius = 15 + (star.size * 2) + (empStar.employee.mass ? empStar.employee.mass / 20 : 2);

      // Calculate star speed for effect intensity
      const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);

      if (dist < collisionRadius && star.isActive) {
        // Calculate score based on employee mass and star size
        const baseScore = empStar.employee.mass || 50;
        const starBonus = star.size * 10;
        const velocityBonus = speed * 20;
        const scoreValue = Math.round(baseScore + starBonus + velocityBonus);

        // Add collision animation
        newCollisions.push({
          x: empStar.x,
          y: empStar.y,
          time: Date.now(),
          score: scoreValue,
          employeeName: empStar.employee.name
        });

        // Create a visual effect at collision point if the function is provided
        if (createCollisionEffect && speed > 0.5 && !collidedStars.includes(starIndex)) {
          createCollisionEffect(
            star.x,
            star.y,
            empStar.employee.color || "#8a2be2",
            scoreValue
          );
          collidedStars.push(starIndex);
        }

        // Deactivate the star
        star.isActive = false;

        // Add some velocity to the employee star for visual feedback
        empStar.vx += (Math.random() - 0.5) * 0.2;
        empStar.vy += (Math.random() - 0.5) * 0.2;

        // Enable pulsation temporarily for visual feedback
        if (empStar.pulsation) {
          empStar.pulsation.enabled = true;
          empStar.pulsation.maxScale = 1.5; // Bigger pulse on collision
          empStar.pulsation.speed *= 2; // Faster pulse on collision
        }

        scoreAdded = true;
      }
    });
  });

  // Update score and clean up old collisions
  if (scoreAdded || newCollisions.length !== gameState.collisions.length) {
    const currentTime = Date.now();
    const updatedCollisions = newCollisions.filter(
      collision => currentTime - collision.time < 2000 // Remove after 2 seconds
    );

    // Calculate total score from all active collisions
    const scoreToAdd = newCollisions
      .filter(c => !gameState.collisions.includes(c))
      .reduce((total, collision) => total + collision.score, 0);

    setGameState({
      ...gameState,
      score: gameState.score + scoreToAdd,
      collisions: updatedCollisions,
      lastScoreUpdate: scoreToAdd > 0 ? Date.now() : gameState.lastScoreUpdate
    });
  }
};

// Add a click to the game
export const addClick = (
  gameState: GameState,
  setGameState: (state: GameState) => void
): void => {
  if (gameState.remainingClicks < 20) {
    setGameState({
      ...gameState,
      remainingClicks: gameState.remainingClicks + 1,
      lastClickTime: Date.now()
    });
  }
};

// Check if it's time to add a new click (every 5 minutes)
export const checkAddClick = (
  gameState: GameState,
  setGameState: (state: GameState) => void
): void => {
  const now = Date.now();

  if (now - gameState.lastClickTime >= gameState.clickAddInterval) {
    setGameState({
      ...gameState,
      remainingClicks: Math.min(gameState.remainingClicks + 1, 10),
      lastClickTime: now
    });
  }
};

// Draw game UI
export const drawGameUI = (
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  width: number,
  height: number
): void => {
  // Draw remaining clicks indicator at bottom center
  ctx.save();

  // Draw click indicators
  const centerX = width / 2;
  const y = height - 50;

  for (let i = 0; i < gameState.remainingClicks; i++) {
    const x = centerX + (i - gameState.remainingClicks / 2) * 30;

    // Draw glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
    gradient.addColorStop(0, "rgba(138, 43, 226, 0.8)");
    gradient.addColorStop(1, "rgba(138, 43, 226, 0)");

    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw inner circle
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();
  }

  ctx.restore();
};

// Fetch IP address for high score tracking
export const fetchIpAddress = async (): Promise<string> => {
  try {
    console.log("Ftching IP dummy call:");
    return "127.0.0.1";
  } catch (error) {
    console.error("Error fetching IP:", error);
    return "";
  }
};

// Get high scores for an IP address
export const getHighScoresForIP = (ip: string): Array<{score: number, date: string}> => {
  try {
    const scoresString = localStorage.getItem(`highScores_${ip}`);
    if (scoresString) {
      return JSON.parse(scoresString);
    }
  } catch (error) {
    console.error("Error getting high scores:", error);
  }

  return [];
};

// Save score
export const saveScore = (gameState: GameState): void => {
  if (!gameState.ipAddress || gameState.score <= 0) return;

  try {
    const highScores = getHighScoresForIP(gameState.ipAddress);

    // Add new score
    highScores.push({
      score: gameState.score,
      date: new Date().toLocaleDateString()
    });

    // Sort by score (descending)
    highScores.sort((a, b) => b.score - a.score);

    // Keep only top 10
    const topScores = highScores.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem(`highScores_${gameState.ipAddress}`, JSON.stringify(topScores));
  } catch (error) {
    console.error("Error saving score:", error);
  }
};
