import OpenAI from "openai";
import type { Account, ChatMessage, Job, User } from "../types.js";

let client: OpenAI | null = null;

/** The OpenAI client, built on first use from OPENAI_API_KEY, or null when the key isn't set. */
function openai(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export class CopilotUnavailableError extends Error {
  constructor() {
    super("Crewdesk Copilot needs OPENAI_API_KEY");
  }
}

/**
 * Asks Crewdesk Copilot, an LLM-powered dispatch assistant, for its reply to the conversation. The model sees
 * the user's account and its upcoming jobs, so it can answer questions about the schedule.
 */
export async function askCopilot(
  messages: ChatMessage[],
  context: { user: User; account: Account; upcomingJobs: Job[] },
): Promise<string> {
  const model = openai();
  if (!model) {
    throw new CopilotUnavailableError();
  }
  const schedule = context.upcomingJobs
    .map((job) => `- ${job.scheduledFor}: ${job.title} (${job.status}, ${job.priority})`)
    .join("\n");
  const completion = await model.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You are Crewdesk Copilot, a dispatch assistant for ${context.account.name}, a field-service company. You help ${context.user.name} plan and schedule jobs. Keep answers short. Upcoming jobs:\n${schedule || "(none)"}`,
      },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ],
  });
  return completion.choices[0]?.message?.content?.trim() || "Sorry, I don't have an answer for that.";
}
