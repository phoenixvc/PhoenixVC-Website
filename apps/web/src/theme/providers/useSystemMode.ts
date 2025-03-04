import { useEffect, useCallback, useState, useRef } from "react";
import { ThemeMode } from "@/theme/types";

export const useSystemMode = (
  useSystem: boolean,
  setState: React.Dispatch<React.SetStateAction<{ systemMode: ThemeMode; mode: ThemeMode }>>
) => {
  // Use local state to track system mode
  const [systemMode, setSystemMode] = useState<ThemeMode>(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Use a ref to track if we've already set the initial state
  const initialStateSet = useRef(false);

  // Define the handler with useCallback to prevent unnecessary re-creation
  const handleSystemModeChange = useCallback(
    (e: MediaQueryListEvent) => {
      const newMode: ThemeMode = e.matches ? "dark" : "light";
      setSystemMode(newMode);

      // Only update parent state if useSystem is true
      if (useSystem) {
        setState((prev) => {
          // Only update if the mode has actually changed
          if (prev.systemMode === newMode) {
            return prev; // No change, return the same state reference
          }
          return { ...prev, systemMode: newMode, mode: newMode };
        });
      }
    },
    [useSystem, setState]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Only set initial mode if useSystem is true AND we haven't set it before
    if (useSystem && !initialStateSet.current) {
      const initialMode: ThemeMode = mediaQuery.matches ? "dark" : "light";

      // Update local state
      setSystemMode(initialMode);

      // Update parent state, but only if needed
      setState((prev) => {
        if (prev.systemMode === initialMode && prev.mode === initialMode) {
          return prev; // No change needed
        }
        return { ...prev, systemMode: initialMode, mode: initialMode };
      });

      // Mark that we've set the initial state
      initialStateSet.current = true;
    }

    // Add event listener for system mode changes
    mediaQuery.addEventListener("change", handleSystemModeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemModeChange);
  }, [useSystem, handleSystemModeChange]); // Remove setState from dependencies

  return { systemMode };
};
