import { describe, expect, it } from "vitest";
import { flattenEvolutionChain } from "@/modules/pokemon/service.js";
import type { PokeApiEvolutionNode } from "@/modules/pokemon/types.js";

function speciesUrl(id: number) {
  return `https://pokeapi.co/api/v2/pokemon-species/${id}/`;
}

describe("flattenEvolutionChain", () => {
  it("flattens a linear chain in root-to-final order", () => {
    const chain: PokeApiEvolutionNode = {
      species: { name: "bulbasaur", url: speciesUrl(1) },
      evolves_to: [
        {
          species: { name: "ivysaur", url: speciesUrl(2) },
          evolves_to: [
            { species: { name: "venusaur", url: speciesUrl(3) }, evolves_to: [] },
          ],
        },
      ],
    };

    expect(flattenEvolutionChain(chain)).toEqual([
      { id: 1, name: "bulbasaur", spriteUrl: expect.stringContaining("/1.png") },
      { id: 2, name: "ivysaur", spriteUrl: expect.stringContaining("/2.png") },
      { id: 3, name: "venusaur", spriteUrl: expect.stringContaining("/3.png") },
    ]);
  });

  it("flattens a branching chain (Eevee-style fork) depth-first, each branch in listed order", () => {
    const chain: PokeApiEvolutionNode = {
      species: { name: "eevee", url: speciesUrl(133) },
      evolves_to: [
        { species: { name: "vaporeon", url: speciesUrl(134) }, evolves_to: [] },
        { species: { name: "jolteon", url: speciesUrl(135) }, evolves_to: [] },
        { species: { name: "flareon", url: speciesUrl(136) }, evolves_to: [] },
      ],
    };

    expect(flattenEvolutionChain(chain).map((stage) => stage.name)).toEqual([
      "eevee",
      "vaporeon",
      "jolteon",
      "flareon",
    ]);
  });

  it("returns a single stage for a Pokémon with no further evolutions", () => {
    const chain: PokeApiEvolutionNode = {
      species: { name: "snorlax", url: speciesUrl(143) },
      evolves_to: [],
    };

    expect(flattenEvolutionChain(chain)).toEqual([
      { id: 143, name: "snorlax", spriteUrl: expect.stringContaining("/143.png") },
    ]);
  });

  it("parses the species id from a URL regardless of a trailing slash", () => {
    const withTrailingSlash: PokeApiEvolutionNode = {
      species: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon-species/1/" },
      evolves_to: [],
    };
    const withoutTrailingSlash: PokeApiEvolutionNode = {
      species: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon-species/1" },
      evolves_to: [],
    };

    expect(flattenEvolutionChain(withTrailingSlash)[0].id).toBe(1);
    expect(flattenEvolutionChain(withoutTrailingSlash)[0].id).toBe(1);
  });

  it("walks a multi-level branching chain (a fork partway down a linear chain)", () => {
    const chain: PokeApiEvolutionNode = {
      species: { name: "poliwag", url: speciesUrl(60) },
      evolves_to: [
        {
          species: { name: "poliwhirl", url: speciesUrl(61) },
          evolves_to: [
            { species: { name: "poliwrath", url: speciesUrl(62) }, evolves_to: [] },
            { species: { name: "politoed", url: speciesUrl(186) }, evolves_to: [] },
          ],
        },
      ],
    };

    expect(flattenEvolutionChain(chain).map((stage) => stage.name)).toEqual([
      "poliwag",
      "poliwhirl",
      "poliwrath",
      "politoed",
    ]);
  });
});
