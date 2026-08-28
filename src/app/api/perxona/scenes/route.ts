import { listScenes } from "@/lib/perxona/perxona.server";
import { jsonError } from "@/lib/http/errors";
export async function GET() { try { return Response.json(await listScenes()); } catch (error) { return jsonError(error); } }
