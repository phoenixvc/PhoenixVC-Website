// features/contact/components/ContactHeader/ContactHeader.tsx
import { FC, memo } from "react";
import { motion } from "framer-motion";
import { contactAnimations } from "../../animations";
import styles from "./ContactHeader.module.css";

interface ContactHeaderProps {
  title: string;
  subtitle: string;
  isDarkMode: boolean;
}

const ContactHeader: FC<ContactHeaderProps> = memo(({ title, subtitle, isDarkMode }) => {
  return (
    <motion.div variants={contactAnimations.item}>
      <h2 className={`${styles.heading} ${isDarkMode ? styles.dark : ""}`}>
        {title}
      </h2>
      <p className={`${styles.subtitle} ${isDarkMode ? styles.dark : ""}`}>
        {subtitle}
      </p>
    </motion.div>
  );
});

ContactHeader.displayName = "ContactHeader";
export default ContactHeader;
