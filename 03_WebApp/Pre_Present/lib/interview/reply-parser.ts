import type {
  CostAnswer,
  Horizon,
  Mobility,
  Tier,
} from "@/lib/decision-engine/types";

export const MAX_CHOICE_REPLY_LENGTH = 160;

export type LikertValue = 1 | 2 | 3 | 4 | 5;
export type ContextChoiceId = "tier" | "cost" | "mobility" | "horizon";

type ContextValueById = {
  tier: Tier;
  cost: CostAnswer;
  mobility: Mobility;
  horizon: Horizon;
};

interface LocalisedLabel {
  en: string;
  th: string;
}

export interface ReplyChoice<T extends string | number> {
  value: T;
  label: LocalisedLabel;
}

export type ReplyParseFailureReason = "empty" | "too_long" | "no_match" | "multiple";

export type ReplyParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: ReplyParseFailureReason };

/*
 * Aliases for both five-point scales the assessment uses: like/dislike for
 * interest items and a confidence wording for the self-efficacy ones. They
 * share a table because they share a value range, and a learner typing
 * "ทำได้ดีมาก" at an interest question is answering 5 either way.
 */
const LIKERT_ALIASES: Record<LikertValue, readonly string[]> = {
  1: [
    "ทำไม่ได้เลย",
    "strongly dislike",
    "i strongly dislike it",
    "i would strongly dislike it",
    "i hate it",
    "not at all",
    "ไม่ชอบอย่างยิ่ง",
    "ไม่ชอบเลย",
    "เกลียด",
  ],
  2: [
    "a little",
    "ทำได้นิดหน่อย",
    "dislike",
    "i dislike it",
    "i would dislike it",
    "probably not",
    "not really",
    "ไม่ชอบ",
    "ไม่ค่อยชอบ",
  ],
  3: [
    "ไม่แน่ใจ",
    "not sure",
    "i am not sure",
    "i'm not sure",
    "unsure",
    "neutral",
    "i do not know",
    "i don't know",
    "ไม่แน่ใจ",
    "เฉย ๆ",
    "เฉยๆ",
    "ยังไม่รู้",
  ],
  4: [
    "fairly well",
    "ทำได้ค่อนข้างดี",
    "like",
    "i like it",
    "i would like it",
    "sounds good",
    "ชอบ",
    "ค่อนข้างชอบ",
  ],
  5: [
    "very well",
    "ทำได้ดีมาก",
    "strongly like",
    "i strongly like it",
    "i would strongly like it",
    "love it",
    "i love it",
    "absolutely",
    "ชอบอย่างยิ่ง",
    "ชอบมาก",
    "ชอบสุด ๆ",
    "ชอบสุดๆ",
  ],
};

const CONTEXT_ALIASES = {
  tier: {
    LOWER_SECONDARY: [
      "lower secondary",
      "m1-m3",
      "m.1-m.3",
      "ม1-ม3",
      "ม.1-ม.3",
      "มัธยมต้น",
    ],
    UPPER_SECONDARY: [
      "upper secondary",
      "m4-m6",
      "m.4-m.6",
      "ม4-ม6",
      "ม.4-ม.6",
      "มัธยมปลาย",
    ],
    VOCATIONAL: [
      "vocational",
      "vocational school",
      "ปวช",
      "ปวส",
      "ปวช-ปวส",
      "อาชีวศึกษา",
      "สายอาชีพ",
    ],
  },
  cost: {
    tight: [
      "it matters a lot",
      "matters a lot",
      "low cost",
      "i need a low-cost route",
      "tight budget",
      "มีผลมาก",
      "ค่าใช้จ่ายต่ำ",
      "งบน้อย",
    ],
    moderate: ["it matters somewhat", "somewhat", "moderate", "มีผลอยู่บ้าง", "ปานกลาง"],
    flexible: [
      "it is not a major constraint",
      "not a major constraint",
      "flexible",
      "cost is not a problem",
      "ไม่ใช่ข้อจำกัดหลัก",
      "ยืดหยุ่น",
    ],
    unknown: ["i do not know yet", "i don't know yet", "unknown", "not sure yet", "ยังไม่รู้"],
  },
  mobility: {
    local_only: [
      "no",
      "no-it needs to be near home",
      "near home",
      "local only",
      "i cannot move",
      "ไม่ได้",
      "ต้องอยู่ใกล้บ้าน",
      "ย้ายไม่ได้",
    ],
    can_move: [
      "yes",
      "yes-i could move",
      "i could move",
      "can move",
      "ได้",
      "ย้ายได้",
      "ย้ายไปอยู่ที่อื่นได้",
    ],
    unknown: ["i do not know yet", "i don't know yet", "unknown", "not sure yet", "ยังไม่รู้"],
  },
  horizon: {
    soon: [
      "as soon as possible",
      "soon",
      "right away",
      "เร็วที่สุดเท่าที่จะเป็นไปได้",
      "เร็วที่สุด",
      "เร็ว ๆ นี้",
      "เร็วๆ นี้",
    ],
    later: [
      "i am willing to study for several years first",
      "later",
      "several years",
      "ยอมเรียนอีกหลายปีก่อนได้",
      "เรียนอีกหลายปีก่อนได้",
      "ทีหลัง",
    ],
    unsure: ["i am not sure", "not sure", "unsure", "ไม่แน่ใจ", "ยังไม่แน่ใจ"],
  },
} satisfies {
  [K in ContextChoiceId]: Record<ContextValueById[K], readonly string[]>;
};

/**
 * Sentence-final politeness particles, stripped before matching.
 *
 * A Thai speaker types ครับ or ค่ะ without deciding to — it marks who is
 * speaking to whom, not what was answered. "ชอบครับ" and "ชอบ" are the same
 * reply, so rejecting the polite one asks the most courteous learners to type
 * again, on a screen that just invited them to answer in their own words.
 *
 * This is not a licence to guess. Everything listed is propositionally empty,
 * and the two exclusions are load bearing:
 *
 * - เลย is an intensifier, not a particle. ไม่ชอบเลย is the bottom of the
 *   scale and ไม่ชอบ is one step up, so stripping it would move a learner's
 *   answer without telling them.
 * - ค่า is left out although it is a common spelling of ค่ะ, because it is
 *   also the ordinary word for cost — something this questionnaire asks about.
 *
 * Hedges (มั้ง, ก็, น่าจะ, คง, แหละ, ล่ะ) are absent for the same reason: they
 * carry real uncertainty, and this parser is meant to ask again rather than
 * resolve it. The alias lists above were carrying "น่าจะชอบ" and "คงไม่ชอบ"
 * against that rule — a hedged answer scored as though it were flat. They are
 * gone, so an unsure learner is asked again instead of being written down.
 */
const TH_POLITENESS_PARTICLES = [
  "ครับผม",
  "ครับ",
  "คับ",
  "ค่ะ",
  "คะ",
  "ฮะ",
  "ฮ่ะ",
  "จ้ะ",
  "จ๊ะ",
  "จ้า",
  "นะ",
  "น่ะ",
  "อ่ะ",
  "อะ",
];

const TH_TRAILING_PARTICLES = new RegExp(
  `(?:\\s*(?:${TH_POLITENESS_PARTICLES.join("|")}))+$`,
  "u",
);

/*
 * There was a rule here that collapsed three or more repeated Thai letters, on
 * the theory that "ชอบบบ" is the same answer as "ชอบ" typed enthusiastically.
 * It is removed, because that reasoning was wrong in the one way that matters:
 * the drawn-out spelling is *how the strength is expressed*. Collapsing it
 * recorded ชอบบบ as 4 and ไม่ชอบบบ as 2 when the learner may well have meant
 * the ends of the scale, and recorded them without asking — the exact failure
 * this parser exists to avoid. Politeness particles carry no meaning and can
 * go; emphasis carries the answer itself and cannot.
 */

/**
 * Unicode-safe normalization for approved whole-reply matching.
 *
 * This deliberately does not remove question marks, exclamation marks, or
 * arbitrary punctuation. "Like?" is uncertain and must not become "Like".
 */
export function normalizeInterviewReply(input: string): string {
  const thaiDigits = "๐๑๒๓๔๕๖๗๘๙";
  const base = input
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/gu, "")
    .replace(/[๐-๙]/gu, (digit) => String(thaiDigits.indexOf(digit)))
    .replace(/[‘’]/gu, "'")
    .replace(/[‐‑‒–—−]/gu, "-")
    .replace(/\s*-\s*/gu, "-")
    .trim()
    .replace(/\s+/gu, " ")
    .replace(/\.$/u, "")
    .toLocaleLowerCase("en");

  // The full stop is trimmed a second time: in "ปวช.ครับ" it only becomes
  // trailing once the particle is gone, and ปวช. is how the abbreviation is
  // ordinarily written.
  const stripped = base.replace(TH_TRAILING_PARTICLES, "").replace(/\.$/u, "");

  // A reply made of nothing but particles carries no answer. Leaving it whole
  // keeps it a miss the learner is told about, rather than collapsing it to an
  // empty lookup key.
  return stripped.length > 0 ? stripped : base;
}

function parseFromChoices<T extends string | number>(
  input: string,
  choices: readonly ReplyChoice<T>[],
  aliases: Readonly<Record<string, readonly string[]>>,
): ReplyParseResult<T> {
  if (input.trim().length === 0) return { ok: false, reason: "empty" };
  if (input.length > MAX_CHOICE_REPLY_LENGTH) return { ok: false, reason: "too_long" };

  const lookup = new Map<string, Set<T>>();
  const add = (rawAlias: string, value: T) => {
    const alias = normalizeInterviewReply(rawAlias);
    const values = lookup.get(alias) ?? new Set<T>();
    values.add(value);
    lookup.set(alias, values);
  };

  choices.forEach((choice, index) => {
    const ordinal = index + 1;
    add(choice.label.en, choice.value);
    add(choice.label.th, choice.value);
    add(String(ordinal), choice.value);
    add(`${ordinal}/${choices.length}`, choice.value);
    add(`option ${ordinal}`, choice.value);
    add(`choice ${ordinal}`, choice.value);
    add(`ข้อ ${ordinal}`, choice.value);
    add(`ตัวเลือก ${ordinal}`, choice.value);
    add(`ระดับ ${ordinal}`, choice.value);
    for (const alias of aliases[String(choice.value)] ?? []) add(alias, choice.value);
  });

  const matches = lookup.get(normalizeInterviewReply(input));
  if (!matches || matches.size === 0) return { ok: false, reason: "no_match" };
  if (matches.size > 1) return { ok: false, reason: "multiple" };
  return { ok: true, value: [...matches][0] };
}

export function parseInterestReply(
  input: string,
  choices: readonly ReplyChoice<LikertValue>[],
): ReplyParseResult<LikertValue> {
  return parseFromChoices(input, choices, LIKERT_ALIASES);
}

export function parseContextReply<K extends ContextChoiceId>(
  questionId: K,
  input: string,
  choices: readonly ReplyChoice<ContextValueById[K]>[],
): ReplyParseResult<ContextValueById[K]> {
  return parseFromChoices(input, choices, CONTEXT_ALIASES[questionId]);
}
