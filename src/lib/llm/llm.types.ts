export type LLMRole = "system" | "user" | "assistant";

export type LLMMessage = { role: LLMRole; content: string };

export type LLMRequest = { messages: LLMMessage[]; temperature?: number; maxTokens?: number };

export type LLMResponse = { text: string; provider: string; model?: string };
