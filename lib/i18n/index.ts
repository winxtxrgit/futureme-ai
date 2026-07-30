import type { Language } from "@/lib/preferences";
import { en, type Dictionary } from "./en";
import { th } from "./th";

export type { Dictionary };

export const DICTIONARIES: Record<Language, Dictionary> = { en, th };

export function dictionaryFor(lang: Language): Dictionary {
  return DICTIONARIES[lang] ?? en;
}

/**
 * Fills `{name}` placeholders.
 *
 * Deliberately not a general template engine: the values are counts and short
 * labels, and anything unmatched is left visible as `{name}` rather than
 * silently blanked, so a missing value shows up in review instead of shipping
 * as an empty sentence.
 */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Picks the right side of a bilingual field from the question bank.
 *
 * Falls back to English when a Thai string is missing. The UI dictionary makes
 * that impossible at compile time, but question data is JSON and is edited by
 * people writing items rather than TypeScript, so it needs a runtime guard.
 */
export function localised(field: { en: string; th?: string }, lang: Language): string {
  if (lang === "th" && field.th && field.th.trim().length > 0) return field.th;
  return field.en;
}
