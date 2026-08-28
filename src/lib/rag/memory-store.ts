import type { StoredChunk } from "./rag.types";

export class MemoryVectorStore {
  private readonly chunks = new Map<string, StoredChunk>();
  add(chunks: StoredChunk[]) { for (const chunk of chunks) this.chunks.set(chunk.id, chunk); }
  all(): StoredChunk[] { return [...this.chunks.values()]; }
  clear() { this.chunks.clear(); }
  count() { return this.chunks.size; }
}

let store: MemoryVectorStore | undefined;
export function getMemoryVectorStore() { return (store ??= new MemoryVectorStore()); }
