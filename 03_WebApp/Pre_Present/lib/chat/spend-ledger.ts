/**
 * A cumulative ceiling on what the API key can be made to spend.
 *
 * The rate limiters answer "how fast", and a five-minute window says nothing
 * about a day. At the shipped global ceiling of 600 calls per five minutes, a
 * caller who simply keeps going within the limit makes about 172,000 calls in
 * twenty-four hours. That is a bill in the thousands of dollars, reached without
 * ever tripping anything, because nothing was counting the total.
 *
 * So this counts totals rather than rates, over a calendar day and a calendar
 * month in UTC — calendar rather than rolling because that is how a bill is
 * read, and how the provider's own limits are drawn.
 *
 * ## What this is not
 *
 * **It is not the primary control, and must not be treated as one.** State lives
 * in this process: a restart clears it, and several instances each keep their
 * own. On a platform that recycles containers the daily counter may barely
 * survive an hour. The control that actually cannot be bypassed is the spend
 * limit set on the key in the Anthropic Console, and that should be configured
 * before a funded key is ever deployed. This is the second line — it catches a
 * runaway loop in the minutes before anyone looks at a dashboard, and it turns
 * the failure into degraded answers instead of an invoice.
 *
 * A durable ledger swaps in behind `createSpendLedger` without touching callers.
 *
 * ## What happens at the ceiling
 *
 * Nothing breaks. Calls stop reaching the provider and the chat answers from
 * project data — the same answer every keyless deployment gives. A learner
 * still gets a real answer to their question; only the AI wording stops.
 */

export type SpendWindow = "day" | "month";
export type SpendMeasure = "calls" | "tokens";

export interface SpendCaps {
  /** Provider calls allowed in the window. Zero or absent means uncapped. */
  calls?: number;
  /** Input plus output tokens allowed in the window. */
  tokens?: number;
}

export interface SpendLedgerOptions {
  day?: SpendCaps;
  month?: SpendCaps;
  /**
   * Called when a window first crosses 50%, 80% and 100% of a cap, once per
   * threshold per window. Exists so exhaustion is noticed while it is still
   * approaching rather than after the fact.
   */
  onThreshold?: (event: {
    window: SpendWindow;
    measure: SpendMeasure;
    used: number;
    cap: number;
    fraction: number;
  }) => void;
}

export interface SpendDecision {
  allowed: boolean;
  window?: SpendWindow;
  measure?: SpendMeasure;
  /** Seconds until the exhausted window rolls over. */
  retryAfterSeconds?: number;
}

export interface SpendUsage {
  inputTokens?: number;
  outputTokens?: number;
}

interface Bucket {
  key: string;
  calls: number;
  tokens: number;
  announced: Set<string>;
}

const THRESHOLDS = [0.5, 0.8, 1] as const;

/** UTC so the boundary does not move with the server's locale. */
function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function monthKey(now: number): string {
  return new Date(now).toISOString().slice(0, 7);
}

function nextBoundary(window: SpendWindow, now: number): number {
  const date = new Date(now);
  if (window === "day") {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
  }
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

export function createSpendLedger(options: SpendLedgerOptions = {}) {
  const buckets: Record<SpendWindow, Bucket> = {
    day: { key: "", calls: 0, tokens: 0, announced: new Set() },
    month: { key: "", calls: 0, tokens: 0, announced: new Set() },
  };

  const capsFor = (window: SpendWindow): SpendCaps => options[window] ?? {};

  /** Rolls the bucket when the calendar moves past it. */
  function current(window: SpendWindow, now: number): Bucket {
    const key = window === "day" ? dayKey(now) : monthKey(now);
    const bucket = buckets[window];
    if (bucket.key !== key) {
      bucket.key = key;
      bucket.calls = 0;
      bucket.tokens = 0;
      bucket.announced.clear();
    }
    return bucket;
  }

  function announce(window: SpendWindow, measure: SpendMeasure, now: number): void {
    const cap = capsFor(window)[measure];
    if (!cap) return;
    const bucket = current(window, now);
    const used = measure === "calls" ? bucket.calls : bucket.tokens;
    for (const threshold of THRESHOLDS) {
      const marker = `${measure}:${threshold}`;
      if (used >= cap * threshold && !bucket.announced.has(marker)) {
        bucket.announced.add(marker);
        options.onThreshold?.({ window, measure, used, cap, fraction: threshold });
      }
    }
  }

  return {
    /**
     * Whether another provider call may be made. Does not consume anything —
     * a caller that decides not to proceed should not move the total.
     */
    check(now: number = Date.now()): SpendDecision {
      for (const window of ["day", "month"] as const) {
        const caps = capsFor(window);
        const bucket = current(window, now);
        for (const measure of ["calls", "tokens"] as const) {
          const cap = caps[measure];
          if (!cap) continue;
          const used = measure === "calls" ? bucket.calls : bucket.tokens;
          if (used >= cap) {
            return {
              allowed: false,
              window,
              measure,
              retryAfterSeconds: Math.max(
                1,
                Math.ceil((nextBoundary(window, now) - now) / 1000),
              ),
            };
          }
        }
      }
      return { allowed: true };
    },

    /** One call is about to be made. Counted before the outcome is known. */
    reserve(now: number = Date.now()): void {
      for (const window of ["day", "month"] as const) {
        current(window, now).calls += 1;
        announce(window, "calls", now);
      }
    },

    /**
     * What the call actually cost, once the provider has said so.
     *
     * Separate from `reserve` because the count has to move before the request
     * goes out — a call in flight has already been committed to — while the
     * token cost is only known after it returns. A call that fails or times out
     * still counts as a call and simply adds no tokens.
     */
    record(usage: SpendUsage, now: number = Date.now()): void {
      const tokens = (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
      if (tokens <= 0) return;
      for (const window of ["day", "month"] as const) {
        current(window, now).tokens += tokens;
        announce(window, "tokens", now);
      }
    },

    /** Totals, for a log line or an operator endpoint. Never for a learner. */
    snapshot(now: number = Date.now()) {
      return {
        day: { ...current("day", now), announced: undefined, caps: capsFor("day") },
        month: { ...current("month", now), announced: undefined, caps: capsFor("month") },
      };
    },
  };
}

const positiveOr = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

/**
 * The shipped ceiling, shared by every route that can spend the key.
 *
 * The defaults are sized for a demo that a room of people might use, not for a
 * service: a thousand calls a day is far more than a hackathon audience
 * generates and far less than a loop costs. Raise them deliberately, and set the
 * Console limit first.
 */
export const spendLedger = createSpendLedger({
  day: {
    calls: positiveOr(process.env.CHAT_DAILY_CALL_CAP, 1_000),
    tokens: positiveOr(process.env.CHAT_DAILY_TOKEN_CAP, 3_000_000),
  },
  month: {
    calls: positiveOr(process.env.CHAT_MONTHLY_CALL_CAP, 20_000),
    tokens: positiveOr(process.env.CHAT_MONTHLY_TOKEN_CAP, 60_000_000),
  },
  onThreshold: ({ window, measure, used, cap, fraction }) => {
    const level = fraction >= 1 ? "EXHAUSTED" : `${Math.round(fraction * 100)}%`;
    console.warn(`[spend] ${window} ${measure} ${level} — ${used}/${cap}`);
  },
});
