import type { FavoritesStore } from "@/modules/favorites/types.js";

export async function addFavorite(store: FavoritesStore, id: number): Promise<void> {
  const current = await store.read();
  if (!current.includes(id)) {
    await store.write([...current, id]);
  }
}

export async function removeFavorite(store: FavoritesStore, id: number): Promise<void> {
  const current = await store.read();
  await store.write(current.filter((existing) => existing !== id));
}

export function listFavorites(store: FavoritesStore): Promise<number[]> {
  return store.read();
}
