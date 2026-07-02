import type { FavoritesStore } from "./repository.js";

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
