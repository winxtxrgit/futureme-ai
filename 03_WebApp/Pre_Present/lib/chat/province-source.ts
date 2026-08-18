import nearby from "@/data/nearby.json";
import type { ChatLanguage } from "@/lib/chat/types";
import type { RetrievedKnowledge } from "@/lib/chat/knowledge";
import { isProvinceCode, type NearbyProvince } from "@/lib/geo/types";

/**
 * A grounding source built from the learner's own province.
 *
 * "เรียนต่อที่ไหนได้บ้าง" is one of the most ordinary questions this product
 * will meet, and the chat could only ever answer it in general terms while the
 * data to answer it specifically sat two directories away.
 *
 * Deliberately its own module. It imports a near-megabyte dataset, and keeping
 * that out of `service.ts` — which the chat barrel re-exports — means no future
 * client import can drag it into a browser bundle by accident.
 *
 * ## What the source may say
 *
 * The register records what each institution *is*, not which programmes it
 * runs, so the context says that in the source text itself rather than trusting
 * the model to infer it. The system prompt separately forbids calling any of
 * them suitable or recommended, and a guard checks the reply for it — naming a
 * place is a new kind of claim and the route guard alone did not cover it.
 */

const PROVINCES = nearby as unknown as Record<string, NearbyProvince>;

/**
 * Words that make a question about *where*, rather than about what or whether.
 *
 * Kept narrow on purpose. Attaching a list of colleges to a question that was
 * not asking for one would spend the learner's attention and invite the model to
 * bring places into an answer that had no need of them.
 */
const PLACE_QUESTION = new RegExp(
  [
    "ที่ไหน", "ใกล้บ้าน", "แถวบ้าน", "ในจังหวัด", "จังหวัดของ", "เรียนต่อที่",
    "สมัครที่ไหน", "มีที่ไหน", "วิทยาลัยไหน", "มหาลัยไหน", "มหาวิทยาลัยไหน",
    "สถานศึกษา", "เดินทาง", "ไกลไหม", "ใกล้ไหม", "หอพัก",
    "\\bwhere\\b", "\\bnear\\b", "\\bnearby\\b", "\\bcommute\\b", "\\btravel\\b",
    "which (?:college|university|school)",
  ].join("|"),
  "i",
);

/** How many places to put in front of the model. Enough to answer, few enough to read. */
const LISTED = 6;

export function looksLikePlaceQuestion(query: string): boolean {
  return PLACE_QUESTION.test(query);
}

/**
 * The source for a province, or null when there is nothing to add.
 *
 * Null when no province is set, when the code is not one, or when the learner
 * was not asking about places — in each case the chat answers exactly as it did
 * before, which is the behaviour to fall back to.
 */
export function provinceSourceFor(
  query: string,
  provinceIso: string | undefined,
  language: ChatLanguage,
): RetrievedKnowledge | null {
  if (!provinceIso || !isProvinceCode(provinceIso)) return null;
  if (!looksLikePlaceQuestion(query)) return null;

  const province = PROVINCES[provinceIso];
  if (!province) return null;

  const listed = province.options.filter((option) => option.km !== null).slice(0, LISTED);
  if (listed.length === 0) return null;

  const lines = listed.map((option) => {
    const parts = [
      option.name,
      option.district ?? null,
      `${option.km} km`,
      option.offers.join("/") || null,
      option.home ? null : option.province,
    ].filter(Boolean);
    return `- ${parts.join(" · ")}`;
  });

  const title =
    language === "th"
      ? `สถานศึกษาใกล้${province.th}`
      : `Institutions near ${province.en}`;

  const excerpt =
    language === "th"
      ? `รายชื่อสถานศึกษาที่อยู่ใกล้${province.th} พร้อมระยะทางตามถนน จากทะเบียนของ สอศ. และ อว.`
      : `Institutions near ${province.en} with road distances, from the OVEC and MHESI registers.`;

  const caveat =
    language === "th"
      ? [
          "ระยะทางวัดจากอำเภอเมืองของจังหวัด ไม่ใช่จากบ้านของผู้เรียน",
          "ทะเบียนบอกว่าแต่ละแห่งเป็นสถานศึกษาประเภทใด ไม่ได้บอกว่าเปิดสาขาอะไร ต้องให้ผู้เรียนตรวจกับสถานศึกษาเอง",
          "ห้ามบอกว่าที่ใดเหมาะกับผู้เรียน ดีที่สุด หรือแนะนำให้เลือกที่ใด ให้บอกเพียงว่ามีที่ใดบ้างและอยู่ห่างเท่าไร",
        ].join(" ")
      : [
          "Distances are measured from the provincial capital, not the learner's home.",
          "The register records what each institution is, not which programmes it runs; the learner must check with the institution itself.",
          "Never say any of these suits the learner, is best, or should be chosen. State only what exists and how far away it is.",
        ].join(" ");

  return {
    source: {
      id: "province-options",
      title,
      excerpt,
      status: "conditional",
    },
    context: [
      "SOURCE_ID: province-options",
      "STATUS: conditional",
      `TITLE: ${title}`,
      `CONTENT: ${excerpt}`,
      ...lines,
      `CONSTRAINT: ${caveat}`,
      "URL: none (built from the registers in 01_Research/Geography_and_Access)",
    ].join("\n"),
  };
}
