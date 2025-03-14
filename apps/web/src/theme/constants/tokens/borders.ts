// constants/tokens/borders.ts

export const borderWidths = {
    none: "0",
    thin: "1px",
    thick: "2px",
    thicker: "4px",
    thickest: "8px",
  } as const;

  export const borderStyles = {
    none: "none",
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
    double: "double",
    groove: "groove",
    ridge: "ridge",
    inset: "inset",
    outset: "outset",
  } as const;

  // Border utility functions
  export function createBorder(
    width: keyof typeof borderWidths = "thin",
    style: keyof typeof borderStyles = "solid",
    color: string = "currentColor"
  ): string {
    return `${borderWidths[width]} ${borderStyles[style]} ${color}`;
  }

  // Theme-specific borders
  export const themeBorders = {
    classic: {
      light: {
        thin: createBorder("thin", "solid", "#e5e7eb"),
        thick: createBorder("thick", "solid", "#e5e7eb"),
        focus: createBorder("thick", "solid", "#3b82f6"),
      },
      dark: {
        thin: createBorder("thin", "solid", "#374151"),
        thick: createBorder("thick", "solid", "#374151"),
        focus: createBorder("thick", "solid", "#60a5fa"),
      },
    },
    // Other themes can have custom border values if needed
  } as const;
