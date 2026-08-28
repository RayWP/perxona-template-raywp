import { createLLMProvider } from "@/lib/llm";
import { retrieveRelevant } from "@/lib/rag/rag.service";
import type { ChatRequest, ChatResponse } from "./conversation.types";
import type { LLMMessage } from "@/lib/llm";

export const DEFAULT_SYSTEM_PROMPT = "You are a concise, helpful assistant. Use supplied knowledge when relevant. If the supplied knowledge does not answer the question, say that rather than inventing facts.";

export async function answerConversation(request: ChatRequest): Promise<ChatResponse> {
  const retrieved = await retrieveRelevant(request.message);
  const context = retrieved.length ? `\n\nSupplied knowledge:\n${retrieved.map((item) => `[${item.documentName}] ${item.text}`).join("\n\n")}` : "";
  const messages: LLMMessage[] = [{ role: "system", content: DEFAULT_SYSTEM_PROMPT }, ...request.history, { role: "user", content: `${request.message}${context}` }];
  const response = await createLLMProvider().generate({ messages, maxTokens: 800 });
  return { answer: response.text, sources: retrieved.map(({ documentName, score }) => ({ documentName, score: Number(score.toFixed(4)) })) };
}
