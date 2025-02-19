import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Navigation, MobileMenu, NAV_ITEMS } from '@/features/navigation';
import { headerVariants } from '../animations';
import { useTheme } from '@/theme';
import ThemeToggle from '@/theme/components/ThemeToggle';

export const Header: React.FC = () => {
  const { colorScheme, colorSchemeClasses: classes } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = (): void => setIsMenuOpen(!isMenuOpen);

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
            {/* Integrated ThemeToggle for switching mode and color scheme */}
            <ThemeToggle />
          </div>

          <motion.button
            className={`md:hidden ${classes.text} p-2 rounded-lg ${classes.hoverBg} transition-colors`}
            onClick={toggleMenu}
            whileTap={{ scale: 0.95 }}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            type="button"
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
