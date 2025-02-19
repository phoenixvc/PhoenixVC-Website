/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./apps/web/index.html",
    "./apps/web/src/**/*.{js,jsx,ts,tsx}",
    "./apps/design-system/index.html",
    "./apps/design-system/src/**/*.{js,jsx,ts,tsx}",
    "./src/styles/**/*.{css,scss}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
      },
    },
  },
  plugins: [],
};
