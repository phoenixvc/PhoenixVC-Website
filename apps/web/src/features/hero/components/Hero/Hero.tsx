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
    // this shouldn't be needed with newer react versions
    const sectionRef = useSectionObserver("home", (id) => {
      console.log(`[Home] Section "${id}" is now visible`);
    });

    const parallaxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleScroll = () => {
        if (parallaxRef.current) {
          const scrolled = window.pageYOffset;

          parallaxRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <section className={styles.heroSection} ref={sectionRef} aria-label="hero section">
        {/* Optional parallax background */}
        <div ref={parallaxRef} className={styles.heroBackground} />

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
                {/* Title */}
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
