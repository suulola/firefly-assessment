import { describe, expect, it } from "vitest";
import { http } from "msw";
import { mswServer } from "./msw/server";
import { ok } from "./msw/envelope";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";
import { getPokemonDetail, getPokemonListPage } from "../src/services/pokemonService";

describe("pokemonService schema validation (end-to-end through fetch + msw)", () => {
  it("returns a well-formed list page unchanged", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
        ok({
          items: [{ id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" }],
          total: 1,
          limit: 1,
          offset: 0,
          hasMore: false,
        }),
      ),
    );

    await expect(getPokemonListPage(30, 0)).resolves.toMatchObject({
      items: [{ id: 1, name: "bulbasaur" }],
      total: 1,
    });
  });

  it("rejects a list envelope whose data doesn't match the Pokémon list shape", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
        ok({ items: "not-an-array", total: 1, limit: 1, offset: 0, hasMore: false }),
      ),
    );

    await expect(getPokemonListPage(30, 0)).rejects.toThrow(
      "Received invalid Pokémon list data from the server.",
    );
  });

  it("rejects a detail envelope missing required fields", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon/1`, () =>
        ok({ id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" }), // missing types/abilities/evolutions
      ),
    );

    await expect(getPokemonDetail(1)).rejects.toThrow(
      "Received invalid Pokémon detail data from the server.",
    );
  });
});
