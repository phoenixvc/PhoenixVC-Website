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
import { ThemeName, useTheme } from "@/theme"; // Now using the updated useTheme hook

const ThemeToggle = () => {
  const {
    themeMode: mode,
    useSystemMode,
    themeName: colorScheme,
    setMode,
    setColorScheme,
    setUseSystemMode,
  } = useTheme();

  const colorSchemes: { label: string; value: ThemeName }[] = [
    { label: "Classic", value: "classic" },
    { label: "Forest", value: "forest" },
    { label: "Ocean", value: "ocean" },
    { label: "Phoenix", value: "phoenix" },
    { label: "Lavender", value: "lavender" },
    { label: "Cloud", value: "cloud" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          {/* Sun/Moon Icons */}
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Light Mode */}
        <DropdownMenuItem onClick={() => setMode("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
          {mode === "light" && <Check className="ml-auto h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        {/* Dark Mode */}
        <DropdownMenuItem onClick={() => setMode("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {mode === "dark" && <Check className="ml-auto h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        {/* Toggle System Mode */}
        <DropdownMenuCheckboxItem
          checked={useSystemMode}
          onCheckedChange={setUseSystemMode}
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
            {colorSchemes.map((scheme) => (
              <DropdownMenuItem
                key={scheme.value}
                onClick={() => setColorScheme(scheme.value)}
                className="flex items-center"
              >
                {/* "Radio Button" Indicator */}
                <div className="relative w-4 h-4 rounded-full mr-2 border border-muted">
                  {colorScheme === scheme.value && (
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

export default ThemeToggle;
