import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { corsHeaders, getAllowedCorsOrigins } from "@/lib/http/cors";

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin, getAllowedCorsOrigins());
  const isAllowed = Boolean(headers["Access-Control-Allow-Origin"]);

  if (request.method === "OPTIONS") return new NextResponse(null, { status: isAllowed ? 204 : 403, headers });

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}

export const config = { matcher: "/api/:path*" };
