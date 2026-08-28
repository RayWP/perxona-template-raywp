import { getServerEnv } from "@/lib/config/env.server";
import type { LLMRequest, LLMResponse } from "./llm.types";
import type { LLMProvider } from "./llm-provider";

type ChatCompletionPayload = { choices?: Array<{ message?: { content?: string | null } }>; model?: string };

export function normalizeChatCompletion(payload: ChatCompletionPayload): LLMResponse {
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The LLM returned no assistant text.");
  return { text, provider: "openai-compatible", model: payload.model };
}

export class OpenAICompatibleProvider implements LLMProvider {
  constructor(private readonly config: { apiKey: string; baseUrl: string; model: string; siteUrl?: string; appName?: string }) {}

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const headers: Record<string, string> = { Authorization: `Bearer ${this.config.apiKey}`, "Content-Type": "application/json" };
    if (this.config.siteUrl) headers["HTTP-Referer"] = this.config.siteUrl;
    if (this.config.appName) headers["X-Title"] = this.config.appName;
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: this.config.model, messages: request.messages, temperature: request.temperature ?? 0.2, max_tokens: request.maxTokens ?? 800 }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) throw new Error(`LLM provider request failed with HTTP ${response.status}. Check LLM_API_KEY, LLM_BASE_URL, and LLM_MODEL.`);
    return normalizeChatCompletion(await response.json() as ChatCompletionPayload);
  }
}

export function createLLMProvider(): LLMProvider {
  const env = getServerEnv();
  if (!env.LLM_API_KEY || !env.LLM_BASE_URL || !env.LLM_MODEL) throw new Error("LLM is not configured. Set LLM_API_KEY, LLM_BASE_URL, and LLM_MODEL in .env.local.");
  return new OpenAICompatibleProvider({ apiKey: env.LLM_API_KEY, baseUrl: env.LLM_BASE_URL, model: env.LLM_MODEL, siteUrl: env.LLM_SITE_URL || undefined, appName: env.LLM_APP_NAME || undefined });
}
