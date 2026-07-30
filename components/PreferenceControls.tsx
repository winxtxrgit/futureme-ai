"use client";

import { usePreferences, useT } from "@/components/PreferencesProvider";
import { LANGUAGES, THEME_CHOICES, type Language, type ThemeChoice } from "@/lib/preferences";

export function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-mint focus:px-4 focus:py-2 focus:text-mintInk"
    >
      {t.chrome.skipToContent}
    </a>
  );
}

const LANGUAGE_LABEL: Record<Language, string> = { en: "EN", th: "ไทย" };

/**
 * Language and theme controls.
 *
 * Both are segmented radiogroups rather than cycling buttons: with a cycle the
 * learner cannot see what the other options are, and "System" in particular is
 * invisible until they have clicked past it. Each segment states its own value,
 * so the current setting is readable without interacting.
 *
 * Language names are written in their own language — a learner looking for Thai
 * is looking for "ไทย", not for "Thai".
 */
export default function PreferenceControls() {
  const { lang, theme, setLang, setTheme } = usePreferences();
  const t = useT();

  const themeLabel: Record<ThemeChoice, string> = {
    light: t.prefs.light,
    dark: t.prefs.dark,
    system: t.prefs.system,
  };

  const themeIcon: Record<ThemeChoice, string> = { light: "☀", dark: "☾", system: "◐" };

  return (
    <div className="flex items-center gap-2">
      <div
        role="radiogroup"
        aria-label={t.prefs.languageLabel}
        className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1"
      >
        {LANGUAGES.map((code) => {
          const active = code === lang;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`lang-${code}`}
              onClick={() => setLang(code)}
              className={[
                "min-h-[32px] min-w-[38px] rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                active ? "bg-mint text-mintInk" : "text-muted hover:text-ink",
              ].join(" ")}
            >
              {LANGUAGE_LABEL[code]}
            </button>
          );
        })}
      </div>

      <div
        role="radiogroup"
        aria-label={t.prefs.themeLabel}
        className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1"
      >
        {THEME_CHOICES.map((choice) => {
          const active = choice === theme;
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={themeLabel[choice]}
              title={themeLabel[choice]}
              data-testid={`theme-${choice}`}
              onClick={() => setTheme(choice)}
              className={[
                "grid h-8 w-8 place-items-center rounded-full text-[13px] transition",
                active ? "bg-mint text-mintInk" : "text-muted hover:text-ink",
              ].join(" ")}
            >
              <span aria-hidden>{themeIcon[choice]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
