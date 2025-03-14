// constants/tokens/gradients.ts

// Gradient direction presets
export const gradientDirections = {
    toTop: "to top",
    toTopRight: "to top right",
    toRight: "to right",
    toBottomRight: "to bottom right",
    toBottom: "to bottom",
    toBottomLeft: "to bottom left",
    toLeft: "to left",
    toTopLeft: "to top left",
    radial: "radial-gradient",
    conic: "conic-gradient",
  } as const;

  // Gradient utility functions
  export function createLinearGradient(
    direction: keyof typeof gradientDirections | string = "toRight",
    colorStops: string[] = ["rgba(0,0,0,0)", "rgba(0,0,0,0.1)"]
  ): string {
    const dir = gradientDirections[direction as keyof typeof gradientDirections] || direction;
    return `linear-gradient(${dir}, ${colorStops.join(", ")})`;
  }

  export function createRadialGradient(
    shape: "circle" | "ellipse" = "circle",
    position: string = "center",
    colorStops: string[] = ["rgba(0,0,0,0)", "rgba(0,0,0,0.1)"]
  ): string {
    return `radial-gradient(${shape} at ${position}, ${colorStops.join(", ")})`;
  }

  export function createConicGradient(
    position: string = "center",
    angle: string = "0deg",
    colorStops: string[] = ["rgba(0,0,0,0)", "rgba(0,0,0,0.1)"]
  ): string {
    return `conic-gradient(from ${angle} at ${position}, ${colorStops.join(", ")})`;
  }

  // Common gradient presets
  export const gradients = {
    // Light gradients
    lightFade: createLinearGradient("toBottom", ["rgba(255,255,255,0)", "rgba(255,255,255,1)"]),
    lightGlow: createRadialGradient("circle", "center", ["rgba(255,255,255,0.8)", "rgba(255,255,255,0)"]),

    // Dark gradients
    darkFade: createLinearGradient("toBottom", ["rgba(0,0,0,0)", "rgba(0,0,0,1)"]),
    darkGlow: createRadialGradient("circle", "center", ["rgba(0,0,0,0.8)", "rgba(0,0,0,0)"]),

    // Color gradients
    blueToGreen: createLinearGradient("toRight", ["#3b82f6", "#10b981"]),
    purpleToBlue: createLinearGradient("toRight", ["#8b5cf6", "#3b82f6"]),
    orangeToRed: createLinearGradient("toRight", ["#f59e0b", "#ef4444"]),
    greenToBlue: createLinearGradient("toRight", ["#10b981", "#3b82f6"]),
    redToPurple: createLinearGradient("toRight", ["#ef4444", "#8b5cf6"]),

    // Radial gradients
    lightRadial: createRadialGradient("circle", "center", ["white", "rgba(255,255,255,0)"]),
    darkRadial: createRadialGradient("circle", "center", ["black", "rgba(0,0,0,0)"]),

    // Conic gradients
    rainbow: createConicGradient("center", "0deg", ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "red"]),
  } as const;

  // Theme-specific gradients
  export const themeGradients = {
    classic: {
      primary: gradients.blueToGreen,
      secondary: gradients.purpleToBlue,
      accent: gradients.orangeToRed,
    },
    ocean: {
      primary: createLinearGradient("toRight", ["#0077b6", "#0096c7"]),
      secondary: createLinearGradient("toRight", ["#023e8a", "#0077b6"]),
      accent: createLinearGradient("toRight", ["#0096c7", "#00b4d8"]),
    },
    forest: {
      primary: createLinearGradient("toRight", ["#3d633e", "#315a31"]),
      secondary: createLinearGradient("toRight", ["#2d4d2d", "#3d633e"]),
      accent: createLinearGradient("toRight", ["#315a31", "#588157"]),
    },
    // Add other theme-specific gradients as needed
  } as const;
