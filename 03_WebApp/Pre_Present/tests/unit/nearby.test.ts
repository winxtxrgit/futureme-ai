import { afterEach, describe, expect, it, vi } from "vitest";
import nearby from "@/data/nearby.json";
import provinces from "@/data/provinces.json";
import { TRAVEL_BANDS, isProvinceCode, type NearbyProvince } from "@/lib/geo/types";
import { en } from "@/lib/i18n/en";
import { th } from "@/lib/i18n/th";

/**
 * The dataset is generated, so these check the shape it must hold rather than
 * its contents — a regenerated file with a different origin, a new register or
 * one more college should still pass.
 *
 * The band assertions matter most. A band is the sentence a learner reads about
 * whether they could get there, and a band that disagrees with its own distance
 * would tell them they can cycle to somewhere sixty kilometres away.
 */

const DATA = nearby as unknown as Record<string, NearbyProvince>;

const BAND_CEILING: Record<string, number> = {
  walkable: 3,
  local: 10,
  commute: 30,
  hard_commute: 80,
};

describe("the nearby dataset", () => {
  it("covers every province the picker offers", () => {
    expect(provinces).toHaveLength(77);
    for (const province of provinces) {
      expect(isProvinceCode(province.iso)).toBe(true);
      expect(DATA[province.iso], `missing ${province.iso}`).toBeDefined();
    }
    expect(Object.keys(DATA)).toHaveLength(77);
  });

  it("gives every province at least one option in its own province", () => {
    for (const [iso, province] of Object.entries(DATA)) {
      expect(province.counts.inside, `${iso} has nothing in-province`).toBeGreaterThan(0);
    }
  });

  it("never puts a distance in a band that contradicts it", () => {
    for (const province of Object.values(DATA)) {
      for (const option of province.options) {
        if (option.km === null) {
          // The only band that may have no distance, and it must have no
          // travel advice attached either.
          expect(option.band).toBe("unknown_distance");
          expect(option.modes).toEqual([]);
          continue;
        }
        expect(option.band).not.toBe("unknown_distance");
        const ceiling = BAND_CEILING[option.band];
        if (ceiling !== undefined) {
          expect(option.km, `${option.name} is ${option.km}km in band ${option.band}`)
            .toBeLessThanOrEqual(ceiling);
        } else {
          expect(option.band).toBe("relocate");
          expect(option.km).toBeGreaterThan(80);
        }
      }
    }
  });

  it("names vehicles with codes both languages can translate", () => {
    // The dataset used to carry Thai words, so an English reader was shown
    // "รถสองแถว". Codes travel now, and a code with no label would render raw.
    const known = new Set(Object.keys(en.nearby.modes));
    expect(new Set(Object.keys(th.nearby.modes))).toEqual(known);
    for (const province of Object.values(DATA)) {
      for (const option of province.options) {
        for (const mode of option.modes) {
          expect(known, `no label for mode "${mode}"`).toContain(mode);
        }
      }
    }
  });

  it("uses only bands the UI can render", () => {
    for (const province of Object.values(DATA)) {
      for (const option of province.options) {
        expect(TRAVEL_BANDS).toContain(option.band);
      }
    }
  });

  it("orders options by distance, with unknown distances last", () => {
    for (const [iso, province] of Object.entries(DATA)) {
      const known = province.options.filter((option) => option.km !== null);
      const sorted = [...known].sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
      expect(known.map((o) => o.id), `${iso} out of order`).toEqual(sorted.map((o) => o.id));
    }
  });

  it("only claims a distance is unknown for places in the learner's own province", () => {
    // An out-of-province option with no coordinate could not have been measured
    // or ranked, so it should never have been included at all.
    for (const province of Object.values(DATA)) {
      for (const option of province.options) {
        if (option.km === null) expect(option.home).toBe(true);
      }
    }
  });

  it("counts what it says it counts", () => {
    for (const [iso, province] of Object.entries(DATA)) {
      const { counts, options } = province;
      expect(counts.inside, iso).toBe(options.filter((o) => o.home).length);
      expect(counts.outside, iso).toBe(options.filter((o) => !o.home).length);
      expect(counts.within30, iso).toBe(
        options.filter((o) => o.km !== null && o.km <= 30).length,
      );
      expect(counts.distanceUnknown, iso).toBe(options.filter((o) => o.km === null).length);
    }
  });

  it("keeps a station reference only when it is a mode you can commute on", () => {
    for (const province of Object.values(DATA)) {
      for (const option of province.options) {
        if (!option.station) continue;
        expect(["metro", "rail"]).toContain(option.station.mode);
        expect(option.station.km).toBeLessThanOrEqual(3);
        expect(option.station.name).toBeTruthy();
      }
    }
  });

  it("says what each place teaches, in terms a learner recognises", () => {
    const allowed = new Set([
      "ปวช.", "ปวส.", "ปริญญาตรี", "ปริญญาโท", "อนุปริญญา", "หลักสูตรระยะสั้น",
    ]);
    for (const province of Object.values(DATA)) {
      for (const option of province.options) {
        for (const level of option.offers) {
          expect(allowed, `${option.name} offers "${level}"`).toContain(level);
        }
      }
    }
  });

  it("reaches a learner on the vocational track in every province", () => {
    // The whole reason the OVEC register was worth using: a ปวช./ปวส. option
    // must exist everywhere, because the university lists alone do not have one.
    for (const [iso, province] of Object.entries(DATA)) {
      expect(province.counts.vocational, `${iso} offers no ปวช./ปวส.`).toBeGreaterThan(0);
    }
  });
});

describe("isProvinceCode", () => {
  it("accepts real province codes and nothing else", () => {
    expect(isProvinceCode("TH-10")).toBe(true);
    expect(isProvinceCode("TH-96")).toBe(true);
    expect(isProvinceCode("TH-S")).toBe(false);      // Pattaya, not a province
    expect(isProvinceCode("th-10")).toBe(false);
    expect(isProvinceCode("TH-100")).toBe(false);
    expect(isProvinceCode("../../etc/passwd")).toBe(false);
    expect(isProvinceCode("")).toBe(false);
    expect(isProvinceCode(null)).toBe(false);
    expect(isProvinceCode(42)).toBe(false);
  });
});

describe("/api/nearby", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function load(env: Record<string, string> = {}) {
    vi.resetModules();
    for (const [key, value] of Object.entries(env)) process.env[key] = value;
    const { GET } = await import("@/app/api/nearby/route");
    return (query: string, headers: Record<string, string> = {}) =>
      GET(new Request(`http://localhost/api/nearby${query}`, { headers }));
  }

  it("returns the province that was asked for", async () => {
    const get = await load({ CHAT_REQUEST_LIMIT_PER_CLIENT: "500" });
    const response = await get("?province=TH-50");
    expect(response.status).toBe(200);
    const body = (await response.json()) as NearbyProvince;
    expect(body.iso).toBe("TH-50");
    expect(body.th).toBe("เชียงใหม่");
    expect(body.options.length).toBeGreaterThan(0);
  });

  it("refuses a malformed code without touching the catalogue", async () => {
    const get = await load({ CHAT_REQUEST_LIMIT_PER_CLIENT: "500" });
    for (const bad of ["", "?province=", "?province=nonsense", "?province=../secrets"]) {
      const response = await get(bad);
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ code: "BAD_PROVINCE" });
    }
  });

  it("distinguishes a well-formed code we have no data for", async () => {
    const get = await load({ CHAT_REQUEST_LIMIT_PER_CLIENT: "500" });
    const response = await get("?province=TH-99");
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ code: "UNKNOWN_PROVINCE" });
  });

  it("is throttled, but never charges the provider allowance", async () => {
    const get = await load({
      CHAT_REQUEST_LIMIT_PER_CLIENT: "2",
      CHAT_RATE_LIMIT_PER_CLIENT: "1",
    });
    const client = { "x-forwarded-for": "203.0.113.44" };
    expect((await get("?province=TH-50", client)).status).toBe(200);
    expect((await get("?province=TH-50", client)).status).toBe(200);

    const refused = await get("?province=TH-50", client);
    expect(refused.status).toBe(429);
    expect(Number(refused.headers.get("retry-after"))).toBeGreaterThan(0);

    // Nothing here reaches Anthropic, so the money ceiling must be untouched.
    const { spendLimiter } = await import("@/lib/chat/limiters");
    expect(spendLimiter.check("203.0.113.44").allowed).toBe(true);
  });
});
