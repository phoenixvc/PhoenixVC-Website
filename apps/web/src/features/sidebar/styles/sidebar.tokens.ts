import { defaultTheme } from "@/features/defaultTheme";

export const SIDEBAR_TOKENS = {
  container: {
    base: {
      background: {
        cssVariable: "--sidebar-container-background",
        value: defaultTheme.light.colors.surface.background,
        variants: {
          light: defaultTheme.light.colors.surface.background,
          dark: defaultTheme.dark.colors.surface.background,
        },
      },
      border: {
        cssVariable: "--sidebar-container-border",
        value: defaultTheme.light.colors.surface.border,
        variants: {
          light: defaultTheme.light.colors.surface.border,
          dark: defaultTheme.dark.colors.surface.border,
        },
      },
    },
    states: {
      collapsed: {
        background: {
          cssVariable: "--sidebar-container-collapsed-background",
          value: defaultTheme.dark.colors.surface.background,
        },
        opacity: {
          cssVariable: "--sidebar-container-collapsed-opacity",
          value: 0.95,
        },
      },
    },
  },
  item: {
    base: {
      padding: {
        cssVariable: "--sidebar-item-padding",
        value: defaultTheme.light.spacing.scale[2],
      },
      color: {
        cssVariable: "--sidebar-item-color",
        value: defaultTheme.light.colors.text.primary,
        variants: {
          light: defaultTheme.light.colors.text.primary,
          dark: defaultTheme.dark.colors.text.primary,
        },
      },
    },
    states: {
      active: {
        color: {
          cssVariable: "--sidebar-item-active-color",
          value: defaultTheme.light.colors.text.inverse,
        },
        background: {
          cssVariable: "--sidebar-item-active-background",
          value: defaultTheme.light.colors.brand.primary,
        },
      },
      hover: {
        background: {
          cssVariable: "--sidebar-item-hover-background",
          value: defaultTheme.light.colors.brand.hover,
        },
      },
      disabled: {
        opacity: {
          cssVariable: "--sidebar-item-disabled-opacity",
          value: 0.5,
        },
        pointerEvents: "none" as const,
      },
    },
  },
} as const;
