import type { FavoritesStore } from "@/modules/favorites/types.js";

const mutationQueues = new WeakMap<FavoritesStore, Promise<void>>();

async function runSerializedMutation(
  store: FavoritesStore,
  mutation: () => Promise<void>,
): Promise<void> {
  const previous = mutationQueues.get(store) ?? Promise.resolve();
  const next = previous.then(mutation, mutation);
  mutationQueues.set(
    store,
    next.catch(() => {}),
  );
  return next;
}

export async function addFavorite(store: FavoritesStore, id: number): Promise<void> {
  await runSerializedMutation(store, async () => {
    const current = await store.read();
    if (!current.includes(id)) {
      await store.write([...current, id]);
    }
  });
}

export async function removeFavorite(store: FavoritesStore, id: number): Promise<void> {
  await runSerializedMutation(store, async () => {
    const current = await store.read();
    await store.write(current.filter((existing) => existing !== id));
  });
}

export function listFavorites(store: FavoritesStore): Promise<number[]> {
  return store.read();
}
