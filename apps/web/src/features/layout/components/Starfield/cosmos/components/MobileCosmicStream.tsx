// apps/web/src/features/layout/components/Starfield/cosmos/components/MobileCosmicStream.tsx
import React from "react";
import styles from "../../starfield.module.css";
import { getAllCosmicObjects, getChildrenOf } from "../cosmicHierarchy";
import { CosmicNavigationState, CosmicObject } from "../types";

interface MobileCosmicStreamProps {
  navigationState: CosmicNavigationState;
  onSelectObject: (object: CosmicObject) => void;
}

const MobileCosmicStream: React.FC<MobileCosmicStreamProps> = ({
  navigationState,
  onSelectObject
}) => {
  const { currentLevel, currentGalaxyId, currentSunId } = navigationState;

  // Get objects to display based on current navigation level
  const getDisplayObjects = (): CosmicObject[] => {
    if (currentLevel === "universe") {
      // At universe level, show galaxies
      return getAllCosmicObjects().filter(obj => obj.level === "galaxy");
    } else if (currentLevel === "galaxy" && currentGalaxyId) {
      // At galaxy level, show suns in this galaxy
      return getChildrenOf(currentGalaxyId);
    } else if (currentLevel === "sun" && currentSunId) {
      // At sun level, show planets orbiting this sun
      return getChildrenOf(currentSunId);
    }
    return [];
  };

  const displayObjects = getDisplayObjects();

  return (
    <div className={styles.mobileCosmicStream}>
      {displayObjects.map(obj => (
        <div
          key={obj.id}
          className={styles.cosmicStreamItem}
          onClick={() => onSelectObject(obj)}
        >
          <div
            className={styles.cosmicStreamIcon}
            style={{ backgroundColor: obj.color }}
          />
          <div className={styles.cosmicStreamContent}>
            <h3>{obj.name}</h3>
            <p>{obj.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileCosmicStream;
