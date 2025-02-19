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
import { useTheme } from "@/theme";
import { ColorScheme } from "@/theme/types";

const ThemeToggle = () => {
  const {
    mode,              // either "light" or "dark"
    systemMode,        // the system-preferred mode
    useSystemMode,
    colorScheme,
    setMode,
    setColorScheme,
    setUseSystemMode,
  } = useTheme();

  // All available color schemes
  const colorSchemes: { label: string; value: ColorScheme }[] = [
    { label: "Classic", value: "classic" },
    { label: "Forest", value: "forest" },
    { label: "Ocean", value: "ocean" },
    { label: "Phoenix", value: "phoenix" },
    { label: "Lavender", value: "lavender" },
    { label: "Cloud", value: "cloud" },
  ];

  // A small helper to see if "Light" is effectively active
  // either because system is controlling it or user selected it
  const isLightActive =
    (useSystemMode && systemMode === "light") ||
    (!useSystemMode && mode === "light");

  // Similarly for "Dark"
  const isDarkActive =
    (useSystemMode && systemMode === "dark") ||
    (!useSystemMode && mode === "dark");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          {/* The sun/moon icons for the button itself */}
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Light Mode */}
        <DropdownMenuItem
          onClick={() => {
            setUseSystemMode(false); // disable system mode
            setMode("light");
            console.log("Theme changed -> Mode: light, Use System Mode: false");
          }}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
          {isLightActive && (
            <Check className="ml-auto h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>

        {/* Dark Mode */}
        <DropdownMenuItem
          onClick={() => {
            setUseSystemMode(false);
            setMode("dark");
            console.log("Theme changed -> Mode: dark, Use System Mode: false");
          }}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {isDarkActive && (
            <Check className="ml-auto h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>

        {/* Use System Mode */}
        <DropdownMenuCheckboxItem
          checked={useSystemMode}
          onCheckedChange={(checked) => {
            setUseSystemMode(checked);
            console.log(`Use System Mode changed -> ${checked}`);
          }}
        >
          Use system
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        {/* Color Scheme Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Color Scheme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {colorSchemes.map((scheme) => {
              const isSelected = colorScheme === scheme.value;
              return (
                <DropdownMenuItem
                  key={scheme.value}
                  onClick={() => {
                    setColorScheme(scheme.value);
                    console.log(`Color Scheme changed -> ${scheme.value}`);
                  }}
                  className="flex items-center"
                >
                  {/* Improved "radio button" styling */}
                  <div className="relative w-4 h-4 rounded-full mr-2 border border-muted">
                    {isSelected && (
                        <div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: "hsl(var(--color-primary))" }}
                      />
                    )}
                  </div>
                  {scheme.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
