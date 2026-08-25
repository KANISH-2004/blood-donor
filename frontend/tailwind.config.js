/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F8FA",
        ink: "#12181B",
        inkSoft: "#4B5560",
        line: "#E2E5E9",
        crimson: {
          DEFAULT: "#C1272D",
          deep: "#8C1C21",
          soft: "#FBEAEA",
        },
        pulse: {
          DEFAULT: "#0E7C7B",
          deep: "#0A5F5E",
          soft: "#E6F3F2",
        },
        amber: {
          DEFAULT: "#B5730A",
          soft: "#FBF1E1",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,24,27,0.06), 0 8px 24px -12px rgba(18,24,27,0.12)",
      },
    },
  },
  plugins: [],
};
