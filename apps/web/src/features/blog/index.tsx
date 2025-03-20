// /features/blog/index.tsx
import { useTheme } from "@/theme";
import styles from "./Blog.module.css";

export const Blog = () => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  return (
    <section className={`${styles.blogSection} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.container}>
        <div className={styles.cosmicBackground}>
          <h1 className={styles.sectionHeading}>Our Blog</h1>
          <div className={styles.divider}></div>

          <div className={styles.comingSoonContainer}>
            <div className={styles.orbitalElement}></div>
            <h2 className={styles.comingSoonText}>Coming Soon</h2>
            <p className={styles.description}>
              We're preparing insightful articles about venture capital, emerging technologies,
              and market trends. Stay tuned for our expert analyses and thought leadership.
            </p>

            <div className={styles.subscribeContainer}>
              <h3 className={styles.subscribeHeading}>Get Notified</h3>
              <p>Subscribe to be the first to know when our blog launches:</p>

              <form className={styles.subscribeForm}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={styles.emailInput}
                  required
                />
                <button type="submit" className={styles.subscribeButton}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
