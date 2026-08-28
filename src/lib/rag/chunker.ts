export function chunkText(text: string, size = 900, overlap = 120): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (size <= 0 || overlap < 0 || overlap >= size) throw new Error("Chunk size must be positive and overlap must be smaller than the chunk size.");
  const chunks: string[] = [];
  for (let start = 0; start < normalized.length; start += size - overlap) {
    const chunk = normalized.slice(start, start + size).trim();
    if (chunk) chunks.push(chunk);
    if (start + size >= normalized.length) break;
  }
  return chunks;
}
