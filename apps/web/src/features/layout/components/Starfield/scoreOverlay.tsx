// components/Layout/Starfield/ScoreOverlay.tsx
import React, { useState } from "react";
import styles from "./scoreOverlay.module.css";
import { ChevronDown, Target, Heart, Crosshair } from "lucide-react";

interface ScoreOverlayProps {
  remainingClicks: number;
  currentScore: number;
  highScores: Array<{score: number, date: string}>;
}

const ScoreOverlay: React.FC<ScoreOverlayProps> = ({
  remainingClicks,
  currentScore,
  highScores
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Render heart icons for remaining lives
  const renderLives = (): React.ReactElement[] => {
    const hearts = [];
    const maxLives = 5;
    for (let i = 0; i < maxLives; i++) {
      hearts.push(
        <Heart
          key={i}
          size={16}
          fill={i < remainingClicks ? "#ff4757" : "transparent"}
          color={i < remainingClicks ? "#ff4757" : "rgba(255,255,255,0.3)"}
          className={styles.lifeHeart}
        />
      );
    }
    return hearts;
  };

  return (
    <div className={`${styles.scoreOverlay} ${isExpanded ? styles.expanded : ""}`}>
      {isExpanded ? (
        <>
          <div className={styles.scoreHeader}>
            <h3>🎮 Game Mode</h3>
            <button
              className={styles.toggleButton}
              onClick={() => setIsExpanded(false)}
              aria-label="Collapse game stats"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <div className={styles.scoreContainer}>
            <div className={styles.scoreItem}>
              <span className={styles.scoreLabel}>Score</span>
              <span className={styles.scoreValue}>{currentScore}</span>
            </div>
            <div className={styles.scoreItem}>
              <span className={styles.scoreLabel}>Lives</span>
              <div className={styles.livesDisplay}>
                {renderLives()}
              </div>
            </div>
          </div>

          <div className={styles.gameInstructions}>
            <p>🎯 Click on planets to score points!</p>
            <p>💫 Chain hits for bonus points</p>
          </div>

          {highScores && highScores.length > 0 && (
            <div className={styles.highScores}>
              <h4>🏆 High Scores</h4>
              <ul>
                {highScores.slice(0, 3).map((score, index) => (
                  <li key={index}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {score.score} pts
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className={styles.compactView}>
          <button
            className={styles.floatingButton}
            onClick={() => setIsExpanded(true)}
            aria-label="Show game stats"
          >
            <Crosshair size={20} />
          </button>
          <div className={styles.compactStats}>
            <div className={styles.compactScore}>
              <Target size={14} />
              <span>{currentScore}</span>
            </div>
            <div className={styles.compactLives}>
              {renderLives()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreOverlay;
