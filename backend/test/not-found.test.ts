import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app.js";

describe("not found handler", () => {
  it("returns the standard API envelope for unknown routes", async () => {
    const response = await request(createApp({}))
      .get("/does-not-exist")
      .set("x-request-id", "not-found-test");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      data: null,
      message: "Route not found.",
      code: "NOT_FOUND",
      requestId: "not-found-test",
    });
  });
});
