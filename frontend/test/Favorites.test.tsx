import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { App } from "../src/App";
import { mswServer } from "./msw/server";
import { BACKEND_BASE_URL } from "../src/lib/backendClient";

const list = [
  { id: 1, name: "bulbasaur", spriteUrl: "https://example.com/1.png" },
  { id: 2, name: "ivysaur", spriteUrl: "https://example.com/2.png" },
];

async function renderReadyList() {
  mswServer.use(
    http.get(`${BACKEND_BASE_URL}/pokemon`, () => HttpResponse.json(list)),
  );
  render(<App />);
  return screen.findAllByRole("listitem");
}

describe("Favorites: toggling a Pokémon as favorite", () => {
  it("updates the UI immediately, before the backend call resolves (optimistic)", async () => {
    mswServer.use(
      http.post(`${BACKEND_BASE_URL}/favorites`, () => new HttpResponse(null, { status: 204 })),
    );
    await renderReadyList();

    const favButton = screen.getByRole("button", { name: /toggle favorite.*bulbasaur/i });
    expect(favButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(favButton);

    expect(favButton).toHaveAttribute("aria-pressed", "true");
  });

  it("rolls back and shows an inline error next to the affected row when the backend call fails", async () => {
    mswServer.use(
      http.post(`${BACKEND_BASE_URL}/favorites`, () => new HttpResponse(null, { status: 502 })),
    );
    await renderReadyList();

    const favButton = screen.getByRole("button", { name: /toggle favorite.*bulbasaur/i });
    const row = favButton.closest("li");
    expect(row).not.toBeNull();
    await userEvent.click(favButton);

    expect(await within(row as HTMLElement).findByRole("alert")).toHaveTextContent(
      /couldn't save/i,
    );
    expect(favButton).toHaveAttribute("aria-pressed", "false");

    // The other row's favorite control has no error of its own.
    const otherFavButton = screen.getByRole("button", { name: /toggle favorite.*ivysaur/i });
    const otherRow = otherFavButton.closest("li");
    expect(otherRow).not.toBeNull();
    expect(within(otherRow as HTMLElement).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a visible badge/icon for favorited Pokémon in the list", async () => {
    mswServer.use(
      http.post(`${BACKEND_BASE_URL}/favorites`, () => new HttpResponse(null, { status: 204 })),
    );
    await renderReadyList();

    const favButton = screen.getByRole("button", { name: /toggle favorite.*bulbasaur/i });
    await userEvent.click(favButton);

    expect(favButton).toHaveTextContent("★");
    const otherFavButton = screen.getByRole("button", { name: /toggle favorite.*ivysaur/i });
    expect(otherFavButton).toHaveTextContent("☆");
  });
});
