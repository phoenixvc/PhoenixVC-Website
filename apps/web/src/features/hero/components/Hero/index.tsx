import { FC, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CTAButton } from "@/components/ui/cta-button";
import { heroAnimations } from "../../animations";
import { DEFAULT_HERO_CONTENT } from "../../constants";
import { heroStyles } from "./styles";
import type { HeroProps } from "../../types";

const Hero: FC<HeroProps> = memo(
  ({
    title = DEFAULT_HERO_CONTENT.title,
    subtitle = DEFAULT_HERO_CONTENT.subtitle,
    primaryCta = DEFAULT_HERO_CONTENT.primaryCta,
    secondaryCta = DEFAULT_HERO_CONTENT.secondaryCta,
    isLoading = false,
  }) => {
    return (
      <section className={heroStyles.section} aria-label="hero section">
        <div className={heroStyles.container}>
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                className={heroStyles.content}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={heroAnimations.container}
              >
                <motion.h1
                  className={heroStyles.heading}
                  variants={heroAnimations.item}
                >
                  {title}
                </motion.h1>

                <motion.p
                  className={heroStyles.subtitle}
                  variants={heroAnimations.item}
                >
                  {subtitle}
                </motion.p>

                <motion.div
                  className={heroStyles.buttonContainer}
                  variants={heroAnimations.item}
                >
                  <CTAButton
                    href={primaryCta.href}
                    variant="primary"
                    aria-label={primaryCta.text}
                  >
                    {primaryCta.text}
                  </CTAButton>

                  <CTAButton
                    href={secondaryCta.href}
                    variant="secondary"
                    aria-label={secondaryCta.text}
                  >
                    {secondaryCta.text}
                  </CTAButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className={heroStyles.loading}>
              <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>
    );
  }
);

Hero.displayName = "Hero";

export default Hero;
