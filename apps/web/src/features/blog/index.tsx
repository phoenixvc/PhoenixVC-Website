// /features/blog/index.tsx
import { useTheme } from "@/theme";
import { useEffect } from "react";
import { Linkedin } from "lucide-react";
import styles from "./Blog.module.css";

interface SubstackPost {
  title: string;
  subtitle: string;
  url: string;
}

const substackPosts: SubstackPost[] = [
  {
    title: "Bitcoin versus Gold: A Fool's Debate?",
    subtitle: "Understanding Volatility's Impact",
    url: "https://ebenmare.substack.com/p/bitcoin-versus-gold-a-fools-debate",
  },
  {
    title: "Is Bitcoin doomed to fail by design? Unraveling the risks that threaten the future of Cryptocurrency",
    subtitle: "A Comprehensive Analysis of the Actual and Perceived Risks facing Bitcoin.",
    url: "https://ebenmare.substack.com/p/is-bitcoin-doomed-to-fail-by-design",
  },
  {
    title: "Decoding Bitcoin Ordinals: An Index and Correlation Analysis",
    subtitle: "An exploration of Ordinals from a financial perspective",
    url: "https://ebenmare.substack.com/p/decoding-bitcoin-ordinals-an-index",
  },
];

export const Blog = () => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  useEffect(() => {
    // Load Substack embed script
    const script = document.createElement("script");
    script.src = "https://substack.com/embedjs/embed.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector("script[src=\"https://substack.com/embedjs/embed.js\"]");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section className={`${styles.blogSection} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.container}>
        <div className={styles.cosmicBackground}>
          <h1 className={styles.sectionHeading}>Our Blog</h1>
          <div className={styles.divider}></div>

          <p className={styles.introText}>
            Insights on venture capital, blockchain technology, fintech, and emerging trends
            from our team and partners.
          </p>

          {/* Substack Embeds */}
          <div className={styles.postsGrid}>
            {substackPosts.map((post, index) => (
              <div key={index} className={styles.postCard}>
                <div
                  className="substack-post-embed"
                  dangerouslySetInnerHTML={{
                    __html: `
                      <p lang="en">${post.title} by Eben Maré</p>
                      <p>${post.subtitle}</p>
                      <a data-post-link href="${post.url}">Read on Substack</a>
                    `,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Team Links Section */}
          <div className={styles.teamSection}>
            <h2 className={styles.teamHeading}>Follow Our Team</h2>
            <div className={styles.teamLinks}>
              <a
                href="https://ebenmare.substack.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.teamLink}
              >
                <span className={styles.substackIcon}>📰</span>
                Eben Maré's Substack
              </a>
              <a
                href="https://www.linkedin.com/company/101922781/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.teamLink}
              >
                <Linkedin size={20} />
                Phoenix VC on LinkedIn
              </a>
            </div>
          </div>

          {/* Subscribe Section */}
          <div className={styles.subscribeContainer}>
            <h3 className={styles.subscribeHeading}>Stay Updated</h3>
            <p>Subscribe to get notified about new articles and insights:</p>

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
    </section>
  );
};

export default Blog;
