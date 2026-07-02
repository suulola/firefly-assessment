import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { App } from "../src/App";
import { mswServer } from "./msw/server";
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
    http.get(`${BACKEND_BASE_URL}/pokemon`, () => HttpResponse.json(list)),
  );
  render(<App />);
  return screen.findAllByRole("listitem");
}

describe("App: click a Pokémon to see its detail", () => {
  it("renders abilities, types, and evolution stages after clicking a list item", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon/1`, () =>
        HttpResponse.json(detailWithEvolutions),
      ),
    );
    await renderReadyList();

    await userEvent.click(screen.getByRole("button", { name: /bulbasaur/i }));

    expect(await screen.findByText("Grass")).toBeInTheDocument();
    expect(screen.getByText("Poison")).toBeInTheDocument();
    expect(screen.getByText("Overgrow")).toBeInTheDocument();
    expect(screen.getAllByText("Ivysaur")).not.toHaveLength(0);
  });

  it("shows the detail panel's own loading and error states independently of the list", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon/1`, async () => {
        await delay("infinite");
        return HttpResponse.json(detailWithEvolutions);
      }),
    );
    await renderReadyList();

    await userEvent.click(screen.getByRole("button", { name: /bulbasaur/i }));

    expect(await screen.findByRole("status", { name: /pokémon detail/i })).toBeInTheDocument();
    // The list itself stays ready — its own items are still visible, not replaced by a spinner.
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows an explicit empty state for a Pokémon with no evolutions", async () => {
    mswServer.use(
      http.get(`${BACKEND_BASE_URL}/pokemon/1`, () =>
        HttpResponse.json(detailWithNoEvolutions),
      ),
    );
    await renderReadyList();

    await userEvent.click(screen.getByRole("button", { name: /bulbasaur/i }));

    expect(
      await screen.findByText(/this pokémon has no evolutions/i),
    ).toBeInTheDocument();
  });
});
