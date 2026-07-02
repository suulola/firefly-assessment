// Data-access layer for the pokemon module: the only place in the backend
// that talks to the external PokéAPI. Routes and other modules' services
// go through here rather than calling fetch() directly.

export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

export class PokeApiError extends Error {}

export async function pokeApiGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${POKEAPI_BASE_URL}${path}`);
  } catch (cause) {
    throw new PokeApiError(`PokéAPI request to ${path} failed`, { cause });
  }

  if (!response.ok) {
    throw new PokeApiError(`PokéAPI request to ${path} returned ${response.status}`);
  }

  return (await response.json()) as T;
}
