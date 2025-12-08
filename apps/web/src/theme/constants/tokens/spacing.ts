// constants/tokens/spacing.ts

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  xxl: "3rem", // 48px
} as const;

export const spacingScale = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
} as const;

// Spacing utility functions
export const getSpacing = (value: keyof typeof spacing): string => {
  return spacing[value];
};

export const getSpacingScale = (value: keyof typeof spacingScale): string => {
  return spacingScale[value];
};
