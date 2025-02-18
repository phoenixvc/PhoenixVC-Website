// features/contact/components/ContactForm/styles.ts
export const contactFormStyles = {
    form: "space-y-6",
    inputGrid: "grid grid-cols-1 md:grid-cols-2 gap-6",
    input: [
      "w-full",
      "px-4 py-3",
      "rounded-lg",
      "bg-white/5",
      "border border-white/10",
      "focus:border-blue-400 focus:outline-none",
      "transition-colors duration-200"
    ].join(' '),
    textarea: [
      "w-full",
      "px-4 py-3",
      "rounded-lg",
      "bg-white/5",
      "border border-white/10",
      "focus:border-blue-400 focus:outline-none",
      "transition-colors duration-200",
      "resize-none"
    ].join(' '),
    button: [
      "w-full",
      "px-8 py-3",
      "bg-blue-600",
      "hover:bg-blue-700",
      "rounded-lg",
      "font-medium",
      "transition-colors duration-200",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    ].join(' '),
    error: "text-red-400 text-sm mt-1"
  } as const;
