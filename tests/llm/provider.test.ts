import { describe, expect, it } from "vitest";
import { normalizeChatCompletion } from "@/lib/llm/openai-compatible.provider";

describe("OpenAI-compatible normalization", () => { it("extracts assistant text", () => { expect(normalizeChatCompletion({ model: "demo", choices: [{ message: { content: " Hello " } }] })).toMatchObject({ text: "Hello", provider: "openai-compatible" }); }); it("rejects an empty response", () => { expect(() => normalizeChatCompletion({ choices: [{ message: { content: "" } }] })).toThrow("no assistant text"); }); });
