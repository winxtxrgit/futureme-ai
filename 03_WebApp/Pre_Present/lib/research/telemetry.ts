"use client";

/**
 * Response-process capture for a pilot.
 *
 * Held in its own localStorage key rather than inside the guest session, for
 * three reasons that are all about consent rather than convenience:
 *
 *  - A learner who deletes their answers should not have research telemetry
 *    survive, and a facilitator who clears research data should not destroy the
 *    learner's session. Separate keys make both possible.
 *  - Response timing is a different kind of data from an answer, and a privacy
 *    notice that lists them together is harder to read honestly.
 *  - The guest session's validator is strict by design; bolting a research
 *    schema onto it would couple a product concern to a study concern.
 *
 * Nothing here is transmitted. It stays in the browser until somebody
 * deliberately exports it, which is the point at which consent is confirmed.
 *
 * What is captured is deliberately narrow: for each item, how long until the
 * first answer, how many times the answer was changed, and where the item sat
 * in the sequence. No keystrokes, no free text, no cursor tracking. Those would
 * add nothing a reliability analysis needs and a great deal a 13-year-old has
 * not agreed to.
 */

export const RESEARCH_KEY = "futureme.research.v1";
export const RESEARCH_SCHEMA = 1;

export interface ItemProcess {
  /** Milliseconds from the item appearing to the first answer. */
  firstResponseMs: number;
  /** How many times the answer was changed after the first one. */
  revisions: number;
  /** Zero-based position in the administered sequence. */
  position: number;
}

export interface TelemetryRecord {
  schema: number;
  /**
   * Random per-browser identifier. Not derived from anything about the person
   * and not linked to the guest session id, so two exports cannot be joined
   * back together into a fuller picture of one learner.
   */
  participantId: string;
  startedAt: string;
  /** Keyed by item id. */
  items: Record<string, ItemProcess>;
  /** Items whose card has been shown, so a skip can be told from a no-show. */
  seen: string[];
}

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `p-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function emptyRecord(): TelemetryRecord {
  // Seeds the cache: without this a browser with no stored record would mint a
  // new participant id on every read, and the id in the export would not be the
  // one the answers were recorded under.
  const record: TelemetryRecord = {
    schema: RESEARCH_SCHEMA,
    participantId: randomId(),
    startedAt: new Date().toISOString(),
    items: {},
    seen: [],
  };
  if (typeof window !== "undefined") {
    cache = record;
    saveTelemetry(record);
  }
  return record;
}

/**
 * In-memory copy of the record.
 *
 * Every interaction used to re-parse the whole record from localStorage before
 * mutating it, which meant a 30-question assessment did about sixty JSON parses
 * of a growing object — wasted work on exactly the low-end phones this product
 * targets, and enough added latency to make a long end-to-end test flaky. The
 * cache makes a mutation a stringify rather than a parse-then-stringify.
 *
 * localStorage remains the source of truth across page loads; the cache is
 * populated from it on first access and invalidated by `clearTelemetry`.
 */
let cache: TelemetryRecord | null = null;

/** Reads the record, discarding anything that is not the current schema. */
export function loadTelemetry(): TelemetryRecord {
  if (cache) return cache;
  if (typeof window === "undefined") return emptyRecord();
  try {
    const raw = window.localStorage.getItem(RESEARCH_KEY);
    if (!raw) return emptyRecord();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyRecord();
    const record = parsed as Partial<TelemetryRecord>;
    if (record.schema !== RESEARCH_SCHEMA) return emptyRecord();
    if (typeof record.participantId !== "string" || typeof record.startedAt !== "string") {
      return emptyRecord();
    }
    cache = {
      schema: RESEARCH_SCHEMA,
      participantId: record.participantId,
      startedAt: record.startedAt,
      items: isItemMap(record.items) ? record.items : {},
      seen: Array.isArray(record.seen) ? record.seen.filter((s) => typeof s === "string") : [],
    };
    return cache;
  } catch {
    return emptyRecord();
  }
}

function isItemMap(value: unknown): value is Record<string, ItemProcess> {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).every(
    (v) =>
      v !== null &&
      typeof v === "object" &&
      Number.isFinite((v as ItemProcess).firstResponseMs) &&
      Number.isFinite((v as ItemProcess).revisions) &&
      Number.isFinite((v as ItemProcess).position),
  );
}

export function saveTelemetry(record: TelemetryRecord): boolean {
  cache = record;
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(RESEARCH_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearTelemetry(): void {
  cache = null;
  shownAt.clear();
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RESEARCH_KEY);
  } catch {
    // Nothing useful to do; the caller already treats storage as best-effort.
  }
}

/** Notes that an item was shown, starting its clock. */
export function markSeen(itemId: string, position: number): void {
  const record = loadTelemetry();
  if (!record.seen.includes(itemId)) {
    record.seen.push(itemId);
    shownAt.set(itemId, Date.now());
    // Position is recorded on first answer; store it now in case the learner
    // skips, so a skipped item still has its place in the sequence.
    if (!record.items[itemId]) {
      record.items[itemId] = { firstResponseMs: -1, revisions: 0, position };
    }
    saveTelemetry(record);
  } else if (!shownAt.has(itemId)) {
    shownAt.set(itemId, Date.now());
  }
}

/**
 * In-memory clock per item.
 *
 * Not persisted on purpose: a timestamp that survives a refresh would measure
 * how long the learner left the tab open, not how long they spent on the item.
 * After a reload the first answer to an already-seen item has no usable timing
 * and is recorded as such rather than as a very slow response.
 */
const shownAt = new Map<string, number>();

/** Records an answer, timing the first one and counting later changes. */
export function recordAnswer(itemId: string, position: number): void {
  const record = loadTelemetry();
  const existing = record.items[itemId];
  const started = shownAt.get(itemId);

  if (!existing || existing.firstResponseMs < 0) {
    record.items[itemId] = {
      firstResponseMs: started === undefined ? -1 : Date.now() - started,
      revisions: 0,
      position: existing?.position ?? position,
    };
  } else {
    record.items[itemId] = { ...existing, revisions: existing.revisions + 1 };
  }
  saveTelemetry(record);
}

/** Seconds per item in administered order; `null` where timing is unusable. */
export function secondsPerItem(record: TelemetryRecord, itemIds: string[]): (number | null)[] {
  return itemIds.map((id) => {
    const p = record.items[id];
    if (!p || p.firstResponseMs < 0) return null;
    return p.firstResponseMs / 1000;
  });
}
