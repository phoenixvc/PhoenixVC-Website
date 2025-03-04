// src/components/ThemeToggle/ThemeToggle.tsx
import React, { useCallback, useRef, useEffect } from "react";
import { Moon, Sun, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ThemeName } from "@/theme";
import { useTheme } from "@/theme/hooks";

// Define color schemes outside the component to avoid recreation
const COLOR_SCHEMES: { label: string; value: ThemeName }[] = [
  { label: "Classic", value: "classic" },
  { label: "Forest", value: "forest" },
  { label: "Ocean", value: "ocean" },
  { label: "Phoenix", value: "phoenix" },
  { label: "Lavender", value: "lavender" },
  { label: "Cloud", value: "cloud" },
];

const ThemeToggle: React.FC = () => {
  // Use refs to store the current theme state to avoid re-renders
  const themeRef = useRef<{
    mode: "light" | "dark";
    useSystemMode: boolean;
    colorScheme: ThemeName;
  }>({ mode: "light", useSystemMode: false, colorScheme: "classic" });

  // Get theme functions from context
  const {
    themeMode,
    useSystemMode,
    themeName,
    setMode,
    setThemeClasses,
    setUseSystemMode,
  } = useTheme();

  // Update the ref when theme state changes
  useEffect(() => {
    themeRef.current = {
      mode: themeMode,
      useSystemMode,
      colorScheme: themeName,
    };
  }, [themeMode, useSystemMode, themeName]);

  // Memoize handlers to prevent recreation on each render
  const handleSetMode = useCallback((newMode: "light" | "dark") => {
    setMode(newMode);
  }, [setMode]);

  const handleSetThemeClasses = useCallback((themeName: ThemeName) => {
    setThemeClasses(themeName);
  }, [setThemeClasses]);

  const handleSetUseSystemMode = useCallback((value: boolean) => {
    setUseSystemMode(value);
  }, [setUseSystemMode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSetMode("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
          {themeMode === "light" && <Check className="ml-auto h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleSetMode("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {themeMode === "dark" && <Check className="ml-auto h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuCheckboxItem
          checked={useSystemMode}
          onCheckedChange={handleSetUseSystemMode}
        >
          Use system
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Color Scheme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {COLOR_SCHEMES.map((scheme) => (
              <DropdownMenuItem
                key={scheme.value}
                onClick={() => handleSetThemeClasses(scheme.value)}
                className="flex items-center"
              >
                <div className="relative w-4 h-4 rounded-full mr-2 border border-muted">
                  {themeName === scheme.value && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: "hsl(var(--color-primary))" }}
                    />
                  )}
                </div>
                {scheme.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default React.memo(ThemeToggle);
