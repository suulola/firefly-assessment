import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app.js";

describe("OpenAPI contract", () => {
  it("serves the OpenAPI document without changing application routes", async () => {
    const response = await request(createApp({})).get("/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      openapi: "3.0.3",
      info: { title: "Firefly Pokémon Assessment API" },
    });
    expect(response.body.paths).toHaveProperty("/pokemon");
    expect(response.body.paths).toHaveProperty("/favorites");
    expect(response.body.paths).toHaveProperty("/health");
  });
});
