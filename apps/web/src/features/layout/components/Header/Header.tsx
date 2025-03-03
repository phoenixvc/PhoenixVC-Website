import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Navigation, MobileMenu, NAVIGATION_ITEMS } from "@/features/navigation";
import { headerVariants } from "../../animations";
import { useTheme } from "@/theme";
import styles from "./header.module.css";
import { useSmoothScroll } from "@/hooks//index.ts";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export const Header: React.FC = () => {
  const { themeName: colorScheme, themeMode: mode } = useTheme();
  const themeClass = `theme-${colorScheme}-${mode}`;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useSmoothScroll();

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className={`
        ${styles.header}
        ${isScrolled ? styles.headerScrolled : styles.headerTransparent}
        ${themeClass}
      `}
    >
      <nav className={styles.navContainer}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Logo />
        </motion.div>

        {/* Navigation – visible on desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <Navigation
            items={NAVIGATION_ITEMS}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            variant="header"
          />
        </div>

        {/* Right: Theme toggle and mobile menu button */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            className={`${styles.menuButton} md:hidden`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              {isMenuOpen ? <X className={styles.icon} /> : <Menu className={styles.icon} />}
            </motion.div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <div className="md:hidden">
            <MobileMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              items={NAVIGATION_ITEMS}
            />
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
