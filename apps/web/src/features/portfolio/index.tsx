// /features/portfolio/index.tsx
import { useTheme } from "@/theme";
import { motion } from "framer-motion";
import { ExternalLink, Github, Cpu, Network, BookOpen, Shield, FileText } from "lucide-react";
import styles from "./Portfolio.module.css";

interface Project {
  name: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  website?: string;
  github?: string;
  docs?: string;
  status: "live" | "development" | "beta" | "alpha" | "pre-alpha";
  tags: string[];
}

const projects: Project[] = [
  {
    name: "Mystira",
    description: "Interactive storytelling adventures for children and families",
    longDescription: "Mystira brings the wonder of storytelling to life for children, parents, and group leaders alike. It transforms shared playtime into immersive, interactive adventures filled with imagination, cooperation, and creativity. Each Mystira story is grounded in child development research, fostering emotional growth, problem-solving skills, and meaningful connections.",
    icon: <BookOpen size={32} />,
    website: "https://mystira.app",
    status: "alpha",
    tags: ["Storytelling", "Children", "Interactive", "Education"],
  },
  {
    name: "Phoenix Rooivalk",
    description: "AI-powered counter-drone defense platform",
    longDescription: "Phoenix Rooivalk is a sophisticated counter-drone platform that leverages advanced AI and machine learning for real-time drone detection, classification, and neutralization. Named after the South African Rooivalk attack helicopter, it provides comprehensive airspace protection with automated threat assessment and response capabilities.",
    icon: <Shield size={32} />,
    website: "https://phoenixrooivalk.com/",
    docs: "https://docs.phoenixrooivalk.com/",
    github: "https://github.com/JustAGhosT/PhoenixRooivalk",
    status: "pre-alpha",
    tags: ["Counter-Drone", "AI", "Defense", "Security"],
  },
  {
    name: "Cognitive Mesh",
    description: "Enterprise-grade AI transformation framework",
    longDescription: "Cognitive Mesh is an enterprise-grade AI transformation framework designed to orchestrate multi-agent cognitive systems with institutional-grade security and compliance controls. It features a five-layer hexagonal architecture enabling organizations to build, deploy, and manage advanced AI capabilities with comprehensive governance, NIST AI Risk Management Framework compliance, and Zero-Trust security architecture.",
    icon: <Network size={32} />,
    github: "https://github.com/justaghost/cognitive-mesh",
    status: "pre-alpha",
    tags: ["Multi-Agent", "Enterprise", "Security", "Governance", "Azure", ".NET"],
  },
];

const statusColors: Record<Project["status"], { bg: string; text: string; label: string }> = {
  live: { bg: "rgba(76, 175, 80, 0.2)", text: "#4caf50", label: "Live" },
  beta: { bg: "rgba(255, 152, 0, 0.2)", text: "#ff9800", label: "Beta" },
  alpha: { bg: "rgba(156, 39, 176, 0.2)", text: "#9c27b0", label: "Alpha" },
  "pre-alpha": { bg: "rgba(121, 85, 72, 0.2)", text: "#795548", label: "Pre-Alpha / Seeding" },
  development: { bg: "rgba(33, 150, 243, 0.2)", text: "#2196f3", label: "In Development" },
};

const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  },
  card: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  },
};

export const Portfolio = () => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  return (
    <section className={`${styles.portfolioSection} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial="hidden"
          animate="visible"
          variants={animations.container}
        >
          {/* Header */}
          <motion.div className={styles.header} variants={animations.item}>
            <div className={styles.headerIcon}>
              <Cpu size={48} />
            </div>
            <h1 className={styles.sectionHeading}>Our Portfolio</h1>
            <div className={styles.divider}></div>
            <p className={styles.subtitle}>
              Pioneering the future through innovative projects and cutting-edge technology initiatives.
            </p>
          </motion.div>

          {/* Projects Grid */}
          <motion.div className={styles.projectsGrid} variants={animations.item}>
            {projects.map((project, index) => (
              <motion.div
                key={index}
                className={styles.projectCard}
                variants={animations.card}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.projectIcon}>
                    {project.icon}
                  </div>
                  <div
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: statusColors[project.status].bg,
                      color: statusColors[project.status].text,
                    }}
                  >
                    {statusColors[project.status].label}
                  </div>
                </div>

                <h2 className={styles.projectName}>{project.name}</h2>
                <p className={styles.projectDescription}>{project.description}</p>
                <p className={styles.projectLongDescription}>{project.longDescription}</p>

                <div className={styles.tags}>
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className={styles.cardActions}>
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.actionButton}
                    >
                      <ExternalLink size={18} />
                      Website
                    </a>
                  )}
                  {project.docs && (
                    <a
                      href={project.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.actionButton} ${styles.docsButton}`}
                    >
                      <FileText size={18} />
                      Docs
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.actionButton} ${styles.githubButton}`}
                    >
                      <Github size={18} />
                      GitHub
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div className={styles.ctaSection} variants={animations.item}>
            <h3 className={styles.ctaTitle}>Interested in Collaboration?</h3>
            <p className={styles.ctaText}>
              We're always looking for innovative partners and contributors to help shape
              the future of technology.
            </p>
            <motion.a
              href="/#contact"
              className={styles.ctaButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Get in Touch
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
