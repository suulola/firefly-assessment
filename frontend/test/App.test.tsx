import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, delay } from "msw";
import { App } from "../src/App";
import { mswServer } from "./msw/server";
import { ok, fail } from "./msw/envelope";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";

const list = [
  { id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" },
  { id: 2, name: "ivysaur", spriteUrl: "https://example.com/2.png" },
];

const detailWithEvolutions = {
  id: 1,
  name: "bulbasaur",
  spriteUrl: "https://example.com/1.png",
  types: ["grass", "poison"],
  abilities: [{ name: "overgrow", hidden: false }],
  evolutions: [
    { id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" },
    { id: 2, name: "ivysaur", spriteUrl: "https://example.com/2.png" },
  ],
};

const detailWithNoEvolutions = {
  ...detailWithEvolutions,
  evolutions: [{ id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" }],
};

async function renderReadyList() {
  mswServer.use(
    http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
      ok({ items: list, total: list.length, limit: list.length, offset: 0, hasMore: false }),
    ),
  );
  render(<App />);
  return screen.findAllByRole("listitem");
}

describe("App: click a Pokémon to see its detail", () => {
  it("renders abilities, types, and evolution stages after clicking a list item", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon/1`, () => ok(detailWithEvolutions)),
    );
    await renderReadyList();

    await userEvent.click(screen.getByRole("button", { name: /^bulbasaur/i }));

    expect(await screen.findByText("Grass")).toBeInTheDocument();
    expect(screen.getByText("Poison")).toBeInTheDocument();
    expect(screen.getByText("Overgrow")).toBeInTheDocument();
    expect(screen.getAllByText("Ivysaur")).not.toHaveLength(0);
    expect(
      screen.getByRole("heading", { level: 2, name: "Bulbasaur" }),
    ).toBeInTheDocument();
    // Landmarks and heading structure a screen reader user relies on to
    // jump around the page instead of reading everything linearly.
    expect(
      screen.getByRole("main", { name: /pokémon detail/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Types" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Abilities" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Evolution line" }),
    ).toBeInTheDocument();
  });

  it("marks the selected list item with aria-current for assistive tech", async () => {
    mswServer.use(http.get(`${BACKEND_BASE_URL}/pokemon/1`, () => ok(detailWithEvolutions)));
    await renderReadyList();

    const bulbasaurButton = screen.getByRole("button", { name: /^bulbasaur/i });
    const ivysaurButton = screen.getByRole("button", { name: /^ivysaur/i });
    expect(bulbasaurButton).not.toHaveAttribute("aria-current");

    await userEvent.click(bulbasaurButton);

    expect(bulbasaurButton).toHaveAttribute("aria-current", "true");
    expect(ivysaurButton).not.toHaveAttribute("aria-current");
  });

  it("shows the detail panel's own loading and error states independently of the list", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon/1`, async () => {
        await delay("infinite");
        return ok(detailWithEvolutions);
      }),
    );
    await renderReadyList();

    await userEvent.click(screen.getByRole("button", { name: /^bulbasaur/i }));

    expect(await screen.findByRole("status", { name: /pokémon detail/i })).toBeInTheDocument();
    // The list itself stays ready — its own items are still visible, not replaced by a spinner.
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the detail panel's own error state when the detail request fails, independently of the list", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon/1`, () =>
        fail("Failed to load this Pokémon."),
      ),
    );
    await renderReadyList();

    await userEvent.click(screen.getByRole("button", { name: /^bulbasaur/i }));

    expect(await screen.findByText(/couldn't load this pokémon/i)).toBeInTheDocument();
    // The list itself stays ready — its own items are still visible, not replaced by an error box.
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows an explicit empty state for a Pokémon with no evolutions", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon/1`, () => ok(detailWithNoEvolutions)),
    );
    await renderReadyList();

    await userEvent.click(screen.getByRole("button", { name: /^bulbasaur/i }));

    expect(
      await screen.findByText(/this pokémon has no evolutions/i),
    ).toBeInTheDocument();
  });
});
