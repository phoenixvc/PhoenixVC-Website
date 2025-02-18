// components/ui/cta-button/styles.ts
export const ctaButtonStyles = {
  base: [
    "px-8 py-3",
    "rounded-lg",
    "font-medium",
    "transition-all duration-200",
    "inline-flex items-center justify-center",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
    "disabled:opacity-60 disabled:cursor-not-allowed"
  ].join(' '),
  variants: {
    primary: [
      "bg-blue-600",
      "text-white",
      "hover:bg-blue-700",
      "active:bg-blue-800",
      "focus:ring-blue-500"
    ].join(' '),
    secondary: [
      "border border-white/20",
      "text-white",
      "hover:border-white/40",
      "active:bg-white/5",
      "focus:ring-white/30"
    ].join(' ')
  }
} as const;
