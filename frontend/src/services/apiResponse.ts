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
    throw new Error(body.message || fallbackMessage);
  }

  return body.data as T;
}
