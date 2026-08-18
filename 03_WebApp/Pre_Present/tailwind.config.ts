import type { Config } from "tailwindcss";

/**
 * Aurora design tokens — the palette described in docs/03-user-experience.md.
 *
 * Every colour resolves through a CSS custom property rather than a literal
 * hex, so the same utility class (`bg-surface`, `text-muted`, `border-mint/40`)
 * renders correctly in both themes. The light and dark values are defined in
 * app/globals.css. Nothing in the app needs `dark:` variants as a result, and
 * a colour can only drift in one place.
 *
 * The `<alpha-value>` placeholder keeps Tailwind's opacity modifiers working,
 * which the UI relies on heavily (`bg-mint/10`, `border-warning/40`).
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        surface2: token("surface2"),
        line: token("line"),
        ink: token("ink"),
        muted: token("muted"),
        indigo: token("indigo"),
        /** Indigo at a lightness that stays readable as text in both themes. */
        indigoText: token("indigo-text"),
        magenta: token("magenta"),
        coral: token("coral"),
        mint: token("mint"),
        mintInk: token("mint-ink"),
        warning: token("warning"),
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
