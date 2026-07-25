import type { Config } from "tailwindcss";

// Aurora design tokens — the same palette used by the design system in docs/03-user-experience.md
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0B0B14",
        surface: "#14141F",
        surface2: "#1C1C2B",
        line: "#2A2A3C",
        ink: "#F5F5FA",
        muted: "#A0A0B8",
        indigo: "#6D5EF6",
        magenta: "#C13BF0",
        coral: "#FF6B6B",
        mint: "#4FE3C1",
        mintInk: "#07130F",
        warning: "#FFD37A",
      },
      borderRadius: { card: "20px", control: "14px" },
      fontFamily: {
        sans: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
