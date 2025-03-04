import { useTheme } from "@/theme";
import { cn } from "@/lib/utils";
import React from "react";

interface LogoProps {
  className?: string;
  variant?: string;
  component?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  variant = "default",
  component = "logo"
}) => {
  const themeContext = useTheme();

  // Get component style directly using the getComponentStyle method
  // This will include both colors and typography in one call
  //TODO, ideally use module and -theme-logo-color, refactor accordingly
  const style = themeContext.getComponentStyle?.(component, variant) || {};

  // Get specific class for the text if you prefer class-based styling
  const textClass = themeContext.getSpecificClass?.("text") as string || "";

  // Get CSS variable for specific properties if needed
  const logoColor = themeContext.getCssVariable("theme-logo-color");

  return (
    <a
      href="/"
      className={cn(
        "text-2xl font-bold transition-colors duration-200",
        textClass,
        className
      )}
      style={{
        ...style,
        // Override with specific CSS variables if needed
        color: logoColor || style.color
      }}
    >
      Phoenix VC
    </a>
  );
};

export default Logo;
