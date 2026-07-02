import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { App } from "../src/App";
import { mswServer } from "./msw/server";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";

const list = [
  { id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" },
  { id: 2, name: "ivysaur", spriteUrl: "https://example.com/2.png" },
  { id: 3, name: "venusaur", spriteUrl: "https://example.com/3.png" },
];

async function renderReadyList() {
  mswServer.use(
    http.get(`${BACKEND_BASE_URL}/pokemon`, () => HttpResponse.json(list)),
    http.get(`${BACKEND_BASE_URL}/favorites`, () => HttpResponse.json([])),
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
  });

  it("restores the full list when the search input is cleared", async () => {
    await renderReadyList();

    const searchInput = screen.getByRole("searchbox", { name: /search/i });
    await userEvent.type(searchInput, "vy");
    expect(await screen.findAllByRole("listitem")).toHaveLength(1);

    await userEvent.clear(searchInput);

    expect(await screen.findAllByRole("listitem")).toHaveLength(3);
  });

  it("resets to the first lazy-load batch after clearing search, with the full list reachable again by scrolling", async () => {
    // Uses a fixture larger than BATCH_SIZE (30) specifically because a small
    // fixture can't distinguish "search cleared correctly" from "the batch
    // reset happened to cover everything since the list was tiny anyway."
    const bigList = Array.from({ length: 150 }, (_, i) => {
      const id = i + 1;
      return {
        id,
        name: id <= 40 ? `keeperon-${id}` : `other-${id}`,
        spriteUrl: `https://example.com/${id}.png`,
      };
    });
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon`, () => HttpResponse.json(bigList)),
      http.get(`${BACKEND_BASE_URL}/favorites`, () => HttpResponse.json([])),
    );
    render(<App />);
    await screen.findAllByRole("listitem");

    const searchInput = screen.getByRole("searchbox", { name: /search/i });
    await userEvent.type(searchInput, "keeperon");

    // 40 matches, but only the first batch (30) renders up front.
    expect(await screen.findAllByRole("listitem")).toHaveLength(30);

    const scrollArea = screen.getByTestId("pokemon-scroll-area");
    Object.defineProperty(scrollArea, "scrollHeight", { value: 3000, configurable: true });
    Object.defineProperty(scrollArea, "clientHeight", { value: 400, configurable: true });
    Object.defineProperty(scrollArea, "scrollTop", { value: 2700, configurable: true });
    fireEvent.scroll(scrollArea);

    // Scrolling loads the rest of the matches, capped at 40 — search is still filtering.
    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(40);
    });

    await userEvent.clear(searchInput);

    // Clearing resets to the first batch of the full 150 — not stuck at 40,
    // and not instantly rendering all 150 (that would defeat lazy-loading).
    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(30);
    });

    fireEvent.scroll(scrollArea);

    // Proves the search restriction is really gone: scrolling now reaches
    // well past the old 40-item cap.
    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(60);
    });
  });
});
