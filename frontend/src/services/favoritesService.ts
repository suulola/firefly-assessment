import { BACKEND_BASE_URL } from "@/lib/backendClient";
import { readApiResponse } from "@/services/apiResponse";
import { favoriteMutationResponseSchema, favoritesSchema, parsePayload } from "@/services/schemas";

export async function addFavorite(id: number): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await readApiResponse<unknown>(
    response,
    "Failed to save this favorite.",
    "favoritesService.addFavorite",
  );
  parsePayload(
    favoriteMutationResponseSchema,
    data,
    "Received an invalid favorite response from the server.",
    "favoritesService.addFavorite",
  );
}

export async function removeFavorite(id: number): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites/${id}`, {
    method: "DELETE",
  });
  const data = await readApiResponse<unknown>(
    response,
    "Failed to remove this favorite.",
    "favoritesService.removeFavorite",
  );
  parsePayload(
    favoriteMutationResponseSchema,
    data,
    "Received an invalid favorite response from the server.",
    "favoritesService.removeFavorite",
  );
}

export async function getFavorites(signal?: AbortSignal): Promise<number[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites`, { signal });
  const data = await readApiResponse<unknown>(
    response,
    "Failed to load favorites.",
    "favoritesService.getFavorites",
  );
  return parsePayload(
    favoritesSchema,
    data,
    "Received invalid favorites data from the server.",
    "favoritesService.getFavorites",
  );
}
