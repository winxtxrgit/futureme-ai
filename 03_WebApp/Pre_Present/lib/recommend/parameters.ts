/**
 * Every number in the programme recommender that is a decision rather than a
 * measurement, in one place, each with the reason it holds that value.
 *
 * The list is exported so the interface can show it. A learner who is told
 * "interest counts for 70%" should be able to find out why, and see that
 * nobody is claiming the figure was measured — none of these is fitted to
 * outcome data, because no outcome data exists yet.
 *
 * Mirrors 01_Research/Recommendation_Engine/engine.py PARAMETERS. The Python
 * reference and this port are checked against each other in
 * tests/unit/recommend-parity.test.ts.
 */
export interface Parameter {
  readonly value: number;
  readonly why: string;
}

export const W_INTEREST = 0.7;
export const W_EFFICACY = 0.3;
export const PRIOR_MEAN = 0.5;
export const CORE_GATE = 55;
export const CONTEXT_MAX = 15;
export const DIFFERENTIATION_GATE = 0.2;
export const EFFICACY_DIM_FLOOR = 0.15;
export const MIN_ITEMS_PER_DIMENSION = 2;
export const MAX_PER_INSTITUTION = 2;
export const MAX_PER_FIELD = 2;
export const CONFIDENCE_GATE = 0.5;

/** The midpoint of the 1..5 response scale. Answering it is not evidence. */
export const SCALE_MIDPOINT = 3;

export const CONTEXT_WEIGHTS = {
  access: 0.45,
  costBand: 0.3,
  intakeRoom: 0.15,
  sectorPreference: 0.1,
} as const;

export type ContextKey = keyof typeof CONTEXT_WEIGHTS;

export const PARAMETERS: Record<string, Parameter> = {
  W_INTEREST: {
    value: W_INTEREST,
    why: "SCCT (Lent, Brown & Hackett 1994) ถือว่าความสนใจถูกสร้างขึ้นบางส่วนจากความมั่นใจในตนเอง การให้ efficacy น้ำหนักเต็มจึงเป็นการนับซ้ำ",
  },
  W_EFFICACY: {
    value: W_EFFICACY,
    why: "ต่ำกว่าความสนใจ เพราะผู้เรียน ม.4–6 ประเมินความถนัดของตัวเองจากประสบการณ์ที่ยังน้อย",
  },
  PRIOR_MEAN: {
    value: PRIOR_MEAN,
    why: "จุดกึ่งกลางสเกล = ไม่มีข้อมูล ไม่เอนไปทางใด · ควรแทนด้วยค่าเฉลี่ยประชากรไทยเมื่อเก็บ norm ได้",
  },
  CORE_GATE: {
    value: CORE_GATE,
    why: "ต่ำกว่านี้ระบบบอกว่าหลักฐานไม่พอ แทนที่จะเสนอไปก่อน",
  },
  CONTEXT_MAX: {
    value: CONTEXT_MAX,
    why: "เพดานที่บริบททั้งหมดรวมกันขยับได้ · เล็กกว่าช่วงห่าง CoreFit ที่มีความหมาย เพื่อให้บริบทจัดลำดับในกลุ่มที่พอ ๆ กันได้ แต่ยกหลักสูตรที่ไม่เข้ากันขึ้นมาชนะไม่ได้",
  },
  DIFFERENTIATION_GATE: {
    value: DIFFERENTIATION_GATE,
    why: "ดัชนี differentiation ของ Holland (1997) · โปรไฟล์ที่ทุกมิติเท่ากันไม่ได้แปลว่าเข้าได้ทุกสาย แต่แปลว่ายังไม่รู้",
  },
  EFFICACY_DIM_FLOOR: {
    value: EFFICACY_DIM_FLOOR,
    why: "น้ำหนักขั้นต่ำที่ถือว่าหลักสูตรใช้มิตินั้นจริง · เวกเตอร์สายไม่เป็นศูนย์ทั้งหกมิติ การเฉลี่ยทั้งหกจะทำให้ทุกหลักสูตรได้ efficacy เท่ากันหมด",
  },
  MIN_ITEMS_PER_DIMENSION: {
    value: MIN_ITEMS_PER_DIMENSION,
    why: "จำนวนข้อที่ให้ข้อมูลขั้นต่ำต่อมิติก่อน coverage เต็ม · ตรงกับ Adaptive_Questionnaire/02-architecture.md §2.3",
  },
  MAX_PER_INSTITUTION: {
    value: MAX_PER_INSTITUTION,
    why: "เพื่อให้รายการเป็นทางเลือกจริง ไม่ใช่โบรชัวร์ของมหาวิทยาลัยเดียว",
  },
  MAX_PER_FIELD: {
    value: MAX_PER_FIELD,
    why: "ความละเอียดของ CoreFit อยู่ที่ระดับสาย ถ้าไม่จำกัด Top 5 จะเป็นสายเดียวกันห้าที่ และลำดับภายในถูกตัดสินด้วยบริบททั้งหมด",
  },
  CONFIDENCE_GATE: {
    value: CONFIDENCE_GATE,
    why: "ความมั่นใจรวมขั้นต่ำก่อนจัดอันดับ · ต่ำกว่านี้การกระทำที่ถูกต้องคือถามต่อ ไม่ใช่เดาให้",
  },
};
