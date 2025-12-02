// /features/portfolio/index.tsx
import { useState } from "react";
import { useTheme } from "@/theme";
import { motion } from "framer-motion";
import { ExternalLink, Github, Cpu, Network, BookOpen, Shield, FileText, Key, Car, Users, Vault, Eye, EyeOff } from "lucide-react";
import styles from "./Portfolio.module.css";

interface Project {
  name: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  website?: string;
  github?: string;
  docs?: string;
  status: "live" | "development" | "beta" | "alpha" | "pre-alpha" | "early-stage" | "growth";
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
  {
    name: "Airkey",
    description: "Digital access management solutions",
    longDescription: "Airkey Ltd provides innovative digital access management solutions that enable secure, keyless entry systems for commercial and residential properties. Using advanced cryptography and mobile technology, Airkey transforms how organizations manage physical access control.",
    icon: <Key size={32} />,
    status: "early-stage",
    tags: ["Access Control", "Security", "IoT", "Mobile"],
  },
  {
    name: "Hop",
    description: "Innovative transportation technology",
    longDescription: "Hop Pty Ltd is revolutionizing urban mobility with innovative transportation technology solutions. Their platform connects commuters with efficient, sustainable transport options while optimizing route planning and reducing congestion.",
    icon: <Car size={32} />,
    status: "early-stage",
    tags: ["Transportation", "Mobility", "Smart City", "Sustainability"],
  },
  {
    name: "Chaufher",
    description: "Women-focused transportation service",
    longDescription: "Chaufher Pty Ltd is a women-focused transportation service designed to provide safe, reliable rides for women, by women. The platform prioritizes passenger safety with vetted drivers and specialized features tailored to women's transportation needs.",
    icon: <Users size={32} />,
    status: "growth",
    tags: ["Transportation", "Safety", "Women-Focused", "Ride-Sharing"],
  },
  {
    name: "VeritasVault",
    description: "DeFi staking and treasury-backed rewards platform",
    longDescription: "VeritasVault is a decentralized finance platform offering transparent, treasury-backed staking rewards with auto-compounding yields. The platform enables users to earn real yield through depositing, staking, and voting mechanisms with no lock-ups and instant withdrawals.",
    icon: <Vault size={32} />,
    website: "https://veritasvault.net",
    github: "https://github.com/justAGhosT/vv",
    status: "pre-alpha",
    tags: ["DeFi", "Blockchain", "Staking", "Crypto", "Web3"],
  },
];

const statusColors: Record<Project["status"], { bg: string; text: string; label: string }> = {
  live: { bg: "rgba(76, 175, 80, 0.2)", text: "#4caf50", label: "Live" },
  beta: { bg: "rgba(255, 152, 0, 0.2)", text: "#ff9800", label: "Beta" },
  alpha: { bg: "rgba(156, 39, 176, 0.2)", text: "#9c27b0", label: "Alpha" },
  "pre-alpha": { bg: "rgba(121, 85, 72, 0.2)", text: "#795548", label: "Pre-Alpha / Seeding" },
  "early-stage": { bg: "rgba(230, 126, 34, 0.2)", text: "#e67e22", label: "Early Stage" },
  growth: { bg: "rgba(231, 76, 60, 0.2)", text: "#e74c3c", label: "Growth Stage" },
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
  const [showComingSoon, setShowComingSoon] = useState(true);

  // Determine if a project is "coming soon" (no public links available)
  const isComingSoon = (project: Project) => !project.website && !project.github && !project.docs;

  // Filter projects based on toggle state
  const visibleProjects = showComingSoon
    ? projects
    : projects.filter(project => !isComingSoon(project));

  const comingSoonCount = projects.filter(isComingSoon).length;

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
            {comingSoonCount > 0 && (
              <button
                className={styles.toggleButton}
                onClick={() => setShowComingSoon(!showComingSoon)}
                aria-label={showComingSoon ? "Hide coming soon projects" : "Show coming soon projects"}
              >
                {showComingSoon ? <EyeOff size={18} /> : <Eye size={18} />}
                <span>
                  {showComingSoon
                    ? `Hide Coming Soon (${comingSoonCount})`
                    : `Show Coming Soon (${comingSoonCount})`}
                </span>
              </button>
            )}
          </motion.div>

          {/* Projects Grid */}
          <motion.div className={styles.projectsGrid} variants={animations.item}>
            {visibleProjects.map((project, index) => (
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
                  {isComingSoon(project) && (
                    <div className={styles.comingSoonBadge}>
                      Coming Soon
                    </div>
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
