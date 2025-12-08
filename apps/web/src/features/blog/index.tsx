// /features/blog/index.tsx
import { useTheme } from "@/theme";
import React, { useEffect, useState, FormEvent, useMemo } from "react";
import {
  Linkedin,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import styles from "./Blog.module.css";

type Author = "Eben Maré" | "Jurie Smit";
type BlogCategory = "Finance" | "Blockchain" | "Technology" | "AI" | "Strategy";
type ArticleSource = "substack" | "linkedin";

interface BlogPost {
  title: string;
  subtitle: string;
  url: string;
  author: Author;
  category: BlogCategory;
  date?: string;
  source: ArticleSource;
  readTime?: string;
}

const blogPosts: BlogPost[] = [
  // Eben Maré's Substack posts
  {
    title: "Bitcoin versus Gold: A Fool's Debate?",
    subtitle: "Understanding Volatility's Impact",
    url: "https://ebenmare.substack.com/p/bitcoin-versus-gold-a-fools-debate",
    author: "Eben Maré",
    category: "Finance",
    date: "Mar 15, 2024",
    source: "substack",
  },
  {
    title: "Is Bitcoin doomed to fail by design?",
    subtitle:
      "A Comprehensive Analysis of the Actual and Perceived Risks facing Bitcoin.",
    url: "https://ebenmare.substack.com/p/is-bitcoin-doomed-to-fail-by-design",
    author: "Eben Maré",
    category: "Blockchain",
    date: "Feb 28, 2024",
    source: "substack",
  },
  {
    title: "Decoding Bitcoin Ordinals: An Index and Correlation Analysis",
    subtitle: "An exploration of Ordinals from a financial perspective",
    url: "https://ebenmare.substack.com/p/decoding-bitcoin-ordinals-an-index",
    author: "Eben Maré",
    category: "Blockchain",
    date: "Jan 22, 2024",
    source: "substack",
  },
  // Jurie Smit's Substack posts
  {
    title:
      "Practical Cognitive Sovereignty: Your Guide to Staying Human in an AI World",
    subtitle:
      "How to maintain meaningful control and decision-making authority while benefiting from AI's capabilities",
    url: "https://juriesmit.substack.com/p/practical-cognitive-sovereignty",
    author: "Jurie Smit",
    category: "AI",
    date: "Jul 10, 2024",
    source: "substack",
    readTime: "4 min",
  },
  {
    title: "The Evolution of Workflow Systems",
    subtitle:
      "From Taylor and Gantt's early 1900s efficiency studies to agentic AI: workflows with persistent tasks and self-organizing teams",
    url: "https://juriesmit.substack.com/p/the-evolution-of-workflow-systems",
    author: "Jurie Smit",
    category: "Technology",
    date: "Jul 9, 2024",
    source: "substack",
    readTime: "12 min",
  },
  {
    title: "Beyond AI Criticism: The Expert's Playbook",
    subtitle:
      "Why viral AI critiques miss the point, and what experts do differently. A series on AI, Expertise, and Tool Criticism.",
    url: "https://juriesmit.substack.com/p/beyond-ai-criticism",
    author: "Jurie Smit",
    category: "AI",
    date: "May 20, 2024",
    source: "substack",
    readTime: "6 min",
  },
  // Jurie Smit's LinkedIn articles
  {
    title: "The Prompt Trap: Why Perfect Inputs Kill Productivity",
    subtitle:
      "An equally costly failure mode following the Polish Trap - when optimizing prompts becomes counterproductive",
    url: "https://www.linkedin.com/pulse/prompt-trap-why-perfect-inputs-kill-productivity-jurie-smit",
    author: "Jurie Smit",
    category: "AI",
    date: "2024",
    source: "linkedin",
    readTime: "5 min",
  },
  {
    title: "The Paradox of Perfection: How AI is Liberating Creativity",
    subtitle:
      "A paradox that plagues many talented individuals: the pursuit of perfection vs creative freedom",
    url: "https://www.linkedin.com/pulse/paradox-perfection-how-ai-liberating-creativity-jurie-smit",
    author: "Jurie Smit",
    category: "AI",
    date: "2024",
    source: "linkedin",
    readTime: "3 min",
  },
  {
    title:
      "The Paradox of AI Documentation: Unified Context vs. Increased Output",
    subtitle:
      "As AI tools become integral to modern software development, professionals notice interesting patterns",
    url: "https://www.linkedin.com/pulse/paradox-ai-documentation-unified-context-vs-increased-jurie-smit",
    author: "Jurie Smit",
    category: "Technology",
    date: "2024",
    source: "linkedin",
    readTime: "7 min",
  },
  {
    title:
      "The Sensitive Professional: Harnessing Creative Intensity in the Technical World",
    subtitle:
      "The truly creative mind in any field: understanding creative intensity and sensitivity",
    url: "https://www.linkedin.com/pulse/sensitive-professional-harnessing-creative-intensity-jurie-smit",
    author: "Jurie Smit",
    category: "Strategy",
    date: "2024",
    source: "linkedin",
    readTime: "7 min",
  },
  {
    title: "The Value of Deleting 1000 Lines of Code vs. Creating It",
    subtitle:
      "We often celebrate productivity through creation—but what about the value of thoughtful deletion?",
    url: "https://www.linkedin.com/pulse/value-deleting-1000-lines-code-vs-creating-legacy-jurie-smit",
    author: "Jurie Smit",
    category: "Technology",
    date: "2024",
    source: "linkedin",
    readTime: "5 min",
  },
  {
    title: "South Africa's 2025 VAT Hike: Legacy System Challenges and Impacts",
    subtitle:
      "A seemingly modest 0.5% VAT adjustment reveals challenges in legacy systems architecture",
    url: "https://www.linkedin.com/pulse/south-africas-2025-vat-hike-legacy-system-challenges-jurie-smit",
    author: "Jurie Smit",
    category: "Technology",
    date: "2024",
    source: "linkedin",
    readTime: "6 min",
  },
];

const categories = [
  "All",
  "Finance",
  "Blockchain",
  "Technology",
  "AI",
  "Strategy",
] as const;

export const Blog = (): React.ReactElement => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("All");

  // Filter posts based on search and filters
  const filteredPosts = useMemo((): BlogPost[] => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesAuthor =
        selectedAuthor === "All" || post.author === selectedAuthor;

      return matchesSearch && matchesCategory && matchesAuthor;
    });
  }, [searchQuery, selectedCategory, selectedAuthor]);

  const handleSubscribe = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setSubscribeStatus("error");
      return;
    }

    // Open Substack subscribe page in new tab with email pre-filled
    const substackUrl = `https://ebenmare.substack.com/subscribe?email=${encodeURIComponent(email)}`;
    window.open(substackUrl, "_blank", "noopener,noreferrer");
    setSubscribeStatus("success");
    setEmail("");

    // Reset status after 3 seconds
    setTimeout(() => setSubscribeStatus("idle"), 3000);
  };

  useEffect(() => {
    // Load Substack embed script with error handling
    const script = document.createElement("script");
    script.src = "https://substack.com/embedjs/embed.js";
    script.async = true;
    script.charset = "utf-8";

    // Handle script loading errors gracefully
    script.onerror = (): void => {
      // Substack embed failed to load - this is non-critical, silently continue
      // The blog will still function, just without Substack embed features
    };

    document.body.appendChild(script);

    return (): void => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        "script[src=\"https://substack.com/embedjs/embed.js\"]",
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <>
      <SEO
        title="Blog"
        description="Insights on venture capital, blockchain technology, fintech, and emerging trends from the Phoenix VC team and partners."
        keywords="venture capital blog, fintech insights, blockchain analysis, startup investing"
      />
      <section
        className={`${styles.blogSection} ${isDarkMode ? styles.dark : styles.light}`}
      >
        <div className={styles.container}>
          <div className={styles.cosmicBackground}>
            <h1 className={styles.sectionHeading}>Our Blog</h1>
            <div className={styles.divider}></div>

            <p className={styles.introText}>
              Insights on venture capital, blockchain technology, fintech, and
              emerging trends from our team and partners.
            </p>

            {/* Search and Filter Section */}
            <div className={styles.filterSection}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search articles"
                />
              </div>

              <div className={styles.filterControls}>
                <div className={styles.filterGroup}>
                  <Filter size={16} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.filterSelect}
                    aria-label="Filter by category"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <User size={16} />
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className={styles.filterSelect}
                    aria-label="Filter by author"
                  >
                    <option value="All">All Authors</option>
                    <option value="Eben Maré">Eben Maré</option>
                    <option value="Jurie Smit">Jurie Smit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className={styles.postsGrid}>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <article key={index} className={styles.postCard}>
                    <div className={styles.postMeta}>
                      <span className={styles.categoryBadge}>
                        {post.category}
                      </span>
                      {post.date && (
                        <span className={styles.postDate}>
                          <Calendar size={12} />
                          {post.date}
                        </span>
                      )}
                    </div>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postSubtitle}>{post.subtitle}</p>
                    <div className={styles.postFooter}>
                      <span className={styles.postAuthor}>
                        <User size={14} />
                        {post.author}
                        {post.readTime && (
                          <span className={styles.readTime}>
                            {" "}
                            · {post.readTime}
                          </span>
                        )}
                      </span>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.readLink}
                      >
                        {post.source === "linkedin" ? (
                          <>
                            <Linkedin size={14} />
                            Read on LinkedIn
                          </>
                        ) : (
                          <>
                            Read on Substack
                            <ExternalLink size={14} />
                          </>
                        )}
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>No articles found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedAuthor("All");
                    }}
                    className={styles.resetButton}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
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
                  href="https://substack.com/@justawannebeghost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.teamLink}
                >
                  <span className={styles.substackIcon}>📰</span>
                  Jurie Smit's Substack
                </a>
                <a
                  href="https://www.linkedin.com/in/juriesmit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.teamLink}
                >
                  <Linkedin size={20} />
                  Jurie Smit on LinkedIn
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

              <form className={styles.subscribeForm} onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={styles.emailInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address for newsletter subscription"
                  aria-invalid={subscribeStatus === "error"}
                  required
                />
                <button
                  type="submit"
                  className={styles.subscribeButton}
                  disabled={subscribeStatus === "success"}
                >
                  {subscribeStatus === "success" ? "Subscribed!" : "Subscribe"}
                </button>
              </form>
              {subscribeStatus === "error" && (
                <p className={styles.errorMessage} role="alert">
                  Please enter a valid email address
                </p>
              )}
              {subscribeStatus === "success" && (
                <p className={styles.successMessage} role="status">
                  Redirecting to Substack...
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
