// components/Layout/MobileMenu/MobileMenu.tsx
import { FC, memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import styles from "./MobileMenu.module.css";
import { MobileMenuProps } from "@/features/layout/types";

const menuVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0 }
};

/**
 * Mobile navigation menu component that matches Phoenix VC theme
 */
const MobileMenu: FC<MobileMenuProps> = memo(({
  isOpen,
  onClose,
  navItems,
  className,
  isDarkMode,
}) => {
  // Track which item is being clicked for visual feedback
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Handle navigation and menu closing
  const handleNavigation = (path: string, label: string) => {
    // Set active state for visual feedback
    setActiveItem(label);

    // Close the menu first
    setTimeout(() => {
      onClose();

      // Handle navigation after a small delay to allow menu closing animation
      setTimeout(() => {
        // Check if it"s an anchor link (starts with #)
        if (path.startsWith("#")) {
          const element = document.querySelector(path);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          // External link or different page
          window.location.href = path;
        }

        // Reset active state
        setActiveItem(null);
      }, 100);
    }, 150);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.backdrop}
            onClick={onClose}
          />

          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={twMerge(
              styles.menuContainer,
              isDarkMode ? styles.darkMode : styles.lightMode,
              className
            )}
          >
            <nav className={styles.menuNav}>
              {navItems && navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  className={styles.menuItem}
                >
                  <button
                    onClick={() => handleNavigation(item.path, item.label)}
                    className={twMerge(
                      styles.navLink,
                      item.style === "primary" && styles.primaryButton,
                      item.style === "secondary" && styles.secondaryButton,
                      activeItem === item.label && styles.activeItem
                    )}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

MobileMenu.displayName = "MobileMenu";
export default MobileMenu;
