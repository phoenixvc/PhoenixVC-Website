// components/Layout/Footer/Footer.tsx
import React from "react"; // Added missing import
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { SOCIAL_LINKS } from "../../constants"; // Ensure this import exists
import { containerVariants, itemVariants } from "../../animations"; // Ensure this import exists
import styles from "./footer.module.css";
import { NAVIGATION_ITEMS } from "@/features/navigation"; // Ensure this import exists

interface FooterProps {
  isDarkMode?: boolean; // Added missing prop
}

export const Footer: React.FC<FooterProps> = ({ isDarkMode = true }) => {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className={`${styles.footer} ${isDarkMode ? "" : styles.lightMode}`}
    >
      <div className={styles.container}>
        <div className={styles.gridContainer}>
          {/* Left section: Logo and description */}
          <motion.div className={styles.logoSection} variants={itemVariants}>
            <Logo />
            <p className={styles.description}>
              Empowering visionary entrepreneurs and innovative startups to shape the future of technology.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              {NAVIGATION_ITEMS.map((item) => (
                <motion.li key={item.path} variants={itemVariants}>
                  <a
                    href={item.path}
                    className={styles.link}
                    onClick={(e) => {
                      if (item.type === "section") {
                        e.preventDefault();
                        const targetId = item.reference || item.path.replace("/#", "");
                        const element = document.getElementById(targetId);

                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        } else {
                          // Fallback to hash change if element isn't found
                          window.location.hash = targetId;
                        }
                      }
                    }}
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div variants={itemVariants}>
            <h4 className={styles.sectionTitle}>Connect</h4>
            <ul className={styles.linkList}>
              {SOCIAL_LINKS.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Footer bottom */}
        <motion.div variants={itemVariants} className={styles.footerBottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Phoenix VC. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
