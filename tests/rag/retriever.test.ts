import { describe, expect, it } from "vitest";
import { cosineSimilarity, retrieveChunks } from "@/lib/rag/retriever";

describe("retriever", () => { it("calculates cosine similarity", () => { expect(cosineSimilarity([1, 0], [1, 0])).toBe(1); }); it("orders nearest chunks first", () => { const result = retrieveChunks([1, 0], [{ id: "a", documentId: "d", documentName: "a", text: "a", embedding: [0, 1] }, { id: "b", documentId: "d", documentName: "a", text: "b", embedding: [1, 0] }]); expect(result[0].id).toBe("b"); }); });
