"use client";

/**
 * Display preferences: interface language and colour theme.
 *
 * Kept separate from the guest session in lib/session. A learner who deletes
 * their answers on the privacy page should not also have the interface snap
 * back to English — the two are different kinds of data, so they are stored
 * under different keys and cleared by different actions.
 *
 * Like the session store, everything read back is validated. localStorage is
 * writable by the user, by extensions, and by any script that has run on this
 * origin, so an unrecognised value falls back to the default rather than being
 * trusted into the DOM.
 */

export const PREFS_KEY = "futureme.prefs.v1";

export const LANGUAGES = ["en", "th"] as const;
export type Language = (typeof LANGUAGES)[number];

export const THEME_CHOICES = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

/** What is actually painted, after `system` has been resolved. */
export type ResolvedTheme = "light" | "dark";

export interface Preferences {
  lang: Language;
  theme: ThemeChoice;
}

export const DEFAULT_PREFERENCES: Preferences = { lang: "en", theme: "system" };

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

function isThemeChoice(value: unknown): value is ThemeChoice {
  return typeof value === "string" && (THEME_CHOICES as readonly string[]).includes(value);
}

/** Reads stored preferences, falling back per-field rather than all-or-nothing. */
export function loadPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_PREFERENCES;
    const record = parsed as Record<string, unknown>;
    return {
      lang: isLanguage(record.lang) ? record.lang : DEFAULT_PREFERENCES.lang,
      theme: isThemeChoice(record.theme) ? record.theme : DEFAULT_PREFERENCES.theme,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/** Returns false when storage is unavailable, so the UI can say so if it matters. */
export function savePreferences(prefs: Preferences): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

export function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  return choice === "system" ? systemTheme() : choice;
}

/**
 * Applies a theme and language to the document element.
 *
 * `lang` is set on <html> as well as `data-theme` because assistive technology
 * uses it to choose a pronunciation, and Thai read with an English voice is not
 * usable. This mirrors what the pre-paint script in layout.tsx does, so the two
 * cannot disagree once React takes over.
 */
export function applyPreferences(prefs: Preferences): ResolvedTheme {
  const resolved = resolveTheme(prefs.theme);
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolved);
    root.setAttribute("lang", prefs.lang);
    root.style.colorScheme = resolved;
  }
  return resolved;
}
