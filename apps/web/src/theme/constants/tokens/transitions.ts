// constants/tokens/transitions.ts

import { animationDurations, animationEasings } from "./animations";

// Transition durations
export const transitionDurations = {
  ...animationDurations,
  DEFAULT: "150ms", // Tailwind default
  75: "75ms",
  100: "100ms",
  150: "150ms",
  200: "200ms",
  300: "300ms",
  500: "500ms",
  700: "700ms",
  1000: "1000ms",
} as const;

// Transition easings
export const transitionEasings = {
  ...animationEasings,
  DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)", // Tailwind default
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

// Transition presets
export const transitions = {
  default: {
    duration: transitionDurations.normal,
    easing: transitionEasings.easeInOut,
    properties: ["all"],
  },
  fast: {
    duration: transitionDurations.fast,
    easing: transitionEasings.easeOut,
    properties: ["all"],
  },
  slow: {
    duration: transitionDurations.slow,
    easing: transitionEasings.easeInOut,
    properties: ["all"],
  },
  color: {
    duration: transitionDurations.normal,
    easing: transitionEasings.easeOut,
    properties: ["color", "background-color", "border-color", "box-shadow"],
  },
  transform: {
    duration: transitionDurations.normal,
    easing: transitionEasings.easeOut,
    properties: ["transform"],
  },
  opacity: {
    duration: transitionDurations.normal,
    easing: transitionEasings.easeOut,
    properties: ["opacity"],
  },
  size: {
    duration: transitionDurations.normal,
    easing: transitionEasings.easeInOut,
    properties: ["width", "height", "max-width", "max-height", "min-width", "min-height"],
  },
} as const;

// Tailwind-compatible transition object
export const tailwindTransitions = {
  duration: {
    DEFAULT: transitionDurations.DEFAULT,
    75: transitionDurations[75],
    100: transitionDurations[100],
    150: transitionDurations[150],
    200: transitionDurations[200],
    300: transitionDurations[300],
    500: transitionDurations[500],
    700: transitionDurations[700],
    1000: transitionDurations[1000],
  },
  timing: {
    DEFAULT: transitionEasings.DEFAULT,
    linear: transitionEasings.linear,
    in: transitionEasings.in,
    out: transitionEasings.out,
    "in-out": transitionEasings["in-out"],
  },
} as const;

// Transition utility functions
export function createTransition(
  type: keyof typeof transitions,
  customProperties?: string[]
): string {
  const transition = transitions[type];
  const properties = customProperties || transition.properties;

  return properties
    .map(property => `${property} ${transition.duration} ${transition.easing}`)
    .join(", ");
}

export function createCustomTransition(
  properties: string[],
  options?: {
    duration?: string;
    easing?: string;
    delay?: string;
  }
): string {
  const duration = options?.duration || transitionDurations.normal;
  const easing = options?.easing || transitionEasings.easeInOut;
  const delay = options?.delay || "0s";

  return properties
    .map(property => `${property} ${duration} ${easing} ${delay}`)
    .join(", ");
}
