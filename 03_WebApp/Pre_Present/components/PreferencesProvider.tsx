"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  loadPreferences,
  resolveTheme,
  savePreferences,
  type Language,
  type Preferences,
  type ResolvedTheme,
  type ThemeChoice,
} from "@/lib/preferences";
import { dictionaryFor, type Dictionary } from "@/lib/i18n";

interface PreferencesContextValue {
  lang: Language;
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  setLang: (lang: Language) => void;
  setTheme: (theme: ThemeChoice) => void;
  t: Dictionary;
  /** False until stored preferences have been read on the client. */
  ready: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/**
 * Holds the interface language and theme.
 *
 * The theme is painted before React runs, by the inline script in layout.tsx,
 * so there is no flash of the wrong colours. Language cannot work the same way
 * — it changes rendered text, and rendering stored Thai on the first client
 * pass would not match the prerendered English and would be a hydration
 * mismatch. So the first paint is the default language and the stored choice
 * is applied on mount. For a learner who has chosen Thai that is a single
 * frame of English on a cold load; a route-based solution (/th/...) is the only
 * way to remove it entirely, and it is not worth restructuring the app for.
 */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadPreferences();
    setPrefs(stored);
    setResolved(applyPreferences(stored));
    setReady(true);
  }, []);

  // Follow the OS while the choice is "system", including live changes.
  useEffect(() => {
    if (prefs.theme !== "system" || typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(applyPreferences(prefs));
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [prefs]);

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const update = useCallback((next: Preferences) => {
    setPrefs(next);
    setResolved(applyPreferences(next));
    savePreferences(next);
  }, []);

  // Built from the in-memory state, not re-read from storage. Re-reading meant
  // that when localStorage is blocked — Safari private mode, blocked cookies —
  // choosing a language silently reverted the theme to the default, because the
  // read came back empty.
  const setLang = useCallback((lang: Language) => update({ ...prefsRef.current, lang }), [update]);
  const setTheme = useCallback(
    (theme: ThemeChoice) => update({ ...prefsRef.current, theme }),
    [update],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      lang: prefs.lang,
      theme: prefs.theme,
      resolvedTheme: resolved,
      setLang,
      setTheme,
      t: dictionaryFor(prefs.lang),
      ready,
    }),
    [prefs, resolved, setLang, setTheme, ready],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    // Rendering outside the provider is a wiring mistake, not a runtime state.
    throw new Error("usePreferences must be used inside <PreferencesProvider>");
  }
  return ctx;
}

/** Shorthand for components that only need the strings. */
export function useT(): Dictionary {
  return usePreferences().t;
}

/** Kept in sync with resolveTheme so callers can preview a choice. */
export { resolveTheme };
