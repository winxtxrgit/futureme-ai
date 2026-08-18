import { createRateLimiter } from "@/lib/chat/rate-limit";

/**
 * Two ceilings, because there are two different things to protect and they are
 * not the same size.
 *
 * The **request throttle** protects this server: every POST costs a body read,
 * a JSON parse and a retrieval pass whether or not a provider is ever called.
 * Everyone pays it.
 *
 * The **provider allowance** protects the money. Only a call that is actually
 * about to reach Anthropic spends from it, so it is checked at the point of
 * spend rather than at the door.
 *
 * They used to be one limiter checked before the body was read, which charged
 * the budget for requests that could never cost anything. A deployment with no
 * ANTHROPIC_API_KEY at all — the configuration this demo ships in — still
 * rationed its free, deterministic answers, and so did malformed JSON and
 * anything the safety gate stopped. A NAT'd school got the strictest ceiling
 * for the traffic least able to spend a satang.
 *
 * The split also changes what running out *means*, which is what makes the
 * tight allowance defensible. Exhausting the throttle is a 429: you are asking
 * too fast, slow down. Exhausting the allowance is not an error at all — the
 * question is answered from the project data instead, which is the same answer
 * the whole demo gives when no key is configured. One locks a classroom out;
 * the other quietly stops paying for them.
 *
 * State is in this process: several instances enforce each ceiling several
 * times over, and a restart clears both. That makes these budget guards, not
 * authentication. A shared store swaps in behind `createRateLimiter` without
 * touching a caller.
 */
const WINDOW_MS = 5 * 60_000;

const positiveOr = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Guards the server, not the budget.
 *
 * Loose on purpose. A person types maybe six messages a minute; a script does
 * thousands a second. Six hundred per client per five minutes sits so far above
 * the first and so far below the second that it stops the script without a
 * whole computer lab behind one NAT address ever noticing it exists — and
 * unlike the allowance, hitting this one does lock you out, so it has to be a
 * ceiling only a machine can reach.
 */
export const requestLimiter = createRateLimiter({
  perClient: {
    limit: positiveOr(process.env.CHAT_REQUEST_LIMIT_PER_CLIENT, 600),
    windowMs: WINDOW_MS,
  },
  global: {
    limit: positiveOr(process.env.CHAT_REQUEST_LIMIT_GLOBAL, 6_000),
    windowMs: WINDOW_MS,
  },
});

/**
 * Guards the API key. Shared by every route that can spend it.
 *
 * Deliberately one instance rather than one per route: the budget is shared, so
 * the ceiling has to be too. A per-route limit would let a caller take the sum
 * of them, and rationing only the busier endpoint moves the attack to the
 * quieter one rather than stopping it.
 *
 * The global ceiling is what actually protects the key — a client key comes
 * from a header the caller writes, so it can be rotated for free. Lower the
 * global one first if spend moves faster than expected.
 */
export const spendLimiter = createRateLimiter({
  perClient: {
    limit: positiveOr(process.env.CHAT_RATE_LIMIT_PER_CLIENT, 30),
    windowMs: WINDOW_MS,
  },
  global: {
    limit: positiveOr(process.env.CHAT_RATE_LIMIT_GLOBAL, 600),
    windowMs: WINDOW_MS,
  },
});
