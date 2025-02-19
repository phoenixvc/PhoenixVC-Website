import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Navigation, MobileMenu, NAV_ITEMS } from "@/features/navigation";
import { headerVariants } from "../../animations";
import { useTheme } from "@/theme";
import ThemeToggle from "@/theme/components/ThemeToggle";
import styles from "./header.module.css";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export const Header: React.FC = () => {
  const { colorScheme, mode } = useTheme();
  // Combine colorScheme + mode => "theme-classic-dark" etc.
  const themeClass = `theme-${colorScheme}-${mode}`;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // If you have a custom smooth-scroll hook
  useSmoothScroll();

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      // Combine your local .header class with either .headerTransparent or .headerScrolled
      // plus your dynamic theme class
      className={`${styles.header} ${
        isScrolled ? styles.headerScrolled : styles.headerTransparent
      } ${themeClass}`}
    >
      <nav className={styles.navContainer}>
        {/* Left: Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Logo />
        </motion.div>

        {/* Middle: Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <Navigation variant="header" />
        </div>

        {/* Right: Theme Toggle & Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <motion.button
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className={styles.icon} />
            ) : (
              <Menu className={styles.icon} />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <MobileMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            items={NAV_ITEMS}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
