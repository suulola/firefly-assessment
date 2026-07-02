import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import request from "supertest";
import { app } from "@/app.js";
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

describe("GET /health/pokeapi", () => {
  it("reports reachable when the PokéAPI responds", async () => {
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon/1`, () => HttpResponse.json(mockPokemon())),
    );

    const response = await request(app).get("/health/pokeapi");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ok", pokeapi: "reachable" },
      message: "PokéAPI is reachable.",
    });
  });

  it("reports unreachable when the PokéAPI call fails", async () => {
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon/1`, () => HttpResponse.error()),
    );

    const response = await request(app).get("/health/pokeapi");

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({
      success: false,
      data: null,
      message: "PokéAPI is unreachable.",
      code: "POKEAPI_UNAVAILABLE",
    });
    expect(response.body.requestId).toEqual(expect.any(String));
  });
});
