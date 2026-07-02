import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "@/app.js";
import {
  createFileFavoritesStore,
  FavoritesStorageError,
} from "@/modules/favorites/repository.js";

let tempDir: string | undefined;

async function tempStorePath() {
  tempDir = await mkdtemp(join(tmpdir(), "favorites-test-"));
  return join(tempDir, "favorites.json");
}

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe("favorites", () => {
  it("persists an added favorite", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });

    const response = await request(app).post("/favorites").send({ id: 25 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { id: 25 },
      message: "Favorite saved.",
    });
    const ids = await createFileFavoritesStore(storePath).read();
    expect(ids).toEqual([25]);
  });

  it("is idempotent when adding an already-favorited Pokémon", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });

    await request(app).post("/favorites").send({ id: 25 });
    const response = await request(app).post("/favorites").send({ id: 25 });

    expect(response.status).toBe(200);
    const ids = await createFileFavoritesStore(storePath).read();
    expect(ids).toEqual([25]);
  });

  it("persists a removed favorite", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });
    await request(app).post("/favorites").send({ id: 25 });

    const response = await request(app).delete("/favorites/25");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { id: 25 },
      message: "Favorite removed.",
    });
    const ids = await createFileFavoritesStore(storePath).read();
    expect(ids).toEqual([]);
  });

  it("is idempotent when removing a Pokémon that isn't favorited", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });

    const response = await request(app).delete("/favorites/25");

    expect(response.status).toBe(200);
    const ids = await createFileFavoritesStore(storePath).read();
    expect(ids).toEqual([]);
  });

  it("survives a fresh app instance reading the same file (simulated restart)", async () => {
    const storePath = await tempStorePath();
    const appBeforeRestart = createApp({ favoritesStorePath: storePath });
    await request(appBeforeRestart).post("/favorites").send({ id: 25 });

    const appAfterRestart = createApp({ favoritesStorePath: storePath });
    const ids = await createFileFavoritesStore(storePath).read();

    expect(ids).toEqual([25]);
    // A fresh instance pointed at the same file serves the same data.
    const response = await request(appAfterRestart).delete("/favorites/25");
    expect(response.status).toBe(200);
  });

  it("GET /favorites reflects adds and removes made through the add/remove endpoints", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });

    await request(app).post("/favorites").send({ id: 25 });
    await request(app).post("/favorites").send({ id: 6 });

    const afterAdds = await request(app).get("/favorites");
    expect(afterAdds.status).toBe(200);
    expect(afterAdds.body).toEqual({
      success: true,
      data: [25, 6],
      message: "Favorites loaded.",
    });

    await request(app).delete("/favorites/25");

    const afterRemove = await request(app).get("/favorites");
    expect(afterRemove.status).toBe(200);
    expect(afterRemove.body).toEqual({
      success: true,
      data: [6],
      message: "Favorites loaded.",
    });
  });

  it("uses FAVORITES_STORE_PATH when no explicit option is passed (Railway volume config)", async () => {
    const storePath = await tempStorePath();
    vi.stubEnv("FAVORITES_STORE_PATH", storePath);

    try {
      const app = createApp({});
      await request(app).post("/favorites").send({ id: 25 });

      const ids = await createFileFavoritesStore(storePath).read();
      expect(ids).toEqual([25]);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("serializes concurrent favorite adds against the same file store", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });

    await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        request(app).post("/favorites").send({ id: index + 1 }),
      ),
    );

    const ids = await createFileFavoritesStore(storePath).read();
    expect([...ids].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
  });

  it("creates the parent directory before writing the file store", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "favorites-test-"));
    const storePath = join(tempDir, "nested", "favorites.json");
    const store = createFileFavoritesStore(storePath);

    await store.write([25]);

    await expect(store.read()).resolves.toEqual([25]);
  });

  it("rejects malformed favorites JSON with a controlled storage error", async () => {
    const storePath = await tempStorePath();
    await writeFile(storePath, "{not-json");

    await expect(createFileFavoritesStore(storePath).read()).rejects.toBeInstanceOf(
      FavoritesStorageError,
    );
  });
});
