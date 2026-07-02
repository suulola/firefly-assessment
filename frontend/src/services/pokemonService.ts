import { BACKEND_BASE_URL } from "@/lib/backendClient";
import { readApiResponse } from "@/services/apiResponse";

export interface PokemonListItem {
  id: number;
  name: string;
  spriteUrl: string;
}

export interface PokemonListPage {
  items: PokemonListItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function getPokemonListPage(
  limit: number,
  offset: number,
): Promise<PokemonListPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`${BACKEND_BASE_URL}/pokemon?${params.toString()}`);
  const data = await readApiResponse<PokemonListPage | PokemonListItem[]>(
    response,
    "Failed to load the Pokémon list.",
  );

  if (Array.isArray(data)) {
    const items = data.slice(offset, offset + limit);
    return {
      items,
      total: data.length,
      limit: items.length,
      offset,
      hasMore: offset + items.length < data.length,
    };
  }

  return data;
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
  return readApiResponse<PokemonDetail>(response, "Failed to load this Pokémon.");
}
