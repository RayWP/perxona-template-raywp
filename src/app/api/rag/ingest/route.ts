import { ingestText } from "@/lib/rag/rag.service";
import { jsonError } from "@/lib/http/errors";
import { z } from "zod";

const schema = z.object({ documentName: z.string().trim().min(1).max(160), text: z.string().min(1).max(500_000) });
export async function POST(request: Request) {
  try { const contentLength = Number(request.headers.get("content-length") || 0); if (contentLength > 700_000) return Response.json({ error: "Ingestion request is too large; keep documents under 500,000 characters." }, { status: 413 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Provide a document name and no more than 500,000 characters of text." }, { status: 400 }); return Response.json(await ingestText(parsed.data.documentName, parsed.data.text)); }
  catch (error) { console.error("POST /api/rag/ingest failed:", error instanceof Error ? error.message : "unknown error"); return jsonError(error); }
}
