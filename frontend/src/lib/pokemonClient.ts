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

export async function addFavorite(id: number): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error("Failed to save this favorite.");
  }
}

export async function removeFavorite(id: number): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to remove this favorite.");
  }
}

export async function getFavorites(): Promise<number[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/favorites`);
  if (!response.ok) {
    throw new Error("Failed to load favorites.");
  }
  return (await response.json()) as number[];
}
