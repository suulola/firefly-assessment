import { afterEach, describe, expect, it, vi } from "vitest";
import {
  favoriteMutationResponseSchema,
  favoritesSchema,
  parsePayload,
  pokemonDetailSchema,
  pokemonListPageSchema,
} from "../src/services/schemas";
import { resetErrorSink, setErrorSink } from "../src/lib/observability";

afterEach(() => {
  resetErrorSink();
});

describe("parsePayload", () => {
  it("returns the data unchanged when it matches the schema", () => {
    const page = { items: [], total: 0, limit: 0, offset: 0, hasMore: false };

    expect(parsePayload(pokemonListPageSchema, page, "bad list", "test")).toEqual(page);
  });

  it("throws the provided message for a malformed Pokémon list payload", () => {
    const malformed = { items: [{ id: "not-a-number", name: "bulbasaur" }], total: 1 };

    expect(() =>
      parsePayload(
        pokemonListPageSchema,
        malformed,
        "Received invalid Pokémon list data from the server.",
        "test",
      ),
    ).toThrow("Received invalid Pokémon list data from the server.");
  });

  it("throws the provided message for a malformed Pokémon detail payload", () => {
    const malformed = {
      id: 1,
      name: "bulbasaur",
      spriteUrl: "https://example.com/1.png",
      types: ["grass"],
      abilities: [{ name: "overgrow" }], // missing required `hidden`
      evolutions: [],
    };

    expect(() =>
      parsePayload(
        pokemonDetailSchema,
        malformed,
        "Received invalid Pokémon detail data from the server.",
        "test",
      ),
    ).toThrow("Received invalid Pokémon detail data from the server.");
  });

  it("throws the provided message for a malformed favorites payload", () => {
    const malformed = ["1", "2", "3"]; // strings, not numbers

    expect(() =>
      parsePayload(
        favoritesSchema,
        malformed,
        "Received invalid favorites data from the server.",
        "test",
      ),
    ).toThrow("Received invalid favorites data from the server.");
  });

  it("throws for a malformed favorite mutation response", () => {
    const malformed = { id: null };

    expect(() =>
      parsePayload(
        favoriteMutationResponseSchema,
        malformed,
        "Received an invalid favorite response from the server.",
        "test",
      ),
    ).toThrow("Received an invalid favorite response from the server.");
  });

  it("reports the validation failure through the observability abstraction", () => {
    const errorSink = vi.fn();
    setErrorSink(errorSink);

    expect(() =>
      parsePayload(favoritesSchema, { not: "an array" }, "bad favorites", "favoritesService"),
    ).toThrow("bad favorites");

    expect(errorSink).toHaveBeenCalledTimes(1);
    const [, context] = errorSink.mock.calls[0];
    expect(context).toMatchObject({ source: "favoritesService", action: "schema-validation" });
  });
});
