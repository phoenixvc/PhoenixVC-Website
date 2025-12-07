// apps/web/src/features/layout/components/Starfield/cosmos/components/DirectZoomButtons.tsx
import React from "react";
import styles from "../../starfield.module.css";
import { GALAXIES } from "../cosmicHierarchy";
import { CosmicObject } from "../types";

interface DirectZoomButtonsProps {
  onZoom: (_object: CosmicObject) => void;
  className?: string;
}

const DirectZoomButtons: React.FC<DirectZoomButtonsProps> = ({ onZoom, className }) => {
  return (
    <div className={`${styles.directZoomButtons} ${className || ""}`}>
      {GALAXIES.map(galaxy => (
        <button
          key={galaxy.id}
          className={styles.zoomButton}
          onClick={() => onZoom(galaxy)}
        >
          {galaxy.name}
        </button>
      ))}
    </div>
  );
};

export default DirectZoomButtons;
