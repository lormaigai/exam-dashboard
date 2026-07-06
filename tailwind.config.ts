import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        paper: "#f8f7f3",
        pine: "#1f6f68",
        coral: "#d6634a",
        gold: "#c49a3a"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 38, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
