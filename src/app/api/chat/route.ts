import { answerConversation } from "@/features/conversation/conversation.service";
import { chatRequestSchema } from "@/features/conversation/conversation.types";
import { jsonError } from "@/lib/http/errors";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 150_000) return Response.json({ error: "Chat request is too large." }, { status: 413 });
    const parsed = chatRequestSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, { status: 400 });
    return Response.json(await answerConversation(parsed.data));
  } catch (error) { console.error("POST /api/chat failed:", error instanceof Error ? error.message : "unknown error"); return jsonError(error); }
}
