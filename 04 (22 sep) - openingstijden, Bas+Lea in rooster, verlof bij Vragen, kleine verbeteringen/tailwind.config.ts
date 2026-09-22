import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Jost", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        ink: { DEFAULT: "#1f1d1a", soft: "#4a4641" },
        sand: { 50: "#faf8f4", 100: "#f3efe7", 200: "#e8e1d3", 300: "#d6cbb6", 400: "#b9a98a" },
        brand: { DEFAULT: "#7a6a4f", light: "#efe8da", dark: "#4f4431" },
      },
    },
  },
  plugins: [],
};
export default config;
