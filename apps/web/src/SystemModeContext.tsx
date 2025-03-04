import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ThemeMode } from "@/theme/types";

type SystemModeContextType = {
  systemMode: ThemeMode;
  useSystemMode: boolean;
  setUseSystemMode: (use: boolean) => void;
};

const SystemModeContext = createContext<SystemModeContextType | undefined>(undefined);

export const SystemModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemMode, setSystemMode] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light"; // Default for SSR
  });
  const [useSystemMode, setUseSystemMode] = useState(true);

  const handleSystemModeChange = useCallback((e: MediaQueryListEvent) => {
    setSystemMode(e.matches ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // Modern API
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleSystemModeChange);
        return () => mediaQuery.removeEventListener("change", handleSystemModeChange);
      }
      // Legacy API for older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemModeChange);
        return () => mediaQuery.removeListener(handleSystemModeChange);
      }
    }
  }, [handleSystemModeChange]);

  return (
    <SystemModeContext.Provider value={{
      systemMode,
      useSystemMode,
      setUseSystemMode
    }}>
      {children}
    </SystemModeContext.Provider>
  );
};

export const useSystemModeContext = () => {
  const context = useContext(SystemModeContext);
  if (!context) {
    throw new Error("useSystemModeContext must be used within a SystemModeProvider");
  }
  return context;
};
