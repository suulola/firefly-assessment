import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import request from "supertest";
import { app } from "@/app.js";
import { mswServer } from "./msw/server.js";
import { POKEAPI_BASE_URL } from "@/modules/pokemon/repository.js";

function mockPokemon(id: number, name: string) {
  return {
    id,
    name,
    types: [
      { slot: 2, type: { name: "poison" } },
      { slot: 1, type: { name: "grass" } },
    ],
    abilities: [
      { ability: { name: "overgrow" }, is_hidden: false },
      { ability: { name: "chlorophyll" }, is_hidden: true },
    ],
  };
}

function mockSpecies(chainId: number | null) {
  return {
    evolution_chain: chainId
      ? { url: `${POKEAPI_BASE_URL}/evolution-chain/${chainId}/` }
      : null,
  };
}

function speciesUrl(id: number) {
  return `${POKEAPI_BASE_URL}/pokemon-species/${id}`;
}

function pokemonUrl(id: number) {
  return `${POKEAPI_BASE_URL}/pokemon/${id}`;
}

describe("GET /pokemon/:id", () => {
  it("returns types, abilities, and a flattened linear evolution chain", async () => {
    mswServer.use(
      http.get(pokemonUrl(1), () => HttpResponse.json(mockPokemon(1, "bulbasaur"))),
      http.get(speciesUrl(1), () => HttpResponse.json(mockSpecies(1))),
      http.get(`${POKEAPI_BASE_URL}/evolution-chain/1`, () =>
        HttpResponse.json({
          chain: {
            species: { name: "bulbasaur", url: `${POKEAPI_BASE_URL}/pokemon-species/1/` },
            evolves_to: [
              {
                species: { name: "ivysaur", url: `${POKEAPI_BASE_URL}/pokemon-species/2/` },
                evolves_to: [
                  {
                    species: { name: "venusaur", url: `${POKEAPI_BASE_URL}/pokemon-species/3/` },
                    evolves_to: [],
                  },
                ],
              },
            ],
          },
        }),
      ),
    );

    const response = await request(app).get("/pokemon/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Pokémon loaded.",
      data: {
      id: 1,
      name: "bulbasaur",
      spriteUrl:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      types: ["grass", "poison"],
      abilities: [
        { name: "overgrow", hidden: false },
        { name: "chlorophyll", hidden: true },
      ],
      evolutions: [
        { id: 1, name: "bulbasaur", spriteUrl: expect.stringContaining("/1.png") },
        { id: 2, name: "ivysaur", spriteUrl: expect.stringContaining("/2.png") },
        { id: 3, name: "venusaur", spriteUrl: expect.stringContaining("/3.png") },
      ],
      },
    });
  });

  it("flattens a branching evolution chain (Eevee-like) in traversal order", async () => {
    mswServer.use(
      http.get(pokemonUrl(133), () => HttpResponse.json(mockPokemon(133, "eevee"))),
      http.get(speciesUrl(133), () => HttpResponse.json(mockSpecies(67))),
      http.get(`${POKEAPI_BASE_URL}/evolution-chain/67`, () =>
        HttpResponse.json({
          chain: {
            species: { name: "eevee", url: `${POKEAPI_BASE_URL}/pokemon-species/133/` },
            evolves_to: [
              {
                species: { name: "vaporeon", url: `${POKEAPI_BASE_URL}/pokemon-species/134/` },
                evolves_to: [],
              },
              {
                species: { name: "jolteon", url: `${POKEAPI_BASE_URL}/pokemon-species/135/` },
                evolves_to: [],
              },
              {
                species: { name: "flareon", url: `${POKEAPI_BASE_URL}/pokemon-species/136/` },
                evolves_to: [],
              },
            ],
          },
        }),
      ),
    );

    const response = await request(app).get("/pokemon/133");

    expect(response.status).toBe(200);
    expect(response.body.data.evolutions.map((e: { name: string }) => e.name)).toEqual([
      "eevee",
      "vaporeon",
      "jolteon",
      "flareon",
    ]);
  });

  it("returns an empty evolutions list for a Pokémon with no evolution chain", async () => {
    mswServer.use(
      http.get(pokemonUrl(143), () => HttpResponse.json(mockPokemon(143, "snorlax"))),
      http.get(speciesUrl(143), () => HttpResponse.json(mockSpecies(null))),
    );

    const response = await request(app).get("/pokemon/143");

    expect(response.status).toBe(200);
    expect(response.body.data.evolutions).toEqual([]);
  });

  it("returns the backend's error envelope when the PokéAPI call fails", async () => {
    mswServer.use(
      http.get(pokemonUrl(1), () => HttpResponse.error()),
      http.get(speciesUrl(1), () => HttpResponse.json(mockSpecies(null))),
    );

    const response = await request(app).get("/pokemon/1");

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({
      success: false,
      data: null,
      message: "Failed to load this Pokémon.",
      code: "POKEAPI_UNAVAILABLE",
    });
    expect(response.body.requestId).toEqual(expect.any(String));
  });
});
