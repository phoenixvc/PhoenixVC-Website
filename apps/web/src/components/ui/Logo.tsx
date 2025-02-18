import { useTheme } from '@/theme'
import { cn } from "@/lib/utils"
import { type ColorScheme } from '@/theme';

interface LogoProps {
  className?: string;
  colorScheme: ColorScheme;
}

export const Logo: React.FC<LogoProps> = ({ colorScheme }) => {
  const { colorSchemeClasses } = useTheme();

  return (
    <a 
      href="/" 
      className={cn(
        "text-2xl font-bold transition-colors duration-200",
        colorSchemeClasses.text,
        colorScheme
      )}
    >
      Phoenix VC
    </a>
  );
};

export default Logo;