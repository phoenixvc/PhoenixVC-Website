// features/navigation/components/NavLink.tsx
import { NavLinkProps } from '../types';
import { useTheme } from '@/theme';
import { twMerge } from 'tailwind-merge';

export const NavLink = ({
  href,
  label,
  onClick,
  isActive = false,
  variant = 'header',
  isMobile = false
}: NavLinkProps) => {
  const { colorSchemeClasses } = useTheme();

  const baseStyles = "transition-colors duration-200";

  const variantStyles = {
    header: twMerge(
      'px-4 py-2 rounded-lg',
      isActive ? colorSchemeClasses.activeBg : colorSchemeClasses.hoverBg,
      isActive ? colorSchemeClasses.activeText : colorSchemeClasses.text,
      isMobile && 'w-full text-left'
    ),
    simple: colorSchemeClasses.text
  } as const;

  return (
    <a
      href={href}
      onClick={onClick}
      className={twMerge(baseStyles, variantStyles[variant])}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </a>
  );
};
