import { motion } from "framer-motion";
import { FocusArea } from "../../types";
import { investmentFocusAnimations } from "../../animations/animations";
import styles from "./InvestmentCard.module.css";
import starfieldStyles from "../../../../features/layout/components/Starfield/starfield.module.css";

interface InvestmentCardProps {
  area: FocusArea;
  index: number;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ area, index }) => {
  return (
    <motion.div
      key={index}
      variants={investmentFocusAnimations.card}
      whileHover="hover"
      className={styles.card && starfieldStyles.focusAreaCard}
    >
      <motion.div
        className={styles.icon}
        variants={investmentFocusAnimations.icon}
        role="img"
        aria-label={`${area.title} icon`}
      >
        {area.icon}
      </motion.div>

      <motion.h3 className={styles.title} layout>
        {area.title}
      </motion.h3>

      <motion.p className={styles.description} layout>
        {area.description}
      </motion.p>
    </motion.div>
  );
};

export default InvestmentCard;
