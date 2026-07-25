import questionsData from "@/data/questions.json";
import missionsData from "@/data/missions.json";
import { DIMENSIONS, type Dimension, type InterviewInput, type MissionInput } from "./types";

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

/** Minimum interest items answered before the engine will recommend anything. */
export const MIN_INTEREST_ANSWERS = 8;

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
    if (typeof raw !== "number" || raw < 1 || raw > 5) continue;
    const d = item.dimension as Dimension;
    sums[d] += (raw - 1) / 4; // 1..5 -> 0..1
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
  notes: string[];
} {
  const vector = emptyProfile();
  const notes: string[] = [];
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

/** Weighted interest fit between a learner profile and a route's weighting. */
export function interestFit(
  profile: Record<Dimension, number>,
  weights: Record<string, number>,
): number {
  let score = 0;
  let weightSum = 0;
  for (const d of DIMENSIONS) {
    const w = weights[d] ?? 0;
    score += profile[d] * w;
    weightSum += w;
  }
  return weightSum > 0 ? score / weightSum : 0;
}
