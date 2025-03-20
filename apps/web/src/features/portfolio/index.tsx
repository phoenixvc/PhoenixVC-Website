// /features/portfolio/index.tsx
import { useTheme } from "@/theme";
import styles from "./Portfolio.module.css";

export const Portfolio = () => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  return (
    <section className={`${styles.portfolioSection} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.container}>
        <div className={styles.cosmicBackground}>
          <h1 className={styles.sectionHeading}>Our Portfolio</h1>
          <div className={styles.divider}></div>

          <div className={styles.comingSoonContainer}>
            <div className={styles.orbitalElement}></div>
            <h2 className={styles.comingSoonText}>Coming Soon</h2>
            <p className={styles.description}>
              Our comprehensive portfolio showcase is under development. Soon you'll be able to
              explore our investments across various sectors including AI, blockchain, clean tech,
              and more. Check back to see how we're shaping the future of technology.
            </p>

            <div className={styles.statsPreview}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>25+</div>
                <div className={styles.statLabel}>Portfolio Companies</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>$120M+</div>
                <div className={styles.statLabel}>Assets Under Management</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>8</div>
                <div className={styles.statLabel}>Successful Exits</div>
              </div>
            </div>

            <button className={styles.notifyButton}>
              Notify Me When Live
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
