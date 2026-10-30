import { useState, type FormEvent } from "react";
import { Button, Notice } from "@crewdesk/ui";
import { sendCopilotMessage, type ChatMessage } from "../api/copilot";

const SUGGESTED_PROMPTS = [
  "What's on the schedule this week?",
  "Which urgent jobs aren't assigned yet?",
  "Draft a reminder for tomorrow's customers",
];

function newConversationId(): string {
  return crypto.randomUUID();
}

/**
 * AI chat panel for Crewdesk Copilot, an LLM-powered dispatch assistant. Each prompt the user sends goes to
 * the Crewdesk API with the conversation so far; the model's reply is added when the API answers.
 */
export function CopilotPanel({ onClose }: { onClose: () => void }) {
  const [conversationId, setConversationId] = useState(newConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (prompt === "" || thinking) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: prompt };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft("");
    setError(null);
    setThinking(true);
    try {
      const reply = await sendCopilotMessage(conversationId, conversation);
      setMessages((current) => [...current, reply.message]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
  };

  const startNewChat = () => {
    setConversationId(newConversationId());
    setMessages([]);
    setError(null);
  };

  return (
    <aside className="copilot" aria-label="Crewdesk Copilot">
      <header>
        <h2>Crewdesk Copilot</h2>
        <div>
          <Button variant="secondary" onClick={startNewChat}>
            New chat
          </Button>
          <Button variant="secondary" onClick={onClose} aria-label="Close Copilot">
            ✕
          </Button>
        </div>
      </header>

      <ol className="messages" aria-live="polite">
        {messages.length === 0 && (
          <li className="hint">
            Ask me about your schedule, your jobs or your customers.
            <div className="suggestions">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button key={prompt} variant="secondary" onClick={() => void send(prompt)}>
                  {prompt}
                </Button>
              ))}
            </div>
          </li>
        )}
        {messages.map((message) => (
          <li key={message.id} className={`message ${message.role}`}>
            {message.content}
          </li>
        ))}
        {thinking && <li className="message assistant">Thinking…</li>}
      </ol>

      {error && <Notice kind="error">{error}</Notice>}

      <form onSubmit={submit}>
        <label className="sr-only" htmlFor="copilot-input">
          Message Copilot
        </label>
        <textarea
          id="copilot-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message Copilot"
          rows={2}
        />
        <Button type="submit" disabled={draft.trim() === "" || thinking}>
          Send
        </Button>
      </form>
    </aside>
  );
}
