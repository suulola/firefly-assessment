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

export interface EvolutionStage {
  id: number;
  name: string;
  spriteUrl: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  spriteUrl: string;
  types: string[];
  abilities: { name: string; hidden: boolean }[];
  evolutions: EvolutionStage[];
}

export async function getPokemonDetail(id: number): Promise<PokemonDetail> {
  const response = await fetch(`${BACKEND_BASE_URL}/pokemon/${id}`);
  if (!response.ok) {
    throw new Error("Failed to load this Pokémon.");
  }
  return (await response.json()) as PokemonDetail;
}
