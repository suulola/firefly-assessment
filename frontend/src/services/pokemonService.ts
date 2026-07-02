import type { z } from "zod";
import { BACKEND_BASE_URL } from "@/lib/backendClient";
import { readApiResponse } from "@/services/apiResponse";
import {
  parsePayload,
  pokemonDetailSchema,
  pokemonListItemSchema,
  pokemonListPageSchema,
  evolutionStageSchema,
} from "@/services/schemas";

// Types are inferred from the Zod schemas (the source of truth for shape)
// rather than hand-duplicated — schemas.ts and these types can't drift apart.
export type PokemonListItem = z.infer<typeof pokemonListItemSchema>;
export type PokemonListPage = z.infer<typeof pokemonListPageSchema>;

export async function getPokemonListPage(
  limit: number,
  offset: number,
  signal?: AbortSignal,
): Promise<PokemonListPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`${BACKEND_BASE_URL}/pokemon?${params.toString()}`, {
    signal,
  });
  const data = await readApiResponse<unknown>(
    response,
    "Failed to load the Pokémon list.",
    "pokemonService.getPokemonListPage",
  );
  return parsePayload(
    pokemonListPageSchema,
    data,
    "Received invalid Pokémon list data from the server.",
    "pokemonService.getPokemonListPage",
  );
}

export type EvolutionStage = z.infer<typeof evolutionStageSchema>;
export type PokemonDetail = z.infer<typeof pokemonDetailSchema>;

export async function getPokemonDetail(
  id: number,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  const response = await fetch(`${BACKEND_BASE_URL}/pokemon/${id}`, { signal });
  const data = await readApiResponse<unknown>(
    response,
    "Failed to load this Pokémon.",
    "pokemonService.getPokemonDetail",
  );
  return parsePayload(
    pokemonDetailSchema,
    data,
    "Received invalid Pokémon detail data from the server.",
    "pokemonService.getPokemonDetail",
  );
}
