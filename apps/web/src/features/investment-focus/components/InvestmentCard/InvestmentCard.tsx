import { motion } from "framer-motion";
import { FocusArea } from "../../types";
import styles from "./InvestmentCard.module.css";
import { investmentFocusAnimations } from "../../animations/animations";

interface InvestmentCardProps {
  area: FocusArea;
  index: number;
  isDarkMode: boolean;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ area, index, isDarkMode }) => {
  return (
    <motion.div
      className={`${styles.card} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
      variants={investmentFocusAnimations.card}
      custom={index}
    >
      {/* Card Icon */}
      <motion.div
        className={styles.icon}
        role="img"
        aria-label={`${area.title} icon`}
        variants={investmentFocusAnimations.icon}
      >
        {area.icon}
      </motion.div>

      {/* Card Title */}
      <h3 className={styles.title}>
        {area.title}
      </h3>

      {/* Card Description */}
      <p className={styles.description}>
        {area.description}
      </p>
    </motion.div>
  );
};

export default InvestmentCard;
