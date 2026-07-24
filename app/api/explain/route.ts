import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * OPTIONAL explanation layer.
 *
 * The app never depends on this. Route selection has already happened
 * deterministically in lib/decision-engine before anything reaches here; this
 * endpoint only rewrites the wording. Every failure path returns
 * `{ source: "fallback" }` with HTTP 200 so the caller can carry on unchanged.
 *
 * Deliberately, the caller sends only the route name and reason codes — never
 * the learner's free text.
 */

const TIMEOUT_MS = 8000;

interface ExplainRequest {
  routeName?: string;
  reasons?: string[];
  fallbackText?: string;
}

export async function POST(request: Request) {
  let body: ExplainRequest;

  try {
    body = (await request.json()) as ExplainRequest;
  } catch {
    return NextResponse.json(
      { source: "fallback", text: "", note: "Malformed request body." },
      { status: 200 },
    );
  }

  const fallback = body.fallbackText ?? "";

  if (!body.routeName || !Array.isArray(body.reasons)) {
    return NextResponse.json(
      { source: "fallback", text: fallback, note: "Missing routeName or reasons." },
      { status: 200 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        source: "fallback",
        text: fallback,
        note: "No ANTHROPIC_API_KEY configured — deterministic explanation used.",
      },
      { status: 200 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content:
              `Rewrite this study-route explanation for a Thai secondary student in plain, warm English. ` +
              `Do not add facts, do not add numbers, do not claim certainty, and keep it under 70 words.\n\n` +
              `Route: ${body.routeName}\nReasons: ${body.reasons.join("; ")}\nCurrent text: ${fallback}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { source: "fallback", text: fallback, note: `Provider returned ${res.status}.` },
        { status: 200 },
      );
    }

    const data: unknown = await res.json();
    const text = extractText(data);

    if (!text) {
      return NextResponse.json(
        { source: "fallback", text: fallback, note: "Malformed provider response." },
        { status: 200 },
      );
    }

    return NextResponse.json({ source: "llm", text }, { status: 200 });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        source: "fallback",
        text: fallback,
        note: aborted ? "Provider timed out." : "Provider unreachable.",
      },
      { status: 200 },
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Defensive parsing — a shape change upstream must not throw. */
function extractText(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const content = (data as { content?: unknown }).content;
  if (!Array.isArray(content) || content.length === 0) return null;
  const first = content[0] as { text?: unknown };
  return typeof first?.text === "string" && first.text.trim().length > 0 ? first.text : null;
}
