import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        body: ["var(--font-body)", "Sora", "sans-serif"],
        serif: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-body)", "Sora", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#1e3a5f",
          dark: "#1e3a5f",
          darker: "#152a45",
          light: "#2c5282",
          surface: "#f0f4f9",
        },
        terracotta: {
          DEFAULT: "#C97B5A",
          light: "#d99274",
          dark: "#a85d3d",
          subtle: "#faede8",
        },
        cream: {
          DEFAULT: "#faf9f6",
          50: "#fdfdfb",
          100: "#faf9f6",
          200: "#f5f1ea",
          300: "#ebe5dc",
          dark: "#f5f1ea",
        },
        text: {
          heading: "#1a1a1a",
          body: "#2d2d2d",
          muted: "#666666",
        },
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(30, 58, 95, 0.08), 0 4px 12px -4px rgba(30, 58, 95, 0.04)",
        "luxury-hover": "0 20px 40px -15px rgba(30, 58, 95, 0.15), 0 8px 16px -6px rgba(30, 58, 95, 0.08)",
        card: "0 2px 8px -2px rgba(26, 26, 26, 0.04), 0 1px 3px -1px rgba(26, 26, 26, 0.02)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
