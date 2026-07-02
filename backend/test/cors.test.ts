import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("CORS", () => {
  it("allows the Vite dev server origin by default when CORS_ORIGIN is unset", async () => {
    const app = createApp({});

    const response = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("rejects an unlisted origin when CORS_ORIGIN is unset (fails closed, not wildcard)", async () => {
    const app = createApp({});

    const response = await request(app)
      .get("/health")
      .set("Origin", "https://some-random-site.example");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("allows an origin explicitly listed in CORS_ORIGIN", async () => {
    const app = createApp({ corsOrigin: "https://my-app.vercel.app" });

    const response = await request(app)
      .get("/health")
      .set("Origin", "https://my-app.vercel.app");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://my-app.vercel.app",
    );
  });

  it("allows multiple comma-separated origins in CORS_ORIGIN", async () => {
    const app = createApp({
      corsOrigin: "https://my-app.vercel.app,https://my-app-preview.vercel.app",
    });

    const first = await request(app)
      .get("/health")
      .set("Origin", "https://my-app.vercel.app");
    const second = await request(app)
      .get("/health")
      .set("Origin", "https://my-app-preview.vercel.app");

    expect(first.headers["access-control-allow-origin"]).toBe(
      "https://my-app.vercel.app",
    );
    expect(second.headers["access-control-allow-origin"]).toBe(
      "https://my-app-preview.vercel.app",
    );
  });

  it("rejects an origin not in a configured CORS_ORIGIN list", async () => {
    const app = createApp({ corsOrigin: "https://my-app.vercel.app" });

    const response = await request(app)
      .get("/health")
      .set("Origin", "https://not-allowed.example");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
