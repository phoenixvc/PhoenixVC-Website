// src/theme/components/ThemeToggle.tsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { THEME_TRANSITION_DURATION, THEME_TRANSITION_TIMING } from '../constants';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 20
}) => {
  const { mode, toggleMode, colorSchemeClasses } = useTheme();
  const isDark = mode === 'dark';

  return (
    <button
      onClick={toggleMode}
      className={`
        inline-flex items-center justify-center
        p-2 rounded-lg
        transition-colors
        ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}
        ${colorSchemeClasses.text}
        ${className}
      `}
      style={{
        transitionDuration: THEME_TRANSITION_DURATION,
        transitionTimingFunction: THEME_TRANSITION_TIMING,
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun
          size={size}
          className="transition-transform hover:rotate-12"
          aria-hidden="true"
        />
      ) : (
        <Moon
          size={size}
          className="transition-transform hover:-rotate-12"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

// Optional: Add display name for better debugging
ThemeToggle.displayName = 'ThemeToggle';
