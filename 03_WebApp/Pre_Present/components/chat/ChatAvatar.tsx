export default function ChatAvatar({ role }: { role: "assistant" | "user" }) {
  if (role === "assistant") {
    return (
      <span
        aria-hidden="true"
        data-testid="chat-avatar-assistant"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border-2 border-indigo/55 bg-indigo/15 shadow-[var(--shadow-card)] sm:h-12 sm:w-12"
      >
        <span className="grid h-8 w-8 place-items-center rounded-[12px] bg-gradient-to-br from-indigo to-magenta">
          <span className="relative block h-5 w-5 rounded-full bg-canvas">
            <span className="absolute left-[5px] top-[7px] h-1.5 w-1.5 rounded-full bg-mint" />
            <span className="absolute right-[5px] top-[7px] h-1.5 w-1.5 rounded-full bg-mint" />
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      data-testid="chat-avatar-user"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-coral/60 bg-coral/15 text-coral shadow-[var(--shadow-card)] sm:h-12 sm:w-12"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" fill="currentColor" />
        <path
          d="M5.4 19.2c.45-3.65 2.75-5.7 6.6-5.7s6.15 2.05 6.6 5.7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
