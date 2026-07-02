import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http } from "msw";
import { App } from "../src/App";
import { mswServer } from "./msw/server";
import { ok } from "./msw/envelope";
import { pokemonPageHandler } from "./msw/pokemonHandlers";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";

const list = [
  { id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" },
  { id: 2, name: "ivysaur", spriteUrl: "https://example.com/2.png" },
  { id: 3, name: "venusaur", spriteUrl: "https://example.com/3.png" },
];

async function renderReadyList() {
  mswServer.use(
    http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
      ok({ items: list, total: list.length, limit: list.length, offset: 0, hasMore: false }),
    ),
    http.get(`${BACKEND_BASE_URL}/favorites`, () => ok([])),
  );
  render(<App />);
  await screen.findAllByRole("listitem");
}

describe("Search", () => {
  it("filters the list to names matching the search input", async () => {
    await renderReadyList();

    await userEvent.type(screen.getByRole("searchbox", { name: /search/i }), "vy");

    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(screen.getByText("Ivysaur")).toBeInTheDocument();
    expect(screen.queryByText("Bulbasaur")).not.toBeInTheDocument();
    expect(screen.queryByText("Venusaur")).not.toBeInTheDocument();
    // Announced to assistive tech, not just shown visually via the list length.
    expect(await screen.findByText("1 result")).toBeInTheDocument();
  });

  it("keeps focus on the search input while typing filters the list (no disruptive focus jump)", async () => {
    await renderReadyList();

    const searchInput = screen.getByRole("searchbox", { name: /search/i });
    searchInput.focus();
    await userEvent.type(searchInput, "vy");
    await screen.findAllByRole("listitem");

    expect(searchInput).toHaveFocus();
  });

  it("restores the full list when the search input is cleared", async () => {
    await renderReadyList();

    const searchInput = screen.getByRole("searchbox", { name: /search/i });
    await userEvent.type(searchInput, "vy");
    expect(await screen.findAllByRole("listitem")).toHaveLength(1);

    await userEvent.clear(searchInput);

    expect(await screen.findAllByRole("listitem")).toHaveLength(3);
  });

  it("keeps loading pages while searching until a match beyond the first page is found", async () => {
    const bigList = Array.from({ length: 150 }, (_, i) => {
      const id = i + 1;
      return {
        id,
        // id 45 is beyond the first 30-item page — only reachable by
        // fetching a second page.
        name: id === 45 ? "raretail" : `common-${id}`,
        spriteUrl: `https://example.com/${id}.png`,
      };
    });
    mswServer.use(
      pokemonPageHandler(bigList),
      http.get(`${BACKEND_BASE_URL}/favorites`, () => ok([])),
    );
    render(<App />);
    await screen.findAllByRole("listitem");

    await userEvent.type(screen.getByRole("searchbox", { name: /search/i }), "raretail");

    expect(await screen.findByText("Raretail")).toBeInTheDocument();
  });

  it("stops fetching once every page has loaded and a search matches nothing", async () => {
    const bigList = Array.from({ length: 150 }, (_, i) => {
      const id = i + 1;
      return { id, name: `common-${id}`, spriteUrl: `https://example.com/${id}.png` };
    });
    let requestCount = 0;
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, ({ request }) => {
        requestCount += 1;
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") ?? 30);
        const offset = Number(url.searchParams.get("offset") ?? 0);
        const items = bigList.slice(offset, offset + limit);
        return ok({
          items,
          total: bigList.length,
          limit: items.length,
          offset,
          hasMore: offset + items.length < bigList.length,
        });
      }),
      http.get(`${BACKEND_BASE_URL}/favorites`, () => ok([])),
    );
    render(<App />);
    await screen.findAllByRole("listitem");

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search/i }),
      "nonexistent-pokemon",
    );

    expect(await screen.findByText(/no pokémon found/i)).toBeInTheDocument();
    // 150 items / 30 per page = 5 requests to exhaust hasMore. Asserting the
    // exact count (not just "stopped eventually") proves the background
    // search-fetch loop halted the moment the backend's hasMore went false,
    // rather than continuing to poll the last page.
    expect(requestCount).toBe(5);
  });
});
