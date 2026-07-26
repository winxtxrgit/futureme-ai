import { NextResponse } from "next/server";
import routesData from "@/data/routes.json";
import { REASON_TEXT } from "@/lib/decision-engine/explanations";
import type { ReasonCode } from "@/lib/decision-engine/types";

export const runtime = "nodejs";

/**
 * OPTIONAL explanation layer.
 *
 *     deterministic engine → structured result → [this] → wording on screen
 *
 * By the time anything reaches here the decision is already made. Eligibility,
 * scoring, ranking and the refusal gates all ran in lib/decision-engine in the
 * browser. This endpoint receives the *conclusion* and rewrites the sentence;
 * it cannot add, remove or reorder a route, because it is never given the list.
 *
 * What the caller sends is deliberately narrow: a route id and a set of reason
 * codes. The server resolves the route name from the catalogue and the wording
 * from its fixed vocabulary, so the endpoint cannot relay arbitrary caller
 * text to the provider. The learner's answers and free text are never included.
 *
 * Every failure path returns `{ source: "fallback" }` with HTTP 200 and the
 * deterministic text unchanged, so the page cannot break on a provider outage.
 */

const TIMEOUT_MS = 8000;
const MAX_REASONS = 8;
const MAX_TEXT = 1000;

const KNOWN_REASONS = new Set(Object.keys(REASON_TEXT));
const ROUTE_NAMES = new Map(routesData.routes.map((route) => [route.id, route.name]));

interface ExplainRequest {
  routeId?: string;
  reasons?: string[];
}

/**
 * Availability probe. The UI asks first so it can offer the control only when
 * the layer can actually do something, rather than presenting a button that
 * always falls back.
 */
export function GET() {
  return NextResponse.json(
    {
      available: Boolean(process.env.ANTHROPIC_API_KEY),
      note: "When unavailable, every explanation on screen is the deterministic template text.",
    },
    { status: 200 },
  );
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

  if (typeof body.routeId !== "string" || !Array.isArray(body.reasons)) {
    return NextResponse.json(
      { source: "fallback", text: "", note: "Missing routeId or reasons." },
      { status: 200 },
    );
  }

  const routeName = ROUTE_NAMES.get(body.routeId);
  if (!routeName) {
    return NextResponse.json(
      { source: "fallback", text: "", note: "Unrecognised route id." },
      { status: 200 },
    );
  }

  // Only reason codes the engine can actually emit are used. Both the route
  // name and reason wording are now resolved server-side from fixed data.
  const reasons = body.reasons
    .filter((r): r is ReasonCode => typeof r === "string" && KNOWN_REASONS.has(r))
    .slice(0, MAX_REASONS);
  const fallback = reasons.map((reason) => REASON_TEXT[reason]).join(" ").slice(0, MAX_TEXT);

  if (reasons.length === 0) {
    return NextResponse.json(
      { source: "fallback", text: fallback, note: "No recognised reason codes." },
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
        system:
          "You rewrite a study-route explanation that a rule-based engine has already produced. " +
          "You are not deciding anything. Do not add facts, numbers, institutions or predictions. " +
          "Do not say the route is the best one, recommended, or a match. Do not promise admission, " +
          "employment or income. Keep every reason that was given and drop none. " +
          "Write plain, warm English for a Thai secondary student, under 70 words.",
        messages: [
          {
            role: "user",
            content:
              `Route: ${routeName}\n` +
              `Reasons the engine gave:\n${reasons.map((r) => `- ${REASON_TEXT[r]}`).join("\n")}\n` +
              `Current wording: ${fallback}`,
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

    return NextResponse.json({ source: "llm", text: text.slice(0, MAX_TEXT) }, { status: 200 });
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
