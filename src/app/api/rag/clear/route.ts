import { getMemoryVectorStore } from "@/lib/rag/memory-store";
export async function POST() { getMemoryVectorStore().clear(); return Response.json({ ok: true }); }
