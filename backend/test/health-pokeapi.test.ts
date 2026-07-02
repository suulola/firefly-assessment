import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import request from "supertest";
import { app } from "../src/app.js";
import { mswServer } from "./msw/server.js";
import { POKEAPI_BASE_URL } from "../src/modules/pokemon/repository.js";

describe("GET /health/pokeapi", () => {
  it("reports reachable when the PokéAPI responds", async () => {
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon/1`, () =>
        HttpResponse.json({ id: 1, name: "bulbasaur" }),
      ),
    );

    const response = await request(app).get("/health/pokeapi");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", pokeapi: "reachable" });
  });

  it("reports unreachable when the PokéAPI call fails", async () => {
    mswServer.use(
      http.get(`${POKEAPI_BASE_URL}/pokemon/1`, () => HttpResponse.error()),
    );

    const response = await request(app).get("/health/pokeapi");

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ status: "error", pokeapi: "unreachable" });
  });
});
