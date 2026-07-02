import { BACKEND_BASE_URL } from "./backendClient";

export interface PokemonListItem {
  id: number;
  name: string;
  spriteUrl: string;
}

export async function getPokemonList(): Promise<PokemonListItem[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/pokemon`);
  if (!response.ok) {
    throw new Error("Failed to load the Pokémon list.");
  }
  return (await response.json()) as PokemonListItem[];
}
