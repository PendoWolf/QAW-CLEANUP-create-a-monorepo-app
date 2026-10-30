import { apiRequest } from "./client";

// Crewdesk Copilot is an AI agent: the API sends the conversation to a large language model and returns the
// model's reply.
export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface CopilotReply {
  conversationId: string;
  message: ChatMessage;
}

/** Sends the whole conversation to Crewdesk Copilot and returns its reply. */
export function sendCopilotMessage(conversationId: string, messages: ChatMessage[]): Promise<CopilotReply> {
  return apiRequest<CopilotReply>("/api/copilot/chat", {
    method: "POST",
    body: {
      conversationId,
      messages: messages.map(({ role, content }) => ({ role, content })),
    },
  });
}
