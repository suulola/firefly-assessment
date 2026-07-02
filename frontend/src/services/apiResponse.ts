import { reportError } from "@/lib/observability";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

function hasEnvelopeShape(
  body: unknown,
): body is { success: unknown; data: unknown; message: unknown } {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    "data" in body &&
    "message" in body
  );
}

function isWellFormedApiResponse<T>(body: unknown): body is ApiResponse<T> {
  if (!hasEnvelopeShape(body)) return false;
  if (typeof body.success !== "boolean") return false;
  if (typeof body.message !== "string") return false;
  if (body.success && body.data == null) return false;
  return true;
}

export async function readApiResponse<T>(
  response: Response,
  fallbackMessage: string,
  source = "apiResponse",
): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    // The backend's own contract (successResponse/errorResponse) guarantees
    // JSON — a body that doesn't parse at all means something between the
    // backend and here (proxy, malformed error page, etc.) broke that
    // contract. Worth reporting distinctly from an ordinary HTTP failure.
    reportError(error, { source, action: "parse-envelope", extra: { status: response.status } });
    throw new Error(fallbackMessage, { cause: error });
  }

  if (!isWellFormedApiResponse<T>(body)) {
    const shapeError = new Error("Received an unexpected response from the server.");
    reportError(shapeError, {
      source,
      action: "validate-envelope",
      extra: { status: response.status },
    });
    throw shapeError;
  }

  if (!response.ok || !body.success) {
    // An expected, user-facing failure (backend rejected the request, or
    // returned a proper error envelope) — not a code-level bug, so this
    // doesn't get reported. Callers render it inline.
    throw new Error(body.message || fallbackMessage);
  }

  return body.data as T;
}
