import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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

    render(<PokemonList selectedId={null} onSelect={() => {}} />);

    expect(await screen.findByRole("status")).toHaveTextContent(/loading/i);
  });

  it("renders 150 items with name, sprite, and number once loaded", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
        HttpResponse.json(mockList(150)),
      ),
    );

    render(<PokemonList selectedId={null} onSelect={() => {}} />);

    expect(
      screen.getByRole("heading", { name: /pokémon explorer/i }),
    ).toBeInTheDocument();
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(150);
    expect(screen.getByText("Pokemon 1")).toBeInTheDocument();
    expect(screen.getByText("#001")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pokemon 1" })).toHaveAttribute(
      "src",
      "https://example.com/sprites/1.png",
    );
  });

  it("shows a clear error message when the backend call fails", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
        HttpResponse.json({ error: "Failed to load the Pokémon list." }, { status: 502 }),
      ),
    );

    render(<PokemonList selectedId={null} onSelect={() => {}} />);

    expect(
      await screen.findByText(/couldn't load pokémon/i),
    ).toBeInTheDocument();
  });
});
