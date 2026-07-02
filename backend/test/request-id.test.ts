import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app.js";

describe("request id middleware", () => {
  it("generates a request id response header", async () => {
    const response = await request(createApp({})).get("/health");

    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
  });

  it("echoes an incoming request id and includes it on error bodies", async () => {
    const response = await request(createApp({}))
      .get("/pokemon/not-a-number")
      .set("x-request-id", "test-request-id");

    expect(response.headers["x-request-id"]).toBe("test-request-id");
    expect(response.body).toMatchObject({
      success: false,
      requestId: "test-request-id",
    });
  });
});
