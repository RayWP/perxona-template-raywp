import { publishableConnectKey } from "@/lib/perxona/perxona.server";
import { jsonError } from "@/lib/http/errors";
export function GET() { try { return Response.json({ connect_key: publishableConnectKey() }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { return jsonError(error); } }
