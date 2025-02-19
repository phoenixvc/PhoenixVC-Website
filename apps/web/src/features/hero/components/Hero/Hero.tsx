import { FC, memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CTAButton } from "@/components/ui/cta-button";
import { heroAnimations } from "../../animations";
import { DEFAULT_HERO_CONTENT } from "../../constants";
import styles from "./hero.module.css";
import type { HeroProps } from "../../types";

const Hero: FC<HeroProps> = memo(
  ({
    title = DEFAULT_HERO_CONTENT.title,
    subtitle = DEFAULT_HERO_CONTENT.subtitle,
    primaryCta = DEFAULT_HERO_CONTENT.primaryCta,
    secondaryCta = DEFAULT_HERO_CONTENT.secondaryCta,
    isLoading = false,
  }) => {

    const parallaxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleScroll = () => {
        if (parallaxRef.current) {
          const scrolled = window.pageYOffset;
          parallaxRef.current.style.transform = `translateY(${scrolled * 0.4}px)`;
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <section className={`${styles.heroSection} ${styles.sectionGradient}`} aria-label="hero section">
        <div ref={parallaxRef} className={styles.heroBackgroundWithAnimation} />
        <div>
        <svg viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="phoenix" d="M50,25 C60,10 70,5 85,5 C100,5 110,15 120,25 C130,35 135,40 140,45 C145,50 150,55 160,55 C170,55 175,45 180,35 C185,25 190,15 200,15 C210,15 215,25 220,35 C225,45 230,55 240,55 C250,55 255,45 260,35 C265,25 270,15 280,15 C290,15 295,25 300,35 C305,45 310,55 320,55 C330,55 335,45 340,35 C345,25 350,15 360,15" fill="none" stroke="white" stroke-width="2"/>

    <ellipse id="egg" cx="200" cy="300" rx="30" ry="40" fill="none" stroke="white" stroke-width="2"/>

    <path id="flightPath" d="M-100,300 C200,100 1000,500 1300,300" fill="none"/>
  </defs>

  <g>
    <use href="#phoenix" fill="none" stroke="white">
      <animateMotion
        dur="10s"
        repeatCount="indefinite"
        rotate="auto">
        <mpath href="#flightPath"/>
      </animateMotion>

      <animate
        attributeName="opacity"
        values="1;0;1"
        dur="10s"
        repeatCount="indefinite"/>

      <animate
        attributeName="d"
        values="M50,25 C60,10 70,5 85,5...;
                M200,260 C200,280 230,320 200,340 C170,320 200,280 200,260;
                M50,25 C60,10 70,5 85,5..."
        dur="10s"
        repeatCount="indefinite"/>
    </use>

    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </g>
</svg>
        </div>
        <div className={`${styles.heroContainer} ${styles.brandPattern}`}>
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                className={styles.heroContent}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={heroAnimations.container}
              >
                {/* Hero Title */}
                <motion.h1 className={styles.heroTitle} variants={heroAnimations.item}>
                  {title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p className={styles.heroSubtitle} variants={heroAnimations.item}>
                  {subtitle}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div className={styles.heroButtonContainer} variants={heroAnimations.item}>
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
