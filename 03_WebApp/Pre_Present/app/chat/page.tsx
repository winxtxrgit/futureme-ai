"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FutureMeMascot, { type MascotState } from "@/components/FutureMeMascot";
import ChatAvatar from "@/components/chat/ChatAvatar";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatMessage from "@/components/chat/ChatMessage";
import type { ChatMessageData, ChatMode, ChatSource } from "@/components/chat/types";
import { usePreferences } from "@/components/PreferencesProvider";
import SafetyPause, { type SafetyTriggerSource } from "@/components/SafetyPause";
import { Button, Card, Notice, Shell } from "@/components/ui";
import { buildClientChatContext, CLIENT_CHAT_LIMITS } from "@/lib/chat/client-context";
import { loadSession } from "@/lib/session";
import {
  CHAT_MASCOT_TIMING,
  getChatResponseMotionDuration,
} from "@/lib/mascot/chat-states";
import { MASCOT_MOTION_KEY } from "@/lib/mascot/motion-preference";
import { checkText } from "@/lib/safety";

interface ChatResponse {
  message: string;
  mode: ChatMode | "safety";
  sources: ChatSource[];
  note?: string;
  safety: boolean;
}


function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Defensive parsing keeps a provider or route-shape change from breaking the page. */
function parseChatResponse(value: unknown): ChatResponse | null {
  const record = asRecord(value);
  if (!record) return null;

  const rawMessage =
    typeof record.message === "string"
      ? record.message
      : typeof record.text === "string"
        ? record.text
        : "";
  const rawMode = record.mode;
  const mode: ChatMode | "safety" =
    rawMode === "ai" || rawMode === "offline" || rawMode === "safety" ? rawMode : "offline";
  const safety = record.safety === true || mode === "safety";

  if (!safety && rawMessage.trim().length === 0) return null;

  const sources = Array.isArray(record.sources)
    ? record.sources
        .map((value): ChatSource | null => {
          const source = asRecord(value);
          if (!source || typeof source.title !== "string" || source.title.trim().length === 0) {
            return null;
          }
          return {
            id:
              typeof source.id === "string" && source.id.trim().length > 0
                ? source.id.slice(0, 120)
                : source.title.slice(0, 120),
            title: source.title.slice(0, 240),
            excerpt: typeof source.excerpt === "string" ? source.excerpt.slice(0, 700) : undefined,
            url: typeof source.url === "string" ? source.url.slice(0, 2_000) : undefined,
            status: typeof source.status === "string" ? source.status.slice(0, 120) : undefined,
          };
        })
        .filter((source): source is ChatSource => source !== null)
        .slice(0, 6)
    : [];

  return {
    message: rawMessage.slice(0, 4_000),
    mode,
    sources,
    note: typeof record.note === "string" ? record.note.slice(0, 700) : undefined,
    safety,
  };
}

export default function ChatPage() {
  const { t, lang } = usePreferences();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [safetySource, setSafetySource] = useState<SafetyTriggerSource | null>(null);
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [forceMascotMotion, setForceMascotMotion] = useState(false);
  const idSequence = useRef(0);
  const requestSequence = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const mascotResetTimerRef = useRef<number | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const shouldRestoreComposerFocus = useRef(false);

  const nextId = (role: "user" | "assistant") => {
    idSequence.current += 1;
    return `${role}-${Date.now()}-${idSequence.current}`;
  };

  const cancelMascotReset = () => {
    if (mascotResetTimerRef.current !== null) {
      window.clearTimeout(mascotResetTimerRef.current);
      mascotResetTimerRef.current = null;
    }
  };

  const showResponseAction = (
    state: Extract<MascotState, "speaking" | "offline">,
    message: string,
    requestId: number,
  ) => {
    cancelMascotReset();
    setMascotState(state);
    mascotResetTimerRef.current = window.setTimeout(() => {
      mascotResetTimerRef.current = null;
      if (requestSequence.current === requestId) setMascotState("idle");
    }, getChatResponseMotionDuration(message));
  };

  const welcome = useMemo<ChatMessageData>(
    () => ({ id: `welcome-${lang}`, role: "assistant", content: t.chat.welcome }),
    [lang, t.chat.welcome],
  );

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy]);

  useEffect(() => {
    try {
      setForceMascotMotion(window.localStorage.getItem(MASCOT_MOTION_KEY) === "on");
    } catch {
      // A blocked preference store should not stop the chat or the mascot.
    }
  }, []);

  useEffect(
    () => () => {
      requestSequence.current += 1;
      controllerRef.current?.abort();
      if (mascotResetTimerRef.current !== null) {
        window.clearTimeout(mascotResetTimerRef.current);
        mascotResetTimerRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!safetySource && shouldRestoreComposerFocus.current) {
      shouldRestoreComposerFocus.current = false;
      composerRef.current?.focus();
    }
  }, [safetySource]);

  const clearChat = () => {
    requestSequence.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    cancelMascotReset();
    setMessages([]);
    setInput("");
    setBusy(false);
    setMascotState("idle");
  };

  const toggleMascotMotion = () => {
    setForceMascotMotion((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(MASCOT_MOTION_KEY, next ? "on" : "system");
      } catch {
        // The in-memory choice still works when storage is unavailable.
      }
      return next;
    });
  };

  const send = async () => {
    const content = input.trim();
    if (!content || busy) return;

    // This happens before the text enters the transcript or any network path.
    // It is a small keyword rule, not a clinical assessment; SafetyPause states
    // that limitation and gives the learner a way back.
    if (checkText(content).triggered) {
      cancelMascotReset();
      setInput("");
      setMascotState("idle");
      setSafetySource("local");
      return;
    }

    const userMessage: ChatMessageData = {
      id: nextId("user"),
      role: "user",
      content: content.slice(0, CLIENT_CHAT_LIMITS.maxMessageChars),
    };
    const requestMessages = buildClientChatContext(messages, userMessage);

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);
    cancelMascotReset();
    setMascotState("thinking");
    const thinkingStartedAt = Date.now();

    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json" },
        /*
         * The province is sent only if the learner has already chosen one
         * elsewhere; the chat never asks for it. It is read at send time rather
         * than held in state so that clearing data on the privacy page takes
         * effect on the next message without this page having to know.
         */
        body: JSON.stringify({
          language: lang,
          messages: requestMessages,
          ...(loadSession()?.provinceIso ? { provinceIso: loadSession()?.provinceIso } : {}),
        }),
      });
      /*
       * Throttled, which is the one failure the learner can actually do
       * something about — so it says how long, rather than joining every other
       * failure under "could not reach the chat service".
       *
       * Their words go back in the composer and the unanswered turn comes off
       * the transcript, so sending again is one click and does not leave a
       * duplicate above it. The provider allowance never arrives here: running
       * out of that returns a project-data answer, not an error.
       */
      if (response.status === 429) {
        if (requestSequence.current !== requestId) return;
        const header = Number(response.headers.get("retry-after"));
        const seconds = Number.isFinite(header) && header > 0 ? Math.ceil(header) : 60;
        setMessages((current) => [
          ...current.filter((message) => message.id !== userMessage.id),
          {
            id: nextId("assistant"),
            role: "assistant",
            content: t.chat.rateLimited.replace("{seconds}", String(seconds)),
            mode: "offline",
          },
        ]);
        setInput(content);
        cancelMascotReset();
        setMascotState("error");
        return;
      }
      if (!response.ok) throw new Error(`Chat route returned ${response.status}`);

      const parsed = parseChatResponse(await response.json());
      if (!parsed) throw new Error("Chat route returned an invalid response");
      if (requestSequence.current !== requestId) return;

      const remainingThinkingMs = Math.max(
        0,
        CHAT_MASCOT_TIMING.minimumThinkingMs - (Date.now() - thinkingStartedAt),
      );
      if (remainingThinkingMs > 0) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, remainingThinkingMs));
      }
      if (requestSequence.current !== requestId) return;

      if (parsed.safety) {
        // A server-side rule may know phrases the client does not. Remove the
        // triggering turn before showing the shared support screen.
        setMessages((current) => current.filter((message) => message.id !== userMessage.id));
        cancelMascotReset();
        setSafetySource("server");
        setMascotState("idle");
        return;
      }

      const messageMode: ChatMode = parsed.mode === "ai" ? "ai" : "offline";

      setMessages((current) => [
        ...current,
        {
          id: nextId("assistant"),
          role: "assistant",
          content: parsed.message,
          mode: messageMode,
          sources: parsed.sources,
          note: parsed.note,
        },
      ]);
      showResponseAction(messageMode === "ai" ? "speaking" : "offline", parsed.message, requestId);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      if (requestSequence.current !== requestId) return;
      setMessages((current) => [
        ...current,
        {
          id: nextId("assistant"),
          role: "assistant",
          content: t.chat.networkError,
          mode: "offline",
        },
      ]);
      cancelMascotReset();
      setMascotState("error");
    } finally {
      if (requestSequence.current === requestId) {
        controllerRef.current = null;
        setBusy(false);
      }
    }
  };

  if (safetySource) {
    return (
      <SafetyPause
        triggerSource={safetySource}
        onDismiss={() => {
          shouldRestoreComposerFocus.current = true;
          setSafetySource(null);
        }}
      />
    );
  }

  const mascotLabels: Record<MascotState, string> = {
    idle: t.chat.mascotReady,
    thinking: t.chat.mascotThinking,
    speaking: t.chat.mascotSpeaking,
    offline: t.chat.mascotOffline,
    error: t.chat.mascotError,
  };
  const mascotLabel = mascotLabels[mascotState];

  const messageLabels = {
    assistant: t.chat.assistantLabel,
    you: t.chat.youLabel,
    modeAi: t.chat.modeAi,
    modeOffline: t.chat.modeOffline,
    sources: t.chat.sources,
    sourceStatus: t.chat.sourceStatus,
  };

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mint">
            {t.chat.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{t.chat.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t.chat.intro}</p>
        </div>

        <div className="mt-5">
          <Notice title={t.chat.privacyTitle}>{t.chat.privacyBody}</Notice>
        </div>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <section
            className="overflow-hidden rounded-card border border-line bg-surface shadow-[var(--shadow-card)] lg:order-2"
            aria-labelledby="chat-panel-title"
          >
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <FutureMeMascot
                  state={mascotState}
                  size="sm"
                  testId="chat-mascot-live"
                  forceMotion={forceMascotMotion}
                />
                <div>
                  <h2 id="chat-panel-title" className="font-bold">
                    {t.chat.companionName}
                  </h2>
                  <p className="text-xs text-muted" aria-live="polite">
                    {mascotLabel}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={toggleMascotMotion}
                  aria-pressed={forceMascotMotion}
                  data-testid="chat-motion-toggle"
                  className="rounded-full border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-mint/60 hover:text-ink"
                >
                  {forceMascotMotion ? t.chat.motionSystem : t.chat.motionEnable}
                </button>
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={messages.length === 0 && !busy}
                  data-testid="chat-clear"
                  className="rounded-full border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.chat.clear}
                </button>
              </div>
            </header>

            <div
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-busy={busy}
              aria-label={t.chat.conversationLabel}
              className="max-h-[62vh] min-h-[420px] space-y-5 overflow-x-hidden overflow-y-auto bg-surface2/20 px-4 py-5 sm:px-5"
            >
              <ChatMessage message={welcome} labels={messageLabels} />
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} labels={messageLabels} />
              ))}
              {busy ? (
                <div
                  aria-hidden="true"
                  className="flex w-full flex-col items-start"
                  data-testid="chat-thinking-row"
                >
                  <div className="relative ml-10 max-w-[calc(100%_-_2.5rem)] rounded-[24px] rounded-bl-control border-2 border-indigo/45 border-l-[3px] border-l-indigo bg-indigo/10 px-4 py-3 text-sm text-muted shadow-[var(--shadow-card)] sm:ml-12 sm:max-w-[82%]">
                    <span className="absolute -bottom-[9px] left-7 h-4 w-4 rotate-45 border-b-2 border-r-2 border-indigo/45 bg-indigo/10" />
                    <span aria-hidden className="mr-2 inline-block motion-safe:animate-pulse">
                      ●●●
                    </span>
                    {t.chat.thinking}
                  </div>
                  <div className="ml-2 mt-3">
                    <ChatAvatar role="assistant" />
                  </div>
                </div>
              ) : null}
              <div ref={logEndRef} />
            </div>

            {messages.length === 0 ? (
              <div className="border-t border-line bg-surface2/40 px-4 py-3 sm:px-5">
                <p className="text-xs font-bold text-muted">{t.chat.suggestionsLabel}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.chat.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="rounded-full border border-line bg-surface px-3 py-2 text-left text-xs font-semibold text-muted transition hover:border-mint/60 hover:text-ink"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <ChatComposer
              inputRef={composerRef}
              value={input}
              onChange={setInput}
              onSubmit={send}
              disabled={busy}
              maxLength={CLIENT_CHAT_LIMITS.maxMessageChars}
              labels={{
                label: t.chat.composerLabel,
                placeholder: t.chat.placeholder,
                hint: t.chat.composerHint,
                send: t.chat.send,
                sending: t.chat.sending,
              }}
            />
          </section>

          <aside className="space-y-4 lg:order-1" aria-label={t.chat.moreOptionsLabel}>
            <Card className="border-indigo/35 bg-indigo/5">
              <FutureMeMascot
                state={mascotState}
                size="lg"
                testId="chat-mascot-action"
                forceMotion={forceMascotMotion}
              />
              <h2 className="mt-4 text-lg font-bold">{t.chat.assessmentTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t.chat.assessmentBody}</p>
              <div className="mt-4">
                <Button href="/interview">{t.chat.assessmentLink}</Button>
              </div>
            </Card>

            <Card className="border-warning/30">
              <h2 className="text-sm font-bold">{t.chat.limitsTitle}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">{t.chat.limitsBody}</p>
              <p className="mt-3 text-xs">
                <Button href="/privacy" variant="secondary" className="w-full">
                  {t.chat.privacyLink}
                </Button>
              </p>
            </Card>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
