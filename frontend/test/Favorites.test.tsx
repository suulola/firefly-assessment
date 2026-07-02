import { describe, expect, it } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
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

async function renderReadyList() {
  mswServer.use(
    http.get(`${BACKEND_BASE_URL}/pokemon`, () =>
      ok({ items: list, total: list.length, limit: list.length, offset: 0, hasMore: false }),
    ),
  );
  render(<App />);
  return screen.findAllByRole("listitem");
}

describe("Favorites: toggling a Pokémon as favorite", () => {
  it("updates the UI immediately, before the backend call resolves (optimistic)", async () => {
    mswServer.use(
      http.post(`${BACKEND_BASE_URL}/favorites`, () => ok({ id: 1 }, "Favorite saved.")),
    );
    await renderReadyList();

    const favButton = screen.getByRole("button", { name: /toggle favorite.*bulbasaur/i });
    expect(favButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(favButton);

    expect(favButton).toHaveAttribute("aria-pressed", "true");
  });

  it("rolls back and shows an inline error next to the affected row when the backend call fails", async () => {
    mswServer.use(
      http.post(`${BACKEND_BASE_URL}/favorites`, () =>
        fail("Failed to save this favorite."),
      ),
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

  it("disables a favorite button while its own mutation is pending and ignores rapid re-clicks", async () => {
    let requestCount = 0;
    mswServer.use(
      http.post(`${BACKEND_BASE_URL}/favorites`, async () => {
        requestCount += 1;
        await delay(50);
        return ok({ id: 1 }, "Favorite saved.");
      }),
    );
    await renderReadyList();

    const favButton = screen.getByRole("button", { name: /toggle favorite.*bulbasaur/i });
    await userEvent.click(favButton);
    expect(favButton).toBeDisabled();
    expect(favButton).toHaveAttribute("aria-busy", "true");

    // A rapid second click while the first mutation is still in flight must
    // not fire a second request or flip the state back.
    await userEvent.click(favButton);

    await waitFor(() => expect(favButton).not.toBeDisabled());
    expect(requestCount).toBe(1);
    expect(favButton).toHaveAttribute("aria-pressed", "true");
    expect(favButton).toHaveAttribute("aria-busy", "false");
  });

  it("removes a favorite (DELETE, not a second POST) when toggling an already-favorited Pokémon", async () => {
    let postCount = 0;
    let deleteCount = 0;
    mswServer.use(
      http.post(`${BACKEND_BASE_URL}/favorites`, () => {
        postCount += 1;
        return ok({ id: 1 }, "Favorite saved.");
      }),
      http.delete(`${BACKEND_BASE_URL}/favorites/1`, () => {
        deleteCount += 1;
        return ok({ id: 1 }, "Favorite removed.");
      }),
    );
    await renderReadyList();

    const favButton = screen.getByRole("button", { name: /toggle favorite.*bulbasaur/i });
    await userEvent.click(favButton);
    await waitFor(() => expect(favButton).toHaveAttribute("aria-pressed", "true"));
    await waitFor(() => expect(favButton).not.toBeDisabled());

    await userEvent.click(favButton);
    await waitFor(() => expect(favButton).toHaveAttribute("aria-pressed", "false"));

    expect(postCount).toBe(1);
    expect(deleteCount).toBe(1);
  });

  it("shows a visible badge/icon for favorited Pokémon in the list", async () => {
    mswServer.use(
      http.post(`${BACKEND_BASE_URL}/favorites`, () => ok({ id: 1 }, "Favorite saved.")),
    );
    await renderReadyList();

    const favButton = screen.getByRole("button", { name: /toggle favorite.*bulbasaur/i });
    await userEvent.click(favButton);

    expect(favButton).toHaveTextContent("★");
    const otherFavButton = screen.getByRole("button", { name: /toggle favorite.*ivysaur/i });
    expect(otherFavButton).toHaveTextContent("☆");
  });
});
