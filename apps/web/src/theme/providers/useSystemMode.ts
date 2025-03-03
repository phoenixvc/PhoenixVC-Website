import { useEffect, useCallback } from "react";
import { ThemeMode } from "@/theme/types";

export const useSystemMode = (
  useSystem: boolean,
  setState: React.Dispatch<React.SetStateAction<{ systemMode: ThemeMode; mode: ThemeMode }>>
) => {
  // Define the handler with useCallback to prevent unnecessary re-creation
  const handleSystemModeChange = useCallback(
    (e: MediaQueryListEvent) => {
      const newMode: ThemeMode = e.matches ? "dark" : "light";
      setState((prev) => ({ ...prev, systemMode: newMode, mode: newMode }));
    },
    [setState]
  );

  useEffect(() => {
    if (!useSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    // Set initial system mode on mount
    const initialMode: ThemeMode = mediaQuery.matches ? "dark" : "light";
    setState((prev) => ({ ...prev, systemMode: initialMode, mode: initialMode }));

    // Add event listener for system mode changes
    mediaQuery.addEventListener("change", handleSystemModeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemModeChange);
  }, [useSystem, handleSystemModeChange, setState]);

  // Return the current system mode
  const systemMode: ThemeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  return { systemMode };
};
