import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  // We extract the colorSchemeClasses from our theme context,
  // which includes our text color for the current theme.
  const { theme: colorSchemeClasses } = useTheme();

  return (
    <a
      href="/"
      className={cn(
        "text-2xl font-bold transition-colors duration-200",
        colorSchemeClasses.text,
        className
      )}
    >
      Phoenix VC
    </a>
  );
};

export default Logo;
