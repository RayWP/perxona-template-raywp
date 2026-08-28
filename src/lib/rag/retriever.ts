import type { RetrievedChunk, StoredChunk } from "./rag.types";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, aMagnitude = 0, bMagnitude = 0;
  for (let index = 0; index < a.length; index++) { dot += a[index] * b[index]; aMagnitude += a[index] ** 2; bMagnitude += b[index] ** 2; }
  return aMagnitude === 0 || bMagnitude === 0 ? 0 : dot / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
}

export function retrieveChunks(query: number[], chunks: StoredChunk[], topK = 4): RetrievedChunk[] {
  return chunks.map((chunk) => ({ id: chunk.id, documentId: chunk.documentId, documentName: chunk.documentName, text: chunk.text, score: cosineSimilarity(query, chunk.embedding) })).sort((a, b) => b.score - a.score).slice(0, topK);
}
