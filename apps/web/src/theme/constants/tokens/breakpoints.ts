// constants/tokens/breakpoints.ts

export const breakpoints = {
  xs: "0px",
  sm: "600px",
  md: "960px",
  lg: "1280px",
  xl: "1920px",
} as const;

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
} as const;

// Breakpoint utility functions
export function up(key: keyof typeof breakpoints): string {
  return `@media (min-width: ${breakpoints[key]})`;
}

export function down(key: keyof typeof breakpoints): string {
  const keys = Object.keys(breakpoints) as Array<keyof typeof breakpoints>;
  const index = keys.indexOf(key);

  if (index === keys.length - 1) {
    // The largest breakpoint has no upper bound
    return mediaQueries.xs;
  }

  const nextKey = keys[index + 1];
  const nextBreakpoint = parseInt(breakpoints[nextKey], 10);

  return `@media (max-width: ${nextBreakpoint - 0.05}px)`;
}

export function between(
  start: keyof typeof breakpoints,
  end: keyof typeof breakpoints,
): string {
  const keys = Object.keys(breakpoints) as Array<keyof typeof breakpoints>;
  const endIndex = keys.indexOf(end);

  if (endIndex === keys.length - 1) {
    // If end is the largest breakpoint, only use min-width
    return up(start);
  }

  const nextKey = keys[endIndex + 1];
  const nextBreakpoint = parseInt(breakpoints[nextKey], 10);

  return `@media (min-width: ${breakpoints[start]}) and (max-width: ${nextBreakpoint - 0.05}px)`;
}
