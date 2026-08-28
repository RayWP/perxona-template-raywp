export class HttpError extends Error {
  constructor(public readonly status: number, message: string) { super(message); this.name = "HttpError"; }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected server error";
}

export function jsonError(error: unknown, fallback = "Request failed") {
  const message = errorMessage(error);
  const status = error instanceof HttpError ? error.status : 500;
  return Response.json({ error: message || fallback }, { status });
}
