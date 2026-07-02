import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "@/app.js";

describe("GET /health", () => {
  it("responds with 200 and a liveness payload", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ok" },
      message: "Backend is healthy.",
    });
  });
});
