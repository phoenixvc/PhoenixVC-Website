// components/ui/Disclaimer.tsx
import { FC, ReactNode } from "react";
import styles from "./Disclaimer.module.css";

export type DisclaimerType = "info" | "warning" | "coming-soon";

interface DisclaimerProps {
  type?: DisclaimerType;
  title: string;
  message: string | ReactNode;
  onDismiss?: () => void;
  icon?: ReactNode;
}

export const Disclaimer: FC<DisclaimerProps> = ({
  type = "info",
  title,
  message,
  onDismiss,
  icon
}): JSX.Element => {
  const getIcon = (): ReactNode => {
    if (icon) return icon;
    
    switch (type) {
      case "warning":
        return "⚠️";
      case "coming-soon":
        return "🚧";
      case "info":
      default:
        return "ℹ️";
    }
  };

  // Convert kebab-case type to camelCase for CSS class
  const getTypeClass = (): string => {
    if (type === "coming-soon") return "comingSoon";
    return type;
  };

  return (
    <div className={`${styles.disclaimer} ${styles[getTypeClass()]}`}>
      <div className={styles.content}>
        <div className={styles.icon}>{getIcon()}</div>
        <div className={styles.text}>
          <div className={styles.title}>{title}</div>
          <div className={styles.message}>{message}</div>
        </div>
        {onDismiss && (
          <button 
            className={styles.dismissButton}
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Disclaimer;
