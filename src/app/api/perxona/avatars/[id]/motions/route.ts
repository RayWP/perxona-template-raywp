import { listAvatarMotions } from "@/lib/perxona/perxona.server";
import { jsonError } from "@/lib/http/errors";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) { try { return Response.json(await listAvatarMotions((await context.params).id)); } catch (error) { return jsonError(error); } }
