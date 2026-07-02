import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, delay } from "msw";
import { PokemonList } from "../src/components/PokemonList";
import { createQueryClient } from "../src/queryClient";
import { mswServer } from "./msw/server";
import { ok, fail } from "./msw/envelope";
import { mockList, pokemonPageHandler } from "./msw/pokemonHandlers";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";

function renderPokemonList() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <PokemonList
        selectedId={null}
        onSelect={() => {}}
        favoriteIds={new Set()}
        favoriteErrors={{}}
        onToggleFavorite={() => {}}
        isFavoritePending={() => false}
      />
    </QueryClientProvider>,
  );
}

describe("PokemonList", () => {
  it("exposes the panel as a labeled navigation landmark", async () => {
    mswServer.use(pokemonPageHandler(mockList(3)));

    renderPokemonList();

    expect(
      await screen.findByRole("navigation", { name: /pokémon list/i }),
    ).toBeInTheDocument();
  });

  it("shows a loading indicator while the list is in flight", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, async () => {
        await delay("infinite");
        return ok({ items: [], total: 0, limit: 0, offset: 0, hasMore: false });
      }),
    );

    renderPokemonList();

    expect(await screen.findByRole("status")).toHaveTextContent(/loading/i);
  });

  it("renders an initial batch (not all 150 at once) with name, sprite, and number", async () => {
    mswServer.use(pokemonPageHandler(mockList(150)));

    renderPokemonList();

    expect(
      screen.getByRole("heading", { name: /pokémon explorer/i }),
    ).toBeInTheDocument();
    const items = await screen.findAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThan(150);
    expect(screen.getByText("Pokemon 1")).toBeInTheDocument();
    expect(screen.getByText("#001")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pokemon 1" })).toHaveAttribute(
      "src",
      "https://example.com/sprites/1.png",
    );
  });

  it("virtualizes the list: DOM rows stay bounded to roughly a viewport while the scroll track reflects the full dataset", async () => {
    mswServer.use(pokemonPageHandler(mockList(150)));

    renderPokemonList();

    const items = await screen.findAllByRole("listitem");
    // Well under 150 — a fixed viewport window (plus overscan), not "batch
    // of 30" truncation. Loose upper bound so this doesn't pin an exact
    // row-height/overscan implementation detail.
    expect(items.length).toBeLessThan(50);

    const list = screen.getByRole("list");
    // The scrollable track is sized for every row *currently loaded* (one
    // 30-item page) even though only a handful of rows are mounted in the
    // DOM — that's the signal this is virtualized, not just a shorter array.
    expect(list).toHaveStyle({ height: "1890px" });
  });

  it("loads more items when scrolled near the bottom of the list", async () => {
    mswServer.use(pokemonPageHandler(mockList(150)));

    renderPokemonList();
    const initialItems = await screen.findAllByRole("listitem");
    const initialCount = initialItems.length;

    const scrollArea = screen.getByTestId("pokemon-scroll-area");
    Object.defineProperty(scrollArea, "scrollHeight", { value: 3000, configurable: true });
    Object.defineProperty(scrollArea, "clientHeight", { value: 400, configurable: true });
    Object.defineProperty(scrollArea, "scrollTop", { value: 2700, configurable: true });
    fireEvent.scroll(scrollArea);

    await waitFor(() => {
      expect(screen.getAllByRole("listitem").length).toBeGreaterThan(initialCount);
    });
  });

  it("shows a clear error message when the backend call fails", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
        fail("Failed to load the Pokémon list."),
      ),
    );

    renderPokemonList();

    expect(
      await screen.findByText(/couldn't load pokémon/i),
    ).toBeInTheDocument();
  });
});
