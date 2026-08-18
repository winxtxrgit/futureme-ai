export type ChatRole = "user" | "assistant";
export type ChatMode = "ai" | "offline";

export interface ChatSource {
  id: string;
  title: string;
  excerpt?: string;
  url?: string;
  status?: string;
}

export interface ChatMessageData {
  id: string;
  role: ChatRole;
  content: string;
  mode?: ChatMode;
  sources?: ChatSource[];
  note?: string;
}
