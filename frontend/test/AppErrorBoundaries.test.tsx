import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { http } from "msw";
import { mswServer } from "./msw/server";
import { ok } from "./msw/envelope";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";
import { App } from "../src/App";

vi.mock("@/hooks/usePokemonList", () => ({
  usePokemonList: () => {
    throw new Error("list hook exploded");
  },
}));

describe("App error boundaries", () => {
  it("shows the crashed panel's fallback while the other panel keeps rendering", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mswServer.use(http.get(`${BACKEND_BASE_URL}/favorites`, () => ok([])));

    render(<App />);

    expect(screen.getByText(/the pokémon list crashed/i)).toBeInTheDocument();
    expect(screen.getByText(/list hook exploded/i)).toBeInTheDocument();
    // The detail panel is a sibling boundary — it never crashed, so its own
    // empty state should still render normally, not get blanked out.
    expect(
      screen.getByText(/select a pokémon to see details/i),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
