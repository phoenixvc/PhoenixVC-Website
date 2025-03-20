// /features/projects/index.tsx
import { useTheme } from "@/theme";
import styles from "./Projects.module.css";

export const Projects = () => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  return (
    <section className={`${styles.projectsSection} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.container}>
        <div className={styles.cosmicBackground}>
          <h1 className={styles.sectionHeading}>Our Projects</h1>
          <div className={styles.divider}></div>

          <div className={styles.comingSoonContainer}>
            <div className={styles.orbitalElement}></div>
            <h2 className={styles.comingSoonText}>Coming Soon</h2>
            <p className={styles.description}>
              We're curating an impressive showcase of our investment portfolio and
              successful ventures. Soon, you'll be able to explore our projects across
              various technology sectors and see the impact of our strategic investments.
            </p>

            <div className={styles.interestContainer}>
              <h3 className={styles.interestHeading}>Interested in Collaboration?</h3>
              <p>If you have an innovative project that aligns with our investment focus:</p>

              <button className={styles.contactButton}>
                Contact Our Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
