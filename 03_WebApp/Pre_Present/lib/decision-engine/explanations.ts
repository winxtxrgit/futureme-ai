import { en } from "@/lib/i18n/en";
import type { Dimension, EvidenceStrength, OpenQuestionCode, ReasonCode } from "./types";

/**
 * English engine copy, taken from the dictionary rather than duplicated here.
 *
 * The server-side explanation layer in app/api/explain runs without a user
 * language and needs a fixed English vocabulary; the interface needs the same
 * strings in whichever language is active. Deriving both from `en` means a
 * wording can only be changed in one place.
 */
export const DIMENSION_LABELS: Record<Dimension, string> = en.engine.dimensions;

/**
 * Deterministic template explanations.
 *
 * This is the DEFAULT explanation layer and it always works offline. The
 * optional LLM layer in app/api/explain rewrites these sentences more warmly —
 * it never changes which routes were selected or why.
 */
export const REASON_TEXT: Record<ReasonCode, string> = en.engine.reasons;

export const STRENGTH_LABELS: Record<EvidenceStrength, string> = en.engine.strengthLabels;

export const STRENGTH_HELP: Record<EvidenceStrength, string> = en.engine.strengthHelp;

/**
 * Joins dimension labels into a list in the given language.
 *
 * The conjunction is passed in rather than hardcoded as "and", because the
 * separator is part of the language, not part of the engine.
 */
export function joinLabels(parts: string[], conjunction: string, empty: string): string {
  if (parts.length === 0) return empty;
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} ${conjunction} ${parts[parts.length - 1]}`;
}

/** English convenience wrapper, kept for the server-side explanation layer. */
export function describeTopInterests(dims: Dimension[]): string {
  return joinLabels(
    dims.map((d) => DIMENSION_LABELS[d]),
    "and",
    "no clear pattern yet",
  );
}

/** Which questions remain open, derived from actual gaps. Codes, not prose. */
export function openQuestionsFor(
  reasons: ReasonCode[],
  strength: EvidenceStrength,
): OpenQuestionCode[] {
  const q: OpenQuestionCode[] = [];
  if (reasons.includes("MISSING_COST_DATA")) q.push("COST_UNKNOWN");
  if (reasons.includes("MISSING_LOCATION_DATA")) q.push("LOCATION_UNKNOWN");
  if (reasons.includes("MISSION_CONTRADICTS")) q.push("MISSION_VS_INTERVIEW");
  if (strength === "limited" || strength === "insufficient") q.push("WHAT_WOULD_YOU_TRY");
  if (reasons.includes("STALE_ROUTE_DATA")) q.push("REQUIREMENTS_CHANGED");
  if (q.length === 0) q.push("WHAT_WOULD_CHANGE_YOUR_MIND");
  return q;
}
