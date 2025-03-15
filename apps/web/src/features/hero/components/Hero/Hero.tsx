import { FC, memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CTAButton } from "@/components/ui/";
import { heroAnimations } from "../../animations";
import { DEFAULT_HERO_CONTENT } from "../../constants";
import styles from "./hero.module.css";
import type { HeroProps } from "../../types";
import { useSectionObserver } from "@/hooks/useSectionObserver";

const Hero: FC<HeroProps> = memo(
  ({
    title = DEFAULT_HERO_CONTENT.title,
    subtitle = DEFAULT_HERO_CONTENT.subtitle,
    primaryCta = DEFAULT_HERO_CONTENT.primaryCta,
    secondaryCta = DEFAULT_HERO_CONTENT.secondaryCta,
    isLoading = false,
  }) => {
    // Use our observer hook and log when the section becomes visible
    const sectionRef = useSectionObserver("home", (id) => {
      console.log(`[Home] Section "${id}" is now visible`);
    });

    const parallaxRef = useRef<HTMLDivElement>(null);
    const decorationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleScroll = () => {
        if (!parallaxRef.current || !decorationRef.current) return;

        const scrolled = window.pageYOffset;
        const scrollFactor = 0.3;

        // Apply different parallax rates to create depth
        parallaxRef.current.style.transform = `translateY(${scrolled * scrollFactor}px)`;
        decorationRef.current.style.transform = `translateY(${scrolled * -scrollFactor * 0.5}px) rotate(${scrolled * 0.02}deg)`;
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <section
        className={styles.heroSection}
        ref={sectionRef}
        aria-label="hero section"
      >
        {/* Parallax background */}
        <div ref={parallaxRef} className={styles.heroBackground} />

        {/* Floating decoration elements */}
        <div ref={decorationRef} className={styles.heroDecorations}>
          <div className={`${styles.heroDecoration} ${styles.decorationLeft}`} />
          <div className={`${styles.heroDecoration} ${styles.decorationRight}`} />
        </div>

        <div className={styles.heroContainer}>
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
                  className={styles.heroTitle}
                  variants={heroAnimations.item}
                >
                  {title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className={styles.heroSubtitle}
                  variants={heroAnimations.item}
                >
                  {subtitle}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  className={styles.heroButtonContainer}
                  variants={heroAnimations.item}
                >
                  <CTAButton href={primaryCta.href} variant="primary">
                    {primaryCta.text}
                  </CTAButton>

                  <CTAButton href={secondaryCta.href} variant="secondary">
                    {secondaryCta.text}
                  </CTAButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className={styles.heroLoading}>
              <div className={styles.heroSpinner} />
            </div>
          )}
        </div>
      </section>
    );
  }
);

Hero.displayName = "Hero";
export default Hero;
