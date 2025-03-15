import { motion } from "framer-motion";
import { FOCUS_AREAS } from "../../constants";
import { investmentFocusAnimations } from "../../animations/animations";
import InvestmentCard from "../InvestmentCard/InvestmentCard";
import styles from "./InvestmentFocus.module.css";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import starfieldStyles from "./Starfield/interactiveStarfield.module.css"; 

export const InvestmentFocus: React.FC = () => {

  // Use our observer hook and log when the section becomes visible
  // this shouldn't be needed with newer react versions
  const sectionRef = useSectionObserver("focus", (id) => {
    console.log(`[Focus] Section "${id}" is now visible`);
  });

  return (
    <section id="focus" ref={sectionRef} className={styles.section}>
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
            <InvestmentCard key={index} area={area} index={index} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default InvestmentFocus;
