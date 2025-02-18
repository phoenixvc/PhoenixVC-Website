// features/contact/components/ContactHeader/styles.ts
export const contactHeaderStyles = {
    heading: [
      "text-4xl md:text-5xl",
      "font-bold",
      "mb-8",
      "bg-clip-text text-transparent",
      "bg-gradient-to-r from-blue-500 to-teal-400",
      "leading-tight"
    ].join(' '),

    subtitle: [
      "text-xl",
      "text-gray-300",
      "mb-12",
      "max-w-2xl",
      "mx-auto",
      "leading-relaxed"
    ].join(' ')
  } as const;
