import { FC, memo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroAnimations } from "../../animations";
import { DEFAULT_HERO_CONTENT } from "../../constants";
import styles from "./hero.module.css";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { HeroProps } from "@/features/layout/components/Starfield/types";

interface ExtendedHeroProps extends HeroProps {
  isDarkMode: boolean;
  colorScheme?: string;
  accentColor?: string;
  enableMouseTracking?: boolean; // Add this prop
}

const Hero: FC<ExtendedHeroProps> = memo(
  ({
    title = DEFAULT_HERO_CONTENT.title,
    subtitle = "Empowering breakthrough innovations through strategic investments and global partnerships.",
    primaryCta = DEFAULT_HERO_CONTENT.primaryCta,
    secondaryCta = DEFAULT_HERO_CONTENT.secondaryCta,
    isLoading = false,
    isDarkMode,
    colorScheme = "purple",
    accentColor,
    enableMouseTracking = false, // Default to false
  }) => {
    const sectionRef = useSectionObserver("home", (id) => {
      console.log(`[Home] Section "${id}" is now visible`);
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Add mouse tracking effect if enabled
    useEffect(() => {
      if (!enableMouseTracking || !containerRef.current) return;

      const handleMouseMove = (e: MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePosition({ x, y });
      };

      const container = containerRef.current;
      container.addEventListener("mousemove", handleMouseMove);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
      };
    }, [enableMouseTracking]);

    const getThemeStyles = () => {
      const textColor = isDarkMode ? "text-white" : "text-gray-900";
      const gradientColors = accentColor
        ? `from-${accentColor} to-${accentColor}`
        : colorScheme === "purple"
        ? "from-purple-500 to-indigo-600"
        : colorScheme === "blue"
        ? "from-blue-500 to-cyan-600"
        : "from-purple-500 to-indigo-600";
      return { textColor, gradientColors };
    };

    const { textColor, gradientColors } = getThemeStyles();

    return (
      <section className={styles.heroSection} ref={sectionRef} aria-label="hero section">
        <div className={isDarkMode ? styles.heroOverlayDark : styles.heroOverlayLight} />
        <div
          className={`${styles.heroContainer} ${textColor} ${enableMouseTracking ? styles.mouseTrackingEnabled : ""}`}
          ref={containerRef}
          style={enableMouseTracking ? {
            "--mouse-x": `${mousePosition.x}px`,
            "--mouse-y": `${mousePosition.y}px`
          } as React.CSSProperties : undefined}
        >
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                className={styles.heroContentWrapper}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={heroAnimations.container}
              >
                <div
                  className={`${styles.heroContentInner} ${isDarkMode ? styles.darkInner : styles.lightInner}`}
                >
                  <motion.h1
                    className={`${styles.heroTitle} bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}
                    variants={heroAnimations.item}
                  >
                    {title}
                  </motion.h1>
                  <motion.p
                    className={`${styles.heroSubtitle} ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    variants={heroAnimations.item}
                  >
                    {subtitle}
                  </motion.p>
                  <motion.div className={styles.heroButtonContainer} variants={heroAnimations.item}>
                    <button
                      className={`${styles.heroButton} ${styles.heroPrimaryButton} ${
                        accentColor
                          ? `bg-${accentColor} hover:bg-${accentColor}-600`
                          : isDarkMode
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-purple-500 hover:bg-purple-600"
                      }`}
                    >
                      {primaryCta.text}
                    </button>
                    <button
                      className={`${styles.heroButton} ${styles.heroSecondaryButton} ${
                        isDarkMode
                          ? "bg-gray-800 text-white hover:bg-gray-700"
                          : "bg-white text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {secondaryCta.text}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {isLoading && (
            <div className={styles.heroLoading}>
              <div className={`${styles.heroSpinner} ${isDarkMode ? "border-white" : "border-gray-800"}`} />
            </div>
          )}
        </div>
      </section>
    );
  }
);

Hero.displayName = "Hero";
export default Hero;
