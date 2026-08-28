import { describe, expect, it } from "vitest";
import { parseServerEnv, serviceConfiguration } from "@/lib/config/env.server";

describe("configuration", () => { it("does not require runtime secrets at build time", () => { expect(serviceConfiguration(parseServerEnv({}))).toEqual({ llmConfigured: false, embeddingsConfigured: false, perxonaConfigured: false }); }); it("rejects malformed URLs", () => { expect(() => parseServerEnv({ LLM_BASE_URL: "not-a-url" })).toThrow("Invalid server configuration"); }); });
