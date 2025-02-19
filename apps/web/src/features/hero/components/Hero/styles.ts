export const heroStyles = {
  // Use the theme's background color via CSS variable
  section: [
    "relative",
    "min-h-screen",
    "flex items-center justify-center",
    "pt-20 w-full",
    "bg-[hsl(var(--background))]"
  ].join(" "),

  container: "container mx-auto px-6 max-w-[1440px]",

  content: [
    "max-w-4xl",
    "mx-auto",
    "text-center",
    "relative",
    "z-10"
  ].join(" "),

  // Heading uses a dynamic gradient from primary to accent colors from the active theme
  heading: [
    "text-6xl md:text-7xl",
    "font-bold",
    "mb-8",
    "bg-clip-text text-transparent",
    "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]",
    "leading-tight"
  ].join(" "),

  // Subtitle now uses the theme’s muted color
  subtitle: [
    "text-xl md:text-2xl",
    "mb-12",
    "max-w-2xl",
    "mx-auto",
    "leading-relaxed",
    "text-[hsl(var(--muted))]"
  ].join(" "),

  buttonContainer: [
    "flex",
    "flex-col sm:flex-row",
    "justify-center",
    "gap-4",
    "w-full",
    "max-w-md",
    "mx-auto"
  ].join(" "),

  loading: [
    "flex",
    "items-center",
    "justify-center",
    "min-h-[400px]"
  ].join(" ")
} as const;
