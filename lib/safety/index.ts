/**
 * Prototype-level safeguarding.
 *
 * IMPORTANT AND DELIBERATE LIMITATION: this is a keyword rule, not a risk
 * assessment. It cannot detect distress reliably, it will miss cases, and it
 * will produce false positives. It exists so that the prototype does not
 * cheerfully generate career advice from a message about self-harm — not
 * because it can judge whether someone is safe.
 *
 * Documented in docs/08-privacy-and-data.md. This must never be described as a
 * validated safeguarding system.
 */

const DISTRESS_PATTERNS: RegExp[] = [
  /\bkill (?:myself|me)\b/i,
  /\bend (?:it all|my life)\b/i,
  /\bsuicide\b/i,
  /\bsuicidal\b/i,
  /\bself[- ]?harm\b/i,
  /\bhurt myself\b/i,
  /\bcut myself\b/i,
  /\bwant to die\b/i,
  /\bno reason to live\b/i,
  /\bbetter off dead\b/i,
  /\bbeing (?:hit|beaten|abused)\b/i,
  /\bhits me\b/i,
  /ฆ่าตัวตาย/,
  /ทำร้ายตัวเอง/,
  /อยากตาย/,
  /ไม่อยากมีชีวิต/,
];

export interface SafetyCheck {
  triggered: boolean;
  /** Never contains the user's text — only which rule fired. */
  ruleIndex: number | null;
}

export function checkText(text: string | undefined | null): SafetyCheck {
  if (!text) return { triggered: false, ruleIndex: null };
  for (let i = 0; i < DISTRESS_PATTERNS.length; i++) {
    if (DISTRESS_PATTERNS[i].test(text)) return { triggered: true, ruleIndex: i };
  }
  return { triggered: false, ruleIndex: null };
}

/** Check every free-text field in one pass. */
export function checkAll(texts: (string | undefined | null)[]): SafetyCheck {
  for (const t of texts) {
    const r = checkText(t);
    if (r.triggered) return r;
  }
  return { triggered: false, ruleIndex: null };
}

export const SUPPORT_MESSAGE = {
  heading: "Let's pause the career questions for a moment.",
  body:
    "Something you wrote suggests you might be going through something difficult. That matters more than any study route, so this prototype has stopped generating recommendations from that answer.",
  action:
    "Please talk to someone you trust — a parent or guardian, a teacher, your school counsellor, or another adult who looks out for you.",
  disclaimer:
    "FutureMe AI is a student prototype. It is not a mental-health service, it cannot assess risk, and it is not monitored by anyone. If you are in immediate danger, contact local emergency services.",
  thaiHotline:
    "In Thailand, the Department of Mental Health hotline is 1323 (24 hours).",
} as const;
