// features/hero/components/hero/styles.ts
export const heroStyles = {
  section: [
    "relative",
    "min-h-screen",
    "flex items-center justify-center",
    "pt-20 w-full",
    "bg-gradient-to-b from-gray-900 to-gray-800"
  ].join(' '),

  container: "container mx-auto px-6 max-w-[1440px]",

  content: [
    "max-w-4xl",
    "mx-auto",
    "text-center",
    "relative",
    "z-10"
  ].join(' '),

  heading: [
    "text-6xl md:text-7xl",
    "font-bold",
    "mb-8",
    "bg-clip-text text-transparent",
    "bg-gradient-to-r from-blue-500 to-teal-400",
    "leading-tight"
  ].join(' '),

  subtitle: [
    "text-xl md:text-2xl",
    "text-gray-300",
    "mb-12",
    "max-w-2xl",
    "mx-auto",
    "leading-relaxed"
  ].join(' '),

  buttonContainer: [
    "flex",
    "flex-col sm:flex-row",
    "justify-center",
    "gap-4",
    "w-full",
    "max-w-md",
    "mx-auto"
  ].join(' '),

  loading: [
    "flex",
    "items-center",
    "justify-center",
    "min-h-[400px]"
  ].join(' ')
} as const;
