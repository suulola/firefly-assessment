import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app.js";

describe("request validation", () => {
  it("rejects a negative Pokémon list limit", async () => {
    const response = await request(createApp({})).get("/pokemon?limit=-1");

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      data: null,
      message: "limit must be non-negative.",
      code: "BAD_REQUEST",
    });
  });

  it("rejects a non-integer Pokémon detail id", async () => {
    const response = await request(createApp({})).get("/pokemon/not-a-number");

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      data: null,
      message: "id must be an integer.",
      code: "BAD_REQUEST",
    });
  });

  it("rejects a favorite body without a positive integer id", async () => {
    const response = await request(createApp({})).post("/favorites").send({ id: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      data: null,
      message: "id must be a positive integer.",
      code: "BAD_REQUEST",
    });
  });

  it("rejects a delete favorite param without a positive integer id", async () => {
    const response = await request(createApp({})).delete("/favorites/-1");

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      data: null,
      message: "id must be a positive integer.",
      code: "BAD_REQUEST",
    });
  });
});
