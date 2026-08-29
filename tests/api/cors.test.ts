import { describe, expect, it } from "vitest";
import { corsHeaders, getAllowedCorsOrigins } from "@/lib/http/cors";

describe("CORS allowlist", () => {
  it("normalizes configured origins and includes development localhost", () => {
    const origins = getAllowedCorsOrigins({ NODE_ENV: "development", CORS_ALLOWED_ORIGINS: " https://demo.ts.net/ " });
    expect(origins.has("https://demo.ts.net")).toBe(true);
    expect(origins.has("http://localhost:3000")).toBe(true);
  });

  it("does not grant access to an unlisted origin", () => {
    const headers = corsHeaders("https://other.ts.net", new Set(["https://demo.ts.net"]));
    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});
