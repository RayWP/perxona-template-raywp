const DEV_DEFAULT_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!/^https?:$/.test(url.protocol) || url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getAllowedCorsOrigins(env: Record<string, string | undefined> = process.env): Set<string> {
  const configured = (env.CORS_ALLOWED_ORIGINS || "").split(",").map(normalizeOrigin).filter((origin): origin is string => Boolean(origin));
  const defaults = env.NODE_ENV === "development" ? DEV_DEFAULT_ORIGINS : [];
  return new Set([...defaults, ...configured]);
}

export function corsHeaders(origin: string | null, allowedOrigins: ReadonlySet<string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
  const normalized = origin ? normalizeOrigin(origin) : null;
  if (normalized && allowedOrigins.has(normalized)) headers["Access-Control-Allow-Origin"] = normalized;
  return headers;
}
