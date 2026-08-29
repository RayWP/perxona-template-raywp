import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

export const serverEnvSchema = z.object({
  CORS_ALLOWED_ORIGINS: z.string().optional().or(z.literal("")),
  PERXONA_API_BASE_URL: optionalUrl,
  PERXONA_CONNECT_SECRET_KEY: z.string().optional().or(z.literal("")),
  PERXONA_CONNECT_PUBLISHABLE_KEY: z.string().optional().or(z.literal("")),
  PERXONA_AVATAR_ID: z.string().optional().or(z.literal("")),
  PERXONA_SCENE_ID: z.string().optional().or(z.literal("")),
  PERXONA_VOICE_ID: z.string().optional().or(z.literal("")),
  PERXONA_PRESENTER_URL: optionalUrl,
  LLM_API_KEY: z.string().optional().or(z.literal("")),
  LLM_BASE_URL: optionalUrl,
  LLM_MODEL: z.string().optional().or(z.literal("")),
  LLM_SITE_URL: optionalUrl,
  LLM_APP_NAME: z.string().optional().or(z.literal("")),
  EMBEDDING_API_KEY: z.string().optional().or(z.literal("")),
  EMBEDDING_BASE_URL: optionalUrl,
  EMBEDDING_MODEL: z.string().optional().or(z.literal("")),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(input: Record<string, string | undefined> = process.env): ServerEnv {
  const result = serverEnvSchema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid server configuration: ${details}`);
  }
  return result.data;
}

export function getServerEnv(): ServerEnv { return parseServerEnv(); }

export function serviceConfiguration(env: ServerEnv = getServerEnv()) {
  const embeddingsExplicit = Boolean(env.EMBEDDING_API_KEY && env.EMBEDDING_BASE_URL && env.EMBEDDING_MODEL);
  const openAiFallback = Boolean(
    !embeddingsExplicit && env.LLM_API_KEY && env.LLM_BASE_URL?.replace(/\/$/, "") === "https://api.openai.com/v1",
  );
  return {
    llmConfigured: Boolean(env.LLM_API_KEY && env.LLM_BASE_URL && env.LLM_MODEL),
    embeddingsConfigured: embeddingsExplicit || openAiFallback,
    perxonaConfigured: Boolean(env.PERXONA_API_BASE_URL && env.PERXONA_CONNECT_SECRET_KEY && env.PERXONA_CONNECT_PUBLISHABLE_KEY),
  };
}
