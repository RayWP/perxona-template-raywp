import { getServerEnv } from "@/lib/config/env.server";

type EmbeddingPayload = { data?: Array<{ embedding?: number[] }> };

function embeddingConfig() {
  const env = getServerEnv();
  if (env.EMBEDDING_API_KEY && env.EMBEDDING_BASE_URL && env.EMBEDDING_MODEL) return { apiKey: env.EMBEDDING_API_KEY, baseUrl: env.EMBEDDING_BASE_URL, model: env.EMBEDDING_MODEL };
  if (env.LLM_API_KEY && env.LLM_BASE_URL?.replace(/\/$/, "") === "https://api.openai.com/v1") return { apiKey: env.LLM_API_KEY, baseUrl: env.LLM_BASE_URL, model: "text-embedding-3-small" };
  throw new Error("Embeddings are not configured. Set EMBEDDING_API_KEY, EMBEDDING_BASE_URL, and EMBEDDING_MODEL. OpenAI chat credentials are reused only for the official OpenAI endpoint.");
}

export async function embedText(input: string): Promise<number[]> {
  const config = embeddingConfig();
  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/embeddings`, { method: "POST", headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: config.model, input }), signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`Embedding provider request failed with HTTP ${response.status}. Verify the endpoint supports embeddings.`);
  const embedding = (await response.json() as EmbeddingPayload).data?.[0]?.embedding;
  if (!embedding?.length) throw new Error("The embedding provider returned no vector.");
  return embedding;
}
