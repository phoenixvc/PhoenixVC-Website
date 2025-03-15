// components/Layout/Hero/Hero.tsx
import { FC, memo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroAnimations } from "../../animations";
import { DEFAULT_HERO_CONTENT } from "../../constants";
import styles from "./hero.module.css";
import type { HeroProps } from "../../types";
import { useSectionObserver } from "@/hooks/useSectionObserver";

interface ExtendedHeroProps extends HeroProps {
  enableMouseTracking?: boolean;
  theme?: "light" | "dark" | "auto";
  colorScheme?: string;
  accentColor?: string;
}

const Hero: FC<ExtendedHeroProps> = memo(
  ({
    title = DEFAULT_HERO_CONTENT.title,
    subtitle = DEFAULT_HERO_CONTENT.subtitle,
    primaryCta = DEFAULT_HERO_CONTENT.primaryCta,
    secondaryCta = DEFAULT_HERO_CONTENT.secondaryCta,
    isLoading = false,
    theme = "dark",
    colorScheme = "purple",
    accentColor,
  }) => {
    const sectionRef = useSectionObserver("home", (id) => {
      console.log(`[Home] Section "${id}" is now visible`);
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Detect system color scheme preference
    const [systemPrefersDark, setSystemPrefersDark] = useState(
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : true
    );

    // Listen for system theme changes
    useEffect(() => {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Calculate effective dark mode state
    const isDarkMode = theme === "auto" ? systemPrefersDark : theme === "dark";

    // Update dimensions on resize
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      };

      // Initial measurement
      updateDimensions();

      // Add resize listener
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Calculate theme-dependent styles
    const getThemeStyles = () => {
      // Text color
      const textColor = isDarkMode
        ? "text-white"
        : "text-gray-900";

      // Gradient colors for title
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
      <section
        className={`${styles.heroSection}`}
        ref={sectionRef}
        aria-label="hero section"
      >
        {/* No background div - let the Layout's starfield show through */}

        <div className={`${styles.heroContainer} ${textColor}`} ref={containerRef}>
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                className={styles.heroContent}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={heroAnimations.container}
              >
                {/* Title with gradient text */}
                <motion.h1
                  className={`${styles.heroTitle} bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}
                  variants={heroAnimations.item}
                >
                  {title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className={`${styles.heroSubtitle} ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  variants={heroAnimations.item}
                >
                  {subtitle}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  className={styles.heroButtonContainer}
                  variants={heroAnimations.item}
                >
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
