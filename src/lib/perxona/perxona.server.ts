import { getServerEnv } from "@/lib/config/env.server";
import { HttpError } from "@/lib/http/errors";
import type { PerxonaCatalog } from "./perxona.types";

function requirePerxona() {
  const env = getServerEnv();
  if (!env.PERXONA_API_BASE_URL || !env.PERXONA_CONNECT_SECRET_KEY) throw new HttpError(503, "Perxona is not configured. Set PERXONA_API_BASE_URL and PERXONA_CONNECT_SECRET_KEY.");
  return { baseUrl: env.PERXONA_API_BASE_URL.replace(/\/$/, ""), key: env.PERXONA_CONNECT_SECRET_KEY };
}

async function perxonaJson(path: string): Promise<unknown> {
  const config = requirePerxona();
  const response = await fetch(`${config.baseUrl}${path}`, { headers: { "X-Connect-Key": config.key, Accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new HttpError(response.status, `Perxona request failed with HTTP ${response.status}. Check the Connect key and API region.`);
  return response.json();
}

function normalizeCatalog(value: unknown, idField: string): PerxonaCatalog {
  const page = (value && typeof value === "object" ? value : {}) as { items?: unknown[] };
  const items = (page.items ?? []).filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")).map((item) => ({ ...item, id: String(item.id ?? item[idField] ?? "") })).filter((item) => item.id);
  return { ...page, items };
}

export function publicPerxonaConfig() {
  const env = getServerEnv();
  const target = env.PERXONA_AVATAR_ID && env.PERXONA_SCENE_ID ? { avatarId: env.PERXONA_AVATAR_ID, sceneId: env.PERXONA_SCENE_ID, ...(env.PERXONA_VOICE_ID ? { voiceId: env.PERXONA_VOICE_ID } : {}) } : null;
  return { presenterUrl: env.PERXONA_PRESENTER_URL || "https://cdn.perxona.ai/prod/latest/widget/entry/presenter.js", target, configured: Boolean(env.PERXONA_CONNECT_SECRET_KEY && env.PERXONA_CONNECT_PUBLISHABLE_KEY) };
}

export function publishableConnectKey() {
  const env = getServerEnv();
  if (!env.PERXONA_CONNECT_PUBLISHABLE_KEY) throw new HttpError(503, "Perxona publishable key is not configured.");
  return env.PERXONA_CONNECT_PUBLISHABLE_KEY;
}

export async function listAvatars() { return normalizeCatalog(await perxonaJson("/api/v1/connect/assets/avatars"), "avatar_id"); }
export async function listScenes() { return normalizeCatalog(await perxonaJson("/api/v1/connect/assets/scenes"), "scene_id"); }
export async function listVoices() { return normalizeCatalog(await perxonaJson("/api/v1/connect/voices"), "voice_id"); }
export async function listAvatarMotions(id: string) { return normalizeCatalog(await perxonaJson(`/api/v1/connect/assets/avatars/${encodeURIComponent(id)}/motions`), "motion_id"); }
