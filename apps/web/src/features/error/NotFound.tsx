// features/error/NotFound.tsx
import { FC, memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { useTheme } from "@/theme";
import styles from "./NotFound.module.css";

const NotFound: FC = memo(() => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  return (
    <section className={`${styles.container} ${isDarkMode ? styles.dark : styles.light}`}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className={styles.errorCode}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          404
        </motion.h1>

        <h2 className={styles.title}>Page Not Found</h2>

        <p className={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryButton}>
            <Home size={18} />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className={styles.secondaryButton}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </motion.div>
    </section>
  );
});

NotFound.displayName = "NotFound";
export { NotFound };
export default NotFound;
