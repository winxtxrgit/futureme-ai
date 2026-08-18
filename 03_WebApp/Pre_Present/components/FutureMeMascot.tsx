import LiveFutureMeMascot from "@/components/mascot/FutureMeMascot";
import {
  CHAT_MASCOT_STATES,
  type ChatMascotState,
} from "@/lib/mascot/chat-states";
import type { MascotCrop } from "@/lib/mascot/states";

export type MascotState = ChatMascotState;

const STATE_STYLES: Record<MascotState, { frame: string; dot: string }> = {
  idle: {
    frame: "border-indigo/40 bg-indigo/10",
    dot: "bg-indigo",
  },
  thinking: {
    frame: "border-indigo/60 bg-indigo/10 motion-safe:animate-pulse",
    dot: "bg-indigo motion-safe:animate-pulse",
  },
  speaking: {
    frame: "border-indigo/60 bg-indigo/10",
    dot: "bg-mint motion-safe:animate-pulse",
  },
  offline: {
    frame: "border-indigo/50 bg-indigo/10",
    dot: "bg-mint",
  },
  error: {
    frame: "border-warning/50 bg-warning/5",
    dot: "bg-warning",
  },
};

/**
 * Chat-specific presentation around the live mascot synchronized from the
 * repository's official Mascot Lab. Visible status text remains the source of
 * meaning, so the character itself is decorative to assistive technology.
 */
export default function FutureMeMascot({
  state = "idle",
  size = "md",
  testId,
  forceMotion = false,
}: {
  state?: MascotState;
  size?: "sm" | "md" | "lg";
  testId?: string;
  forceMotion?: boolean;
}) {
  const styles = STATE_STYLES[state];
  const visual = CHAT_MASCOT_STATES[state];
  const config: Record<
    "sm" | "md" | "lg",
    { crop: MascotCrop; frame: string; mascotSize: number }
  > = {
    sm: { crop: "face", frame: "h-20 w-20 rounded-full", mascotSize: 80 },
    md: { crop: "face", frame: "h-28 w-28 rounded-full", mascotSize: 112 },
    lg: { crop: "full", frame: "min-h-[248px] w-full rounded-card", mascotSize: 200 },
  };
  const selected = config[size];

  return (
    <div
      aria-hidden="true"
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border p-1 shadow-[var(--shadow-card)] transition-colors duration-500 ease-out motion-reduce:duration-0 ${selected.frame} ${styles.frame}`}
      data-mascot-animated="true"
      data-mascot-force-motion={forceMotion ? "on" : "system"}
      data-mascot-state={state}
      data-testid={testId}
    >
      <LiveFutureMeMascot
        emotion={visual.emotion}
        pose={visual.pose}
        crop={selected.crop}
        size={selected.mascotSize}
        animated
        motion={forceMotion ? "on" : "system"}
        className="relative z-10"
      />
      <span
        aria-hidden
        className={`absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface transition-colors duration-500 ease-out motion-reduce:duration-0 ${styles.dot}`}
      />
    </div>
  );
}
