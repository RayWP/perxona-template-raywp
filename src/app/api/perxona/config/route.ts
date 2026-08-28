import { publicPerxonaConfig } from "@/lib/perxona/perxona.server";
export function GET() { return Response.json(publicPerxonaConfig()); }
