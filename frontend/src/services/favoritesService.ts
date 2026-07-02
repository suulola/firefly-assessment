import { BACKEND_BASE_URL } from "@/lib/backendClient";
import { readApiResponse } from "@/services/apiResponse";

export async function addFavorite(id: number): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  await readApiResponse<{ id: number }>(response, "Failed to save this favorite.");
}

export async function removeFavorite(id: number): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites/${id}`, {
    method: "DELETE",
  });
  await readApiResponse<{ id: number }>(
    response,
    "Failed to remove this favorite.",
  );
}

export async function getFavorites(): Promise<number[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites`);
  return readApiResponse<number[]>(response, "Failed to load favorites.");
}
