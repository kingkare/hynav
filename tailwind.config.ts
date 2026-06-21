import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0b1c2b",
          panel: "#0f2536",
          text: "#dfe8f2",
          cyan: "#6fe1ff",
          lime: "#f1ff5c",
          purple: "#a78bfa",
          border: "rgba(111, 225, 255, 0.2)"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 24px rgba(111, 225, 255, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
