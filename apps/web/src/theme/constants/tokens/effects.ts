// constants/tokens/effects.ts

import { blurs } from "./theme-constants";

// Filter effects
export const filters = {
  none: "none",
  blur: (value: keyof typeof blurs = "md") => `blur(${blurs[value]})`,
  brightness: (value: number = 100) => `brightness(${value}%)`,
  contrast: (value: number = 100) => `contrast(${value}%)`,
  grayscale: (value: number = 100) => `grayscale(${value}%)`,
  hueRotate: (value: number = 0) => `hue-rotate(${value}deg)`,
  invert: (value: number = 100) => `invert(${value}%)`,
  saturate: (value: number = 100) => `saturate(${value}%)`,
  sepia: (value: number = 100) => `sepia(${value}%)`,
} as const;

// Backdrop filter effects
export const backdropFilters = {
  ...filters,
} as const;

// Create filter utility function
export function createFilter(...filterValues: string[]): string {
  return filterValues.join(" ");
}

// Create backdrop filter utility function
export function createBackdropFilter(...filterValues: string[]): string {
  return filterValues.join(" ");
}

// Common filter combinations
export const filterCombinations = {
  softBlur: createFilter(filters.blur("sm")),
  mediumBlur: createFilter(filters.blur("md")),
  heavyBlur: createFilter(filters.blur("lg")),
  grayscale: createFilter(filters.grayscale()),
  dimmed: createFilter(filters.brightness(80)),
  brightened: createFilter(filters.brightness(120)),
  highContrast: createFilter(filters.contrast(120)),
  lowContrast: createFilter(filters.contrast(80)),
  sepiaTone: createFilter(filters.sepia()),
  coolTone: createFilter(filters.hueRotate(180)),
  warmTone: createFilter(filters.hueRotate(30), filters.saturate(150)),
} as const;

// Common backdrop filter combinations
export const backdropFilterCombinations = {
  softGlass: createBackdropFilter(backdropFilters.blur("sm")),
  frostedGlass: createBackdropFilter(backdropFilters.blur("md")),
  heavyFrost: createBackdropFilter(backdropFilters.blur("lg")),
  dimmedGlass: createBackdropFilter(
    backdropFilters.blur("md"),
    backdropFilters.brightness(90),
  ),
  darkGlass: createBackdropFilter(
    backdropFilters.blur("md"),
    backdropFilters.brightness(70),
  ),
} as const;
