import { describe, expect, it } from "vitest";
import {
  ChatProviderError,
  clientKeyFromHeaders,
  createRateLimiter,
  extractAnthropicResult,
  failureForStatus,
  requestAnthropic,
} from "@/lib/chat";

/*
 * The layer that spends money and talks to the outside world.
 *
 * A learner sees the same offline reply however this fails, so nothing here
 * changes what they read. What it protects is the two things that only show up
 * in production: that one caller cannot drain the key, and that when the AI
 * layer does go quiet, somebody can find out why.
 */

const okBody = (text: string, stopReason = "end_turn") => ({
  stop_reason: stopReason,
  content: [{ type: "text", text }],
});

function stubFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  return async () =>
    ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => okBody("hi"),
      ...response,
    }) as Response;
}

describe("extractAnthropicResult", () => {
  it("returns the text of a complete answer", () => {
    expect(extractAnthropicResult(okBody("ปวช. ใช้เวลาเรียนสามปี"))).toEqual({
      ok: true,
      text: "ปวช. ใช้เวลาเรียนสามปี",
    });
  });

  it("treats a refusal as a refusal, before it reads the content", () => {
    // A refusal arrives as HTTP 200 with an empty or partial body, so code
    // that reads content[0] first would see nothing and guess wrong about why.
    expect(extractAnthropicResult({ stop_reason: "refusal", content: [] })).toEqual({
      ok: false,
      reason: "refused",
    });
  });

  it("discards a truncated answer rather than passing on half a citation", () => {
    expect(extractAnthropicResult(okBody("partial…", "max_tokens"))).toEqual({
      ok: false,
      reason: "truncated",
    });
  });

  it.each([
    [null, "malformed"],
    ["not an object", "malformed"],
    [{ stop_reason: "end_turn" }, "malformed"],
    [{ stop_reason: "end_turn", content: [{ type: "text", text: "   " }] }, "empty"],
  ])("reports %s as %s", (value, reason) => {
    expect(extractAnthropicResult(value)).toEqual({ ok: false, reason });
  });
});

describe("failureForStatus", () => {
  it.each([
    [401, "unauthorized"],
    [403, "unauthorized"],
    [429, "rate_limited"],
    [529, "overloaded"],
    [500, "server_error"],
    [503, "server_error"],
    [400, "bad_request"],
  ])("maps %i to %s", (status, reason) => {
    expect(failureForStatus(status)).toBe(reason);
  });
});

describe("requestAnthropic", () => {
  const base = { apiKey: "k", model: "claude-sonnet-5", system: "s", messages: [] };

  it("carries the reason and the provider's retry-after on a rate limit", async () => {
    const fetchImpl = stubFetch({
      ok: false,
      status: 429,
      headers: new Headers({ "retry-after": "42" }),
    });
    await expect(requestAnthropic({ ...base, fetchImpl } as never)).rejects.toMatchObject({
      reason: "rate_limited",
      retryAfterSeconds: 42,
    });
  });

  it("distinguishes an expired key from an outage", async () => {
    await expect(
      requestAnthropic({ ...base, fetchImpl: stubFetch({ ok: false, status: 401 }) } as never),
    ).rejects.toMatchObject({ reason: "unauthorized" });
    await expect(
      requestAnthropic({ ...base, fetchImpl: stubFetch({ ok: false, status: 529 }) } as never),
    ).rejects.toMatchObject({ reason: "overloaded" });
  });

  it("surfaces a refusal as its own reason", async () => {
    const fetchImpl = stubFetch({ json: async () => ({ stop_reason: "refusal", content: [] }) });
    await expect(requestAnthropic({ ...base, fetchImpl } as never)).rejects.toMatchObject({
      reason: "refused",
    });
  });

  it("asks for enough room that an ordinary Thai answer is not truncated", async () => {
    let sent: Record<string, unknown> = {};
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      sent = JSON.parse(String(init.body));
      return { ok: true, status: 200, headers: new Headers(), json: async () => okBody("ok") };
    }) as unknown as typeof fetch;

    await requestAnthropic({ ...base, fetchImpl } as never);

    expect(sent.max_tokens).toBeGreaterThanOrEqual(2_000);
    // Sonnet 5 accepts disabled thinking; it would 400 on Fable 5, so this
    // pairing and the model default belong together.
    expect(sent.thinking).toEqual({ type: "disabled" });
  });

  it("reports a timeout as a timeout", async () => {
    const fetchImpl = (async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    }) as unknown as typeof fetch;
    await expect(requestAnthropic({ ...base, fetchImpl } as never)).rejects.toMatchObject({
      reason: "timeout",
    });
  });

  it("is a ChatProviderError in every failure case, so callers can branch once", async () => {
    const fetchImpl = stubFetch({ ok: false, status: 500 });
    await expect(requestAnthropic({ ...base, fetchImpl } as never)).rejects.toBeInstanceOf(
      ChatProviderError,
    );
  });
});

describe("createRateLimiter", () => {
  const rules = {
    perClient: { limit: 3, windowMs: 1_000 },
    global: { limit: 5, windowMs: 1_000 },
  };

  it("allows a visitor up to their limit and then refuses", () => {
    const limiter = createRateLimiter(rules);
    for (let i = 0; i < 3; i += 1) expect(limiter.check("a", 0).allowed).toBe(true);

    const refused = limiter.check("a", 0);
    expect(refused.allowed).toBe(false);
    expect(refused.scope).toBe("client");
    expect(refused.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("lets a different visitor through — one person cannot lock out the rest", () => {
    const limiter = createRateLimiter(rules);
    for (let i = 0; i < 4; i += 1) limiter.check("a", 0);
    expect(limiter.check("b", 0).allowed).toBe(true);
  });

  it("reopens once the window passes", () => {
    const limiter = createRateLimiter(rules);
    for (let i = 0; i < 4; i += 1) limiter.check("a", 0);
    expect(limiter.check("a", 1_001).allowed).toBe(true);
  });

  it("still stops a flood that rotates its client key", () => {
    const limiter = createRateLimiter(rules);
    for (let i = 0; i < 5; i += 1) expect(limiter.check(`ip-${i}`, 0).allowed).toBe(true);

    const refused = limiter.check("ip-fresh", 0);
    expect(refused.allowed).toBe(false);
    expect(refused.scope).toBe("global");
  });

  it("does not spend a visitor's allowance on a globally busy minute", () => {
    const limiter = createRateLimiter(rules);
    for (let i = 0; i < 5; i += 1) limiter.check(`ip-${i}`, 0);
    limiter.check("late", 0); // refused globally, must not count against "late"

    // Next window: the visitor still has their full allowance.
    for (let i = 0; i < 3; i += 1) expect(limiter.check("late", 1_001).allowed).toBe(true);
  });

  it("does not grow without bound on attacker-chosen keys", () => {
    const limiter = createRateLimiter({
      perClient: { limit: 1, windowMs: 1_000 },
      global: { limit: 1_000_000, windowMs: 1_000 },
      maxTrackedClients: 10,
    });
    for (let i = 0; i < 500; i += 1) limiter.check(`ip-${i}`, 0);
    expect(limiter.size()).toBeLessThanOrEqual(10);
  });
});

describe("clientKeyFromHeaders", () => {
  it("takes the first hop of x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" });
    expect(clientKeyFromHeaders(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    expect(clientKeyFromHeaders(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("puts unidentifiable callers in one bucket rather than giving each a pass", () => {
    expect(clientKeyFromHeaders(new Headers())).toBe("unknown");
    expect(clientKeyFromHeaders(new Headers({ "x-forwarded-for": "  " }))).toBe("unknown");
  });
});
