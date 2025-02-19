export const contactStyles = {
  section: [
    "py-20",
    "min-h-screen",
    "flex items-center",
    "bg-[hsl(var(--background))]" // Use theme background
  ].join(" "),
  container: ["container", "mx-auto", "px-6"].join(" "),
  content: ["max-w-4xl", "mx-auto", "text-center"].join(" "),
} as const;
