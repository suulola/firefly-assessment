import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import request from "supertest";
import { app } from "../src/app.js";
import { mswServer } from "./msw/server.js";
import { POKEAPI_BASE_URL } from "../src/modules/pokemon/repository.js";

function mockPokeApiListPage(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 150);
  const offset = Number(url.searchParams.get("offset") ?? 0);
  const count = Math.max(limit, 0);
  return {
    results: Array.from({ length: count }, (_, i) => {
      const id = offset + i + 1;
      return {
        name: `pokemon-${id}`,
        url: `${POKEAPI_BASE_URL}/pokemon/${id}/`,
      };
    }),
  };
}

describe("GET /pokemon", () => {
  it("returns the first 150 Pokémon with id, name, and sprite URL", async () => {
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon`, ({ request }) =>
        HttpResponse.json(mockPokeApiListPage(request)),
      ),
    );

    const response = await request(app).get("/pokemon?limit=30&offset=0");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Pokémon list loaded.",
      data: {
        total: 150,
        limit: 30,
        offset: 0,
        hasMore: true,
      },
    });
    expect(response.body.data.items).toHaveLength(30);
    expect(response.body.data.items[0]).toEqual({
      id: 1,
      name: "pokemon-1",
      spriteUrl:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    });
  });

  it("returns the backend's error envelope when the PokéAPI call fails", async () => {
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon`, () => HttpResponse.error()),
    );

    const response = await request(app).get("/pokemon");

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      success: false,
      data: null,
      message: "Failed to load the Pokémon list.",
    });
  });
});
