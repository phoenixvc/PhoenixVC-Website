 export const defaultTheme = {
    spacing: {
      unit: 8,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    typography: {
      fontFamily: {
        base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        heading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        monospace: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        md: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        xxl: "1.5rem",
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
      letterSpacing: {
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
      },
    },
    borders: {
      radius: {
        none: "0",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.5rem",
        full: "9999px",
      },
      width: {
        none: "0",
        thin: "1px",
        normal: "2px",
        thick: "4px",
      },
      style: {
        solid: "solid",
        dashed: "dashed",
        dotted: "dotted",
      },
    },
    shadows: {
      none: "none",
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    breakpoints: {
      xs: "0px",
      sm: "600px",
      md: "960px",
      lg: "1280px",
      xl: "1920px",
    },
    transitions: {
      duration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
      easing: {
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        easeOut: "cubic-bezier(0, 0, 0.2, 1)",
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
    zIndex: {
      dropdown: 1000,
      modal: 1300,
      overlay: 1200,
      popover: 1100,
      tooltip: 1500,
    },
    components: {},
  };
  export type DefaultTheme = typeof defaultTheme;
