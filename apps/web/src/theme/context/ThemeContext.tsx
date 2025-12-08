// apps/web/src/theme/context/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  themeMode: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "theme-mode";

// Get initial theme from localStorage, default to dark
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch (error) {
    console.warn("Failed to load theme from localStorage:", error);
  }

  return "dark"; // Default to dark mode
};

export const ThemeProvider = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => {
  const [themeMode, setThemeMode] = useState<Theme>(getInitialTheme);

  // Persist theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
      // Apply theme class to document
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  }, [themeMode]);

  // Apply initial theme class on mount - intentionally runs once
  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = (): void => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const isDarkMode = useMemo(() => themeMode === "dark", [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      toggleTheme,
      isDarkMode,
    }),
    [themeMode, isDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
