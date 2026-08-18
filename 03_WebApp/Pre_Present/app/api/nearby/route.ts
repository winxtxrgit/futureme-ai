import { NextResponse } from "next/server";
import nearby from "@/data/nearby.json";
import { clientKeyFromHeaders, requestLimiter } from "@/lib/chat";
import { isProvinceCode, type NearbyProvince } from "@/lib/geo/types";

export const runtime = "nodejs";

/**
 * What exists near a province, and how far away it is.
 *
 * Served from an endpoint rather than imported into the page because the file
 * is close to a megabyte: on the server that is one read, in a client bundle it
 * would be a megabyte every learner downloads to look at one province.
 *
 * No provider is involved and nothing here costs money, so this is behind the
 * request throttle only — never the provider allowance. It is also entirely
 * deterministic: the same province returns the same list, and the list is
 * ordered by road distance, which is a fact about a journey rather than a
 * judgement about a place.
 */

const PROVINCES = nearby as unknown as Record<string, NearbyProvince>;

const NO_STORE = { "Cache-Control": "no-store" } as const;

export function GET(request: Request) {
  const decision = requestLimiter.check(clientKeyFromHeaders(request.headers));
  if (!decision.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly.", code: "RATE_LIMITED" },
      {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": String(decision.retryAfterSeconds) },
      },
    );
  }

  const province = new URL(request.url).searchParams.get("province");

  // Checked against the shape and then against the catalogue, so an unknown
  // but well-formed code cannot reach the lookup.
  if (!isProvinceCode(province)) {
    return NextResponse.json(
      { error: "A province code such as TH-50 is required.", code: "BAD_PROVINCE" },
      { status: 400, headers: NO_STORE },
    );
  }

  const payload = PROVINCES[province];
  if (!payload) {
    return NextResponse.json(
      { error: "No data for that province.", code: "UNKNOWN_PROVINCE" },
      { status: 404, headers: NO_STORE },
    );
  }

  /*
   * The dataset is generated and versioned, not live, so it can be cached hard
   * by the browser. The province a learner picked is not sensitive — they chose
   * it from a list and it is a province, not an address — but it is still their
   * data, so the cache is private rather than shared.
   */
  return NextResponse.json(payload, {
    status: 200,
    headers: { "Cache-Control": "private, max-age=3600" },
  });
}
