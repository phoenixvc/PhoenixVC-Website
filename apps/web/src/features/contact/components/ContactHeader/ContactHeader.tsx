// features/contact/components/ContactHeader/ContactHeader.tsx
import { FC, memo } from "react";
import { motion } from "framer-motion";
import { contactAnimations } from "../../animations";
import styles from "./ContactHeader.module.css";
import { useTheme } from "@/theme";

interface ContactHeaderProps {
  title: string;
  subtitle: string;
}

const ContactHeader: FC<ContactHeaderProps> = memo(({ title, subtitle }) => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";
  return (
    <motion.div variants={contactAnimations.item}>
      <h2 className={`${styles.heading} ${isDarkMode ? styles.darkHeading : styles.lightHeading}`}>
        {title}
      </h2>
      <p className={`${styles.subtitle} ${isDarkMode ? styles.darkSubtitle : styles.lightSubtitle}`}>
        {subtitle}
      </p>
    </motion.div>
  );
});

ContactHeader.displayName = "ContactHeader";
export default ContactHeader;
