import { randomUUID } from "node:crypto";
import { Router } from "express";
import { askCopilot, CopilotUnavailableError } from "../ai/copilot.js";
import { jobs } from "../store/data.js";
import type { ChatMessage } from "../types.js";

export const copilotRouter = Router();

// The web app sends the whole conversation each time, so the API keeps no chat state of its own.
copilotRouter.post("/chat", async (req, res) => {
  const { conversationId, messages } = (req.body ?? {}) as { conversationId?: unknown; messages?: unknown };
  if (typeof conversationId !== "string" || !Array.isArray(messages)) {
    res.status(400).json({ error: "conversationId and messages are required" });
    return;
  }
  const conversation = (messages as ChatMessage[]).filter(
    (message) => (message?.role === "user" || message?.role === "assistant") && typeof message.content === "string",
  );
  const { user, account } = req.session!;
  const today = new Date().toISOString().slice(0, 10);
  const upcomingJobs = [...jobs.values()].filter((job) => job.accountId === account.id && job.scheduledFor >= today);
  try {
    const content = await askCopilot(conversation, { user, account, upcomingJobs });
    res.json({ conversationId, message: { id: randomUUID(), role: "assistant", content } });
  } catch (error) {
    if (error instanceof CopilotUnavailableError) {
      res.status(503).json({ error: error.message });
      return;
    }
    res.status(502).json({ error: "Crewdesk Copilot could not answer" });
  }
});
