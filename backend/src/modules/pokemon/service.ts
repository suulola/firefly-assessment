import { POKEAPI_BASE_URL, pokeApiGet } from "./repository.js";

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

interface PokeApiListResponse {
  results: { name: string; url: string }[];
}

interface PokeApiPokemon {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
}

interface PokeApiSpecies {
  evolution_chain: { url: string } | null;
}

interface PokeApiEvolutionNode {
  species: { name: string; url: string };
  evolves_to: PokeApiEvolutionNode[];
}

interface PokeApiEvolutionChain {
  chain: PokeApiEvolutionNode;
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

function flattenEvolutionChain(chain: PokeApiEvolutionNode): EvolutionStage[] {
  const stages: EvolutionStage[] = [];
  const walk = (node: PokeApiEvolutionNode) => {
    const id = idFromUrl(node.species.url);
    stages.push({ id, name: node.species.name, spriteUrl: spriteUrlFor(id) });
    node.evolves_to.forEach(walk);
  };
  walk(chain);
  return stages;
}

export async function getPokemonDetail(id: string): Promise<PokemonDetail> {
  const [poke, species] = await Promise.all([
    pokeApiGet<PokeApiPokemon>(`/pokemon/${id}`),
    pokeApiGet<PokeApiSpecies>(`/pokemon-species/${id}`),
  ]);

  const types = [...poke.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);
  const abilities = poke.abilities.map((a) => ({
    name: a.ability.name,
    hidden: a.is_hidden,
  }));

  let evolutions: EvolutionStage[] = [];
  if (species.evolution_chain) {
    const chainPath = species.evolution_chain.url.replace(POKEAPI_BASE_URL, "");
    const chainData = await pokeApiGet<PokeApiEvolutionChain>(chainPath);
    evolutions = flattenEvolutionChain(chainData.chain);
  }

  return {
    id: poke.id,
    name: poke.name,
    spriteUrl: spriteUrlFor(poke.id),
    types,
    abilities,
    evolutions,
  };
}
