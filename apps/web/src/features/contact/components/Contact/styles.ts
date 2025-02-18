// features/contact/components/Contact/styles.ts
export const contactStyles = {
    section: [
      "py-20",
      "bg-slate-800/30",
      "min-h-screen",
      "flex items-center"
    ].join(' '),

    container: [
      "container",
      "mx-auto",
      "px-6"
    ].join(' '),

    content: [
      "max-w-4xl",
      "mx-auto",
      "text-center"
    ].join(' ')
  } as const;
