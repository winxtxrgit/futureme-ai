import questionsData from "@/data/questions.json";
import missionsData from "@/data/missions.json";
import {
  DIMENSIONS,
  type Dimension,
  type InterviewInput,
  type Localised,
  type MissionInput,
} from "./types";

/**
 * Weights for the five-criterion decision matrix.
 *
 * These are DESIGN JUDGEMENT, not values fitted to student outcome data — no
 * outcome data exists. They match the weights documented in
 * docs/04-ai-system.md so the documentation and the code cannot drift apart.
 */
export const WEIGHTS = {
  interests: 0.3,
  feasibility: 0.25,
  strengths: 0.2,
  learningStyle: 0.15,
  flexibility: 0.1,
} as const;

/**
 * The response scale's endpoints. Declared here rather than assumed, because
 * reverse scoring is defined in terms of them: a reversed answer is reflected
 * about the scale's midpoint, so the arithmetic breaks silently if the scale
 * changes and this does not. `tests/unit/question-bank.test.ts` asserts these
 * match data/questions.json.
 */
export const SCALE_MIN = 1;
export const SCALE_MAX = 5;

/**
 * Reflects a reverse-keyed answer onto the positive direction.
 *
 * On a 1..5 scale: 1→5, 2→4, 3→3, 4→2, 5→1. Items declare their own direction
 * in the question bank; nothing here hard-codes which items are reversed, so
 * the data and the scoring cannot drift apart.
 */
export function applyDirection(raw: number, direction: string | undefined): number {
  return direction === "reverse" ? SCALE_MIN + SCALE_MAX - raw : raw;
}

/**
 * Minimum share of the bank that must be answered before the engine will
 * recommend anything.
 *
 * Expressed as a ratio so that changing the number of items cannot silently
 * weaken the floor. Three quarters is a judgement call, not an empirical
 * threshold — documented as such in docs/questionnaire-methodology.md.
 *
 * This is the *only* completeness floor. `evidenceStrength` previously applied
 * its own hardcoded 0.75 check on top of a two-thirds constant, so the real
 * floor was higher than the one the interface quoted: a learner told "answer at
 * least 20" could answer exactly 20, finish the mission, and land on an empty
 * routes page blaming insufficient evidence. Both now read this constant.
 */
export const MIN_INTEREST_RATIO = 0.75;
export const MIN_INTEREST_ANSWERS = Math.ceil(
  questionsData.interest.length * MIN_INTEREST_RATIO,
);

/**
 * Cut-offs on the 0..100 interest-fit scale.
 *
 * `interestFit` moved from a weighted mean to cosine similarity, which shifted
 * the whole distribution upward — the median over every profile on the
 * {0,.25,.5,.75,1} grid went from 50.0 to 71.6. Left alone, the old cut-offs
 * would have handed out "strong evidence" roughly three times as often and made
 * INTEREST_WEAK a near-dead branch, which would have quietly loosened the
 * product's honesty gates while appearing to change nothing.
 *
 * These values are percentile-matched to the previous calibration over that
 * same grid (93,744 profile-route pairs), so each gate fires at the rate it
 * used to: MATCH 30.7% -> 31.7%, STRONG 21.4% -> 21.5%, LIMITED 40.0% -> 39.3%,
 * MODERATE 50.6% -> 51.1%. They are calibration, not measurement.
 */
export const FIT_MATCH = 79;
export const FIT_STRONG = 83;
export const FIT_LIMITED = 76;
export const FIT_MODERATE = 71;

/** Two totals within this many points are treated as tied, not ranked. */
export const TIE_EPSILON = 4;

const emptyProfile = (): Record<Dimension, number> =>
  DIMENSIONS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {} as Record<Dimension, number>);

/**
 * Normalise Likert answers (1..5) into a 0..1 score per RIASEC dimension.
 * Unanswered items are excluded rather than treated as zero, so a partial
 * interview does not silently look like a low score.
 */
export function normaliseInterests(input: InterviewInput): {
  riasec: Record<Dimension, number>;
  answered: number;
  total: number;
} {
  const sums = emptyProfile();
  const counts = emptyProfile();
  const items = questionsData.interest;

  for (const item of items) {
    const raw = input.interest[item.id];
    // Number.isFinite rather than typeof: NaN is a number, and both NaN < 1
    // and NaN > 5 are false, so a bare range check lets it through and poisons
    // the whole dimension.
    if (!Number.isFinite(raw) || raw < SCALE_MIN || raw > SCALE_MAX) continue;
    const d = item.dimension as Dimension;
    const directed = applyDirection(raw, (item as { direction?: string }).direction);
    // 1..5 -> 0..1, so a dimension's score is the mean of its items and stays
    // comparable across dimensions with different numbers of items answered.
    sums[d] += (directed - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
    counts[d] += 1;
  }

  const riasec = emptyProfile();
  for (const d of DIMENSIONS) riasec[d] = counts[d] > 0 ? sums[d] / counts[d] : 0;

  const answered = DIMENSIONS.reduce((n, d) => n + counts[d], 0);
  return { riasec, answered, total: items.length };
}

/**
 * Turn a completed mission into an independent RIASEC evidence vector.
 * This is deterministic rule application over the option->evidence maps in
 * data/missions.json, plus keyword spotting in free text. No model is involved.
 */
export function scoreMissionEvidence(mission: MissionInput | null): {
  vector: Record<Dimension, number>;
  signals: number;
  notes: Localised[];
} {
  const vector = emptyProfile();
  const notes: Localised[] = [];
  let signals = 0;

  if (!mission || !mission.completed) return { vector, signals, notes };

  const def = missionsData.missions.find((m) => m.id === mission.missionId);
  if (!def) return { vector, signals, notes };

  const raw = emptyProfile();

  for (const step of def.steps) {
    const answer = mission.answers[step.id];
    if (answer === undefined) continue;

    if (step.type === "multi" && Array.isArray(answer)) {
      for (const value of answer) {
        const opt = step.options?.find((o) => o.value === value);
        if (!opt?.evidence) continue;
        for (const [d, w] of Object.entries(opt.evidence)) {
          raw[d as Dimension] += w as number;
          signals += 1;
        }
        notes.push(opt.label);
      }
    }

    if (step.type === "single" && typeof answer === "string") {
      const opt = step.options?.find((o) => o.value === answer);
      if (opt?.evidence) {
        for (const [d, w] of Object.entries(opt.evidence)) {
          raw[d as Dimension] += w as number;
          signals += 1;
        }
        notes.push(opt.label);
      }
    }

    if (step.type === "text" && typeof answer === "string" && answer.trim().length > 0) {
      const hits = keywordEvidence(answer, def.textEvidenceKeywords);
      for (const [d, n] of Object.entries(hits)) {
        raw[d as Dimension] += n;
        if (n > 0) signals += 1;
      }
    }
  }

  // Normalise to 0..1 against the strongest observed dimension so that the
  // mission vector is comparable with the interview vector.
  const max = Math.max(...DIMENSIONS.map((d) => raw[d]), 0);
  if (max > 0) for (const d of DIMENSIONS) vector[d] = raw[d] / max;

  return { vector, signals, notes };
}

/** Count keyword hits per dimension in free text. Case-insensitive, word-ish. */
export function keywordEvidence(
  text: string,
  keywords: Record<string, string[]>,
): Record<Dimension, number> {
  const out = emptyProfile();
  const lower = ` ${text.toLowerCase().replace(/[^a-z฀-๿\s]/g, " ")} `;
  for (const [d, words] of Object.entries(keywords)) {
    for (const w of words) {
      if (lower.includes(` ${w.toLowerCase()} `)) out[d as Dimension] += 1;
    }
  }
  return out;
}

/** The dimensions the learner scored highest on, strongest first. */
export function topDimensions(riasec: Record<Dimension, number>, n = 3): Dimension[] {
  return [...DIMENSIONS].sort((a, b) => riasec[b] - riasec[a]).slice(0, n);
}

/**
 * Dimensions where the interview and the mission disagree sharply.
 * Surfaced to the learner rather than silently averaged away.
 */
export function findContradictions(
  interview: Record<Dimension, number>,
  mission: Record<Dimension, number>,
  threshold = 0.5,
): Dimension[] {
  return DIMENSIONS.filter((d) => Math.abs(interview[d] - mission[d]) >= threshold);
}

/**
 * How closely a learner's interest profile matches the *shape* of a route's
 * weighting, as cosine similarity between the two six-dimensional vectors.
 *
 * This was previously a weighted mean of the profile across the route's
 * weights. That measured the learner's average interest level over those
 * dimensions rather than the correspondence between the two profiles, and the
 * difference was not academic: under a weighted mean a learner whose interest
 * is concentrated in one dimension could never score above that route's weight
 * for it. A purely Artistic learner topped out at 50 against the arts route, a
 * purely Social learner at 40, a purely Enterprising learner at 30 — all under
 * the 60 needed for an interest match, so all three were told there was
 * insufficient evidence, while learners whose interests happened to span two
 * dimensions a route weighted heavily scored 70 and got recommendations. The
 * arithmetic, not the learner, decided who was legible.
 *
 * Cosine similarity compares direction rather than magnitude, which is what
 * "does this route look like this person" actually asks. It is also the
 * profile-correlation approach the cross-cultural literature prefers over
 * assuming the RIASEC hexagon's adjacency holds — see
 * docs/questionnaire-methodology.md §11.2.
 *
 * Returns 0 for a zero-length profile rather than dividing by zero. The
 * answer-count and profile-spread gates already stop those cases upstream;
 * this is a guard, not a reachable path.
 */
export function interestFit(
  profile: Record<Dimension, number>,
  weights: Record<string, number>,
): number {
  let dot = 0;
  let profileNorm = 0;
  let weightNorm = 0;

  for (const d of DIMENSIONS) {
    const p = profile[d] ?? 0;
    const w = weights[d] ?? 0;
    dot += p * w;
    profileNorm += p * p;
    weightNorm += w * w;
  }

  if (profileNorm === 0 || weightNorm === 0) return 0;
  return dot / (Math.sqrt(profileNorm) * Math.sqrt(weightNorm));
}
