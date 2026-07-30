/**
 * Localisation completeness.
 *
 * The UI dictionary is already covered by the type system — `Dictionary` is
 * derived from the English object, so a missing Thai key cannot compile. Seed
 * data is JSON and gets no such protection, and it is exactly where an
 * untranslated string is easiest to miss: nothing breaks, a Thai learner just
 * silently reads English.
 *
 * These tests walk every learner-visible field in the seed files and insist on
 * real Thai. They also check the dictionaries agree at runtime, so a bad merge
 * that satisfies the compiler still fails here.
 */
import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";
import missions from "@/data/missions.json";
import routes from "@/data/routes.json";
import { en } from "@/lib/i18n/en";
import { th } from "@/lib/i18n/th";
import { format, localised } from "@/lib/i18n";

const THAI = /[฀-๿]/;

/** Collects every `{en, th}` pair in a tree, with a path for the failure message. */
function collectLocalised(node: unknown, path = "", out: [string, { en: string; th: string }][] = []) {
  if (node === null || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectLocalised(item, `${path}[${i}]`, out));
    return out;
  }
  const record = node as Record<string, unknown>;
  if (typeof record.en === "string" && typeof record.th === "string") {
    out.push([path, { en: record.en, th: record.th }]);
    return out;
  }
  for (const [key, value] of Object.entries(record)) {
    collectLocalised(value, path ? `${path}.${key}` : key, out);
  }
  return out;
}

describe.each([
  ["questions.json", questions],
  ["missions.json", missions],
  ["routes.json", routes],
])("%s is fully translated", (name, data) => {
  const pairs = collectLocalised(data);

  it("contains bilingual fields at all", () => {
    expect(pairs.length, `${name} has no {en, th} pairs — is it still English-only?`)
      .toBeGreaterThan(0);
  });

  it("has a non-empty Thai string everywhere", () => {
    const empty = pairs.filter(([, v]) => v.th.trim().length === 0).map(([p]) => p);
    expect(empty, `empty Thai at: ${empty.join(", ")}`).toEqual([]);
  });

  it("never leaves the Thai identical to the English", () => {
    // An untranslated stub is usually a copy-paste of the source string.
    const copied = pairs.filter(([, v]) => v.th === v.en).map(([p]) => p);
    expect(copied, `untranslated at: ${copied.join(", ")}`).toEqual([]);
  });

  it("writes Thai in Thai script", () => {
    // Product names and numbers are legitimately Latin, so this only fires when
    // a field has no Thai characters at all.
    const notThai = pairs.filter(([, v]) => !THAI.test(v.th)).map(([p]) => p);
    expect(notThai, `no Thai script at: ${notThai.join(", ")}`).toEqual([]);
  });
});

describe("the two dictionaries describe the same interface", () => {
  function paths(node: unknown, prefix = "", out: string[] = []): string[] {
    if (node === null || typeof node !== "object") {
      out.push(prefix);
      return out;
    }
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      paths(value, prefix ? `${prefix}.${key}` : key, out);
    }
    return out;
  }

  it("has exactly the same keys in both languages", () => {
    const enPaths = paths(en).sort();
    const thPaths = paths(th).sort();
    expect(thPaths).toEqual(enPaths);
  });

  it("has no empty strings in either language", () => {
    const blanks: string[] = [];
    const walk = (node: unknown, prefix: string, lang: string) => {
      if (typeof node === "string") {
        if (node.trim().length === 0) blanks.push(`${lang}:${prefix}`);
        return;
      }
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
          walk(v, prefix ? `${prefix}.${k}` : k, lang);
        }
      }
    };
    walk(en, "", "en");
    walk(th, "", "th");
    expect(blanks).toEqual([]);
  });

  it("keeps the same placeholders on both sides", () => {
    // A Thai string that dropped {total} would render a sentence missing its
    // number; one that invented {foo} would render the literal braces.
    const placeholders = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort().join(",");
    const mismatches: string[] = [];
    const walk = (a: unknown, b: unknown, prefix: string) => {
      if (typeof a === "string" && typeof b === "string") {
        if (placeholders(a) !== placeholders(b)) {
          mismatches.push(`${prefix}: en[${placeholders(a)}] th[${placeholders(b)}]`);
        }
        return;
      }
      if (a && b && typeof a === "object" && typeof b === "object") {
        for (const key of Object.keys(a as Record<string, unknown>)) {
          walk(
            (a as Record<string, unknown>)[key],
            (b as Record<string, unknown>)[key],
            prefix ? `${prefix}.${key}` : key,
          );
        }
      }
    };
    walk(en, th, "");
    expect(mismatches, mismatches.join(" | ")).toEqual([]);
  });
});

describe("format", () => {
  it("substitutes named values", () => {
    expect(format("Question {current} of {total}", { current: 3, total: 30 })).toBe(
      "Question 3 of 30",
    );
  });

  it("leaves an unmatched placeholder visible rather than blanking it", () => {
    expect(format("Hello {name}", {})).toBe("Hello {name}");
  });
});

describe("localised", () => {
  it("picks the requested language", () => {
    expect(localised({ en: "Like", th: "ชอบ" }, "th")).toBe("ชอบ");
    expect(localised({ en: "Like", th: "ชอบ" }, "en")).toBe("Like");
  });

  it("falls back to English when Thai is missing at runtime", () => {
    // Cannot happen through the type system, but seed data is edited by hand.
    expect(localised({ en: "Like" } as { en: string; th?: string }, "th")).toBe("Like");
    expect(localised({ en: "Like", th: "   " }, "th")).toBe("Like");
  });
});
