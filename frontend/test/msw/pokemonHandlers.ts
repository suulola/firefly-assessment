import { http } from "msw";
import { ok } from "./envelope";
import { BACKEND_BASE_URL } from "../../src/lib/backendClient";

export interface MockPokemonListItem {
  id: number;
  name: string;
  spriteUrl: string;
}

export function mockList(count: number): MockPokemonListItem[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    return {
      id,
      name: `pokemon-${id}`,
      spriteUrl: `https://example.com/sprites/${id}.png`,
    };
  });
}

export function pokemonPageHandler(allItems: MockPokemonListItem[]) {
  return http.get(`${BACKEND_BASE_URL}/pokemon`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 30);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const items = allItems.slice(offset, offset + limit);
    return ok({
      items,
      total: allItems.length,
      limit: items.length,
      offset,
      hasMore: offset + items.length < allItems.length,
    });
  });
}
