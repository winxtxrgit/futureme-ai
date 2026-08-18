import type { ChatMessage } from "@/lib/chat/types";

export const CLIENT_CHAT_LIMITS = {
  maxMessageChars: 1_000,
  // An odd count preserves user/assistant alternation while starting and
  // ending with a user turn, as required by the server contract.
  maxContextMessages: 7,
} as const;

/** Build the bounded, stateless history sent by the browser for one request. */
export function buildClientChatContext(
  history: readonly ChatMessage[],
  latestUserMessage: ChatMessage,
): ChatMessage[] {
  const context = [...history, latestUserMessage]
    .slice(-CLIENT_CHAT_LIMITS.maxContextMessages)
    .map(({ role, content }) => ({
      role,
      content: content.slice(0, CLIENT_CHAT_LIMITS.maxMessageChars),
    }));

  // Be defensive if future UI changes ever pass a non-alternating prefix.
  return context[0]?.role === "assistant" ? context.slice(1) : context;
}
