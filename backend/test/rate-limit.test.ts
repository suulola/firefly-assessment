import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app.js";

describe("rate limiting", () => {
  it("returns the standard API envelope after the request limit is exceeded", async () => {
    const app = createApp({ rateLimitWindowMs: 60_000, rateLimitMax: 1 });

    const first = await request(app).get("/health");
    const second = await request(app).get("/health");

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.body).toMatchObject({
      success: false,
      data: null,
      message: "Too many requests.",
      code: "RATE_LIMITED",
    });
    expect(second.body.requestId).toEqual(expect.any(String));
  });
});
