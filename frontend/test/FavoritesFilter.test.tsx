import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http } from "msw";
import { App } from "../src/App";
import { mswServer } from "./msw/server";
import { ok } from "./msw/envelope";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";

const list = [
  { id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" },
  { id: 2, name: "ivysaur", spriteUrl: "https://example.com/2.png" },
  { id: 3, name: "venusaur", spriteUrl: "https://example.com/3.png" },
];

async function renderWithFavorites(favoriteIds: number[]) {
  mswServer.use(
    http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
      ok({ items: list, total: list.length, limit: list.length, offset: 0, hasMore: false }),
    ),
    http.get(`${BACKEND_BASE_URL}/favorites`, () => ok(favoriteIds)),
  );
  render(<App />);
  await screen.findAllByRole("listitem");
}

describe("Favorites filter", () => {
  it("shows only favorited Pokémon when toggled on, and hides the rest", async () => {
    await renderWithFavorites([2]);

    await userEvent.click(screen.getByRole("button", { name: /favorites only/i }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Ivysaur")).toBeInTheDocument();
    expect(screen.queryByText("Bulbasaur")).not.toBeInTheDocument();
    expect(screen.queryByText("Venusaur")).not.toBeInTheDocument();
  });

  it("restores the full list when toggled back off", async () => {
    await renderWithFavorites([2]);

    const toggle = screen.getByRole("button", { name: /favorites only/i });
    await userEvent.click(toggle);
    expect(await screen.findAllByRole("listitem")).toHaveLength(1);

    await userEvent.click(toggle);

    expect(await screen.findAllByRole("listitem")).toHaveLength(3);
  });
});
