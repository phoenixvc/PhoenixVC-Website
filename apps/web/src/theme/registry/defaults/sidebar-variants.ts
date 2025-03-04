// theme/defaults/sidebar-variants.ts

import { SidebarVariant } from "@/theme";


/**
 * Default sidebar variant with modern styling - simplified with only hex values
 */
export const defaultSidebarVariant: Partial<SidebarVariant> = {
  container: {
    background: { hex: "#f8f9fa" },
    foreground: { hex: "#212529" },
    border: { hex: "#dee2e6" },
    style: {
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      borderRadius: "0.375rem"
    }
  },
  group: {
    container: {
      background: { hex: "transparent" },
      foreground: { hex: "#212529" },
      border: { hex: "transparent" },
      style: {
        padding: "0.5rem 0"
      }
    },
    title: {
      background: { hex: "transparent" },
      foreground: { hex: "#6c757d" },
      border: { hex: "transparent" },
      style: {
        fontSize: "0.75rem",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }
    },
    style: {
      marginBottom: "0.75rem"
    }
  },
  item: {
    default: {
      background: { hex: "transparent" },
      foreground: { hex: "#495057" },
      border: { hex: "transparent" },
      hover: {
        background: { hex: "#e9ecef" },
        foreground: { hex: "#212529" },
        border: { hex: "transparent" }
      },
      active: {
        background: { hex: "#dee2e6" },
        foreground: { hex: "#212529" },
        border: { hex: "transparent" }
      },
      focus: {
        background: { hex: "#e9ecef" },
        foreground: { hex: "#212529" },
        border: { hex: "#0d6efd" }
      },
      disabled: {
        background: { hex: "transparent" },
        foreground: { hex: "#adb5bd" },
        border: { hex: "transparent" }
      },
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0.25rem",
        transition: "all 0.2s ease-in-out"
      }
    },
    active: {
      background: { hex: "#0d6efd" },
      foreground: { hex: "#ffffff" },
      border: { hex: "#0a58ca" },
      style: {
        fontWeight: "500"
      }
    },
    style: {
      margin: "0.125rem 0"
    }
  },
  divider: { hex: "#dee2e6" },
  icon: {
    default: { hex: "#6c757d" },
    active: { hex: "#ffffff" },
    style: {
      marginRight: "0.5rem",
      fontSize: "1rem"
    }
  },
  style: {
    width: "100%",
    maxWidth: "280px",
    padding: "1rem",
    height: "100%",
    overflowY: "auto"
  }
};

/**
 * Compact sidebar variant for smaller screens or minimalist designs
 */
export const compactSidebarVariant: SidebarVariant = {
  container: {
    background: { hex: "#f8f9fa" },
    foreground: { hex: "#212529" },
    border: { hex: "#dee2e6" },
    style: {
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      borderRadius: "0.375rem"
    }
  },
  group: {
    container: {
      background: { hex: "transparent" },
      foreground: { hex: "#212529" },
      border: { hex: "transparent" },
      style: {
        padding: "0.25rem 0"
      }
    },
    title: {
      background: { hex: "transparent" },
      foreground: { hex: "#6c757d" },
      border: { hex: "transparent" },
      style: {
        fontSize: "0.7rem",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }
    },
    style: {
      marginBottom: "0.5rem"
    }
  },
  item: {
    default: {
      background: { hex: "transparent" },
      foreground: { hex: "#495057" },
      border: { hex: "transparent" },
      hover: {
        background: { hex: "#e9ecef" },
        foreground: { hex: "#212529" },
        border: { hex: "transparent" }
      },
      active: {
        background: { hex: "#dee2e6" },
        foreground: { hex: "#212529" },
        border: { hex: "transparent" }
      },
      focus: {
        background: { hex: "#e9ecef" },
        foreground: { hex: "#212529" },
        border: { hex: "#0d6efd" }
      },
      disabled: {
        background: { hex: "transparent" },
        foreground: { hex: "#adb5bd" },
        border: { hex: "transparent" }
      },
      style: {
        padding: "0.35rem 0.75rem",
        borderRadius: "0.25rem",
        transition: "all 0.2s ease-in-out",
        fontSize: "0.875rem"
      }
    },
    active: {
      background: { hex: "#0d6efd" },
      foreground: { hex: "#ffffff" },
      border: { hex: "#0a58ca" },
      style: {
        fontWeight: "500"
      }
    },
    style: {
      margin: "0.125rem 0"
    }
  },
  divider: { hex: "#dee2e6" },
  icon: {
    default: { hex: "#6c757d" },
    active: { hex: "#ffffff" },
    style: {
      marginRight: "0.375rem",
      fontSize: "0.875rem"
    }
  },
  style: {
    width: "100%",
    maxWidth: "220px",
    padding: "0.75rem",
    height: "100%",
    overflowY: "auto"
  }
};

/**
 * Dark mode sidebar variant
 */
export const darkSidebarVariant: SidebarVariant = {
  container: {
    background: { hex: "#212529" },
    foreground: { hex: "#f8f9fa" },
    border: { hex: "#343a40" },
    style: {
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      borderRadius: "0.375rem"
    }
  },
  group: {
    container: {
      background: { hex: "transparent" },
      foreground: { hex: "#e9ecef" },
      border: { hex: "transparent" },
      style: {
        padding: "0.5rem 0"
      }
    },
    title: {
      background: { hex: "transparent" },
      foreground: { hex: "#adb5bd" },
      border: { hex: "transparent" },
      style: {
        fontSize: "0.75rem",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }
    },
    style: {
      marginBottom: "0.75rem"
    }
  },
  item: {
    default: {
      background: { hex: "transparent" },
      foreground: { hex: "#dee2e6" },
      border: { hex: "transparent" },
      hover: {
        background: { hex: "#343a40" },
        foreground: { hex: "#f8f9fa" },
        border: { hex: "transparent" }
      },
      active: {
        background: { hex: "#495057" },
        foreground: { hex: "#f8f9fa" },
        border: { hex: "transparent" }
      },
      focus: {
        background: { hex: "#343a40" },
        foreground: { hex: "#f8f9fa" },
        border: { hex: "#0d6efd" }
      },
      disabled: {
        background: { hex: "transparent" },
        foreground: { hex: "#6c757d" },
        border: { hex: "transparent" }
      },
      style: {
        padding: "0.5rem 1rem",
        borderRadius: "0.25rem",
        transition: "all 0.2s ease-in-out"
      }
    },
    active: {
      background: { hex: "#0d6efd" },
      foreground: { hex: "#ffffff" },
      border: { hex: "#0a58ca" },
      style: {
        fontWeight: "500"
      }
    },
    style: {
      margin: "0.125rem 0"
    }
  },
  divider: { hex: "#495057" },
  icon: {
    default: { hex: "#adb5bd" },
    active: { hex: "#ffffff" },
    style: {
      marginRight: "0.5rem",
      fontSize: "1rem"
    }
  },
  style: {
    width: "100%",
    maxWidth: "280px",
    padding: "1rem",
    height: "100%",
    overflowY: "auto"
  }
};
