import { ModeColors } from "@/theme";
import { ComponentSkin } from "..";

export function mapThemeColorsToSkin(themeClasses: {
  schemes: Record<string, Record<"light" | "dark", ModeColors>>;
}): ComponentSkin {
  const themeConfig: Record<
    string,
    Record<"light" | "dark", ComponentSkin>
  > = {};

  for (const [themeName, themeScheme] of Object.entries(themeClasses.schemes)) {
    // Initialize the themeConfig for the current theme with empty ComponentSkin objects
    themeConfig[themeName] = {
      light: {} as ComponentSkin,
      dark: {} as ComponentSkin,
    };

    // Process both light and dark modes
    for (const mode of ["light", "dark"] as const) {
      const modeColors: ModeColors = themeScheme[mode];

      // Map modeColors to a valid ComponentSkin structure
      themeConfig[themeName][mode] = {
        colors: {
          surface: {
            background: modeColors.background.hex || "#FFFFFF",
            border: modeColors.border.hex || "#CCCCCC",
            foreground: modeColors.text.hex || "#000000",
            elevation: "0", // Default value
            overlay: "none", // Default value
          },
        },
        states: {
          interactive: {
            default: modeColors.text.hex || "#000000",
            hover: modeColors.hover?.hex || "#CCCCCC",
            active: modeColors.active?.hex || "#333333",
            focus: modeColors.focus?.hex || "#0000FF",
            disabled: modeColors.disabled?.hex || "#AAAAAA",
          },
          component: {
            background: modeColors.background.hex || "#FFFFFF",
            foreground: modeColors.text.hex || "#000000",
            border: modeColors.border.hex || "#CCCCCC",
            shadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Optional
            opacity: 1, // Optional
          },
        },
        computed: {
          colorSet: {
            background: modeColors.background,
            foreground: modeColors.text,
            border: modeColors.border,
            outline: modeColors.border,
          },
          semanticSet: {
            background: modeColors.background,
            foreground: modeColors.text,
            border: modeColors.border,
            outline: modeColors.border,
            light: modeColors.text,
            dark: modeColors.background,
            muted: {
              hex: "#AAAAAA",
              hsl: "hsl(0, 0%, 67%)",
              rgb: "rgb(170, 170, 170)",
            }, // Custom ColorDefinition
            emphasis: {
              hex: "#FF0000",
              hsl: "hsl(0, 100%, 50%)",
              rgb: "rgb(255, 0, 0)",
            },
          },
          componentSet: {
            background: modeColors.background,
            foreground: modeColors.text,
            border: modeColors.border,
            outline: modeColors.border,
            hover: modeColors.hover || {
              hex: "#CCCCCC",
              hsl: "hsl(0, 0%, 80%)",
              rgb: "rgb(204, 204, 204)",
            }, // Custom fallback
            active: modeColors.active || {
              hex: "#333333",
              hsl: "hsl(0, 0%, 20%)",
              rgb: "rgb(51, 51, 51)",
            }, // Custom fallback
            disabled: modeColors.disabled || {
              hex: "#AAAAAA",
              hsl: "hsl(0, 0%, 67%)",
              rgb: "rgb(170, 170, 170)",
            }, // Custom fallback
            focus: modeColors.focus || {
              hex: "#0000FF",
              hsl: "hsl(240, 100%, 50%)",
              rgb: "rgb(0, 0, 255)",
            }, // Custom fallback
          },
        },
      };
    }
  }

  // Return the ComponentSkin for the default theme (or handle appropriately)
  return themeConfig.default.light; // Adjust based on your requirements
}
