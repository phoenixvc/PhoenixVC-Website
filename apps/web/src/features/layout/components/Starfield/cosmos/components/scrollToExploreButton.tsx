// apps/web/src/features/layout/components/Starfield/cosmos/components/ScrollToExploreButton.tsx
import React, { useEffect, useState } from "react";
import styles from "../../starfield.module.css";

interface ScrollToExploreButtonProps {
  className?: string;
}

const ScrollToExploreButton: React.FC<ScrollToExploreButtonProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`${styles.scrollToExplore} ${className || ""}`}>
      <div className={styles.scrollText}>Scroll to Explore</div>
      <div className={styles.scrollArrow}>↓</div>
    </div>
  );
};

export default ScrollToExploreButton;
