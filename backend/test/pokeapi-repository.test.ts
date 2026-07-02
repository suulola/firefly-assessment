import { describe, expect, it } from "vitest";
import { delay, http, HttpResponse } from "msw";
import request from "supertest";
import { createApp } from "@/app.js";
import { mswServer } from "./msw/server.js";
import { POKEAPI_BASE_URL } from "@/modules/pokemon/repository.js";

function mockListPage(name = "bulbasaur") {
  return {
    results: [{ name, url: `${POKEAPI_BASE_URL}/pokemon/1/` }],
  };
}

describe("PokéAPI repository hardening", () => {
  it("returns a timeout-specific code when the upstream request exceeds the configured timeout", async () => {
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon`, async () => {
        await delay(100);
        return HttpResponse.json(mockListPage());
      }),
    );

    const response = await request(createApp({ pokeApiTimeoutMs: 1 })).get(
      "/pokemon?limit=1&offset=0",
    );

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({
      success: false,
      data: null,
      message: "Failed to load the Pokémon list.",
      code: "POKEAPI_TIMEOUT",
    });
  });

  it("caches successful PokéAPI GET responses for the configured TTL", async () => {
    let requestCount = 0;
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon`, () => {
        requestCount += 1;
        return HttpResponse.json(mockListPage(`pokemon-${requestCount}`));
      }),
    );

    const app = createApp({ pokeApiCacheTtlMs: 60_000 });

    const first = await request(app).get("/pokemon?limit=1&offset=0");
    const second = await request(app).get("/pokemon?limit=1&offset=0");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(requestCount).toBe(1);
    expect(second.body.data.items[0].name).toBe("pokemon-1");
  });

  it("rejects malformed upstream list payloads as upstream failures", async () => {
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon`, () =>
        HttpResponse.json({ results: [{ name: "missing-url" }] }),
      ),
    );

    const response = await request(createApp({})).get("/pokemon?limit=1&offset=0");

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({
      success: false,
      data: null,
      message: "Failed to load the Pokémon list.",
      code: "POKEAPI_UNAVAILABLE",
    });
  });
});
