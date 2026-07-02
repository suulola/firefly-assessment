import { pokeApiGet } from "@/modules/pokemon/repository.js";
import type { FavoritesStore } from "@/modules/favorites/types.js";

export function checkLiveness(): { status: "ok" } {
  return { status: "ok" };
}

export async function checkPokeApiReachable(): Promise<
  { reachable: true } | { reachable: false }
> {
  try {
    await pokeApiGet("/pokemon/1");
    return { reachable: true };
  } catch {
    return { reachable: false };
  }
}

export async function checkFavoritesStorageReadable(
  store: FavoritesStore,
): Promise<{ readable: true } | { readable: false }> {
  try {
    await store.read();
    return { readable: true };
  } catch {
    return { readable: false };
  }
}

export async function checkReadiness(store: FavoritesStore): Promise<{
  status: "ready" | "degraded";
  backend: "ok";
  favorites: "readable" | "unreadable";
  pokeapi: "reachable" | "unreachable";
}> {
  const [favorites, pokeapi] = await Promise.all([
    checkFavoritesStorageReadable(store),
    checkPokeApiReachable(),
  ]);

  return {
    status: favorites.readable && pokeapi.reachable ? "ready" : "degraded",
    backend: "ok",
    favorites: favorites.readable ? "readable" : "unreadable",
    pokeapi: pokeapi.reachable ? "reachable" : "unreachable",
  };
}
