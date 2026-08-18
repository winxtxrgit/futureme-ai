import nearbyData from "@/data/nearby.json";
import { DIMENSIONS, type Dimension } from "@/lib/decision-engine/types";
import {
  CONFIDENCE_GATE,
  CONTEXT_MAX,
  CONTEXT_WEIGHTS,
  CORE_GATE,
  DIFFERENTIATION_GATE,
  EFFICACY_DIM_FLOOR,
  MAX_PER_INSTITUTION,
  MAX_PER_FIELD,
  W_EFFICACY,
  W_INTEREST,
  type ContextKey,
} from "./parameters";
import { buildProfile, type Profile } from "./profile";
import { allProgrammes, PROGRAMME_META, type Programme } from "./programmes";

export * from "./parameters";
export { buildProfile } from "./profile";
export type { Profile, DimensionScore } from "./profile";
export { PROGRAMME_META } from "./programmes";
export type { Programme } from "./programmes";

export const RECOMMENDER_VERSION = "1.0.0-programme";

/**
 * Ranks real programmes for a learner, and refuses to when the evidence does
 * not support it.
 *
 * Port of 01_Research/Recommendation_Engine/engine.py. No model is involved:
 * the same answers always give the same ranking, and every intermediate value
 * comes back in the result so the interface can show its working.
 */

export type Quadrant =
  | "golden-fit"
  | "growth-area"
  | "burnout-risk"
  | "unfavourable"
  | "unknown-efficacy";

export type Blocker = "LOW_CONFIDENCE" | "UNDIFFERENTIATED_PROFILE";

export interface ContextResult {
  score: number | null;
  known: Partial<Record<ContextKey, number>>;
  /** Named so the learner sees what nobody has checked. */
  unknown: string[];
}

export interface Travel {
  /** Road distance from the learner's provincial centre, not from their home. */
  km: number | null;
  band: string | null;
  /**
   * How the trip could actually be made. This matters more than the distance
   * to someone who cannot drive, which is everyone this product is for.
   *
   * `drive_minutes` is deliberately left out. Geography_and_Access is explicit
   * that it is car time and "ไม่ใช่เวลาที่เด็กใช้จริง" — most learners wait for
   * a สองแถว — so printing it would be a precise number about the wrong
   * journey.
   */
  modes: string[];
  district: string | null;
}

export interface ScoredProgramme {
  programme: Programme;
  travel: Travel;
  congruence: number;
  efficacy: number | null;
  efficacyDimensions: Dimension[];
  core: number;
  quadrant: Quadrant;
  context: ContextResult;
  contextComponent: number;
  final: number;
}

export interface FieldScore {
  /** ISCED-F 2013 detailed field code */
  isced: string;
  iscedTitle: string;
  core: number;
  congruence: number;
  quadrant: Quadrant;
  reachable: number;
}

export interface ProgrammeRecommendation {
  profile: Profile;
  /** Empty when the engine declines. */
  top: ScoredProgramme[];
  /** The layer CoreFit actually resolves at, and therefore the honest headline. */
  fields: FieldScore[];
  candidates: number;
  rejected: number;
  blockers: Blocker[];
  confidentEnough: boolean;
  missingForEveryProgramme: string[];
  version: string;
}

export interface LearnerContext {
  provinceIso?: string;
  /**
   * Narrowing the learner asked for. These belong here rather than in the
   * component because filtering the finished Top 5 is not the same operation:
   * asking for ปวช. would leave a learner staring at an empty list while
   * thousands of ปวช. programmes sat one rank below the cut. The filter has to
   * apply before the ranking is taken, so the five they see are the best five
   * of what they asked for.
   */
  onlyLevel?: string;
  onlySector?: "public" | "private";
  onlyHomeProvince?: boolean;
  /**
   * What the learner is leaving. ม.3 can go to ปวช.; ม.6 to ปวส. or a degree.
   * Absent means no filter — showing everything is better than guessing wrong.
   */
  tier?: "LOWER_SECONDARY" | "UPPER_SECONDARY" | "VOCATIONAL";
  mobility?: "local_only" | "can_move" | "unknown";
  budgetBand?: "tight" | "moderate" | "flexible";
  preferSector?: string;
}

interface NearbyOption {
  id: string;
  km: number | null;
  band?: string;
  modes?: string[];
  district?: string | null;
}

/**
 * How far each institution is from the learner's province, by road.
 *
 * The band travels alongside the kilometres because the two say different
 * things: 40 km is a number, "ไปกลับได้ แต่กินเวลาและค่าเดินทางทุกวัน" is the
 * decision. Both go on the card.
 */
function accessIndex(provinceIso: string | undefined): Map<string, NearbyOption> {
  const map = new Map<string, NearbyOption>();
  if (!provinceIso) return map;
  const entry = (nearbyData as Record<string, { options?: NearbyOption[] }>)[provinceIso];
  for (const option of entry?.options ?? []) map.set(option.id, option);
  return map;
}

export function cosine(a: Record<Dimension, number>, b: Record<Dimension, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const d of DIMENSIONS) {
    const x = a[d] ?? 0;
    const y = b[d] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Efficacy relevant to a programme, over the dimensions it actually loads on.
 * Unanswered dimensions are dropped rather than imputed, and the caller is
 * told which ones carried the number.
 */
export function programmeEfficacy(
  vec: Record<Dimension, number>,
  efficacy: Record<Dimension, number | null>,
): { value: number | null; dimensions: Dimension[] } {
  const used = DIMENSIONS.filter(
    (d) => efficacy[d] !== null && (vec[d] ?? 0) >= EFFICACY_DIM_FLOOR,
  );
  if (used.length === 0) return { value: null, dimensions: [] };
  const totalWeight = used.reduce((s, d) => s + vec[d], 0);
  if (totalWeight === 0) return { value: null, dimensions: [] };
  const value = used.reduce((s, d) => s + vec[d] * (efficacy[d] as number), 0) / totalWeight;
  return { value, dimensions: used };
}

/**
 * Interest x self-efficacy. For explanation only, never for ranking.
 *
 * The burnout-risk cell is why this exists: a learner who is capable at
 * something they dislike is the classic mis-advised case, and a single blended
 * score hides it.
 */
export function quadrantOf(congruence: number, efficacy: number | null): Quadrant {
  if (efficacy === null) return "unknown-efficacy";
  const highInterest = congruence >= 0.8;
  const highEfficacy = efficacy >= 0.6;
  if (highInterest && highEfficacy) return "golden-fit";
  if (highInterest) return "growth-area";
  if (highEfficacy) return "burnout-risk";
  return "unfavourable";
}

/**
 * Contextual fit, over the sub-scores we hold real data for.
 *
 * Unknown sub-scores are excluded from the mean and reported, not imputed as
 * neutral. Imputing would let a programme nobody has priced score the same as
 * one verified affordable.
 */
function contextFit(
  programme: Programme,
  learner: LearnerContext,
  access: Map<string, NearbyOption>,
): ContextResult {
  const known: Partial<Record<ContextKey, number>> = {};
  const unknown: string[] = [];

  const km = access.get(programme.institutionId)?.km ?? null;
  if (km !== null) {
    // Bands from Geography_and_Access/build/build_access.py — daily return
    // travel by someone who cannot drive a car.
    if (km <= 3) known.access = 1;
    else if (km <= 10) known.access = 0.85;
    else if (km <= 30) known.access = 0.65;
    else if (km <= 80) known.access = 0.35;
    else known.access = 0.15;
  } else if (programme.provinceIso === learner.provinceIso) {
    known.access = 0.6; // same province, distance not computed
  } else {
    known.access = 0.1; // outside the commute set: relocation
  }

  const seats = programme.seatsPlanned;
  if (seats === null) {
    unknown.push("seats_planned");
  } else {
    // Published intake is the only admission signal we hold. More room, not
    // "easier" — the wording matters and the trace says so.
    known.intakeRoom = Math.min(1, Math.log10(Math.max(seats, 1) + 1) / Math.log10(301));
  }

  const band = programme.tuitionBand;
  if (!learner.budgetBand || band === "unknown") {
    unknown.push("tuition");
  } else {
    const cheap = band === "public" || band === "rajabhat" || band === "rajamangala";
    const mid = band === "autonomous";
    if (learner.budgetBand === "tight") known.costBand = cheap ? 1 : mid ? 0.4 : 0.1;
    else if (learner.budgetBand === "moderate") known.costBand = cheap || mid ? 1 : 0.5;
    else known.costBand = 1;
  }

  if (learner.preferSector) {
    known.sectorPreference = band === learner.preferSector ? 1 : 0.3;
  }

  // Absent for every programme in the index — named once so the gap is visible
  // rather than silently absorbed.
  unknown.push(...PROGRAMME_META.missing);

  const keys = Object.keys(known) as ContextKey[];
  if (keys.length === 0) {
    return { score: null, known, unknown: [...new Set(unknown)].sort() };
  }
  const totalWeight = keys.reduce((s, k) => s + CONTEXT_WEIGHTS[k], 0);
  const score =
    keys.reduce((s, k) => s + CONTEXT_WEIGHTS[k] * (known[k] as number), 0) / totalWeight;

  return { score, known, unknown: [...new Set(unknown)].sort() };
}

/**
 * Which levels a learner at this tier can actually enter next.
 * A ม.3 leaver cannot enrol on a bachelor's degree, and offering one is not a
 * stretch goal — it is a wrong answer.
 */
function levelOpenTo(level: string, tier: LearnerContext["tier"]): boolean {
  if (!tier) return true;
  if (tier === "LOWER_SECONDARY") return level === "ปวช.";
  if (tier === "VOCATIONAL") return level === "ปวส." || level === "ปริญญาตรี";
  return level === "ปริญญาตรี" || level === "ปวส.";
}

const STATE_FUNDED = new Set(["public", "rajabhat", "rajamangala", "autonomous"]);

/** Coarse public/private split, from the institution's sector. */
export function sectorOf(tuitionBand: string): "public" | "private" {
  return STATE_FUNDED.has(tuitionBand) ? "public" : "private";
}

export function recommendProgrammes(
  answers: Record<string, number>,
  learner: LearnerContext = {},
  topN = 5,
): ProgrammeRecommendation {
  const profile = buildProfile(answers);

  const blockers: Blocker[] = [];
  if (profile.overallConfidence < CONFIDENCE_GATE) blockers.push("LOW_CONFIDENCE");
  if (profile.differentiation < DIFFERENTIATION_GATE) {
    blockers.push("UNDIFFERENTIATED_PROFILE");
  }

  const base: ProgrammeRecommendation = {
    profile,
    top: [],
    fields: [],
    candidates: 0,
    rejected: 0,
    blockers,
    confidentEnough: blockers.length === 0,
    missingForEveryProgramme: PROGRAMME_META.missing,
    version: RECOMMENDER_VERSION,
  };

  // The engine declines rather than guesses. Low confidence is a reason to ask
  // more, never a reason to answer anyway.
  if (blockers.length > 0) return base;

  const access = accessIndex(learner.provinceIso);
  const scored: ScoredProgramme[] = [];
  let rejected = 0;

  for (const programme of allProgrammes()) {
    const congruence = cosine(profile.vector, programme.riasec);
    const { value: efficacy, dimensions } = programmeEfficacy(
      programme.riasec,
      profile.efficacy,
    );

    const core =
      efficacy === null
        ? 100 * congruence
        : 100 * (W_INTEREST * congruence + W_EFFICACY * efficacy);

    if (!levelOpenTo(programme.level, learner.tier)) {
      rejected += 1;
      continue;
    }
    if (learner.onlyLevel && programme.level !== learner.onlyLevel) continue;
    if (learner.onlySector && sectorOf(programme.tuitionBand) !== learner.onlySector) continue;
    if (learner.onlyHomeProvince && programme.provinceIso !== learner.provinceIso) continue;
    if (core < CORE_GATE) {
      rejected += 1;
      continue;
    }
    if (learner.mobility === "local_only" && !access.has(programme.institutionId)) {
      rejected += 1;
      continue;
    }

    const nearby = access.get(programme.institutionId);
    const context = contextFit(programme, learner, access);
    const contextComponent = CONTEXT_MAX * (context.score ?? 0);

    scored.push({
      programme,
      travel: {
        km: nearby?.km ?? null,
        band: nearby?.band ?? null,
        modes: nearby?.modes ?? [],
        district: nearby?.district ?? null,
      },
      congruence,
      efficacy,
      efficacyDimensions: dimensions,
      core,
      quadrant: quadrantOf(congruence, efficacy),
      context,
      contextComponent,
      final: core + contextComponent,
    });
  }

  scored.sort((a, b) =>
    b.final !== a.final
      ? b.final - a.final
      : a.programme.title.localeCompare(b.programme.title, "th"),
  );

  // Two diversity caps, for two different reasons. Per institution, so the
  // list is a set of choices rather than one university's brochure. Per route,
  // because CoreFit resolves at route level — every programme in a route
  // shares one vector, so without this the whole Top 5 is one field and the
  // ordering inside it is done entirely by context, which is what CONTEXT_MAX
  // exists to prevent.
  const top: ScoredProgramme[] = [];
  const perInstitution = new Map<string, number>();
  const perField = new Map<string, number>();

  for (const row of scored) {
    const inst = row.programme.institutionId;
    const field = row.programme.isced;
    if ((perInstitution.get(inst) ?? 0) >= MAX_PER_INSTITUTION) continue;
    if ((perField.get(field) ?? 0) >= MAX_PER_FIELD) continue;
    perInstitution.set(inst, (perInstitution.get(inst) ?? 0) + 1);
    perField.set(field, (perField.get(field) ?? 0) + 1);
    top.push(row);
    if (top.length === topN) break;
  }

  const fieldMap = new Map<string, FieldScore>();
  for (const row of scored) {
    const key = row.programme.isced;
    const existing = fieldMap.get(key);
    if (existing) {
      existing.reachable += 1;
    } else {
      fieldMap.set(key, {
        isced: key,
        iscedTitle: row.programme.iscedTitle,
        core: row.core,
        congruence: row.congruence,
        quadrant: row.quadrant,
        reachable: 1,
      });
    }
  }

  return {
    ...base,
    top,
    fields: [...fieldMap.values()].sort((a, b) => b.core - a.core),
    candidates: scored.length,
    rejected,
  };
}
