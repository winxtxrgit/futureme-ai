import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The request throttle and the provider allowance are separate ceilings that
 * protect separate things, and these tests exist to keep them separate.
 *
 * The bug they encode: when one limiter guarded both, it was checked before the
 * body was read — so it charged the budget for requests that could never cost
 * anything. A deployment with no ANTHROPIC_API_KEY, which is what this demo
 * ships as, still rationed its free deterministic answers.
 *
 * Both limiters read their ceilings from the environment at import time, so
 * each test builds its own module graph with `vi.resetModules()` and the limits
 * it wants. That also gives every test a fresh, empty limiter.
 */

const ALLOWANCE = 2;

interface Harness {
  post: (body: unknown, headers?: Record<string, string>) => Promise<Response>;
  /** Consumes one unit of the shared allowance, and says whether it was there. */
  spendAllowance: (clientKey: string) => boolean;
}

async function load(env: Record<string, string | undefined>): Promise<Harness> {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  const { POST } = await import("@/app/api/chat/route");
  const { spendLimiter } = await import("@/lib/chat/limiters");

  return {
    post: (body, headers = {}) =>
      POST(
        new Request("http://localhost/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json", ...headers },
          body: typeof body === "string" ? body : JSON.stringify(body),
        }),
      ),
    spendAllowance: (clientKey) => spendLimiter.check(clientKey).allowed,
  };
}

const ask = (content: string) => ({
  language: "en",
  messages: [{ role: "user", content }],
});

/** A question the retrieval layer can ground, so the route reaches the provider. */
const GROUNDED = "What is the difference between the vocational and academic routes?";

const BASE_ENV = {
  CHAT_RATE_LIMIT_PER_CLIENT: String(ALLOWANCE),
  CHAT_RATE_LIMIT_GLOBAL: "1000",
  CHAT_REQUEST_LIMIT_PER_CLIENT: "1000",
  CHAT_REQUEST_LIMIT_GLOBAL: "1000",
};

const CLIENT = { "x-forwarded-for": "203.0.113.9" };

/**
 * A provider that answers with a citation the guards will accept.
 *
 * The id is read back out of the system prompt we were sent rather than
 * hard-coded, so the answer cites a source that was genuinely retrieved for
 * this question. Citing an id that was not retrieved trips the invented-source
 * guard, and the reply comes back as `offline` — which would make every "was
 * the provider used?" assertion below silently meaningless.
 */
function stubProvider(usage?: { inputTokens: number; outputTokens: number }) {
  const calls: string[] = [];
  vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
    const sent = JSON.parse(String(init.body)) as { system: string };
    const sourceId = /SOURCE_ID: (\S+)/.exec(sent.system)?.[1];
    if (!sourceId) throw new Error("no source reached the provider");
    calls.push(sourceId);
    return new Response(
      JSON.stringify({
        stop_reason: "end_turn",
        content: [{ type: "text", text: `Here is a short answer. [${sourceId}]` }],
        ...(usage
          ? { usage: { input_tokens: usage.inputTokens, output_tokens: usage.outputTokens } }
          : {}),
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the provider allowance is only spent on calls that reach the provider", () => {
  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("does not charge a deployment that has no key at all", async () => {
    const { post, spendAllowance } = await load({
      ...BASE_ENV,
      ANTHROPIC_API_KEY: undefined,
    });

    for (let i = 0; i < 10; i += 1) {
      const response = await post(ask(GROUNDED), CLIENT);
      expect(response.status).toBe(200);
      expect(await response.clone().json()).toMatchObject({ mode: "offline" });
    }

    // Ten free answers later, the budget is still untouched: this is the whole
    // finding. Before the split these requests spent it and a class of thirty
    // could be throttled out of answers that cost nothing to give.
    expect(spendAllowance("203.0.113.9")).toBe(true);
    expect(spendAllowance("203.0.113.9")).toBe(true);
    expect(spendAllowance("203.0.113.9")).toBe(false);
  });

  it("does not charge a message the safety gate stops", async () => {
    const { post, spendAllowance } = await load({
      ...BASE_ENV,
      ANTHROPIC_API_KEY: "test-key",
    });
    const calls = stubProvider();

    const response = await post(ask("sometimes I want to die"), CLIENT);

    expect(response.status).toBe(200);
    expect((await response.json()).safety).toBeTruthy();
    // The gate runs before the provider, so nothing was sent and nothing spent.
    expect(calls).toHaveLength(0);
    expect(spendAllowance("203.0.113.9")).toBe(true);
  });

  it("does not charge a question nothing in the project data can answer", async () => {
    const { post, spendAllowance } = await load({
      ...BASE_ENV,
      ANTHROPIC_API_KEY: "test-key",
    });
    const calls = stubProvider();

    const response = await post(ask("qqqq zzzz xxxx"), CLIENT);

    expect(await response.json()).toMatchObject({ mode: "offline" });
    expect(calls).toHaveLength(0);
    expect(spendAllowance("203.0.113.9")).toBe(true);
  });

  it("does not charge a malformed body", async () => {
    const { post, spendAllowance } = await load({
      ...BASE_ENV,
      ANTHROPIC_API_KEY: "test-key",
    });

    expect((await post("{ not json", CLIENT)).status).toBe(400);
    expect((await post({ language: "en" }, CLIENT)).status).toBe(400);

    expect(spendAllowance("203.0.113.9")).toBe(true);
    expect(spendAllowance("203.0.113.9")).toBe(true);
  });

  it("charges exactly once for a call that does reach the provider", async () => {
    const { post, spendAllowance } = await load({
      ...BASE_ENV,
      ANTHROPIC_API_KEY: "test-key",
    });
    const calls = stubProvider();

    const response = await post(ask(GROUNDED), CLIENT);

    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(spendAllowance("203.0.113.9")).toBe(true);
    expect(spendAllowance("203.0.113.9")).toBe(false);
  });
});

describe("running out of allowance answers the question instead of refusing it", () => {
  it("falls back to project data rather than a 429", async () => {
    const { post } = await load({
      ...BASE_ENV,
      CHAT_RATE_LIMIT_PER_CLIENT: "1",
      ANTHROPIC_API_KEY: "test-key",
    });
    const calls = stubProvider();

    const first = await post(ask(GROUNDED), CLIENT);
    expect(await first.json()).toMatchObject({ mode: "ai" });

    const second = await post(ask(GROUNDED), CLIENT);

    /*
     * The learner asked a real question and gets a real answer — the same one
     * every keyless deployment gives. Only the AI wording was withheld. A 429
     * here would take the answer away too, for a much smaller saving.
     */
    expect(second.status).toBe(200);
    const body = (await second.json()) as { mode: string; sources?: unknown[] };
    expect(body.mode).toBe("offline");
    expect(body.sources?.length).toBeGreaterThan(0);
    // Still only the one paid call.
    expect(calls).toHaveLength(1);
  });
});

describe("the request throttle guards the server, and does refuse", () => {
  it("returns 429 with a Retry-After the page can read", async () => {
    const { post } = await load({
      ...BASE_ENV,
      CHAT_REQUEST_LIMIT_PER_CLIENT: "3",
      ANTHROPIC_API_KEY: undefined,
    });

    for (let i = 0; i < 3; i += 1) {
      expect((await post(ask(GROUNDED), CLIENT)).status).toBe(200);
    }

    const refused = await post(ask(GROUNDED), CLIENT);

    expect(refused.status).toBe(429);
    expect(await refused.json()).toMatchObject({ code: "RATE_LIMITED" });
    const retryAfter = Number(refused.headers.get("retry-after"));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(300);
  });

  it("refuses before reading the body, so a flood cannot make us parse it", async () => {
    const { post } = await load({
      ...BASE_ENV,
      CHAT_REQUEST_LIMIT_PER_CLIENT: "1",
      ANTHROPIC_API_KEY: undefined,
    });

    await post(ask(GROUNDED), CLIENT);
    // Malformed, and oversized in a way that would be rejected on parse — but
    // the throttle answers first, which is the point.
    const refused = await post("{".repeat(10_000), CLIENT);

    expect(refused.status).toBe(429);
  });

  it("keeps one client's flood off another client's allowance", async () => {
    const { post } = await load({
      ...BASE_ENV,
      CHAT_REQUEST_LIMIT_PER_CLIENT: "2",
      ANTHROPIC_API_KEY: undefined,
    });

    await post(ask(GROUNDED), CLIENT);
    await post(ask(GROUNDED), CLIENT);
    expect((await post(ask(GROUNDED), CLIENT)).status).toBe(429);

    const other = { "x-forwarded-for": "198.51.100.2" };
    expect((await post(ask(GROUNDED), other)).status).toBe(200);
  });
});

describe("the cumulative cap is a different ceiling from the rate", () => {
  it("stops calling the provider for the rest of the day, and still answers", async () => {
    const { post } = await load({
      ...BASE_ENV,
      CHAT_DAILY_CALL_CAP: "1",
      ANTHROPIC_API_KEY: "test-key",
    });
    const calls = stubProvider();

    const first = await post(ask(GROUNDED), CLIENT);
    expect(await first.json()).toMatchObject({ mode: "ai" });

    // The per-window allowance is nowhere near exhausted; the day's total is.
    const second = await post(ask(GROUNDED), CLIENT);
    expect(second.status).toBe(200);
    const body = (await second.json()) as { mode: string; sources?: unknown[] };
    expect(body.mode).toBe("offline");
    expect(body.sources?.length).toBeGreaterThan(0);
    expect(calls).toHaveLength(1);
  });

  it("counts the tokens the provider reports, not just the calls", async () => {
    const { post } = await load({
      ...BASE_ENV,
      CHAT_DAILY_TOKEN_CAP: "50",
      ANTHROPIC_API_KEY: "test-key",
    });
    const calls = stubProvider({ inputTokens: 40, outputTokens: 20 });

    expect(await (await post(ask(GROUNDED), CLIENT)).json()).toMatchObject({ mode: "ai" });
    // 60 tokens against a cap of 50, so the next call does not go out.
    expect(await (await post(ask(GROUNDED), CLIENT)).json()).toMatchObject({ mode: "offline" });
    expect(calls).toHaveLength(1);
  });

  it("does not charge the day for a request that never reaches the provider", async () => {
    const { post } = await load({
      ...BASE_ENV,
      CHAT_DAILY_CALL_CAP: "2",
      ANTHROPIC_API_KEY: "test-key",
    });
    const calls = stubProvider();

    await post(ask("sometimes I want to die"), CLIENT);   // safety gate
    await post(ask("qqqq zzzz xxxx"), CLIENT);            // nothing to ground on
    await post("{ not json", CLIENT);                     // malformed

    // All three were free, so both of the day's calls are still there.
    expect(await (await post(ask(GROUNDED), CLIENT)).json()).toMatchObject({ mode: "ai" });
    expect(await (await post(ask(GROUNDED), CLIENT)).json()).toMatchObject({ mode: "ai" });
    expect(calls).toHaveLength(2);
  });
});
