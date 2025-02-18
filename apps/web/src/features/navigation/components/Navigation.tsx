// features/navigation/components/Navigation.tsx
import { useState, useEffect, MouseEvent } from 'react';
import { NavLink } from './NavLink';
import { NavigationProps } from '../types';
import { NAV_ITEMS } from '../constants';
import { twMerge } from 'tailwind-merge';

export const Navigation = ({
  items = NAV_ITEMS,
  onItemClick,
  className = "",
  variant = 'header',
  activeSection: propActiveSection
}: NavigationProps) => {
  const [activeSection, setActiveSection] = useState(propActiveSection || 'home');

  useEffect(() => {
    if (variant === 'header' && !propActiveSection) {
      const observeSection = () => {
        const sections = items.map(item => item.href.replace('#', ''));

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setActiveSection(entry.target.id);
              }
            });
          },
          { threshold: 0.5 }
        );

        sections.forEach(section => {
          const element = document.getElementById(section);
          if (element) observer.observe(element);
        });

        return () => observer.disconnect();
      };

      const cleanup = observeSection();
      return cleanup;
    }
  }, [items, variant, propActiveSection]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (onItemClick) {
      onItemClick(event);
    }
  };

  if (variant === 'simple') {
    return (
      <div className={twMerge('flex gap-4', className)}>
        {items.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            onClick={handleClick}
            variant="simple"
          />
        ))}
      </div>
    );
  }

  return (
    <nav className={twMerge('flex gap-2', className)}>
      {items.map((item) => (
        <NavLink
          key={item.href}
          {...item}
          isActive={activeSection === item.href.replace('#', '')}
          onClick={handleClick}
          variant="header"
        />
      ))}
    </nav>
  );
};
