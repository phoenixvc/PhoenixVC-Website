export const contactHeaderStyles = {
  heading: [
    "text-4xl md:text-5xl",
    "font-bold",
    "mb-4",
    "bg-clip-text text-transparent",
    "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]",
    "leading-tight",
  ].join(" "),
  subtitle: [
    "text-xl",
    "mb-8",
    "max-w-2xl",
    "mx-auto",
    "leading-relaxed",
    "text-[hsl(var(--muted))]",
  ].join(" "),
} as const;
