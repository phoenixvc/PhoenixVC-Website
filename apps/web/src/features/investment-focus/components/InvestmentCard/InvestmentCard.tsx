import { motion } from "framer-motion";
import { FocusArea } from "../../types";
import styles from "./InvestmentCard.module.css";
import { investmentFocusAnimations } from "../../animations/animations";

interface InvestmentCardProps {
  area: FocusArea;
  index: number;
  isDarkMode: boolean;
  onClick?: () => void;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ area, index, isDarkMode, onClick }) => {
  return (
    <motion.div
      className={`${styles.card} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
      variants={investmentFocusAnimations.card}
      custom={index}
      onClick={onClick}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      style={{ cursor: onClick ? "pointer" : "default" }}
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
