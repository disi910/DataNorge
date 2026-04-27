/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0e1a2b",
        "ink-2": "#2a3a52",
        paper: "#f1ece1",
        "paper-2": "#e8e2d3",
        "paper-3": "#fbf8f1",
        blue: "#1d49c7",
        "blue-2": "#143198",
        "blue-3": "#d6dcf2",
        muted: "#5b6478",
        "muted-2": "#8a8e98",
        accent: "#1d49c7",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "IBM Plex Serif", "serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
