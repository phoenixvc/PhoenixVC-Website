import React from "react";
import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "../../constants";
import { containerVariants, itemVariants } from "../../animations";
import styles from "./footer.module.css";
import { NAVIGATION_ITEMS } from "@/features/navigation";

interface FooterProps {
  isDarkMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDarkMode = true }) => {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className={`${styles.footer} ${isDarkMode ? styles.dark : styles.light}`}
    >
      <div className={styles.footerGlow}></div>
      <div className={styles.container}>
        <div className={styles.gridContainer}>
          {/* Logo and company description */}
          <motion.div className={styles.logoSection} variants={itemVariants}>
            <div className={styles.logoWrapper}>
              {/* Using styled text to match header */}
              <span className={styles.logoText}>Phoenix VC</span>
            </div>
            <p className={styles.description}>
              Empowering visionary entrepreneurs and innovative startups to shape the future of technology.
            </p>
            <div className={styles.socialLinks}>
              {SOCIAL_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  aria-label={link.label}
                  title={link.label}
                >
                  <span className={styles.iconWrapper}>
                    {link.icon || link.label.charAt(0)}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation Links - Matching sidebar sections */}
          <motion.div variants={itemVariants} className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>Navigation</h4>
            <ul className={styles.linkList}>
              {NAVIGATION_ITEMS.filter(item => item.type !== "section").map((item) => (
                <motion.li key={item.path} variants={itemVariants}>
                  <a href={item.path} className={styles.link}>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources section - With Substack added */}
          <motion.div variants={itemVariants} className={styles.linksSection}>
            <h4 className={styles.sectionTitle}>Resources</h4>
            <ul className={styles.linkList}>
              <motion.li variants={itemVariants}>
                <a href="/documentation" className={styles.link}>Documentation</a>
              </motion.li>
              <motion.li variants={itemVariants}>
                <a href="/theme-designer" className={styles.link}>Theme Designer</a>
              </motion.li>
              <motion.li variants={itemVariants}>
                <a
                  href="https://ebenmare.substack.com/"
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Newsletter
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        {/* Footer bottom with cosmic particles */}
        <motion.div variants={itemVariants} className={styles.footerBottom}>
          <div className={styles.particles}></div>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Phoenix VC. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
