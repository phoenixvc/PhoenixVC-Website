export const ctaButtonStyles = {
  base: [
    "px-8 py-3",
    "rounded-lg",
    "font-medium",
    "transition-all duration-200",
    "inline-flex items-center justify-center",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-60 disabled:cursor-not-allowed"
  ].join(" "),
  variants: {
    primary: [
      // Use theme variables for background, hover and active states
      "bg-[hsl(var(--color-primary))]",
      "text-white",
      "hover:bg-[hsl(var(--color-hover, var(--color-primary)))]",
      "active:bg-[hsl(var(--color-active, var(--color-secondary)))]",
      "focus:ring-[hsl(var(--color-primary))]"
    ].join(" "),
    secondary: [
      "border",
      "border-[hsl(var(--color-border))]",
      "text-[hsl(var(--color-text))]",
      "hover:border-[hsl(var(--color-hover, var(--color-border)))]",
      "active:bg-[hsl(var(--color-active, var(--color-background)))]",
      "focus:ring-[hsl(var(--color-primary))]"
    ].join(" ")
  }
} as const;
