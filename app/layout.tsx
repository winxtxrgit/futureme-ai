import type { Metadata } from "next";
import "./globals.css";
import { PreferencesProvider } from "@/components/PreferencesProvider";
import { SkipLink } from "@/components/PreferenceControls";
import { PREFS_KEY } from "@/lib/preferences";

export const metadata: Metadata = {
  title: "FutureMe AI — prototype",
  description:
    "Career and study guidance prototype for Thai students. Functional prototype with a runnable end-to-end demo flow.",
};

/**
 * Applies the stored theme before first paint.
 *
 * Runs synchronously in <head>, ahead of hydration, so a learner who chose the
 * light theme never sees a dark frame first. It is deliberately tiny and
 * defensive: any failure falls back to the dark theme the product shipped with
 * rather than leaving the document unstyled.
 */
const THEME_BOOTSTRAP = `
(function () {
  try {
    var stored = JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)}) || "{}");
    var choice = stored.theme === "light" || stored.theme === "dark" ? stored.theme : "system";
    var dark = choice === "dark" ||
      (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.style.colorScheme = dark ? "dark" : "light";
    if (stored.lang === "th") root.setAttribute("lang", "th");
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="aurora-field min-h-screen font-sans antialiased">
        <PreferencesProvider>
          <SkipLink />
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
