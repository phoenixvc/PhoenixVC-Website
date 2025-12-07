// components/Layout/Starfield/DebugControlsOverlay.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./debugControls.module.css";

// Import the DebugSettings type from your types file
import { DebugSettings, MousePosition, Star } from "./types"; // Adjust the import path as needed

interface DebugControlsProps {
  debugSettings: DebugSettings;
  updateDebugSetting: <K extends keyof DebugSettings>(_key: K, _value: DebugSettings[K]) => void;
  resetStars: () => void;
  sidebarWidth: number;
  // Add new props for debug info
  stars?: Star[];
  mousePosition?: MousePosition;
  fps?: number;
  timestamp?: number;
  // Add new prop for setting mouse position
  setMousePosition?: (_position: MousePosition) => void;
  // Add isDarkMode prop
  isDarkMode?: boolean;
  onEmployeeOrbitSpeedChange?: (_e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DebugControlsOverlay: React.FC<DebugControlsProps> = ({
  debugSettings,
  updateDebugSetting,
  resetStars,
  sidebarWidth,
  stars = [],
  mousePosition = { x: 0, y: 0, isOnScreen: false, isClicked: false },
  fps = 0,
  timestamp: _timestamp,
  setMousePosition,
  isDarkMode = true,
  onEmployeeOrbitSpeedChange
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
  const handleAnimationSpeedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateDebugSetting("animationSpeed", Number(e.target.value));
  };

  const handleMaxVelocityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateDebugSetting("maxVelocity", Number(e.target.value));
  };

  const handleFlowStrengthChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateDebugSetting("flowStrength", Number(e.target.value));
  };

  const handleGravitationalPullChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateDebugSetting("gravitationalPull", Number(e.target.value));
  };

  const handleMouseEffectRadiusChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateDebugSetting("mouseEffectRadius", Number(e.target.value));
  };

  const handleEmployeeOrbitSpeedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateDebugSetting("employeeOrbitSpeed", Number(e.target.value));

    if (onEmployeeOrbitSpeedChange) {
      onEmployeeOrbitSpeedChange(e);
    }
  };

  const handleLineConnectionDistanceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateDebugSetting("lineConnectionDistance", Number(e.target.value));
  };

  const handleLineOpacityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    updateDebugSetting("lineOpacity", Number(e.target.value));
  };

  const handleCloseDebug = (): void => {
    updateDebugSetting("isDebugMode", false);
  };

  // Handle test mouse effect click
  const handleTestMouseEffect = (): void => {
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
  const handleRepulsionTest = (): void => {
    const canvasWidth  = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;

    if (window.starfieldAPI) {
      window.starfieldAPI.applyForce(
        cx,
        cy,
        debugSettings.repulsionRadius,
        debugSettings.repulsionForce
      );
      window.starfieldAPI.createExplosion(cx, cy);
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
    <div className={styles.debugOverlayContainer} onClick={(e) => e.stopPropagation()}>
      <div
        className={styles.debugIndicator}
        style={{ left: `${sidebarWidth + 10}px`, top: "80px" }}
        onClick={(e) => e.stopPropagation()}
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
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
      >
        <h3>Universal Constants</h3>

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
              onChange={(e) => {
                e.stopPropagation();
                handleAnimationSpeedChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                handleMaxVelocityChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                handleFlowStrengthChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                handleGravitationalPullChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                handleMouseEffectRadiusChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>

          {/* ——— Repulsion On/Off Toggle ——— */}
          <div className={styles.controlRow}>
            <label>
              <input
                type="checkbox"
                checked={debugSettings.repulsionEnabled}
                onChange={(e) => {
                  e.stopPropagation();
                  updateDebugSetting("repulsionEnabled", e.target.checked);
                }}
              />
              Enable Repulsion Effect
            </label>
          </div>

          {/* Repulsion Radius */}
          <div>
            <label>
              Repulsion Radius: {debugSettings.repulsionRadius.toFixed(0)}px
            </label>
            <input
              type="range"
              min="50"
              max="600"
              step="10"
              value={debugSettings.repulsionRadius}
              onChange={(e) => {
                e.stopPropagation();
                updateDebugSetting("repulsionRadius", Number(e.target.value));
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Repulsion Force */}
          <div>
            <label>
              RepulsionForce: {debugSettings.repulsionForce.toFixed(0)}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={debugSettings.repulsionForce}
              onChange={(e) => {
                e.stopPropagation();
                updateDebugSetting("repulsionForce", Number(e.target.value));
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div>
            <label>Portfolio Orbit Speed: {debugSettings.employeeOrbitSpeed.toFixed(5)}</label>
            <input
              type="range"
              min="0.00001"
              max="0.001"
              step="0.00001"
              value={debugSettings.employeeOrbitSpeed}
              onChange={(e) => {
                e.stopPropagation();
                handleEmployeeOrbitSpeedChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                handleLineConnectionDistanceChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                handleLineOpacityChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className={styles.debugButtons}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetStars();
            }}
          >
            Reset Stars
          </button>
          {setMousePosition && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTestMouseEffect();
              }}
              className={styles.testButton}
            >
              Test Mouse Effect
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCloseDebug();
            }}
            className={styles.closeButton}
          >
            Close Debug
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleRepulsionTest(); }}
            disabled={!debugSettings.repulsionEnabled}
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
