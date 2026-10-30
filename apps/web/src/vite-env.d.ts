/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface PendoAgentMetadata {
  agentId: string;
  conversationId: string;
  messageId: string;
  content: string;
  modelUsed?: string;
  suggestedPrompt?: boolean;
  toolsUsed?: string[];
  fileUploaded?: boolean;
}

interface Window {
  pendo?: {
    trackAgent: (eventType: "prompt" | "agent_response" | "user_reaction", metadata: PendoAgentMetadata) => void;
  };
}
