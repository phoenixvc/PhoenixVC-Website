import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import styles from './MobileMenu.module.css';
import { MobileMenuProps } from '../../types';
import { menuVariants, itemVariants } from '../../animations';

/**
 * Mobile navigation menu component
 */
export const MobileMenu = ({
  isOpen,
  onClose,
  items,
  className,
}: MobileMenuProps) => {
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
            className={twMerge(styles.menuContainer, className)}
          >
            <nav className={styles.menuNav}>
              {items.map((item, index) => (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className={styles.menuItem}
                >
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      const element = document.querySelector(item.path);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={styles.navLink}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
