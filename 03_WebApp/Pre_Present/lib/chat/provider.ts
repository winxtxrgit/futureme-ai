import type { ChatMessage } from "@/lib/chat/types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_REPLY_CHARS = 4_000;

export interface AnthropicRequest {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  /**
   * Called with what the provider says the call cost, when it says so.
   *
   * A callback rather than a changed return type: every caller wants the text
   * and none of them wants a tuple, and the spend ledger is the only thing that
   * cares about tokens. It fires even when the body turns out to be unusable,
   * because a refused or truncated reply was still paid for.
   */
  onUsage?: (usage: { inputTokens: number; outputTokens: number }) => void;
}

/**
 * Why a provider call did not produce an answer.
 *
 * Every one of these ends the same way for the learner — the offline reply —
 * so the value here is entirely operational. Without it, a drained quota, an
 * expired key, a safety refusal and a flaky network are one indistinguishable
 * "chat is offline", and the first thing anyone asks when the AI layer goes
 * quiet is which of those it was.
 */
export type ChatProviderFailure =
  | "unauthorized"
  | "rate_limited"
  | "overloaded"
  | "bad_request"
  | "server_error"
  | "refused"
  | "truncated"
  | "malformed"
  | "empty"
  | "timeout"
  | "unreachable";

export class ChatProviderError extends Error {
  readonly reason: ChatProviderFailure;
  /** Seconds the provider asked us to wait, when it said so. */
  readonly retryAfterSeconds?: number;

  constructor(reason: ChatProviderFailure, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "ChatProviderError";
    this.reason = reason;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Maps a provider status onto a reason. Retrying is the caller's decision. */
export function failureForStatus(status: number): ChatProviderFailure {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 429) return "rate_limited";
  if (status === 529) return "overloaded";
  if (status >= 500) return "server_error";
  return "bad_request";
}

/** What a well-formed response turned out to be. */
export type ExtractResult =
  | { ok: true; text: string }
  | { ok: false; reason: Extract<ChatProviderFailure, "refused" | "truncated" | "malformed" | "empty"> };

export function extractAnthropicResult(value: unknown): ExtractResult {
  if (typeof value !== "object" || value === null) return { ok: false, reason: "malformed" };
  const response = value as { content?: unknown; stop_reason?: unknown };

  /*
   * A refusal is a 200 with an empty or partial body, so it has to be checked
   * before the content is read. Sonnet 5's safeguards can decline a request
   * outright, and a learner asking about, say, a security career is exactly
   * the benign case that occasionally trips them.
   */
  if (response.stop_reason === "refusal") return { ok: false, reason: "refused" };

  // A hard output-limit stop can leave a sentence or citation incomplete, and
  // a half-written citation is worse than no answer: the guards downstream
  // check that a source id is present, not that the sentence around it
  // finished.
  if (response.stop_reason === "max_tokens") return { ok: false, reason: "truncated" };

  const content = response.content;
  if (!Array.isArray(content)) return { ok: false, reason: "malformed" };

  const text = content
    .map((block) => {
      if (typeof block !== "object" || block === null) return "";
      const candidate = block as { type?: unknown; text?: unknown };
      return candidate.type === "text" && typeof candidate.text === "string" ? candidate.text : "";
    })
    .join("\n")
    .trim();

  if (text.length === 0) return { ok: false, reason: "empty" };
  return { ok: true, text: text.slice(0, MAX_REPLY_CHARS) };
}

/**
 * Token counts as reported by the provider.
 *
 * Defensive because a shape change upstream must not throw inside a finally-ish
 * path: an unreadable usage block means the call is counted without tokens,
 * never that the response is discarded.
 */
export function extractAnthropicUsage(
  value: unknown,
): { inputTokens: number; outputTokens: number } | null {
  if (typeof value !== "object" || value === null) return null;
  const usage = (value as { usage?: unknown }).usage;
  if (typeof usage !== "object" || usage === null) return null;
  const input = (usage as { input_tokens?: unknown }).input_tokens;
  const output = (usage as { output_tokens?: unknown }).output_tokens;
  const inputTokens = typeof input === "number" && Number.isFinite(input) ? input : 0;
  const outputTokens = typeof output === "number" && Number.isFinite(output) ? output : 0;
  if (inputTokens === 0 && outputTokens === 0) return null;
  return { inputTokens, outputTokens };
}

/** Kept for callers that only need the text. */
export function extractAnthropicText(value: unknown): string | null {
  const result = extractAnthropicResult(value);
  return result.ok ? result.text : null;
}

export async function requestAnthropic(input: AnthropicRequest): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.timeoutMs ?? 8_000);
  const fetchImpl = input.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl(ANTHROPIC_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": input.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: input.model,
        /*
         * Sized for a Thai answer that also has to carry citations, not for
         * the shortest plausible reply. Truncation here is not a shorter
         * answer — the extractor discards a truncated body outright — so a tight
         * cap silently turned every longer reply into an offline fallback.
         * Thai spends noticeably more tokens per sentence than English, and
         * Sonnet 5's tokenizer more again, so the old 500 was reachable in
         * ordinary use rather than at the extreme.
         */
        max_tokens: 2_000,
        // This is a short, scoped explanation task. Sonnet 5 otherwise enables
        // adaptive thinking, which would share the cap above.
        thinking: { type: "disabled" },
        system: input.system,
        messages: input.messages,
      }),
    });

    if (!response.ok) {
      const retryAfter = Number(response.headers.get("retry-after"));
      throw new ChatProviderError(
        failureForStatus(response.status),
        `Provider returned ${response.status}.`,
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ChatProviderError("malformed", "Provider returned malformed JSON.");
    }

    // Reported before the body is judged: a refusal or a truncated reply cost
    // exactly as much as a usable one.
    const usage = extractAnthropicUsage(data);
    if (usage) input.onUsage?.(usage);

    const result = extractAnthropicResult(data);
    if (!result.ok) {
      throw new ChatProviderError(result.reason, `Provider returned no usable text (${result.reason}).`);
    }
    return result.text;
  } catch (error) {
    if (error instanceof ChatProviderError) throw error;
    const timedOut = error instanceof Error && error.name === "AbortError";
    throw new ChatProviderError(
      timedOut ? "timeout" : "unreachable",
      timedOut ? "Provider timed out." : "Provider is unreachable.",
    );
  } finally {
    clearTimeout(timer);
  }
}
