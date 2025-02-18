// features/navigation/components/MobileMenu.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { MobileMenuProps } from '../types';
import { NAV_ITEMS } from '../constants';
import { NavLink } from './NavLink';
import { useTheme } from '@/theme';
import { twMerge } from 'tailwind-merge';

export const MobileMenu = ({
  isOpen,
  onClose,
  items = NAV_ITEMS,
  activeSection
}: MobileMenuProps) => {
  const { colorSchemeClasses } = useTheme();

  const handleClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={twMerge(
            'fixed inset-x-0 top-[4rem] p-4',
            colorSchemeClasses.bgMobileMenu,
            'backdrop-blur-lg',
            'border-b',
            colorSchemeClasses.border,
            'z-50'
          )}
          aria-label="Mobile navigation menu"
        >
          <nav className="flex flex-col space-y-2">
            {items.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                onClick={handleClick}
                isActive={activeSection === item.href.replace('#', '')}
                variant="header"
                isMobile
              />
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
