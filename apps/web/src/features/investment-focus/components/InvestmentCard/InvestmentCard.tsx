import { motion } from "framer-motion";
import { memo } from "react";
import { FocusArea } from "../../types";
import styles from "./InvestmentCard.module.css";
import { investmentFocusAnimations } from "../../animations/animations";
import { useTheme } from "@/theme";

interface InvestmentCardProps {
  area: FocusArea;
  index: number;
  onClick?: () => void;
}

const InvestmentCard: React.FC<InvestmentCardProps> = memo(({ area, index, onClick }) => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";
  return (
    <motion.button
      type="button"
      className={`${styles.card} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
      variants={investmentFocusAnimations.card}
      custom={index}
      onClick={onClick}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
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
    </motion.button>
  );
});

InvestmentCard.displayName = "InvestmentCard";
export default InvestmentCard;
