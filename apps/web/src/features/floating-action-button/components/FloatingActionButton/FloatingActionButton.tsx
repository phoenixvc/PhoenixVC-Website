import { FloatingActionButtonProps } from "../../types";
import styles from "./floating-action-button.module.css";

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
}) => {
  return (
    <button
      className={styles.fab}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
    </button>
  );
};
