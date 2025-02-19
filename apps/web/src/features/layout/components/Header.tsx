import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Navigation, MobileMenu, NAV_ITEMS } from "@/features/navigation";
import { headerVariants } from "../animations";
import { useTheme } from "@/theme";
import ThemeToggle from "@/theme/components/ThemeToggle";

export const Header: React.FC = () => {
  const { colorScheme, colorSchemeClasses: classes } = useTheme();

  // Derive a theme class (e.g., "theme-classic", "theme-ocean", etc.)
  const themeClass = `theme-${colorScheme}`;

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeSection] = useState<string>(""); // For highlighting nav items

  // Track scroll to add a background shadow
  useEffect(() => {
    const handleScroll = (): void => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      // Debug log
      console.log(
        `%c[Header] Scroll detected. isScrolled: ${scrolled}`,
        "color: cyan; font-weight: bold;"
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Toggle the mobile menu
  const toggleMenu = (): void => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    console.log(
      `%c[Header] Menu toggled. isMenuOpen: ${newState}`,
      "color: yellow; font-weight: bold;"
    );
  };

  // Debug: whenever the colorScheme changes
  useEffect(() => {
    console.log(
      `%c[Header] Theme Updated. Current Theme: ${colorScheme}`,
      "color: magenta; font-weight: bold;"
    );
  }, [colorScheme]);

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className={`${themeClass} fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[hsl(var(--color-background)/0.9)] backdrop-blur-[var(--backdrop-blur)] shadow-[var(--shadow)]"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto max-w-screen-xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Logo colorScheme={colorScheme} />
          </motion.div>

          {/* Middle: Navigation (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center">
            <Navigation
              className="flex items-center space-x-1"
              variant="header"
              activeSection={activeSection}
            />
          </div>

          {/* Right side: Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* ThemeToggle hidden on small screens if desired:
                remove "hidden md:block" if you want it always visible */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              className={`md:hidden ${classes.text} p-2 rounded-lg ${classes.hoverBg} transition-colors`}
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              type="button"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <MobileMenu
            isOpen={isMenuOpen}
            onClose={() => {
              console.log(
                `%c[Header] Closing Mobile Menu`,
                "color: red; font-weight: bold;"
              );
              setIsMenuOpen(false);
            }}
            activeSection={activeSection}
            items={NAV_ITEMS}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
