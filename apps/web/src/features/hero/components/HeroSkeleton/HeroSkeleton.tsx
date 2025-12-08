// features/hero/components/HeroSkeleton/HeroSkeleton.tsx
import { FC, memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/theme";
import styles from "./HeroSkeleton.module.css";

/**
 * HeroSkeleton - A loading placeholder for the Hero component
 * Displays animated placeholder elements while the Hero content loads
 */
const HeroSkeleton: FC = memo(() => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  return (
    <div
      className={`${styles.skeletonContainer} ${isDarkMode ? styles.dark : styles.light}`}
    >
      <motion.div
        className={styles.skeletonContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Title skeleton */}
        <div className={styles.titleSkeleton}>
          <div className={`${styles.skeletonLine} ${styles.titleLine}`} />
        </div>

        {/* Subtitle skeleton */}
        <div className={styles.subtitleSkeleton}>
          <div className={`${styles.skeletonLine} ${styles.subtitleLine1}`} />
          <div className={`${styles.skeletonLine} ${styles.subtitleLine2}`} />
        </div>

        {/* Buttons skeleton */}
        <div className={styles.buttonsSkeleton}>
          <div className={`${styles.skeletonButton} ${styles.primaryButton}`} />
          <div
            className={`${styles.skeletonButton} ${styles.secondaryButton}`}
          />
        </div>
      </motion.div>
    </div>
  );
});

HeroSkeleton.displayName = "HeroSkeleton";
export default HeroSkeleton;
