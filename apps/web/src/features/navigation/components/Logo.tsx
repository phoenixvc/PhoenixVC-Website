// features/navigation/components/Logo.tsx

import { ColorScheme } from "@/theme/types";


interface LogoProps {
  colorScheme?: ColorScheme;
}

export const Logo = ({ }: LogoProps) => {
  // Handle all possible color scheme values
  const getTextColorClass = (scheme: ColorScheme) => {
    switch (scheme) {
      case 'dark':
        return 'text-white';
      case 'blue':
        return 'text-blue-500';
      case 'light':
      default:
        return 'text-black';
    }
  };

  return (
    <a href="/" className={`text-2xl font-bold gradient-text ${getTextColorClass(colorScheme)}`}>
      Phoenix VC
    </a>
  );
};
