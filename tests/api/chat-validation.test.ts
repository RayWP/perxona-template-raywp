import { describe, expect, it } from "vitest";
import { chatRequestSchema } from "@/features/conversation/conversation.types";

describe("chat request validation", () => { it("accepts bounded messages", () => { expect(chatRequestSchema.parse({ message: "Hello", history: [] }).message).toBe("Hello"); }); it("rejects oversized history", () => { expect(() => chatRequestSchema.parse({ message: "Hi", history: Array.from({ length: 21 }, () => ({ role: "user", content: "x" })) })).toThrow(); }); });
