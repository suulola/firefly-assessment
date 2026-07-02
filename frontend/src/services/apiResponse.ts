export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

function isApiResponse<T>(body: unknown): body is ApiResponse<T> {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    "data" in body &&
    "message" in body
  );
}

export async function readApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as unknown;

  if (!response.ok) {
    if (isApiResponse<T>(body) && typeof body.message === "string") {
      throw new Error(body.message);
    }
    throw new Error(fallbackMessage);
  }

  if (isApiResponse<T>(body)) {
    if (!body.success || body.data == null) {
      throw new Error(body.message || fallbackMessage);
    }
    return body.data;
  }

  return body as T;
}
