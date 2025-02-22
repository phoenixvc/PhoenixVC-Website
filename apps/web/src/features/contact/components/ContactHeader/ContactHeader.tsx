import { FC } from "react";
import { motion } from "framer-motion";
import { contactAnimations } from "../../animations";
import { ContactHeaderProps } from "../../types";
import styles from "./ContactHeader.module.css";

const ContactHeader: FC<ContactHeaderProps> = ({ title, subtitle, className = "" }) => {
  return (
    <div className={className}>
      <motion.h2 className={styles.heading} variants={contactAnimations.item}>
        {title}
      </motion.h2>
      <motion.p className={styles.subtitle} variants={contactAnimations.item}>
        {subtitle}
      </motion.p>
    </div>
  );
};

export default ContactHeader;
