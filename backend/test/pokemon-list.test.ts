import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import request from "supertest";
import { app } from "../src/app.js";
import { mswServer } from "./msw/server.js";
import { POKEAPI_BASE_URL } from "../src/modules/pokemon/repository.js";

function mockPokeApiList(count: number) {
  return {
    results: Array.from({ length: count }, (_, i) => {
      const id = i + 1;
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
      http.get(`${POKEAPI_BASE_URL}/pokemon`, () =>
        HttpResponse.json(mockPokeApiList(150)),
      ),
    );

    const response = await request(app).get("/pokemon");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(150);
    expect(response.body[0]).toEqual({
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
      error: "Failed to load the Pokémon list.",
    });
  });
});
