// components/Layout/Starfield/DebugControlsOverlay.tsx
import React, { useEffect, useState, useRef } from "react";
import styles from "./debugControls.module.css";

// Import the DebugSettings type from your types file
import { DebugSettings, MousePosition, Star } from "./types"; // Adjust the import path as needed

interface DebugControlsProps {
  debugSettings: DebugSettings;
  updateDebugSetting: <K extends keyof DebugSettings>(key: K, value: DebugSettings[K]) => void;
  resetStars: () => void;
  sidebarWidth: number;
  // Add new props for debug info
  stars?: Star[];
  mousePosition?: MousePosition;
  fps?: number;
  timestamp?: number;
  // Add new prop for setting mouse position
  setMousePosition?: (position: MousePosition) => void;
  // Add isDarkMode prop
  isDarkMode?: boolean;
}

const DebugControlsOverlay: React.FC<DebugControlsProps> = ({
  debugSettings,
  updateDebugSetting,
  resetStars,
  sidebarWidth,
  stars = [],
  mousePosition = { x: 0, y: 0, isOnScreen: false, isClicked: false },
  fps = 0,
  timestamp,
  setMousePosition,
  isDarkMode = true // Default to dark mode if not specified
}) => {
  // FPS tracking
  const fpsValues = useRef<number[]>([]);
  const [averageFps, setAverageFps] = useState<number>(0);

  // Update FPS values
  useEffect(() => {
    if (fps > 0) {
      fpsValues.current.push(fps);
      if (fpsValues.current.length > 60) {
        fpsValues.current.shift();
      }

      // Calculate average FPS
      const avgFps = fpsValues.current.length > 0
        ? fpsValues.current.reduce((sum, val) => sum + val, 0) / fpsValues.current.length
        : 0;
      setAverageFps(avgFps);
    }
  }, [fps]);

  // Early return if debug mode is disabled
  if (!debugSettings.isDebugMode) {
    return null;
  }

  // Handle input changes with proper typing
  const handleAnimationSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugSetting("animationSpeed", Number(e.target.value));
  };

  const handleMaxVelocityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugSetting("maxVelocity", Number(e.target.value));
  };

  const handleFlowStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugSetting("flowStrength", Number(e.target.value));
  };

  const handleGravitationalPullChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugSetting("gravitationalPull", Number(e.target.value));
  };

  const handleMouseEffectRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugSetting("mouseEffectRadius", Number(e.target.value));
  };

  const handleEmployeeOrbitSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugSetting("employeeOrbitSpeed", Number(e.target.value));
  };

  const handleLineConnectionDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugSetting("lineConnectionDistance", Number(e.target.value));
  };

  const handleLineOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDebugSetting("lineOpacity", Number(e.target.value));
  };

  const handleCloseDebug = () => {
    updateDebugSetting("isDebugMode", false);
  };

  // Handle test mouse effect click
  const handleTestMouseEffect = () => {
    if (setMousePosition) {
      const newPos = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        lastX: mousePosition.x,
        lastY: mousePosition.y,
        speedX: 0,
        speedY: 0,
        isClicked: true,
        clickTime: Date.now(),
        isOnScreen: true
      };
      setMousePosition(newPos);
    }
  };

  // Handle repulsion test
  const handleRepulsionTest = () => {
    console.log("Test Repulsion button clicked");

    // Get canvas dimensions
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    console.log(`Center coordinates: (${centerX}, ${centerY})`);

    // Use the starfieldAPI directly
    if (window.starfieldAPI) {
      console.log("Using starfieldAPI from Test Repulsion button");
      const affectedStars = window.starfieldAPI.applyForce(centerX, centerY, 300, 100);
      console.log(`Applied force to ${affectedStars} stars from button`);

      // Create an explosion effect
      window.starfieldAPI.createExplosion(centerX, centerY);
    } else {
      console.error("starfieldAPI not available from Test Repulsion button");
    }
  };

  // Calculate max velocity of any star
  const maxVelocity = stars.length > 0
    ? stars.reduce((max, star) => {
        const vel = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
        return vel > max ? vel : max;
      }, 0)
    : 0;

  // Determine the CSS classes based on the theme
  const debugControlsClass = `${styles.debugControls} ${!isDarkMode ? styles.debugControlsLight : ""}`;

  return (
    <div className={styles.debugOverlayContainer}>
      <div
        className={styles.debugIndicator}
        style={{ left: `${sidebarWidth + 10}px`, top: "80px" }}
      >
        Debug Mode
      </div>
      <div
        className={debugControlsClass}
        style={{
          left: `${sidebarWidth + 10}px`,
          top: "110px",
          maxHeight: "80vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Debug Controls</h3>

        {/* Debug Info Section */}
        <div className={styles.debugInfoSection}>
          <h4>DEBUG INFO</h4>
          <div className={styles.debugInfoGrid}>
            <div>FPS: {Math.round(averageFps)}</div>
            <div>Stars: {stars.length}</div>
            <div>Mouse: {Math.round(mousePosition.x)}, {Math.round(mousePosition.y)}</div>
            <div>Clicked: {mousePosition.isClicked ? "Yes" : "No"}</div>
            <div>Max Velocity: {maxVelocity.toFixed(2)}</div>
            <div>Effect Radius: {debugSettings.mouseEffectRadius}px</div>
          </div>
        </div>

        {/* Controls Section */}
        <div className={styles.controlsSection}>
          <h4>CONTROLS</h4>
          <div>
            <label>Animation Speed: {debugSettings.animationSpeed.toFixed(2)}x</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={debugSettings.animationSpeed}
              onChange={handleAnimationSpeedChange}
            />
          </div>

          <div>
            <label>Max Velocity: {debugSettings.maxVelocity.toFixed(2)}</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={debugSettings.maxVelocity}
              onChange={handleMaxVelocityChange}
            />
          </div>

          <div>
            <label>Flow Strength: {debugSettings.flowStrength.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={debugSettings.flowStrength}
              onChange={handleFlowStrengthChange}
            />
          </div>

          <div>
            <label>Gravitational Pull: {debugSettings.gravitationalPull.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={debugSettings.gravitationalPull}
              onChange={handleGravitationalPullChange}
            />
          </div>

          <div>
            <label>Mouse Effect Radius: {debugSettings.mouseEffectRadius}px</label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={debugSettings.mouseEffectRadius}
              onChange={handleMouseEffectRadiusChange}
            />
          </div>

          <div>
            <label>Employee Orbit Speed: {debugSettings.employeeOrbitSpeed.toFixed(5)}</label>
            <input
              type="range"
              min="0.00001"
              max="0.001"
              step="0.00001"
              value={debugSettings.employeeOrbitSpeed}
              onChange={handleEmployeeOrbitSpeedChange}
            />
          </div>

          <div>
            <label>Line Connection Distance: {debugSettings.lineConnectionDistance}px</label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={debugSettings.lineConnectionDistance}
              onChange={handleLineConnectionDistanceChange}
            />
          </div>

          <div>
            <label>Line Opacity: {debugSettings.lineOpacity.toFixed(2)}</label>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={debugSettings.lineOpacity}
              onChange={handleLineOpacityChange}
            />
          </div>
        </div>

        <div className={styles.debugButtons}>
          <button onClick={resetStars}>Reset Stars</button>
          {setMousePosition && (
            <button
              onClick={handleTestMouseEffect}
              className={styles.testButton}
            >
              Test Mouse Effect
            </button>
          )}
          <button
            onClick={handleCloseDebug}
            className={styles.closeButton}
          >
            Close Debug
          </button>
          <button
            onClick={handleRepulsionTest}
            className={styles.actionButton}
          >
            Test Repulsion
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugControlsOverlay;
