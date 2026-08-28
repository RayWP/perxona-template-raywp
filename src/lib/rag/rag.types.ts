export type StoredChunk = { id: string; documentId: string; documentName: string; text: string; embedding: number[] };
export type RetrievedChunk = { id: string; documentId: string; documentName: string; text: string; score: number };
export type IngestedDocument = { documentId: string; documentName: string; chunks: number };
