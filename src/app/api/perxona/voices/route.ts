import { listVoices } from "@/lib/perxona/perxona.server";
import { jsonError } from "@/lib/http/errors";
export async function GET() { try { return Response.json(await listVoices()); } catch (error) { return jsonError(error); } }
