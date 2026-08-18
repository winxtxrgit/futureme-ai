import type { ChatMessageData } from "./types";
import ChatAvatar from "./ChatAvatar";

interface MessageLabels {
  assistant: string;
  you: string;
  modeAi: string;
  modeOffline: string;
  sources: string;
  sourceStatus: string;
}

function safeWebUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function ChatMessage({
  message,
  labels,
}: {
  message: ChatMessageData;
  labels: MessageLabels;
}) {
  const assistant = message.role === "assistant";
  const modeLabel =
    message.mode === "ai"
      ? labels.modeAi
      : message.mode === "offline"
        ? labels.modeOffline
        : null;

  return (
    <article
      aria-label={assistant ? labels.assistant : labels.you}
      className={`flex w-full min-w-0 flex-col ${assistant ? "items-start" : "items-end"}`}
      data-side={assistant ? "left" : "right"}
      data-testid={`chat-message-${message.role}`}
    >
      <div
        data-bubble-side={assistant ? "left" : "right"}
        data-testid={`chat-bubble-${message.role}`}
        className={[
          "relative min-w-0 max-w-[calc(100%_-_2.5rem)] rounded-[24px] border-2 px-4 py-3 text-sm leading-relaxed shadow-[var(--shadow-card)] sm:max-w-[82%]",
          assistant
            ? "ml-10 rounded-bl-control border-indigo/45 border-l-[3px] border-l-indigo bg-indigo/10 text-ink sm:ml-12"
            : "mr-10 rounded-br-control border-coral/45 border-r-[3px] border-r-coral bg-coral/10 text-ink sm:mr-12",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          data-tail-side={assistant ? "left" : "right"}
          data-testid={`chat-tail-${message.role}`}
          className={`absolute -bottom-[9px] h-4 w-4 rotate-45 border-b-2 border-r-2 ${
            assistant
              ? "left-7 border-indigo/45 bg-indigo/10"
              : "right-7 border-coral/45 bg-coral/10"
          }`}
        />

        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className={assistant ? "text-indigoText" : "text-coral"}>
            {assistant ? labels.assistant : labels.you}
          </span>
          {modeLabel ? (
            <span
              className={`rounded-full border px-2 py-0.5 ${
                message.mode === "ai"
                  ? "border-indigo/40 bg-indigo/10 text-indigoText"
                  : "border-warning/40 bg-warning/5 text-warning"
              }`}
            >
              {modeLabel}
            </span>
          ) : null}
        </div>

        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>

        {message.note ? (
          <p className="mt-2 break-words border-t border-line/70 pt-2 text-xs text-muted [overflow-wrap:anywhere]">
            {message.note}
          </p>
        ) : null}

        {assistant && message.sources && message.sources.length > 0 ? (
          <div className="mt-3 border-t border-line/70 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
              {labels.sources}
            </p>
            <ul className="mt-2 space-y-2">
              {message.sources.map((source) => {
                const href = safeWebUrl(source.url);
                return (
                  <li
                    key={source.id}
                    className="min-w-0 rounded-control border border-line bg-surface px-3 py-2"
                  >
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 max-w-full break-words font-semibold text-mint underline underline-offset-2 [overflow-wrap:anywhere]"
                        >
                          {source.title}
                        </a>
                      ) : (
                        <span className="min-w-0 max-w-full break-words font-semibold [overflow-wrap:anywhere]">
                          {source.title}
                        </span>
                      )}
                      {source.status ? (
                        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-muted">
                          <span className="sr-only">{labels.sourceStatus}: </span>
                          {source.status}
                        </span>
                      ) : null}
                    </div>
                    {source.excerpt ? (
                      <p className="mt-1 break-words text-xs leading-relaxed text-muted [overflow-wrap:anywhere]">
                        {source.excerpt}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <div className={assistant ? "ml-2 mt-3" : "mr-2 mt-3"}>
        <ChatAvatar role={message.role} />
      </div>
    </article>
  );
}
