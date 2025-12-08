// apps/web/src/features/hero/components/HeroSkeleton/HeroSkeleton.tsx
import { FC, memo } from "react";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import styles from "./HeroSkeleton.module.css";

// TODO: Production hardening:
// 1. Make the skeleton more closely match the final Hero component layout.
// 2. Add a subtle shimmer animation.

const HeroSkeleton: FC = memo(() => {
  return (
    <div className={styles.skeletonContainer}>
      <Skeleton height={60} width="80%" className={styles.title} />
      <Skeleton height={24} width="60%" className={styles.subtitle} />
      <div className={styles.buttonContainer}>
        <Skeleton height={44} width={120} />
        <Skeleton height={44} width={120} />
      </div>
    </div>
  );
});

HeroSkeleton.displayName = "HeroSkeleton";
export default HeroSkeleton;
