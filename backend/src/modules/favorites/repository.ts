import { readFile, rename, writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type { FavoritesStore } from "@/modules/favorites/types.js";

// Data-access layer for the favorites module: file-based JSON storage
// behind a read/write interface, so the storage mechanism can be swapped
// later without touching the service or route layers.

const DEFAULT_STORE_PATH = fileURLToPath(
  new URL("../../../data/favorites.json", import.meta.url),
);

export class FavoritesStorageError extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "FavoritesStorageError";
  }
}

function parseFavoriteIds(contents: string): number[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (cause) {
    throw new FavoritesStorageError("Favorites store contains malformed JSON.", { cause });
  }

  if (
    !Array.isArray(parsed) ||
    !parsed.every((id) => Number.isInteger(id) && id > 0)
  ) {
    throw new FavoritesStorageError("Favorites store contains invalid data.");
  }

  return parsed;
}

export function createFileFavoritesStore(
  storePath: string = DEFAULT_STORE_PATH,
): FavoritesStore {
  return {
    async read() {
      try {
        const contents = await readFile(storePath, "utf-8");
        return parseFavoriteIds(contents);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return [];
        }
        throw error;
      }
    },
    async write(favoriteIds) {
      const storeDir = dirname(storePath);
      await mkdir(storeDir, { recursive: true });
      const tempPath = join(storeDir, `.${basename(storePath)}.${process.pid}.${randomUUID()}.tmp`);
      await writeFile(tempPath, JSON.stringify(favoriteIds, null, 2));
      await rename(tempPath, storePath);
    },
  };
}
