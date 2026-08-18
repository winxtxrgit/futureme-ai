import { describe, expect, it, vi } from "vitest";
import { createSpendLedger } from "@/lib/chat/spend-ledger";

/**
 * The ceiling the rate limiters cannot see.
 *
 * A five-minute window says nothing about a day: staying inside 600 calls per
 * five minutes still amounts to roughly 172,000 calls in twenty-four hours. What
 * these check is that the total is actually counted, that it rolls at the
 * calendar boundary rather than drifting, and that running out degrades the
 * answer instead of breaking it.
 */

const DAY = "2026-08-06T12:00:00Z";
const at = (iso: string) => new Date(iso).getTime();

describe("counting the total, not the rate", () => {
  it("allows calls up to the daily cap and refuses the one after", () => {
    const ledger = createSpendLedger({ day: { calls: 3 } });
    const now = at(DAY);

    for (let i = 0; i < 3; i += 1) {
      expect(ledger.check(now).allowed).toBe(true);
      ledger.reserve(now);
    }

    const refused = ledger.check(now);
    expect(refused.allowed).toBe(false);
    expect(refused.window).toBe("day");
    expect(refused.measure).toBe("calls");
  });

  it("does not consume anything when only asked", () => {
    // A caller that checks and then decides not to proceed must not move the
    // total, or a page that merely probes availability would spend the budget.
    const ledger = createSpendLedger({ day: { calls: 2 } });
    const now = at(DAY);
    for (let i = 0; i < 10; i += 1) expect(ledger.check(now).allowed).toBe(true);
  });

  it("counts tokens as well as calls, because cost is not per call", () => {
    const ledger = createSpendLedger({ day: { tokens: 1_000 } });
    const now = at(DAY);

    ledger.reserve(now);
    ledger.record({ inputTokens: 600, outputTokens: 300 }, now);
    expect(ledger.check(now).allowed).toBe(true);

    ledger.record({ inputTokens: 200, outputTokens: 0 }, now);
    const refused = ledger.check(now);
    expect(refused.allowed).toBe(false);
    expect(refused.measure).toBe("tokens");
  });

  it("counts a call that returned nothing usable", () => {
    // A refusal or a timeout was still paid for. Counting only successful
    // answers would let a loop of failures run free.
    const ledger = createSpendLedger({ day: { calls: 2 } });
    const now = at(DAY);
    ledger.reserve(now);
    ledger.reserve(now);
    expect(ledger.check(now).allowed).toBe(false);
  });
});

describe("rolling at the calendar boundary", () => {
  it("resets the day at midnight UTC and keeps the month running", () => {
    const ledger = createSpendLedger({ day: { calls: 2 }, month: { calls: 3 } });

    ledger.reserve(at("2026-08-06T23:59:00Z"));
    ledger.reserve(at("2026-08-06T23:59:30Z"));
    expect(ledger.check(at("2026-08-06T23:59:59Z")).allowed).toBe(false);

    // New day, so the daily cap frees up — but the month has counted both.
    const nextDay = at("2026-08-07T00:00:01Z");
    expect(ledger.check(nextDay).allowed).toBe(true);
    ledger.reserve(nextDay);

    const stopped = ledger.check(nextDay);
    expect(stopped.allowed).toBe(false);
    expect(stopped.window).toBe("month");
  });

  it("resets the month at the first of the month", () => {
    const ledger = createSpendLedger({ month: { calls: 1 } });
    ledger.reserve(at("2026-08-31T23:00:00Z"));
    expect(ledger.check(at("2026-08-31T23:30:00Z")).allowed).toBe(false);
    expect(ledger.check(at("2026-09-01T00:00:01Z")).allowed).toBe(true);
  });

  it("says how long until the window it exhausted rolls over", () => {
    const ledger = createSpendLedger({ day: { calls: 1 } });
    const noon = at("2026-08-06T12:00:00Z");
    ledger.reserve(noon);

    const refused = ledger.check(noon);
    expect(refused.retryAfterSeconds).toBe(12 * 60 * 60);
  });
});

describe("noticing before it runs out", () => {
  it("announces each threshold once, and not again", () => {
    const onThreshold = vi.fn();
    const ledger = createSpendLedger({ day: { calls: 10 }, onThreshold });
    const now = at(DAY);

    for (let i = 0; i < 10; i += 1) ledger.reserve(now);

    const fractions = onThreshold.mock.calls.map((call) => call[0].fraction);
    expect(fractions).toEqual([0.5, 0.8, 1]);

    // Already exhausted; further attempts must not re-announce.
    ledger.reserve(now);
    expect(onThreshold).toHaveBeenCalledTimes(3);
  });

  it("announces again in a new window, because it is a new budget", () => {
    const onThreshold = vi.fn();
    const ledger = createSpendLedger({ day: { calls: 2 }, onThreshold });
    ledger.reserve(at("2026-08-06T10:00:00Z"));
    ledger.reserve(at("2026-08-06T10:00:01Z"));
    const first = onThreshold.mock.calls.length;

    ledger.reserve(at("2026-08-07T10:00:00Z"));
    expect(onThreshold.mock.calls.length).toBeGreaterThan(first);
  });
});

describe("an uncapped measure is not a cap of zero", () => {
  it("treats an absent cap as no limit", () => {
    const ledger = createSpendLedger({});
    const now = at(DAY);
    for (let i = 0; i < 500; i += 1) ledger.reserve(now);
    expect(ledger.check(now).allowed).toBe(true);
  });

  it("treats a zero cap as no limit, so a bad env var cannot silence the AI", () => {
    // CHAT_DAILY_CALL_CAP=0 reads as "unset" rather than "never call the
    // provider", because the second is a configuration that looks like the
    // feature is broken and gives no clue why.
    const ledger = createSpendLedger({ day: { calls: 0 } });
    const now = at(DAY);
    ledger.reserve(now);
    expect(ledger.check(now).allowed).toBe(true);
  });
});
