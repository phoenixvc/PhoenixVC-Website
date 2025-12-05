// apps/web/src/theme/context/ThemeContext.tsx
import { createContext, useContext, useState, useMemo, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  themeMode: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<Theme>("dark"); // Default to dark mode

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const isDarkMode = useMemo(() => themeMode === "dark", [themeMode]);

  const value = useMemo(() => ({
    themeMode,
    toggleTheme,
    isDarkMode,
  }), [themeMode, isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
