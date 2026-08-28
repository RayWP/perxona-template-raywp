import { serviceConfiguration } from "@/lib/config/env.server";

export const dynamic = "force-dynamic";
export function GET() { return Response.json({ ok: true, services: serviceConfiguration() }); }
