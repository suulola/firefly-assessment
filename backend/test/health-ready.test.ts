import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { http, HttpResponse } from "msw";
import request from "supertest";
import { createApp } from "@/app.js";
import { mswServer } from "./msw/server.js";
import { POKEAPI_BASE_URL } from "@/modules/pokemon/repository.js";

function mockPokemon() {
  return {
    id: 1,
    name: "bulbasaur",
    types: [{ slot: 1, type: { name: "grass" } }],
    abilities: [{ ability: { name: "overgrow" }, is_hidden: false }],
  };
}

describe("GET /health/ready", () => {
  it("reports ready when storage is readable and PokéAPI is reachable", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "ready-test-"));
    try {
      mswServer.use(
        http.get(`${POKEAPI_BASE_URL}/pokemon/1`, () => HttpResponse.json(mockPokemon())),
      );

      const response = await request(
        createApp({ favoritesStorePath: join(tempDir, "favorites.json") }),
      ).get("/health/ready");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          status: "ready",
          backend: "ok",
          favorites: "readable",
          pokeapi: "reachable",
        },
        message: "Backend is ready.",
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("reports degraded readiness when PokéAPI is unreachable", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "ready-test-"));
    try {
      mswServer.use(
        http.get(`${POKEAPI_BASE_URL}/pokemon/1`, () => HttpResponse.error()),
      );

      const response = await request(
        createApp({ favoritesStorePath: join(tempDir, "favorites.json") }),
      ).get("/health/ready");

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        success: false,
        data: null,
        message: "Backend is not ready.",
        code: "BACKEND_NOT_READY",
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
