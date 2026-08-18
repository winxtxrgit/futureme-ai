import { NextResponse } from "next/server";
import { provinceSourceFor } from "@/lib/chat/province-source";
import {
  CHAT_LIMITS,
  ChatProviderError,
  answerChat,
  clientKeyFromHeaders,
  requestAnthropic,
  requestLimiter,
  spendLedger,
  spendLimiter,
  validateChatRequest,
  type ChatResponse,
} from "@/lib/chat";

export const runtime = "nodejs";

const TIMEOUT_MS = 8_000;
const DEFAULT_MODEL = "claude-sonnet-5";
const NO_STORE = { "Cache-Control": "no-store" } as const;


function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function GET() {
  const available = Boolean(process.env.ANTHROPIC_API_KEY);
  return json({
    available,
    mode: available ? "ai" : "offline",
    limits: CHAT_LIMITS,
  });
}

type BodyReadResult =
  | { ok: true; value: unknown }
  | { ok: false; code: "MALFORMED_JSON" | "PAYLOAD_TOO_LARGE" };

/** Bound raw bytes before parsing so the semantic text limit is not bypassed. */
async function readJsonBody(request: Request): Promise<BodyReadResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > CHAT_LIMITS.maxRequestBytes) {
    return { ok: false, code: "PAYLOAD_TOO_LARGE" };
  }

  if (!request.body) return { ok: false, code: "MALFORMED_JSON" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > CHAT_LIMITS.maxRequestBytes) {
        await reader.cancel();
        return { ok: false, code: "PAYLOAD_TOO_LARGE" };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, code: "MALFORMED_JSON" };
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const clientKey = clientKeyFromHeaders(request.headers);

  /*
   * The request throttle, checked before the body is read: refusing costs
   * nothing then, and a caller flooding the endpoint should not also get to
   * make us parse 64KB per attempt.
   *
   * This ceiling is about server load only. What it does *not* do any more is
   * charge the provider budget, which is checked further down at the moment
   * something is actually about to be spent.
   */
  const decision = requestLimiter.check(clientKey);
  if (!decision.allowed) {
    console.warn(`[chat] throttled (${decision.scope})`);
    return NextResponse.json(
      { error: "Too many requests. Try again shortly.", code: "RATE_LIMITED" },
      {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": String(decision.retryAfterSeconds) },
      },
    );
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok && bodyResult.code === "PAYLOAD_TOO_LARGE") {
    return json({ error: "Request body is too large.", code: bodyResult.code }, 413);
  }
  if (!bodyResult.ok) {
    return json({ error: "Malformed JSON request body.", code: "MALFORMED_JSON" }, 400);
  }

  const parsed = validateChatRequest(bodyResult.value);
  if (!parsed.ok) {
    return json({ error: parsed.error, code: parsed.code }, 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const generate = apiKey
    ? async ({ system, messages }: { system: string; messages: typeof parsed.value.messages }) => {
        /*
         * The provider allowance, spent here and nowhere earlier. answerChat
         * only reaches this closure once the safety gate has passed and
         * retrieval has found something to ground an answer in, so a blocked
         * message, an unanswerable one, and a malformed body all cost nothing.
         *
         * Refusal is a throw rather than a 429, which answerChat turns into the
         * project-data answer — the same one every keyless deployment gives.
         * The learner still gets a real answer to their question; we simply
         * stop paying for the wording. A 429 here would take the answer away
         * too, which is a worse outcome for a much smaller saving.
         */
        const spend = spendLimiter.check(clientKey);
        if (!spend.allowed) {
          console.warn(`[chat] provider allowance exhausted (${spend.scope})`);
          throw new ChatProviderError(
            "rate_limited",
            "Local provider allowance exhausted.",
            spend.retryAfterSeconds,
          );
        }

        /*
         * The cumulative ceiling, which the per-window allowance above cannot
         * see: staying inside 600 calls per five minutes still amounts to about
         * 172,000 calls a day. Checked after the rate limiter and before the
         * request, then reserved, because a call in flight has already been
         * committed to whatever it returns.
         */
        const budget = spendLedger.check();
        if (!budget.allowed) {
          console.warn(
            `[chat] ${budget.window} ${budget.measure} cap reached — answering from project data`,
          );
          throw new ChatProviderError(
            "rate_limited",
            `Cumulative ${budget.window} ${budget.measure} cap reached.`,
            budget.retryAfterSeconds,
          );
        }
        spendLedger.reserve();

        try {
          return await requestAnthropic({
            apiKey,
            model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
            system,
            messages,
            timeoutMs: TIMEOUT_MS,
            onUsage: (usage) => spendLedger.record(usage),
          });
        } catch (error) {
          /*
           * The learner gets the offline answer either way — answerChat treats
           * a throw as "no AI available". This line is the only place the
           * distinction survives, and without it a dead key, an exhausted
           * quota and a safety refusal are the same silent degradation.
           * Nothing from the conversation is logged.
           */
          if (error instanceof ChatProviderError) {
            const wait = error.retryAfterSeconds ? ` retry-after=${error.retryAfterSeconds}s` : "";
            console.warn(`[chat] provider unavailable: ${error.reason}${wait}`);
          } else {
            console.warn("[chat] provider unavailable: unknown");
          }
          throw error;
        }
      }
    : undefined;

  /*
   * Built from the last two user turns, the same text retrieval uses, so a
   * short follow-up like "แล้วใกล้บ้านผมมีไหม" still carries its topic.
   */
  const recentUserText = parsed.value.messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .slice(-2)
    .join("\n");

  const response: ChatResponse = await answerChat(parsed.value, {
    generate,
    extraSource: provinceSourceFor(
      recentUserText,
      parsed.value.provinceIso,
      parsed.value.language,
    ),
  });
  return json(response);
}
