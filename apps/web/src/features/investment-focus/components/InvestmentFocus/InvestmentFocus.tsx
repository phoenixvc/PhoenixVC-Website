// components/InvestmentFocus/InvestmentFocus.tsx
import { motion } from "framer-motion";
import { FOCUS_AREAS } from "../../constants";
import { investmentFocusAnimations } from "../../animations/animations";
import InvestmentCard from "../InvestmentCard/InvestmentCard";
import styles from "./InvestmentFocus.module.css";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { FC } from "react";

interface InvestmentFocusProps {
  isDarkMode?: boolean;
}

export const InvestmentFocus: FC<InvestmentFocusProps> = ({ isDarkMode = true }) => {
  // Use our observer hook and log when the section becomes visible
  const sectionRef = useSectionObserver("focus", (id) => {
    console.log(`[Focus] Section "${id}" is now visible`);
  });

  return (
    <section
      id="focus"
      ref={sectionRef}
      className={`${styles.section} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
    >
      <motion.div
        className="container mx-auto px-6 max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={investmentFocusAnimations.container}
      >
        {/* Section Heading */}
        <motion.h2
          variants={investmentFocusAnimations.header}
          className={styles.heading}
        >
          Focus Areas
        </motion.h2>

        {/* Grid of Focus Areas */}
        <motion.div
          className={styles.grid}
          variants={investmentFocusAnimations.container}
        >
          {FOCUS_AREAS.map((area, index) => (
            <InvestmentCard
              key={index}
              area={area}
              index={index}
              isDarkMode={isDarkMode}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default InvestmentFocus;
