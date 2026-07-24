import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FutureMe AI — prototype",
  description:
    "Career and study guidance prototype for Thai students. Functional prototype with a runnable end-to-end demo flow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="aurora-field min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-mint focus:px-4 focus:py-2 focus:text-mintInk"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
