// components/ui/Skeleton/Skeleton.tsx
import { FC, memo } from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular";
  className?: string;
  animation?: "pulse" | "wave" | "none";
}

/**
 * Skeleton loading placeholder component
 * Provides visual feedback while content is loading
 */
const Skeleton: FC<SkeletonProps> = memo(
  ({
    width = "100%",
    height = 20,
    variant = "rectangular",
    className = "",
    animation = "pulse",
  }) => {
    const style = {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
    };

    return (
      <div
        className={`${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className}`}
        style={style}
        aria-hidden="true"
        role="presentation"
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

/**
 * Preset skeleton for page loading
 */
const PageSkeleton: FC<{ isDarkMode?: boolean }> = memo(
  ({ isDarkMode = false }) => (
    <div className={`${styles.pageSkeleton} ${isDarkMode ? styles.dark : ""}`}>
      <div className={styles.header}>
        <Skeleton width={200} height={32} />
        <Skeleton width={100} height={24} />
      </div>
      <div className={styles.content}>
        <Skeleton height={200} />
        <div className={styles.textGroup}>
          <Skeleton height={24} />
          <Skeleton height={16} width="80%" />
          <Skeleton height={16} width="60%" />
        </div>
      </div>
    </div>
  ),
);

PageSkeleton.displayName = "PageSkeleton";

export { Skeleton, PageSkeleton };
export default Skeleton;
