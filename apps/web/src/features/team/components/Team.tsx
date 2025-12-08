// apps/web/src/features/team/components/Team.tsx
import { FC, memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/theme";
import { containerVariants, itemVariants } from "@/animations/variants";
import styles from "./Team.module.css";

// TODO: Production hardening:
// 1. Fetch team data from a headless CMS or API.
// 2. Add social media links and detailed bios for each member.
// 3. Implement a proper grid system for responsive layout.
// 4. Add unit and integration tests.

const teamMembers = [
  { name: "John Doe", role: "Managing Partner" },
  { name: "Jane Smith", role: "Venture Partner" },
  { name: "Peter Jones", role: "Principal" },
];

const advisors = [
  { name: "Alice Williams", role: "Industry Advisor" },
  { name: "Bob Brown", role: "Technology Advisor" },
];

const Team: FC = memo(() => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  return (
    <section
      id="team"
      className={`${styles.section} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
    >
      <motion.div
        className="container mx-auto px-6 max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className={styles.heading}>
          Our Team & Advisors
        </motion.h2>

        <motion.h3 variants={itemVariants} className={styles.subheading}>
          Meet the Experts
        </motion.h3>

        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              variants={itemVariants}
              className={styles.teamMember}
            >
              <div className={styles.avatar}></div>
              <h4 className={styles.name}>{member.name}</h4>
              <p className={styles.role}>{member.role}</p>
            </motion.div>
          ))}
        </div>

        <motion.h3 variants={itemVariants} className={styles.subheading}>
          Our Advisors
        </motion.h3>

        <div className={styles.teamGrid}>
          {advisors.map((advisor) => (
            <motion.div
              key={advisor.name}
              variants={itemVariants}
              className={styles.teamMember}
            >
              <div className={styles.avatar}></div>
              <h4 className={styles.name}>{advisor.name}</h4>
              <p className={styles.role}>{advisor.role}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
});

Team.displayName = "Team";
export default Team;
