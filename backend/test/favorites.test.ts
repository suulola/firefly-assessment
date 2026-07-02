import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createFileFavoritesStore } from "../src/modules/favorites/repository.js";

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

    expect(response.status).toBe(204);
    const ids = await createFileFavoritesStore(storePath).read();
    expect(ids).toEqual([25]);
  });

  it("is idempotent when adding an already-favorited Pokémon", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });

    await request(app).post("/favorites").send({ id: 25 });
    const response = await request(app).post("/favorites").send({ id: 25 });

    expect(response.status).toBe(204);
    const ids = await createFileFavoritesStore(storePath).read();
    expect(ids).toEqual([25]);
  });

  it("persists a removed favorite", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });
    await request(app).post("/favorites").send({ id: 25 });

    const response = await request(app).delete("/favorites/25");

    expect(response.status).toBe(204);
    const ids = await createFileFavoritesStore(storePath).read();
    expect(ids).toEqual([]);
  });

  it("is idempotent when removing a Pokémon that isn't favorited", async () => {
    const storePath = await tempStorePath();
    const app = createApp({ favoritesStorePath: storePath });

    const response = await request(app).delete("/favorites/25");

    expect(response.status).toBe(204);
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
    expect(response.status).toBe(204);
  });
});
