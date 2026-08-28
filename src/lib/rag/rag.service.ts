import { embedText } from "./embeddings";
import { chunkText } from "./chunker";
import { getMemoryVectorStore } from "./memory-store";
import { retrieveChunks } from "./retriever";
import type { IngestedDocument, RetrievedChunk, StoredChunk } from "./rag.types";

export async function ingestText(documentName: string, text: string): Promise<IngestedDocument> {
  const chunks = chunkText(text);
  if (!chunks.length) throw new Error("The document is empty.");
  const documentId = crypto.randomUUID();
  const stored: StoredChunk[] = [];
  for (const [index, chunk] of chunks.entries()) stored.push({ id: `${documentId}-${index}`, documentId, documentName, text: chunk, embedding: await embedText(chunk) });
  getMemoryVectorStore().add(stored);
  return { documentId, documentName, chunks: stored.length };
}

export async function retrieveRelevant(query: string, topK = 4): Promise<RetrievedChunk[]> {
  const store = getMemoryVectorStore();
  if (store.count() === 0) return [];
  return retrieveChunks(await embedText(query), store.all(), topK);
}
