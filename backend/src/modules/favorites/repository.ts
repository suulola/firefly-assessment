import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Data-access layer for the favorites module: file-based JSON storage
// behind a read/write interface, so the storage mechanism can be swapped
// later without touching the service or route layers.
// Not yet wired to a route (see issue 004 for add/remove/list endpoints).

const DEFAULT_STORE_PATH = fileURLToPath(
  new URL("../../../data/favorites.json", import.meta.url),
);

export interface FavoritesStore {
  read(): Promise<number[]>;
  write(favoriteIds: number[]): Promise<void>;
}

export function createFileFavoritesStore(
  storePath: string = DEFAULT_STORE_PATH,
): FavoritesStore {
  return {
    async read() {
      try {
        const contents = await readFile(storePath, "utf-8");
        return JSON.parse(contents) as number[];
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return [];
        }
        throw error;
      }
    },
    async write(favoriteIds) {
      await writeFile(storePath, JSON.stringify(favoriteIds, null, 2));
    },
  };
}
