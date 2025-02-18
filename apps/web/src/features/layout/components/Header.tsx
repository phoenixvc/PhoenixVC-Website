// features/layout/components/Header.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Navigation, MobileMenu, NAV_ITEMS } from '@/features/navigation';
import { headerVariants } from '../animations';
import { useTheme } from '@/theme';

export const Header = () => {
    const {
      colorScheme,
      mode,
      toggleMode,
      colorSchemeClasses: classes
    } = useTheme();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection] = useState(''); // Add this if you need to track active section

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };

      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
      <motion.header
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Logo colorScheme={colorScheme} />
            </motion.div>

            <div className="hidden md:flex items-center space-x-6">
              <Navigation
                className="flex items-center space-x-1"
                variant="header"
                activeSection={activeSection}
              />

              <button
                onClick={toggleMode}
                className={`${classes.text} p-2 rounded-lg ${classes.hoverBg} transition-colors`}
                aria-label={`Toggle ${mode === 'dark' ? 'light' : 'dark'} mode`}
              >
                {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            <motion.button
              className={`md:hidden ${classes.text} p-2 rounded-lg ${classes.hoverBg} transition-colors`}
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {isMenuOpen && (
            <MobileMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              activeSection={activeSection}
              items={NAV_ITEMS}
            />
          )}
        </AnimatePresence>
      </motion.header>
    );
};

export default Header;
