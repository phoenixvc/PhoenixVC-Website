// components/Layout/Starfield/ScoreOverlay.tsx
import React, { useState } from "react";
import styles from "./scoreOverlay.module.css";
import { ChevronUp, ChevronDown, Target } from "lucide-react";

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

  return (
    <div className={`${styles.scoreOverlay} ${isExpanded ? styles.expanded : ""}`}>
      {isExpanded ? (
        <>
          <div className={styles.scoreHeader}>
            <h3>Game Stats</h3>
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
              <span className={styles.scoreLabel}>Clicks</span>
              <span className={styles.scoreValue}>{remainingClicks}</span>
            </div>
          </div>

          {highScores && highScores.length > 0 && (
            <div className={styles.highScores}>
              <h4>High Scores</h4>
              <ul>
                {highScores.slice(0, 3).map((score, index) => (
                  <li key={index}>
                    {score.score} pts - {score.date}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <button
          className={styles.floatingButton}
          onClick={() => setIsExpanded(true)}
          aria-label="Show game stats"
        >
          <Target size={20} />
          <span className={styles.miniScore}>{currentScore}</span>
        </button>
      )}
    </div>
  );
};

export default ScoreOverlay;
