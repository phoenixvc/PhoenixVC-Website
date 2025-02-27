import { SidebarProps } from "../../types";
import styles from "./sidebar.module.css";

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close sidebar"
      >
        &times;
      </button>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
