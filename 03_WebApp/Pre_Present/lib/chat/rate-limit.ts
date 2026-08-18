/**
 * A small in-process limiter for the routes that spend the API key.
 *
 * What it is for: the chat endpoint is public and every call costs money, so
 * without a ceiling one script can drain the budget — and the failure is
 * invisible until the bill arrives, because a drained key just makes the chat
 * quietly fall back to offline answers.
 *
 * What it is not: a security control. State lives in this process, so a
 * deployment running several instances enforces the limit per instance, and a
 * serverless one keeps it only as long as a container stays warm. That is
 * worth having anyway — it turns "anyone can drain the key in a loop" into
 * "someone has to work at it" — but a real deployment wants a shared store,
 * and this file is where that swap goes.
 *
 * Two ceilings, because either alone has a hole. Per-client stops one visitor
 * hammering it; the global cap still holds when the client key is spoofed or
 * rotated, which it trivially can be.
 */

export type RateLimitScope = "client" | "global";

export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds until the caller may retry. Zero when allowed. */
  retryAfterSeconds: number;
  /** Which ceiling refused, for logging. */
  scope?: RateLimitScope;
}

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimiterOptions {
  perClient: RateLimitRule;
  global: RateLimitRule;
  /**
   * Ceiling on tracked clients. Keys come from request headers, so an attacker
   * chooses them; without a cap the map is an unbounded allocation they
   * control. On overflow the oldest windows go first — they are the closest to
   * expiring anyway.
   */
  maxTrackedClients?: number;
}

interface Window {
  count: number;
  resetAt: number;
}

const DEFAULT_MAX_TRACKED_CLIENTS = 5_000;

function hit(window: Window | undefined, rule: RateLimitRule, now: number): Window {
  if (!window || now >= window.resetAt) return { count: 1, resetAt: now + rule.windowMs };
  return { count: window.count + 1, resetAt: window.resetAt };
}

const secondsUntil = (resetAt: number, now: number) =>
  Math.max(1, Math.ceil((resetAt - now) / 1000));

export function createRateLimiter(options: RateLimiterOptions) {
  const clients = new Map<string, Window>();
  const maxTracked = options.maxTrackedClients ?? DEFAULT_MAX_TRACKED_CLIENTS;
  let globalWindow: Window | undefined;

  return {
    /**
     * Records one request and says whether it may proceed.
     *
     * A refusal does not consume budget from the other ceiling: being over the
     * global cap should not also burn a visitor's personal allowance, or a
     * busy minute would lock people out for the rest of their window.
     */
    check(clientKey: string, now: number = Date.now()): RateLimitDecision {
      const nextGlobal = hit(globalWindow, options.global, now);
      if (nextGlobal.count > options.global.limit) {
        globalWindow = { ...nextGlobal, count: options.global.limit + 1 };
        return {
          allowed: false,
          scope: "global",
          retryAfterSeconds: secondsUntil(nextGlobal.resetAt, now),
        };
      }

      const nextClient = hit(clients.get(clientKey), options.perClient, now);
      if (nextClient.count > options.perClient.limit) {
        clients.set(clientKey, { ...nextClient, count: options.perClient.limit + 1 });
        return {
          allowed: false,
          scope: "client",
          retryAfterSeconds: secondsUntil(nextClient.resetAt, now),
        };
      }

      globalWindow = nextGlobal;
      clients.set(clientKey, nextClient);
      prune(clients, now, maxTracked);
      return { allowed: true, retryAfterSeconds: 0 };
    },

    /** Tracked client count. Exposed so a test can prove pruning happens. */
    size() {
      return clients.size;
    },
  };
}

function prune(clients: Map<string, Window>, now: number, maxTracked: number): void {
  for (const [key, window] of clients) {
    if (now >= window.resetAt) clients.delete(key);
  }
  if (clients.size <= maxTracked) return;
  // Map preserves insertion order, so the front is the least recently created.
  const excess = clients.size - maxTracked;
  let removed = 0;
  for (const key of clients.keys()) {
    clients.delete(key);
    if (++removed >= excess) break;
  }
}

/**
 * Identifies the caller as well as a proxy chain allows.
 *
 * The left-most `x-forwarded-for` entry is the one the client claims, so it is
 * spoofable — which is exactly why the global ceiling exists and why nothing
 * security-relevant is keyed on this. Callers with no usable header share one
 * bucket rather than getting a free pass each.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return headers.get("x-real-ip")?.trim() || "unknown";
}
