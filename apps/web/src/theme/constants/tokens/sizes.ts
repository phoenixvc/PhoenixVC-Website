// constants/tokens/sizes.ts

// Width and height values
export const sizes = {
  0: "0px",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
  auto: "auto",
  px: "1px",
  "1/2": "50%",
  "1/3": "33.333333%",
  "2/3": "66.666667%",
  "1/4": "25%",
  "2/4": "50%",
  "3/4": "75%",
  "1/5": "20%",
  "2/5": "40%",
  "3/5": "60%",
  "4/5": "80%",
  "1/6": "16.666667%",
  "2/6": "33.333333%",
  "3/6": "50%",
  "4/6": "66.666667%",
  "5/6": "83.333333%",
  full: "100%",
  screen: "100vh",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
} as const;

// Max width values
export const maxWidths = {
  ...sizes,
  none: "none",
  xs: "20rem",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "42rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
  "7xl": "80rem",
  prose: "65ch",
} as const;

// Min width values
export const minWidths = {
  ...sizes,
  none: "none",
} as const;

// Max height values
export const maxHeights = {
  ...sizes,
  none: "none",
  screen: "100vh",
} as const;

// Min height values
export const minHeights = {
  ...sizes,
  none: "none",
  screen: "100vh",
} as const;

// Common container sizes
export const containers = {
  xs: maxWidths.xs,
  sm: maxWidths.sm,
  md: maxWidths.md,
  lg: maxWidths.lg,
  xl: maxWidths.xl,
  "2xl": maxWidths["2xl"],
  "3xl": maxWidths["3xl"],
  "4xl": maxWidths["4xl"],
  "5xl": maxWidths["5xl"],
  "6xl": maxWidths["6xl"],
  "7xl": maxWidths["7xl"],
} as const;

// Size utility functions
export function getSize(key: keyof typeof sizes): string {
  return sizes[key];
}

export function getMaxWidth(key: keyof typeof maxWidths): string {
  return maxWidths[key];
}

export function getMinWidth(key: keyof typeof minWidths): string {
  return minWidths[key];
}

export function getMaxHeight(key: keyof typeof maxHeights): string {
  return maxHeights[key];
}

export function getMinHeight(key: keyof typeof minHeights): string {
  return minHeights[key];
}

export function getContainer(key: keyof typeof containers): string {
  return containers[key];
}
