import baseConfig from "../../tailwind.config.js";

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],  // Removed duplicate "class"
  theme: {
    extend: {
      ...baseConfig.theme?.extend,
      colors: {
        // Core theme colors
        primary: {
          DEFAULT: "hsl(var(--theme-primary) / <alpha-value>)",
          foreground: "hsl(var(--theme-primary-foreground) / <alpha-value>)"
        },
        secondary: {
          DEFAULT: "hsl(var(--theme-secondary) / <alpha-value>)",
          foreground: "hsl(var(--theme-secondary-foreground) / <alpha-value>)"
        },
        accent: {
          DEFAULT: "hsl(var(--theme-accent) / <alpha-value>)",
          foreground: "hsl(var(--theme-accent-foreground) / <alpha-value>)"
        },

        // Base colors
        background: "hsl(var(--theme-background) / <alpha-value>)",
        foreground: "hsl(var(--theme-foreground) / <alpha-value>)",

        // UI elements
        muted: {
          DEFAULT: "hsl(var(--theme-muted) / <alpha-value>)",
          foreground: "hsl(var(--theme-muted-foreground) / <alpha-value>)"
        },
        card: {
          DEFAULT: "hsl(var(--theme-card) / <alpha-value>)",
          foreground: "hsl(var(--theme-card-foreground) / <alpha-value>)"
        },
        popover: {
          DEFAULT: "hsl(var(--theme-popover) / <alpha-value>)",
          foreground: "hsl(var(--theme-popover-foreground) / <alpha-value>)"
        },

        // Status colors
        destructive: {
          DEFAULT: "hsl(var(--theme-destructive) / <alpha-value>)",
          foreground: "hsl(var(--theme-destructive-foreground) / <alpha-value>)"
        },
        success: {
          DEFAULT: "hsl(var(--theme-success) / <alpha-value>)",
          foreground: "hsl(var(--theme-success-foreground) / <alpha-value>)"
        },
        warning: {
          DEFAULT: "hsl(var(--theme-warning) / <alpha-value>)",
          foreground: "hsl(var(--theme-warning-foreground) / <alpha-value>)"
        },

        // UI elements
        border: "hsl(var(--theme-border) / <alpha-value>)",
        input: "hsl(var(--theme-input) / <alpha-value>)",
        ring: "hsl(var(--theme-ring) / <alpha-value>)",

        // Chart colors
        chart: {
          1: "hsl(var(--theme-chart-1) / <alpha-value>)",
          2: "hsl(var(--theme-chart-2) / <alpha-value>)",
          3: "hsl(var(--theme-chart-3) / <alpha-value>)",
          4: "hsl(var(--theme-chart-4) / <alpha-value>)",
          5: "hsl(var(--theme-chart-5) / <alpha-value>)"
        }
      },

      // Theme-specific text colors
      textColor: {
        theme: {
          base: "hsl(var(--theme-text) / <alpha-value>)",
          muted: "hsl(var(--theme-text-muted) / <alpha-value>)",
          primary: "hsl(var(--theme-text-primary) / <alpha-value>)",
          secondary: "hsl(var(--theme-text-secondary) / <alpha-value>)"
        }
      },

      // Theme-specific background colors
      backgroundColor: {
        theme: {
          base: "hsl(var(--theme-bg) / <alpha-value>)",
          primary: "hsl(var(--theme-bg-primary) / <alpha-value>)",
          secondary: "hsl(var(--theme-bg-secondary) / <alpha-value>)",
          muted: "hsl(var(--theme-bg-muted) / <alpha-value>)"
        }
      },

      // Theme-specific border colors
      borderColor: {
        theme: "hsl(var(--theme-border) / <alpha-value>)"
      },

      // Background patterns and effects
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-theme": "linear-gradient(var(--theme-gradient))"
      },

      // Blur effects
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "10px",
        xl: "16px",
        "2xl": "24px"
      },

      // Border radius
      borderRadius: {
        lg: "var(--theme-radius-lg)",
        md: "var(--theme-radius-md)",
        sm: "var(--theme-radius-sm)"
      },

      // Animation durations
      transitionDuration: {
        theme: "var(--theme-transition-duration)"
      },

      // Animation timing functions
      transitionTimingFunction: {
        theme: "var(--theme-transition-timing)"
      }
    }
  },
  plugins: [
    ...baseConfig.plugins || [],
    require("tailwindcss-animate")
  ],
};
