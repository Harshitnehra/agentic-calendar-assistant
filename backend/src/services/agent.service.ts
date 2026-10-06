import { Agent } from "@mastra/core/agent";
import { createAgentMemory } from "../config/memory.js";
import { getAgentInstructions } from "../config/agent-instructions.js";
import { createCalendarTools } from "./agent-tools.service.js";

export type AgentEvent = {
  type: "started" | "progress" | "token" | "completed" | "error";
  message?: string;
  token?: string;
};

export type StreamAgentReplyInput = {
  userId: string;
  authUserId: string;
  threadId: string;
  message: string;
  onEvent: (event: AgentEvent) => void;
};

export type ThreadSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ThreadMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

function modelName() {
  const model = process.env.AI_MODEL?.trim() || "gemini-3.8-flash";
  return model.startsWith("google/") ? model : `google/${model}`;
}

function configureGeminiApiKey() {
  const apiKey =
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Gemini API key is not set. Add GEMINI_API_KEY to backend/.env",
    );
  }

  // Mastra's Google model router reads this standard AI SDK variable. Keep
  // GOOGLE_GEMINI_API_KEY working as a backwards-compatible project alias.
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string" && error.trim()) return error;

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return "The AI provider failed to generate a response";
}

function messageText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!content || typeof content !== "object") return "";

  const record = content as {
    content?: unknown;
    parts?: Array<{ type?: string; text?: string }>;
  };

  if (typeof record.content === "string" && record.content.trim()) {
    return record.content.trim();
  }

  if (!Array.isArray(record.parts)) return "";
  return record.parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text!.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function listUserThreads(
  authUserId: string,
): Promise<ThreadSummary[]> {
  const memory = createAgentMemory();

  const result = await memory.listThreads({
    filter: { resourceId: authUserId },
    perPage: 30,
    orderBy: { field: "updatedAt", direction: "DESC" },
  });

  return result.threads.map((thread) => ({
    id: thread.id,
    title: thread.title?.trim() || "Untitled Chat",
    updatedAt:
      thread.updatedAt instanceof Date
        ? thread.updatedAt.toISOString()
        : String(thread.updatedAt),
  }));
}

export async function getThreadMessages(
  authUserId: string,
  threadId: string,
): Promise<ThreadMessage[]> {
  const memory = createAgentMemory();

  const thread = await memory.getThreadById({
    threadId,
    resourceId: authUserId,
  });

  if (!thread || thread.resourceId !== authUserId) {
    throw new Error("Thread not found");
  }

  const recalledMemoryData = await memory.recall({
    threadId,
    resourceId: authUserId,
    perPage: false,
  });

  const messages: ThreadMessage[] = [];

  for (const message of recalledMemoryData.messages) {
    const content = messageText(message.content);

    if (!content) {
      continue;
    }

    const role: ThreadMessage["role"] =
      message.role === "user" || message.role === "assistant"
        ? message.role
        : "system";

    messages.push({
      id: message.id,
      role,
      content,
    });
  }

  return messages;
}

export async function streamAgentReply(input: StreamAgentReplyInput) {
  configureGeminiApiKey();

  input.onEvent({
    type: "started",
    message: "Agent is planning",
  });

  const memory = createAgentMemory();

  const agent = new Agent({
    id: "metting-assistant",
    name: "Meeting Assitant",
    instructions: getAgentInstructions(),
    model: modelName(),
    tools: createCalendarTools(input.authUserId),
    memory,
  });

  const result = await agent.stream(input.message, {
    memory: {
      resource: input.authUserId,
      thread: input.threadId,
    },
  });

  let streamedText = "";

  for await (const chunk of result.fullStream) {
    if (chunk.type === "error") {
      throw new Error(errorMessage(chunk.payload.error));
    }

    if (chunk.type === "tool-call") {
      input.onEvent({
        type: "progress",
        message: `Running ${chunk.payload.toolName}`,
      });

      continue;
    }

    if (chunk.type === "text-delta") {
      const text = chunk.payload.text;

      if (text) {
        streamedText += text;
        input.onEvent({
          type: "token",
          token: text,
        });
      }
    }
  }

  const outputError = result.error;
  if (outputError) {
    throw outputError;
  }

  // Some providers buffer their answer instead of emitting text-delta chunks.
  // Preserve streaming when available, but fall back to the completed text so
  // the UI never receives a false "completed" event with an empty response.
  const finalText = await result.text;
  if (!streamedText && finalText) {
    streamedText = finalText;
    input.onEvent({
      type: "token",
      token: finalText,
    });
  }

  if (!streamedText.trim()) {
    throw new Error("The AI provider returned an empty response");
  }

  // streaming finsihes

  const thread = await memory.getThreadById({
    threadId: input.threadId,
    resourceId: input.authUserId,
  });

  if (thread && !thread.title?.trim()) {
    await memory.updateThread({
      id: thread.id,
      title: input.message.slice(0, 80),
      metadata: thread.metadata ?? {},
    });
  }

  input.onEvent({
    type: "completed",
    message: "done",
  });
}
