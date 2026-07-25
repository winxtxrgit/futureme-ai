"use client";

import Link from "next/link";
import type { EvidenceStrength } from "@/lib/decision-engine/types";

export function Shell({
  children,
  step,
}: {
  children: React.ReactNode;
  step?: 1 | 2 | 3 | 4 | 5;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <Header />
      {step ? <Steps current={step} /> : null}
      <main id="main" className="flex-1 pt-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-9 w-9 place-items-center rounded-[12px] bg-gradient-to-br from-indigo via-magenta to-coral"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-canvas">
            <span className="h-2 w-2 rounded-full bg-mint" />
          </span>
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold">FutureMe AI</span>
          <span className="block text-[11px] font-semibold tracking-widest text-muted">
            PROTOTYPE
          </span>
        </span>
      </Link>
      <span className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-semibold text-muted">
        Demo · not validated guidance
      </span>
    </header>
  );
}

const STEP_LABELS = ["Interview", "Mission", "Routes", "Compare", "Plan"];

export function Steps({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="mt-6">
      <ol className="flex flex-wrap gap-x-2 gap-y-2 text-[11px] sm:text-xs">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "current" : "todo";
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={[
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold",
                  state === "current"
                    ? "border-mint bg-mint text-mintInk"
                    : state === "done"
                      ? "border-mint/40 text-mint"
                      : "border-line text-muted",
                ].join(" ")}
              >
                <span aria-hidden>{state === "done" ? "✓" : n}</span>
                <span>{label}</span>
                {state === "done" ? <span className="sr-only">(completed)</span> : null}
              </span>
              {n < STEP_LABELS.length ? (
                <span aria-hidden className="text-line">
                  ›
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-line pt-5 text-xs text-muted">
      <p>
        FutureMe AI is a student prototype for exploration. It is not validated guidance and does
        not predict admission, employment or income. Always check current criteria against official
        sources and talk to a qualified counsellor.
      </p>
      <p className="mt-2">
        <Link href="/privacy" className="text-mint underline underline-offset-2">
          Privacy &amp; your data
        </Link>
      </p>
    </footer>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag className={`rounded-card border border-line bg-surface p-5 ${className}`}>{children}</Tag>
  );
}

export function Button({
  children,
  onClick,
  href,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
} & Record<string, unknown>) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "bg-mint text-mintInk hover:bg-mint/90"
      : "border border-line bg-surface2 text-ink hover:border-muted";
  const cls = `${base} ${styles} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} {...rest}>
      {children}
    </button>
  );
}

const STRENGTH_STYLE: Record<EvidenceStrength, string> = {
  strong: "border-mint/50 text-mint",
  moderate: "border-indigo/60 text-[#A99BFF]",
  limited: "border-warning/50 text-warning",
  insufficient: "border-line text-muted",
};

/**
 * Evidence strength never relies on colour alone — it always carries the shape
 * marker and the word, so it survives greyscale and colour blindness.
 */
export function EvidenceBadge({
  strength,
  label,
}: {
  strength: EvidenceStrength;
  label: string;
}) {
  const bars = { strong: "▮▮▮", moderate: "▮▮▯", limited: "▮▯▯", insufficient: "▯▯▯" }[strength];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STRENGTH_STYLE[strength]}`}
    >
      <span aria-hidden className="tracking-[0.15em]">
        {bars}
      </span>
      <span>{label}</span>
    </span>
  );
}

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning";
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="note"
      className={`rounded-control border px-4 py-3 text-sm ${
        tone === "warning" ? "border-warning/40 bg-warning/5" : "border-line bg-surface2"
      }`}
    >
      {title ? <p className="mb-1 font-bold">{title}</p> : null}
      <div className="text-muted">{children}</div>
    </div>
  );
}
