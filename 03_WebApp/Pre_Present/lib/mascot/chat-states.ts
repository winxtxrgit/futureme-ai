import {
  MASCOT_PRODUCT_STATES,
  type MascotEmotion,
  type MascotPose,
} from "@/lib/mascot/states";

export type ChatMascotState = "idle" | "thinking" | "speaking" | "offline" | "error";

export const CHAT_MASCOT_TIMING = {
  minimumThinkingMs: 800,
  minimumResponseMs: 1_900,
  maximumResponseMs: 3_400,
  responseCharacterMs: 4,
} as const;

/** Keeps the presenting action readable without making a finished reply feel stuck. */
export function getChatResponseMotionDuration(message: string): number {
  const readableDuration =
    CHAT_MASCOT_TIMING.minimumResponseMs +
    message.trim().length * CHAT_MASCOT_TIMING.responseCharacterMs;
  return Math.min(CHAT_MASCOT_TIMING.maximumResponseMs, readableDuration);
}

/** Chat states reuse the product-wide vocabulary defined by the Mascot Lab. */
export const CHAT_MASCOT_STATES = {
  idle: MASCOT_PRODUCT_STATES.interviewListening,
  thinking: MASCOT_PRODUCT_STATES.aiThinking,
  speaking: MASCOT_PRODUCT_STATES.routeReady,
  // Project-data mode is also a successful response action. The visible label
  // and message badge distinguish its source from an AI response.
  offline: MASCOT_PRODUCT_STATES.routeReady,
  error: MASCOT_PRODUCT_STATES.warning,
} as const satisfies Record<ChatMascotState, { emotion: MascotEmotion; pose: MascotPose }>;
