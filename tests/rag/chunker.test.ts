import { describe, expect, it } from "vitest";
import { chunkText } from "@/lib/rag/chunker";

describe("chunkText", () => { it("normalizes and chunks deterministically", () => { expect(chunkText(" a\r\nb ", 3, 0)).toEqual(["a\nb"]); }); it("returns no chunks for blank input", () => { expect(chunkText("  ")).toEqual([]); }); });
