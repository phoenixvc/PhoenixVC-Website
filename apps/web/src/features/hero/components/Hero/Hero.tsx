import { HeroProps } from "@/features/layout/components/Starfield/types";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { AnimatePresence, motion } from "framer-motion";
import { FC, memo, useEffect, useRef, useState } from "react";
import { heroAnimations } from "../../animations";
import { DEFAULT_HERO_CONTENT } from "../../constants";
import styles from "./hero.module.css";
import { logger } from "@/utils/logger";
import { Minimize2, Maximize2 } from "lucide-react";

interface ExtendedHeroProps extends HeroProps {
  isDarkMode: boolean;
  colorScheme?: string;
  accentColor?: string;
  enableMouseTracking?: boolean;
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
    enableMouseTracking = false,
  }) => {
    const sectionRef = useSectionObserver("home", (id) => {
      logger.debug(`[Home] Section "${id}" is now visible`);
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMouseNearBorder, setIsMouseNearBorder] = useState(false);

    const [showHeroContent, setShowHeroContent] = useState(true); // Show by default
    const [isMinimized, setIsMinimized] = useState(true); // State for minimized hero - minimized by default
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);
    const [showReturnToStars, setShowReturnToStars] = useState(false); // Hide at top of page
    const [scrollPosition, setScrollPosition] = useState(0);

    // Mouse tracking effect
    useEffect(() => {
      if (!enableMouseTracking || !containerRef.current) return;

      const handleMouseMove = (e: MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if mouse is near the border (within 20px)
        const borderThreshold = 20;
        const isNearBorder =
          x < borderThreshold ||
          y < borderThreshold ||
          x > rect.width - borderThreshold ||
          y > rect.height - borderThreshold;

        setIsMouseNearBorder(isNearBorder);
        setMousePosition({ x, y });
      };

      const container = containerRef.current;
      container.addEventListener("mousemove", handleMouseMove);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
      };
    }, [enableMouseTracking]);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollPosition = window.scrollY;
        setScrollPosition(currentScrollPosition);

        // Hide scroll indicator after scrolling, show return button instead
        if (currentScrollPosition > 50) {
          setShowScrollIndicator(false);
          setShowReturnToStars(true);
        } else {
          setShowScrollIndicator(true);
          setShowReturnToStars(false);
        }
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

    // Handler for returning to stars
    const handleReturnToStars = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handler for minimizing/maximizing hero content
    const handleToggleMinimize = () => {
      setIsMinimized((prev) => !prev);
    };

    // Handler for scroll indicator click - scroll to next section
    const scrollToContent = () => {
      // Hide scroll indicator
      setShowScrollIndicator(false);

      // Try to scroll to the focus-areas section, fallback to scrolling past the hero
      const focusSection = document.getElementById("focus-areas");
      if (focusSection) {
        focusSection.scrollIntoView({ behavior: "smooth" });
      } else {
        // Fallback: scroll past the hero section
        window.scrollTo({
          top: window.innerHeight,
          behavior: "smooth",
        });
      }
    };
    return (
      <section
        className={styles.heroSection}
        ref={sectionRef}
        aria-label="hero section"
        style={{
          backgroundPosition: `center ${scrollPosition * 0.05}px`,
        }}
      >
        <div
          className={
            isDarkMode ? styles.heroOverlayDark : styles.heroOverlayLight
          }
        />
        <div
          className={`${styles.heroContainer} ${textColor} ${
            enableMouseTracking
              ? `${styles.mouseTrackingEnabled} ${isMouseNearBorder ? styles.mouseBorder : ""}`
              : ""
          }`}
          ref={containerRef}
          style={
            enableMouseTracking
              ? ({
                  "--mouse-x": `${mousePosition.x}px`,
                  "--mouse-y": `${mousePosition.y}px`,
                } as React.CSSProperties)
              : undefined
          }
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
                <AnimatePresence>
                  {showHeroContent && (
                    <motion.div
                      className={`${styles.heroContentInner} ${isDarkMode ? styles.darkInner : styles.lightInner} ${isMinimized ? styles.minimized : ""}`}
                      initial={{ opacity: 0, y: 40, scale: 0.95 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        height: isMinimized ? "auto" : "auto"
                      }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{
                        duration: 0.6,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                    >
                      {/* Minimize/Maximize button - always visible */}
                      <motion.button
                        className={styles.minimizeButton}
                        onClick={handleToggleMinimize}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        aria-label={isMinimized ? "Expand hero content" : "Minimize hero content"}
                        title={isMinimized ? "Expand" : "Minimize"}
                      >
                        {isMinimized ? (
                          <Maximize2 size={16} className={isDarkMode ? "text-white" : "text-gray-800"} />
                        ) : (
                          <Minimize2 size={16} className={isDarkMode ? "text-white" : "text-gray-800"} />
                        )}
                      </motion.button>

                      {/* Return to Stars button - only shows after scrolling */}
                      <AnimatePresence>
                        {showReturnToStars && !isMinimized && (
                          <motion.button
                            className={styles.returnToStarsButton}
                            onClick={handleReturnToStars}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            aria-label="Return to stars view"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className={
                                isDarkMode ? "text-white" : "text-gray-800"
                              }
                            >
                              <path
                                d="M18 15l-6-6-6 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Return to Stars</span>
                          </motion.button>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {!isMinimized && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.h1
                              className={`${styles.heroTitle} bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}
                              transition={{ duration: 0.5, delay: 0.1 }}
                            >
                              {title}
                            </motion.h1>

                            <motion.p
                              className={`${styles.heroSubtitle} ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            >
                              {subtitle}
                            </motion.p>

                            <motion.div
                              className={styles.heroButtonContainer}
                              transition={{ duration: 0.5, delay: 0.3 }}
                            >
                              <button
                                type="button"
                                aria-label={`Navigate to ${primaryCta.text} section`}
                                className={`${styles.heroButton} ${styles.heroPrimaryButton} ${
                                  accentColor
                                    ? `bg-${accentColor} hover:bg-${accentColor}-600`
                                    : isDarkMode
                                      ? "bg-purple-600 hover:bg-purple-700"
                                      : "bg-purple-500 hover:bg-purple-600"
                                }`}
                                onClick={() => {
                                  const section = document.querySelector(primaryCta.href);
                                  if (section) {
                                    section.scrollIntoView({ behavior: "smooth" });
                                  }
                                }}
                              >
                                {primaryCta.text}
                              </button>
                              <button
                                type="button"
                                aria-label={`Navigate to ${secondaryCta.text} section`}
                                className={`${styles.heroButton} ${styles.heroSecondaryButton} ${
                                  isDarkMode
                                    ? "bg-gray-800 text-white hover:bg-gray-700"
                                    : "bg-white text-gray-800 hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  const section = document.querySelector(secondaryCta.href);
                                  if (section) {
                                    section.scrollIntoView({ behavior: "smooth" });
                                  }
                                }}
                              >
                                {secondaryCta.text}
                              </button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Minimized content - show only title */}
                      <AnimatePresence>
                        {isMinimized && (
                          <motion.div
                            className={styles.minimizedContent}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className={`bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent ${styles.minimizedTitle}`}>
                              {title}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          {isLoading && (
            <div className={styles.heroLoading}>
              <div
                className={`${styles.heroSpinner} ${isDarkMode ? "border-white" : "border-gray-800"}`}
              />
            </div>
          )}
        </div>

        <AnimatePresence>
          {showScrollIndicator && (
            <motion.button
              className={styles.scrollIndicator}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.5 },
                y: { repeat: Infinity, duration: 1.5 },
              }}
              /* No inline styles needed - using CSS for positioning */
              onClick={scrollToContent}
              aria-label="Scroll to explore content"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.scrollText}>SCROLL TO EXPLORE</span>
            </motion.button>
          )}
        </AnimatePresence>
      </section>
    );
  },
);

Hero.displayName = "Hero";
export default Hero;
