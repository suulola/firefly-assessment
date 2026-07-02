export interface PokemonListItem {
  id: number;
  name: string;
  spriteUrl: string;
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

export interface PokemonListPage {
  items: PokemonListItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PokeApiListResponse {
  results: { name: string; url: string }[];
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
}

export interface PokeApiSpecies {
  evolution_chain: { url: string } | null;
}

export interface PokeApiEvolutionNode {
  species: { name: string; url: string };
  evolves_to: PokeApiEvolutionNode[];
}

export interface PokeApiEvolutionChain {
  chain: PokeApiEvolutionNode;
}
