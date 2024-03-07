/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        text: "var(--color-text)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        error: "var(--color-error)",
        errorHover: "var(--color-errorHover)",
        waiting: "var(--color-waiting)",
        success: "var(--color-success)",
      },
    },
  },
  plugins: [],
};
