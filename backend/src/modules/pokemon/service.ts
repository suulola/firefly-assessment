import { pokeApiGet } from "./repository.js";

export interface PokemonListItem {
  id: number;
  name: string;
  spriteUrl: string;
}

interface PokeApiListResponse {
  results: { name: string; url: string }[];
}

function spriteUrlFor(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function idFromUrl(url: string): number {
  const segments = url.split("/").filter(Boolean);
  return Number(segments[segments.length - 1]);
}

export async function getPokemonList(): Promise<PokemonListItem[]> {
  const { results } = await pokeApiGet<PokeApiListResponse>("/pokemon?limit=150");

  return results
    .map(({ name, url }) => {
      const id = idFromUrl(url);
      return { id, name, spriteUrl: spriteUrlFor(id) };
    })
    .sort((a, b) => a.id - b.id);
}
