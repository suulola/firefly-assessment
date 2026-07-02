import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { App } from "../src/App";
import { mswServer } from "./msw/server";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";

describe("App backend status", () => {
  it("shows the backend health status once the mocked backend responds", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/health`, () =>
        HttpResponse.json({ status: "ok" }),
      ),
    );

    render(<App />);

    expect(
      await screen.findByText(/backend status: ok/i),
    ).toBeInTheDocument();
  });

  it("shows an error state when the backend is unreachable", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/health`, () => HttpResponse.error()),
    );

    render(<App />);

    expect(
      await screen.findByText(/backend status: unreachable/i),
    ).toBeInTheDocument();
  });
});
