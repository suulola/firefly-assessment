import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse, delay } from "msw";
import { PokemonList } from "../src/components/PokemonList";
import { mswServer } from "./msw/server";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";

function mockList(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    return {
      id,
      name: `pokemon-${id}`,
      spriteUrl: `https://example.com/sprites/${id}.png`,
    };
  });
}

describe("PokemonList", () => {
  it("shows a loading indicator while the list is in flight", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, async () => {
        await delay("infinite");
        return HttpResponse.json([]);
      }),
    );

    render(<PokemonList selectedId={null} onSelect={() => {}} favoriteIds={new Set()} favoriteErrors={{}} onToggleFavorite={() => {}} />);

    expect(await screen.findByRole("status")).toHaveTextContent(/loading/i);
  });

  it("renders an initial batch (not all 150 at once) with name, sprite, and number", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
        HttpResponse.json(mockList(150)),
      ),
    );

    render(<PokemonList selectedId={null} onSelect={() => {}} favoriteIds={new Set()} favoriteErrors={{}} onToggleFavorite={() => {}} />);

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

  it("loads more items when scrolled near the bottom of the list", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
        HttpResponse.json(mockList(150)),
      ),
    );

    render(<PokemonList selectedId={null} onSelect={() => {}} favoriteIds={new Set()} favoriteErrors={{}} onToggleFavorite={() => {}} />);
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
        HttpResponse.json({ error: "Failed to load the Pokémon list." }, { status: 502 }),
      ),
    );

    render(<PokemonList selectedId={null} onSelect={() => {}} favoriteIds={new Set()} favoriteErrors={{}} onToggleFavorite={() => {}} />);

    expect(
      await screen.findByText(/couldn't load pokémon/i),
    ).toBeInTheDocument();
  });
});
