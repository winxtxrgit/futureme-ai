import missionsData from "@/data/missions.json";
import { MIN_INTEREST_ANSWERS } from "@/lib/decision-engine";
import { normaliseInterests, topDimensions } from "@/lib/decision-engine/scoring";
import { DIMENSIONS, type Dimension, type InterviewInput } from "@/lib/decision-engine/types";

/** Why the selector landed on a mission. Rendered by the interface. */
export type MissionRationale =
  | { kind: "learner-choice" }
  | { kind: "default-too-few" }
  | { kind: "default-too-even" }
  | { kind: "default-no-match" }
  | { kind: "matched"; missionId: string; dimension: Dimension; rank: number };

export type MissionDef = (typeof missionsData.missions)[number];

export const MISSIONS = missionsData.missions as MissionDef[];

/** The mission used when the interview cannot justify a choice. */
export const DEFAULT_MISSION_ID = MISSIONS[0].id;

/**
 * Below this spread the learner's answers are too uniform to point anywhere,
 * so picking a "matching" mission would be inventing a preference. Same
 * threshold the recommendation engine uses to refuse a route.
 */
const MIN_SPREAD = 0.15;

export interface MissionChoice {
  mission: MissionDef;
  /** The other missions, in catalogue order. Offered to the learner as alternatives. */
  alternatives: MissionDef[];
  /** The interview dimension that decided it, or null when nothing decided it. */
  matchedDimension: Dimension | null;
  /** True when the interview was too thin or too flat to choose from. */
  isDefault: boolean;
  /** True when the learner picked this mission themselves. */
  isLearnerChoice: boolean;
  /** One sentence, shown to the learner, explaining how this mission was picked. */
  /**
   * Why this mission was chosen, as data. The interface renders it in the
   * active language; the selector does not own a wording.
   */
  rationale: MissionRationale;
}

export function missionById(id: string | null | undefined): MissionDef | undefined {
  if (!id) return undefined;
  return MISSIONS.find((m) => m.id === id);
}

/**
 * Choose the mission a learner is given, from the interview alone.
 *
 * The rule is ordinary code with no model in it, and it is deliberately small
 * enough to state in one sentence: walk the learner's RIASEC dimensions from
 * strongest to weakest, and take the first mission that lists that dimension in
 * its `bestFor`. Catalogue order breaks ties, so the same interview always
 * produces the same mission.
 *
 * It declines to choose in the two cases where a choice would not be evidence
 * based — too few answers, or a profile so flat that no dimension leads — and
 * falls back to the first mission while saying that is what happened.
 *
 * `override` is the learner's own pick and always wins. Being told "this task
 * was chosen for you" and not being able to change it is exactly the kind of
 * quiet narrowing this project is supposed to avoid.
 */
export function selectMission(
  interview: InterviewInput,
  override?: string | null,
): MissionChoice {
  const chosenByLearner = missionById(override);
  if (chosenByLearner) {
    return {
      mission: chosenByLearner,
      alternatives: MISSIONS.filter((m) => m.id !== chosenByLearner.id),
      matchedDimension: null,
      isDefault: false,
      isLearnerChoice: true,
      rationale: { kind: "learner-choice" },
    };
  }

  const { riasec, answered } = normaliseInterests(interview);
  const values = DIMENSIONS.map((d) => riasec[d]);
  const spread = Math.max(...values) - Math.min(...values);

  const undecidable = answered < MIN_INTEREST_ANSWERS || spread < MIN_SPREAD;

  if (undecidable) {
    const fallback = MISSIONS[0];
    return {
      mission: fallback,
      alternatives: MISSIONS.filter((m) => m.id !== fallback.id),
      matchedDimension: null,
      isDefault: true,
      isLearnerChoice: false,
      rationale:
        answered < MIN_INTEREST_ANSWERS
          ? { kind: "default-too-few" }
          : { kind: "default-too-even" },
    };
  }

  const ranked = topDimensions(riasec, 6);
  for (let rank = 0; rank < ranked.length; rank += 1) {
    const dimension = ranked[rank];
    const match = MISSIONS.find((m) => (m.bestFor as Dimension[]).includes(dimension));
    if (match) {
      return {
        mission: match,
        alternatives: MISSIONS.filter((m) => m.id !== match.id),
        matchedDimension: dimension,
        isDefault: false,
        isLearnerChoice: false,
        rationale: { kind: "matched", missionId: match.id, dimension, rank },
      };
    }
  }

  // Unreachable while the catalogue covers all six dimensions, but a catalogue
  // is data and data can be edited, so it must still return something usable.
  const fallback = MISSIONS[0];
  return {
    mission: fallback,
    alternatives: MISSIONS.filter((m) => m.id !== fallback.id),
    matchedDimension: null,
    isDefault: true,
    isLearnerChoice: false,
    rationale: { kind: "default-no-match" },
  };
}
