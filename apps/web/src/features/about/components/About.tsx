// features/about/components/About/About.tsx
import { FC, memo } from "react";
import { motion } from "framer-motion";
import styles from "./About.module.css";
import { useSectionObserver } from "@/hooks/useSectionObserver";

interface AboutProps {
  isDarkMode: boolean;
}

const aboutAnimations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  },
};

const About: FC<AboutProps> = memo(({ isDarkMode }) => {
  const sectionRef = useSectionObserver("about", (id) => {
    console.log(`[About] Section "${id}" is now visible`);
  });

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`${styles.section} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
      aria-label="About Phoenix VC"
    >
      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={aboutAnimations.container}
        >
          <motion.h2
            className={`${styles.title} ${isDarkMode ? styles.darkTitle : styles.lightTitle}`}
            variants={aboutAnimations.item}
          >
            About Us
          </motion.h2>

          <div className={styles.divider} />

          <div className={styles.paragraphContainer}>
            <motion.p
              className={styles.paragraph}
              variants={aboutAnimations.item}
            >
              At Phoenix VC, our mission is to empower innovation, fuel growth, and shape the future through strategic investments and partnerships. We are committed to identifying and nurturing exceptional entrepreneurs, startups, and businesses that have the potential to revolutionize industries and create lasting positive impact.
            </motion.p>

            <motion.p
              className={styles.paragraph}
              variants={aboutAnimations.item}
            >
              Our core values of integrity, collaboration, and visionary thinking drive our investment decisions and guide our interactions with founders, investors, and stakeholders. Through diligent research, rigorous due diligence, and a forward-thinking approach, we strive to identify transformative opportunities in the technology sector.
            </motion.p>

            <motion.p
              className={styles.paragraph}
              variants={aboutAnimations.item}
            >
              Furthermore, we are committed to responsible investing practices that align with environmental, social, and governance (ESG) principles. By integrating sustainability considerations into our investment strategies, we strive to create a positive ripple effect that goes beyond financial gains and contributes to a more equitable and sustainable future.
            </motion.p>

            <motion.p
              className={styles.paragraph}
              variants={aboutAnimations.item}
            >
              Phoenix VC is driven by a passion for unlocking untapped potential, driving disruptive change, and fostering a culture of entrepreneurship. We aim to be a trusted partner for founders and investors, a catalyst for innovation, and a driving force behind the success stories of tomorrow. Together, we will soar to new heights, igniting possibilities and shaping a brighter future for generations to come.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

About.displayName = "About";
export default About;
